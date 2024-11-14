import { Handlers } from "$fresh/server.ts";
import { logger } from "../../src/logFile.ts";
import type { PackageMetadata } from "~/types/index.ts";
import { Package, PackageData, ExtendedPackage } from "../../types/index.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // SQLite3 import
import { getMetrics } from "~/src/metrics/getMetrics.ts";
import { BlobReader, ZipReader } from "https://deno.land/x/zipjs@v2.7.53/index.js";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

export const handler: Handlers = {
	async POST(req) {
		logger.info("package.ts: Received package upload request");

		try {
			const packageData = await req.json() as PackageData; // Define PackageData type as needed

			if (packageData.URL && packageData.Content) {
				logger.debug("package.ts: Invalid package data received - status 400");
				return new Response(
					"There is missing field(s) in the PackageData or it is formed improperly (e.g. Content and URL ar both set)",
					{ status: 400 },
				);
			}

			// Handle package data based on URL or Content
			let packageJSON: Package;
			if (packageData.URL) {
				logger.debug("package.ts: Received package data with URL: " + packageData.URL);
				packageJSON = await handleURL(packageData.URL);
			} else if (packageData.Content) {
				logger.debug("package.ts: Received package data with content");
				packageJSON = await handleContent(packageData.Content);
				logger.info("package.ts: Successfully handled content.");
			} else {
				logger.debug("package.ts: Invalid package data received - status 400");
				return new Response("Invalid package data", { status: 400 });
			}

			// get package ID from db
			const db = new DB(DATABASEFILE);
			const packageID = await db.query(
				"SELECT id FROM packages WHERE name = ? AND version = ?",
				[packageJSON.metadata.Name, packageJSON.metadata.Version],
			);

			// Populate JSON response to server
			const jsonReturn = {
				metadata: {
					Name: packageJSON.metadata.Name,
					Version: packageJSON.metadata.Version,
					ID: packageID[0][0] || "",
				} as PackageMetadata,
				data: {
					Content: packageJSON.data.Content,
					JSProgram:
						"if (process.argv.length === 7) {\nconsole.log('Success')\nprocess.exit(0)\n} else {\nconsole.log('Failed')\nprocess.exit(1)\n}\n",
					debloat: true, // TODO: CHANGE TO READ FROM DB
				},
			};

			logger.info("package.ts: ✓ Package added!");
			return new Response(JSON.stringify(jsonReturn), { status: 201 });

			// Handle HTTP errors. each function may throw an error, and the handler will catch it
			// This is done instead of each function returning a Response object which couples them to the server and complicates return types
		} catch (error) {
			logger.debug("package.ts: Failed to add package - Error: " + (error as Error).message);

			if ((error as Error).message.includes("Package already exists in database")) {
				return new Response("Package already exists in database", { status: 409 });
			} else if ((error as Error).message.includes("Package is not uploaded due to the disqualified rating")) {
				return new Response("Package is not uploaded due to the disqualified rating", { status: 424 });
			} else if ((error as Error).message.includes("package.json not found")) {
				return new Response("package.json not found", { status: 400 });
			} else if (
				(error as Error).message.includes("Package is too large, why are you trying to upload a zip bomb?")
			) {
				return new Response("Package is too large, why are you trying to upload a zip bomb?", { status: 400 });
			} else {
				return new Response(
					"There is missing field(s) in the PackageData or it is formed improperly (e.g. Content and URL ar both set)",
					{ status: 400 },
				);
			}
		}
	},
};

