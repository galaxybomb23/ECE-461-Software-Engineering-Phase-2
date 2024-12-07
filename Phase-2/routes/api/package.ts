import { Handlers } from "$fresh/server.ts";
import { displayRequest, logger } from "~/src/logFile.ts";
import { ExtendedPackage, Package, PackageData, PackageMetadata } from "~/types/index.ts";
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts"; // SQLite3 import
import { getMetrics } from "~/src/metrics/getMetrics.ts";
import { BlobReader, ZipReader } from "https://deno.land/x/zipjs@v2.7.53/index.js";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";
import { getGithubUrlFromNpm } from "~/src/API.ts";
import { getUserAuthInfo } from "~/utils/validation.ts";
import { queryPackageById } from "~/routes/api/package/[id].ts";
import { build } from "https://deno.land/x/esbuild@v0.14.24/mod.js";

export const handler: Handlers = {
	async POST(req) {
		logger.info("--> /package: POST");
		await displayRequest(req);

		const db = new DB(DATABASEFILE);

		try {
			const packageData = await req.json() as PackageData; // Define PackageData type as needed

			// Extract and validate the 'X-Authentication' token
			const authToken = req.headers.get("X-Authorization") ?? "";
			if (!authToken) {
				logger.warn("Invalid request: missing authentication token");
				return new Response("Invalid request: missing authentication token", { status: 403 });
			}
			if (!getUserAuthInfo(authToken).is_token_valid) {
				logger.warn("Unauthorized request: invalid token");
				return new Response("Unauthorized request: invalid token", { status: 403 });
			}

			if (packageData.URL && packageData.Content) {
				logger.warn("package.ts: Invalid package data received - status 400");
				return new Response(
					"There is missing field(s) in the PackageData or it is formed improperly (e.g. Content and URL ar both set)",
					{ status: 400 },
				);
			}

			// Handle package data based on URL or Content
			let packageJSON: Package;
			if (packageData.URL) {
				packageData.URL = packageData.URL.replace(/\/$/, "");
				logger.debug("package.ts: Original package data with URL: " + packageData.URL);
				// convert url to github url if it is npmjs url
				if (packageData.URL.includes("npmjs.com")) {
					const changedURL = await getGithubUrlFromNpm(packageData.URL);
					if (changedURL) packageData.URL = changedURL;
					logger.debug("package.ts: Converted npmjs URL to GitHub URL: " + packageData.URL);
				}
				packageJSON = await handleURL(packageData.URL);
			} else if (packageData.Content) {
				logger.debug("package.ts: Received package data with content");
				const debloat = packageData.debloat || false;
				logger.debug("package.ts: Debloat flag: " + debloat);
				packageJSON = await handleContent(
					packageData.Content,
					undefined,
					1,
					undefined,
					undefined,
					undefined,
					debloat,
				);
				logger.info("package.ts: Successfully handled content.");
			} else {
				logger.warn("package.ts: Invalid package data received - status 400");
				return new Response("Invalid package data", { status: 400 });
			}

			// get package ID from db
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
					debloat: packageData.debloat || false,
				},
			};

			logger.info("package.ts: ✓ Package added!");
			return new Response(JSON.stringify(jsonReturn), { status: 201 });

			// Handle HTTP errors. each function may throw an error, and the handler will catch it
			// This is done instead of each function returning a Response object which couples them to the server and complicates return types
		} catch (error) {
			logger.error("package.ts: Failed to add package - Error: " + (error as Error).message);

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
					"There is missing field(s) in the PackageData or it is formed improperly (e.g. Content and URL ar both set)" +
						(error as Error).message,
					{ status: 400 },
				);
			}
		} finally {
			db.close();
		}
	},
};

export async function debloatPackage(
	entryFile: string, // The main entry file of your package (index.js)
	outputFile: string, // Output path for the cleaned package
	platform: "browser" | "node" = "node", // Target platform (can be "browser" or "node")
) {
	try {
		// Build with tree-shaking enabled but keep files unbundled
		await build({
			entryPoints: [entryFile], // Entry point for your code
			outfile: outputFile,
			minify: true,
			treeShaking: true, // Enable tree-shaking
			platform: platform,
			target: ["esnext"],
			allowOverwrite: true,
			bundle: false, // Don't bundle files; just apply tree shaking
		});

		logger.debug(`Debloated package is written to: ${outputFile}`);
	} catch (error) {
		logger.error("Error during debloating:", error);
	}
}

