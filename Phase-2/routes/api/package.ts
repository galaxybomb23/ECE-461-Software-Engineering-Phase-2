import { Handlers } from "$fresh/server.ts";
import { logger } from "../../src/logFile.ts";
import type { PackageMetadata } from "~/types/index.ts";
import { PackageData } from "../../types/index.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // SQLite3 import
import { getMetrics } from "~/src/metrics/getMetrics.ts";

const DB_PATH = "data/data.db";

export const handler: Handlers = {
	async POST(req) {
		logger.info("package.ts: Received package upload request");
		const db = new DB(DB_PATH);

		try {
			const packageData = await req.json() as PackageData; // Define PackageData type as needed
			let packageJSON: any;

			if (packageData.URL && packageData.Content) {
				logger.debug("package.ts: Invalid package data received - status 400");
				return new Response("There is missing field(s) in the PackageData or it is formed improperly (e.g. Content and URL ar both set)", { status: 400 });
			}

			// Handle package data based on URL or Content
			if (packageData.URL) {
				logger.debug("package.ts: Received package data with URL: " + packageData.URL);
				packageJSON = await handleURL(db, packageData.URL);
			} else if (packageData.Content) {
				logger.debug("package.ts: Received package data with content");
				packageJSON = await handleContent(db, packageData.Content);
			} else {
				logger.debug("package.ts: Invalid package data received - status 400");
				return new Response("Invalid package data", { status: 400 });
			}

			const jsonReturn = {
				metadata: {
					Name: packageJSON.name,
					Version: packageJSON.version,
					ID: packageJSON.name.toLowerCase() || "no-id",
				} as PackageMetadata,
				data: {
					Content: packageData.Content || "Base64 encoded content here...",
					JSProgram: "if (process.argv.length === 7) {\nconsole.log('Success')\nprocess.exit(0)\n} else {\nconsole.log('Failed')\nprocess.exit(1)\n}\n",
				},
			};

			db.close();
			logger.info("package.ts: ✓ Package added!");
			return new Response(JSON.stringify(jsonReturn), { status: 201 });

		// Handle HTTP errors
		} catch (error) {
			logger.debug("package.ts: Failed to add package - Error: " + (error as Error).message);
			db.close();
			
			if ((error as Error).message.includes("Package already exists in database")) {
				return new Response("Package already exists in database", { status: 409 });
			}
			else if ((error as Error).message.includes("Package is not uploaded due to the disqualified rating")) {
				return new Response("Package is not uploaded due to the disqualified rating", { status: 424 });
			}
			else if ((error as Error).message.includes("package.json not found")) {
				return new Response("package.json not found", { status: 400 });
			}
			else {
				return new Response("There is missing field(s) in the PackageData or it is formed improperly (e.g. Content and URL ar both set)", { status: 400 });
			}
		}
	},
};