export async function handleContent(content: string, url?: string, db = new DB(DATABASEFILE), autoCloseDB = true) {
	try {
		// Generate a unique suffix for the temp file. 36 is the base (26 letters + 10 digits) and 7 is number of characters to use
		const suffix = Date.now() + Math.random().toString(36).substring(7);
		const decodedContent = atob(content);

		const tempFilePath = "./temp/pkg_" + suffix + ".zip";
		const unzipPath = "./temp/pkg_unzip_" + suffix;
		await Deno.mkdir("./temp", { recursive: true });
		await Deno.mkdir(unzipPath, { recursive: true });

		// Write the base64 content to a temp zip file
		await Deno.writeFile(tempFilePath, new Uint8Array([...decodedContent].map((c) => c.charCodeAt(0))));

		// Check if the package is a zip bomb (> 1GB)
		if (!(await pleaseDontZipBombMe(tempFilePath, 1024 * 1024 * 1024))) {
			const cmd = new Deno.Command("unzip", { args: ["-q", tempFilePath, "-d", unzipPath] });
			await cmd.output();
		} else {
			logger.warn("package.ts: Bomb detected - 😞");
			await Deno.remove(tempFilePath);
			await Deno.remove(unzipPath, { recursive: true });
			await Deno.remove("./temp", { recursive: true });
			throw new Error("Package is too large, why are you trying to upload a zip bomb?");
		}

		// parse and verify package.json
		const packageJSON = await parsePackageJSON(unzipPath);
		let metrics = null;
		if (url != "No repository URL" && url) packageJSON.data.URL = url; // If URL is provided, use it
		if (packageJSON.data.URL) {
			logger.debug("package.ts: Calling phase 1 on: " + packageJSON.data.URL);
			metrics = await getMetrics(packageJSON.data.URL);
		} else {
			logger.debug(
				"package.ts: No repository URL found in package.json for " + packageJSON.metadata.Name +
					", skipping phase 1",
			);
		}

		// Metrics check, all metrics must be above 0.5 to ingest
		if (metrics) {
			metrics = JSON.parse(metrics);

			// ☢️ DO NOT KEEP 1 || IN PRODUCTION ☢️
			if (
				(metrics.BusFactor > 0.5 && metrics.Correctness > 0.5 && metrics.License > 0.5 &&
					metrics.RampUp > 0.5 &&
					metrics.ResponsiveMaintainer > 0.5 && metrics.dependencyPinning > 0.5 &&
					metrics.ReviewPercentage > 0.5)
			) {
				// metrics
				await uploadZipToSQLite(
					tempFilePath,
					packageJSON,
					metrics.BusFactor,
					metrics.BusFactor_Latency,
					metrics.Correctness,
					metrics.Correctness_Latency,
					metrics.License,
					metrics.License_Latency,
					metrics.RampUp,
					metrics.RampUp_Latency,
					metrics.ResponsiveMaintainer,
					metrics.ResponsiveMaintainer_Latency,
					metrics.dependencyPinning,
					metrics.dependencyPinning_Latency,
					metrics.ReviewPercentage,
					metrics.ReviewPercentage_Latency,
					metrics.NetScore,
					metrics.NetScore_Latency,
					db,
					true,
				);


				// Now we add the dependency cost
				await db.query(
					"UPDATE packages SET dependency_cost = ? WHERE name = ? AND version = ?",
					[packageJSON.data.Dependencies, packageJSON.metadata.Name, packageJSON.metadata.Version],
				);
			} else {
				logger.debug(
					"package.ts: Package [" + packageJSON.metadata.Name + "] @ [" + packageJSON.metadata.Version +
						"] failed metric check - status 400",
				);

				await Deno.remove(tempFilePath);
				await Deno.remove(unzipPath, { recursive: true });
				await Deno.remove("./temp", { recursive: true });

				throw new Error("Package is not uploaded due to the disqualified rating");
			}
		} // Something goes wrong with the metrics
		else {
			logger.debug(
				"package.ts: Package [" + packageJSON.metadata.Name + "] @ [" + packageJSON.metadata.Version +
					"] failed metric check - status 400",
			);

			await Deno.remove(tempFilePath);
			await Deno.remove(unzipPath, { recursive: true });
			await Deno.remove("./temp", { recursive: true });

			throw new Error("Package is not uploaded due to the disqualified rating");
		}

		await Deno.remove(tempFilePath);
		await Deno.remove(unzipPath, { recursive: true });
		await Deno.remove("./temp", { recursive: true });

		packageJSON.data.Content = content;
		return packageJSON;
	} finally {
		if (autoCloseDB) db.close();
	}
}

// Handles the URL of the package
// Fetches the .zip from the URL and processes it
export async function handleURL(url: string, db = new DB(DATABASEFILE), autoCloseDB = true) {
	// Use these URLs fetch the .zip for a package
	let response = await fetch(url + "/zipball/master");
	if (!response.ok) {
		response = await fetch(url + "/zipball/main");
	}

	if (!response.ok) {
		const errMsg = `Failed to fetch: ${response.status} ${response.statusText}`;
		logger.debug("package.ts: " + errMsg);
		throw new Error(errMsg);
	}

	// After we have the .zip, we base64 encode it and handle it as Content
	// This is done since the logic for handling the package is the same for both URL and Content after getting the .zip
	const content = await response.arrayBuffer();
	logger.debug("package.ts: Successfully read package content");
	const base64Content = btoa(
		new Uint8Array(content).reduce((data, byte) => data + String.fromCharCode(byte), ""),
	);

	const packageJSON = await handleContent(base64Content, url, db, autoCloseDB);
	return packageJSON;
}