export async function handleContent(
	content: string,
	url?: string,
	via_content: number = 1,
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
	old_version?: [string],
	debloat?: boolean,
) {
	logger.silly(
		`handleContent(${content.substring(0, 20)}...${
			content.slice(-20)
		}, ${url}, ${via_content},..., ${old_version})`,
	);
	// Outside the try block so we can reference the paths in the finally block
	// Generate a unique suffix for the temp file. 36 is the base (26 letters + 10 digits) and 7 is number of characters to use
	const suffix = Date.now() + Math.random().toString(36).substring(7);
	const decodedContent = atob(content);

	const tempFilePath = "./temp/pkg_" + suffix + ".zip";
	const unzipPath = "./temp/pkg_unzip_" + suffix;
	try {
		await Deno.mkdir("./temp", { recursive: true });
		await Deno.mkdir(unzipPath, { recursive: true });

		// Write the base64 content to a temp zip file
		await Deno.writeFile(tempFilePath, new Uint8Array([...decodedContent].map((c) => c.charCodeAt(0))));

		// Check if the package is a zip bomb (> 1GB)
		if (!(await pleaseDontZipBombMe(tempFilePath, 1024 * 1024 * 1024))) {
			logger.debug("package.ts: No zip bomb detected - 😊");
			await unzipFile(tempFilePath, unzipPath);
		} else {
			logger.warn("package.ts: Bomb detected - 😞");
			throw new Error("Package is too large, why are you trying to upload a zip bomb?");
		}

		if (!via_content && debloat) {
			logger.debug("package.ts: Debloating requires content, skipping debloat");
		}

		// find the package folder
		let packageFolder: Deno.DirEntry | null = null;
		const dirEntries = Deno.readDir(unzipPath);
		for await (const entry of dirEntries) {
			if (entry.isDirectory) {
				packageFolder = entry;
				break;
			}
		}

		if (via_content && debloat) {
			logger.debug("package.ts: Debloating package");

			const rootPath = `${unzipPath}/index.js`;
			const subDirPath = `${unzipPath}/${packageFolder?.name}/index.js`;
			const packageJSONPath = await Deno.stat(rootPath).then(() => rootPath).catch(() => subDirPath);

			// check actually exists
			const packageJSONExists = await Deno.stat(packageJSONPath).then(() => true).catch(() => false);
			if (packageJSONExists) {
				logger.debug("found package folder at: " + packageJSONPath);

				await debloatPackage(packageJSONPath, packageJSONPath);

				// rezip at original name
				logger.debug(
					"package.ts: Rezipping package after debloating, src path: " + unzipPath + " and dest path: " +
						tempFilePath,
				);

				const command = new Deno.Command("zip", {
					args: ["-r", "-9", "-Z", "deflate", "-X", "../pkg_" + suffix + ".zip", "."],
					cwd: unzipPath,
				});

				try {
					const { code, stderr } = await command.output();

					if (code !== 0) {
						const errorMsg = new TextDecoder().decode(stderr);
						logger.warn("package.ts: Error while rezipping package - " + errorMsg);
						throw new Error(errorMsg);
					}
				} catch (error) {
					logger.warn("package.ts: Error while rezipping package - " + error);
				}
			} else {
				logger.warn("package.ts: No package folder found for debloating, skipping");
			}
		}

		// grab README.md
		const rootPath = `${unzipPath}/README.md`;
		const subDirPath = `${unzipPath}/${packageFolder?.name}/README.md`;
		const READMEPATH = await Deno.stat(rootPath).then(() => rootPath).catch(() => subDirPath);
		const readme_exists = await Deno.stat(READMEPATH).then(() => true).catch(() => false);

		let readme_content = "";
		if (readme_exists) {
			readme_content = await Deno.readTextFile(READMEPATH);
			logger.debug("package.ts: Found README.md file");
		} else {
			logger.warn("package.ts: No README.md file found, skipping readme column upload");
		}

		// parse and verify package.json
		const packageJSON = await parsePackageJSON(unzipPath, db, false);
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

		// ensure not uploading prior patch versionm if old_version is provided
		if (old_version) {
			for (const version of old_version) {
				const old_version_split = version.split(".");
				const new_version_split = packageJSON.metadata.Version.split(".");
				if (
					old_version_split[0] === new_version_split[0] && old_version_split[1] === new_version_split[1] &&
					parseInt(old_version_split[2]) > parseInt(new_version_split[2])
				) {
					throw new Error("Package version is lower than the current version");
				}
			}
		}

		// Metrics check, all metrics must be above 0.5 to ingest
		if (metrics) {
			metrics = JSON.parse(metrics);

			// For content, ALL metrics must be above 0.5, if URL, only NetScore must be above 0.5
			if (
				(!via_content &&
					(metrics.BusFactor > 0.5 && metrics.Correctness > 0.5 && metrics.License > 0.5 &&
						metrics.RampUp > 0.5 &&
						metrics.ResponsiveMaintainer > 0.5 && metrics.DependencyPinning > 0.5 &&
						metrics.ReviewPercentage > 0.5)) || (via_content && metrics.NetScore > 0.5)
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
					metrics.DependencyPinning,
					metrics.DependencyPinning_Latency,
					metrics.ReviewPercentage,
					metrics.ReviewPercentage_Latency,
					metrics.NetScore,
					metrics.NetScore_Latency,
					db,
					false,
					readme_content,
				);

				// Now we add the dependency cost
				// prepend length of base64_content to dependency_cost
				const program_length = content.length;
				const cost = program_length + "," + packageJSON.data.Dependencies;

				await db.query(
					"UPDATE packages SET dependency_cost = ? WHERE name = ? AND version = ?",
					[cost, packageJSON.metadata.Name, packageJSON.metadata.Version],
				);

				// Add uploaded by content or URL flag
				await db.query(
					"UPDATE packages SET uploaded_by_content = ? WHERE name = ? AND version = ?",
					[via_content, packageJSON.metadata.Name, packageJSON.metadata.Version],
				);
			} else {
				logger.debug(
					"package.ts: Package [" + packageJSON.metadata.Name + "] @ [" + packageJSON.metadata.Version +
						"] Stats:\n" + metrics,
				);

				throw new Error("Package is not uploaded due to the disqualified rating");
			}
		} // Something goes wrong with the metrics
		else {
			logger.debug(
				"package.ts: Package [" + packageJSON.metadata.Name + "] @ [" + packageJSON.metadata.Version +
					"] failed metric check - status 424",
			);

			throw new Error("Package is not uploaded due to the disqualified rating");
		}

		packageJSON.data.Content = content;
		return packageJSON;
	} finally {
		if (autoCloseDB) db.close();
		await Deno.remove(tempFilePath).catch(() => {});
		await Deno.remove(unzipPath, { recursive: true }).catch(() => {});
		await Deno.remove("./temp", { recursive: true }).catch(() => {});
	}
}