export async function handleContent(db: DB, content: string, url?: string) {
	const suffix = Date.now() + Math.random().toString(36).substring(7);
	const decodedContent = atob(content);

	const tempFilePath = "./temp/pkg_" + suffix + ".zip";
	const unzipPath = "./temp/pkg_unzip_" + suffix;
	await Deno.mkdir("./temp", { recursive: true });
	await Deno.mkdir(unzipPath, { recursive: true });

	await Deno.writeFile(tempFilePath, new Uint8Array([...decodedContent].map((c) => c.charCodeAt(0))));
	const cmd = new Deno.Command("unzip", {args: ["-q", tempFilePath, "-d", unzipPath]});
	await cmd.output();

	logger.debug("package.ts: Successfully unzipped package content");
	
	const packageJSON = await parsePackageJSON(unzipPath);

	let metrics = null;
	if (url != "No repository URL" && url) { packageJSON.url = url; }
	if (packageJSON.url != "No repository URL") {
		logger.debug("package.ts: Calling phase 1 on: " + packageJSON.url);
		metrics = await getMetrics(packageJSON.url);
	} else {
		logger.debug("package.ts: No repository URL found in package.json for " + packageJSON.name + ", not running Phase 1");
	}

	let uploadRet: number;
	if (metrics) {
		metrics = JSON.parse(metrics);
		// check if each non-latency metric is > 0.5
		if (metrics.BusFactor > 0.5 && metrics.Correctness > 0.5 && metrics.License > 0.5 && metrics.RampUp > 0.5 && metrics.ResponsiveMaintainer > 0.5 && metrics.DependencyPinning > 0.5 && metrics.ReviewPercentage > 0.5) {
			await uploadZipToSQLite(unzipPath, tempFilePath, packageJSON, db);
		}
		else {
			logger.debug("package.ts: Package [" + packageJSON.name + "] @ [" + packageJSON.version + "] failed metric check - status 400");
			throw new Error("Package is not uploaded due to the disqualified rating");
		}
	}


	await Deno.remove(tempFilePath);
	await Deno.remove(unzipPath, { recursive: true });
	await Deno.remove("./temp", { recursive: true });

	return packageJSON;
}

export async function handleURL(db: DB, url: string) {
	let response = await fetch(url + "/zipball/master");
	if (!response.ok) {
		response = await fetch(url + "/zipball/main");
	}

	if (!response.ok) {
		const errMsg = `Failed to fetch: ${response.status} ${response.statusText}`;
		logger.debug("package.ts: " + errMsg);
		throw new Error(errMsg);
	}

	logger.debug("package.ts: Successfully fetched package from URL: " + url + " with response: " + response);

	const content = await response.arrayBuffer();
	logger.debug("package.ts: Successfully read package content");
	const base64Content = btoa(
		new Uint8Array(content).reduce((data, byte) => data + String.fromCharCode(byte), ""),
	);

	logger.debug("package.ts: Successfully converted package content to base64");

	const packageJSON = await handleContent(db, base64Content, url);
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
	let packageJSON: any;
	const rootPath = `${filePath}/package.json`;
	const subDirPath = `${filePath}/${packageFolder?.name}/package.json`;

	try {
		packageJSON = JSON.parse(await Deno.readTextFile(rootPath));
		logger.debug("package.ts: Found package.json in root");
	} catch {
		try {
			packageJSON = JSON.parse(await Deno.readTextFile(subDirPath));
			logger.debug("package.ts: Found package.json in subdirectory");
		} catch {
			logger.debug("package.ts: package.json not found - status 400");
			throw new Error("package.json not found");
		}
	}


	return {
		name: packageJSON.name.split("/").pop() || "No name",
		version: packageJSON.version || "No version",
		url: packageJSON.repository?.url || packageJSON.url || "No repository URL",
		json: packageJSON || {},
	} 
}

export async function uploadZipToSQLite(unzipPath: string, tempFilePath: string, packageJSON: any, db: DB) {
	const zipData = await Deno.readFile(tempFilePath);
	const zipBase64 = btoa(new Uint8Array(zipData).reduce((data, byte) => data + String.fromCharCode(byte), ""));

	logger.debug("package.ts: Adding package zip named [" + packageJSON.name + "] @ [" + packageJSON.version + "] located at " + tempFilePath + " to SQLite database");

	const packageExists = await db.query(
		"SELECT * FROM packages WHERE name = ? AND version = ?",
		[packageJSON.name.toString(), packageJSON.version.toString()],
	);

	if (packageExists.length > 0) {
		logger.debug("package.ts: Package [" + packageJSON.name + "] @ [" + packageJSON.version + "] already exists in database - status 409");
		throw new Error("Package already exists in database");
	}

	db.query(
		"INSERT OR IGNORE INTO packages (name, url, version, base64_content) VALUES (?, ?, ?, ?)",
		[packageJSON.name, packageJSON.url, packageJSON.version, zipBase64],
	);
}