export async function parsePackageJSON(filePath: string) {
	const dirEntries = Deno.readDir(filePath);
	let packageFolder: Deno.DirEntry | null = null;

	for await (const entry of dirEntries) {
		if (entry.isDirectory) {
			packageFolder = entry;
			break;
		}
	}

	logger.debug("package.ts: Reading package.json");
	const rootPath = `${filePath}/package.json`;
	const subDirPath = `${filePath}/${packageFolder?.name}/package.json`;

	const packageJSONPath = await Deno.stat(rootPath).then(() => rootPath).catch(() => subDirPath);
	if (!packageJSONPath) {
		logger.debug("package.ts: package.json not found - status 400");
		throw new Error("package.json not found");
	}
	const packageJSON = JSON.parse(await Deno.readTextFile(packageJSONPath));

	// Find number of dependencies and upload to db.
	// Required for some retrieving cost of packages later
	const numberDependencies = Object.keys(packageJSON.dependencies || {}).length +
		Object.keys(packageJSON.devDependencies || {}).length;

	return {
		metadata: {
			Name: packageJSON.name,
			Version: packageJSON.version,
			ID: packageJSON.name + "@" + packageJSON.version,
		},
		data: {
			Content: "",
			// url can be repository.url or repository or url
			URL: packageJSON.repository?.url || packageJSON.repository || packageJSON.url || "No repository URL",
			Dependencies: numberDependencies
		},
	} as ExtendedPackage;
}

// Uploads the package zip to the SQLite database
// If originally was a URL, we downloaded the .zip from GitHub and will upload it to the database
// If originally was a base64 Content, we unzipped and processed the package, so now we encode and upload to the database
export async function uploadZipToSQLite(
    tempFilePath: string,
    packageJSON: Package,
    busFactor: number,
    busFactorLatency: number,
    correctness: number,
    correctnessLatency: number,
    license: number,
    licenseLatency: number,
    rampUp: number,
    rampUpLatency: number,
    responsiveMaintainer: number,
    responsiveMaintainerLatency: number,
    dependencyPinning: number,
    dependencyPinningLatency: number,
    reviewPercentage: number,
    reviewPercentageLatency: number,
    netscore: number,
	netscoreLatency: number,
    db = new DB(DATABASEFILE),
    autoCloseDB = true,
) {
	const zipData = await Deno.readFile(tempFilePath);
	const zipBase64 = btoa(new Uint8Array(zipData).reduce((data, byte) => data + String.fromCharCode(byte), ""));

	logger.debug(
		"package.ts: Adding package zip named [" + packageJSON.metadata.Name + "] @ [" + packageJSON.metadata.Version +
			tempFilePath + " to SQLite database",
	);

	// Check if the package already exists in the database
	const packageExists = await db.query(
		"SELECT * FROM packages WHERE name = ? AND version = ?",
		[packageJSON.metadata.Name, packageJSON.metadata.Version],
	);

	if (packageExists.length > 0) {
		logger.debug(
			"package.ts: Package [" + packageJSON.metadata.Name + "] @ [" + packageJSON.metadata.Version +
				"] already exists in database - status 409",
		);
		throw new Error("Package already exists in database");
	}

	// Insert the package into the database
	await db.query(
    `INSERT OR IGNORE INTO packages (
        name, url, version, base64_content, 
        license_score, license_latency, netscore, netscore_latency, 
        dependency_pinning_score, dependency_pinning_latency, 
        rampup_score, rampup_latency, review_percentage_score, 
        review_percentage_latency, bus_factor, bus_factor_latency, 
        correctness, correctness_latency, responsive_maintainer, responsive_maintainer_latency
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
        packageJSON.metadata.Name,
        packageJSON.data.URL,
        packageJSON.metadata.Version,
        zipBase64,
        license, licenseLatency, netscore, netscoreLatency,
        dependencyPinning, dependencyPinningLatency,
        rampUp, rampUpLatency, reviewPercentage, reviewPercentageLatency,
        busFactor, busFactorLatency, correctness, correctnessLatency,
        responsiveMaintainer, responsiveMaintainerLatency,
    ]);
}

// Checks if the package is a zip bomb
async function pleaseDontZipBombMe(tempFilePath: string, maxDecompressedSize: number) {
	const file = await Deno.readFile(tempFilePath);
	const blob = new Blob([file]);
	const zipReader = new ZipReader(new BlobReader(blob));

	const entries = await zipReader.getEntries();
	let decompressedSize = 0;

	for (const entry of entries) {
		if (entry.directory) continue; // Skip directories
		decompressedSize += entry.uncompressedSize || 0;

		// Check limits
		if (decompressedSize > maxDecompressedSize) {
			await zipReader.close();
			return true;
		}
	}
	await zipReader.close();
}