// Handles the URL of the package
// Fetches the .zip from the URL and processes it
export async function handleURL(url: string, db = new DB(DATABASEFILE), autoCloseDB = true, old_version?: string) {
	logger.silly(`handleURL(${url},..., ${old_version})`);
	try {
		// First, parse the GitHub URL to get owner and repo
		const { owner, repo } = parseGithubURL(url);
		if (!owner || !repo) {
			throw new Error("Invalid GitHub URL");
		}

		// Retrieve the GitHub token from environment variables
		const token = Deno.env.get("GITHUB_TOKEN");
		if (!token) {
		  logger.warn("No GitHub token found. Ensure GITHUB_TOKEN is set in the environment.");
		}
	
		// Define headers for authentication
		const headers = token ? { Authorization: token } : {};

		// Fetch repository metadata from the GitHub API
		const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
		const repoResponse = await fetch(apiUrl, { headers });
		if (!repoResponse.ok) {
			const errMsg = `Failed to fetch repo metadata: ${repoResponse.status} ${repoResponse.statusText}`;
			logger.debug("package.ts: " + errMsg);
			throw new Error(errMsg);
		}
		const repoData = await repoResponse.json();
		const defaultBranch = repoData.default_branch || "main";

		// Now fetch the zipball of the default branch
		const zipballUrl = `${url}/zipball/${defaultBranch}`;
		const response = await fetch(zipballUrl);

		if (!response.ok) {
			const errMsg = `Failed to fetch zipball: ${response.status} ${response.statusText}`;
			logger.debug("package.ts: " + errMsg);
			throw new Error(errMsg);
		}

		// After we have the .zip, we base64-encode it and handle it as Content
		const content = await response.arrayBuffer();
		logger.debug("package.ts: Successfully read package content");
		const base64Content = btoa(
			new Uint8Array(content).reduce((data, byte) => data + String.fromCharCode(byte), ""),
		);

		const packageJSON = await handleContent(base64Content, url, 0, db, false);
		return packageJSON;
	} finally {
		if (autoCloseDB) db.close();
	}
}

/**
 * Utility function to parse GitHub URL of the form https://github.com/{owner}/{repo}
 */
function parseGithubURL(url: string): { owner: string | null; repo: string | null } {
	try {
		const u = new URL(url);
		const pathParts = u.pathname.split("/").filter(Boolean); // remove empty segments
		if (pathParts.length >= 2) {
			return { owner: pathParts[0], repo: pathParts[1] };
		}
		return { owner: null, repo: null };
	} catch {
		return { owner: null, repo: null };
	}
}

export async function parsePackageJSON(filePath: string, db = new DB(DATABASEFILE), autoCloseDB = true) {
	logger.silly(`parsePackageJSON(${filePath})`);
	try {
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

		const packageJSONPath = await Deno.stat(rootPath)
			.then(() => rootPath)
			.catch(() =>
				Deno.stat(subDirPath)
					.then(() => subDirPath)
					.catch(() => null) // If subDirPath is not found, set packageJSONPath to null
			);

		if (!packageJSONPath) {
			logger.debug("package.ts: package.json not found - status 400");
			throw new Error("package.json not found");
		}

		const packageJSON = JSON.parse(await Deno.readTextFile(packageJSONPath));

		const fullDependencies = { ...packageJSON.dependencies, ...packageJSON.devDependencies } as Record<
			string,
			string
		>;
		const deps = await computeDependencies(fullDependencies, db, false);

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
				Dependencies: deps,
			},
		} as ExtendedPackage;
	} finally {
		if (autoCloseDB) db.close();
	}
}

export async function computeDependencies(
	fullDependencies: Record<string, string>,
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
) {
	logger.silly(`computeDependencies(${fullDependencies})`);
	try {
		// we will now query by name and version to find IDs of dependencies/devDependencies
		// build a string of id:cost, id:cost, id:cost
		let costs = "";

		for (const [name, version] of Object.entries(fullDependencies)) {
			const cleanedVersion = (version as string).replace(/^[^\d]*/, ""); // Cast to string and clean

			let pkgs = await queryPackageById(undefined, name, cleanedVersion, db, false);
			if (pkgs) {
				logger.debug("package.ts: Found package with name: " + name + " and version: " + cleanedVersion);
				if (!Array.isArray(pkgs)) pkgs = [pkgs];

				for (const pkg of pkgs) {
					// query db to get base64_content
					const base64_content = await db.query(
						"SELECT base64_content FROM packages WHERE id = ?",
						[pkg.metadata.ID],
					) as string[][];

					// get length of base64_content and add to costs
					const program_length = base64_content[0][0].length;
					costs += pkg.metadata.ID + ":" + program_length + ",";
				}
			}
		}
		return costs; // either empty string or id:cost, id:cost, id:cost,
	} finally {
		if (autoCloseDB) db.close(true);
	}
}

export async function unzipFile(zipFilePath: string, outputDir: string) {
	logger.silly(`unzipFile(${zipFilePath}, ${outputDir})`);

	// unzip the file
	const cmd = new Deno.Command("unzip", { args: ["-q", zipFilePath, "-d", outputDir] });
	await cmd.output();
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
	DependencyPinning: number,
	DependencyPinningLatency: number,
	reviewPercentage: number,
	reviewPercentageLatency: number,
	netscore: number,
	netscoreLatency: number,
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
	readme_content?: string,
) {
	logger.silly(
		`uploadZipToSQLite(${tempFilePath}, ${packageJSON}, ${busFactor}, ${busFactorLatency}, ${correctness}, ${correctnessLatency}, ${license}, ${licenseLatency}, ${rampUp}, ${rampUpLatency}, ${responsiveMaintainer}, ${responsiveMaintainerLatency}, ${DependencyPinning}, ${DependencyPinningLatency}, ${reviewPercentage}, ${reviewPercentageLatency}, ${netscore}, ${netscoreLatency})`,
	);
	try {
		const zipData = await Deno.readFile(tempFilePath);
		const zipBase64 = btoa(new Uint8Array(zipData).reduce((data, byte) => data + String.fromCharCode(byte), ""));

		logger.debug(
			"package.ts: Adding package zip named [" + packageJSON.metadata.Name + "] @ [" +
				packageJSON.metadata.Version +
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
			name, url, version, base64_content, readme,
			license_score, license_latency, netscore, netscore_latency, 
			dependency_pinning_score, dependency_pinning_latency, 
			rampup_score, rampup_latency, review_percentage_score, 
			review_percentage_latency, bus_factor, bus_factor_latency, 
			correctness, correctness_latency, responsive_maintainer, responsive_maintainer_latency
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				packageJSON.metadata.Name,
				packageJSON.data.URL,
				packageJSON.metadata.Version,
				zipBase64,
				readme_content,
				license,
				licenseLatency,
				netscore,
				netscoreLatency,
				DependencyPinning,
				DependencyPinningLatency,
				rampUp,
				rampUpLatency,
				reviewPercentage,
				reviewPercentageLatency,
				busFactor,
				busFactorLatency,
				correctness,
				correctnessLatency,
				responsiveMaintainer,
				responsiveMaintainerLatency,
			],
		);
	} finally {
		if (autoCloseDB) db.close();
	}
}

// Checks if the package is a zip bomb
async function pleaseDontZipBombMe(tempFilePath: string, maxDecompressedSize: number) {
	logger.silly(`pleaseDontZipBombMe(${tempFilePath}, ${maxDecompressedSize})`);
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
