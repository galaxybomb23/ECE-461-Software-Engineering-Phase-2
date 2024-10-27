import { Handlers } from "$fresh/server.ts";
import { logger } from "../../src/logFile.ts";
import { PackageData } from "../../types/index.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // SQLite3 import

const DB_PATH = "data/data.db";

export const handler: Handlers = {
	async POST(req) {
		logger.info("package.ts: Received package upload request");
		const db = new DB(DB_PATH);
		try {
			let jsonResponse = await packageUpload(db, req);
			db.close();
			logger.info("package.ts: ✓ Package added!");
			return new Response(JSON.stringify(jsonResponse), { status: 201 });
		} catch (error) {
			logger.warning("package.ts: Failed to add package - Error: " + error.message);
			db.close();
			return new Response("Failed to add package", { status: 500 });
		}
	},
};

export async function packageUpload(db: DB, req: Request) {
	const packageData = await req.json() as PackageData;
	let packageJSON: any;

	if (packageData.URL) {
		logger.debug("package.ts: Received package data with URL: " + packageData.URL);
		packageJSON = await handleURL(packageData.URL);
	} else if (packageData.Content) {
		logger.debug("package.ts: Received package data with content");
		packageJSON = await handleContent(packageData.Content);
	} else {
		logger.warning("package.ts: Invalid package data received - status 400");
		return new Response("Invalid package data", { status: 400 });
	}

	let jsonReturn = {
		metadata: {
			Name: packageJSON.name,
			Version: packageJSON.version,
			ID: packageJSON.name.toLowerCase() || "no-id",
		},
		data: {
			Content: packageData.Content || "Base64 encoded content here...",
			JSProgram: "if (process.argv.length === 7) {\nconsole.log('Success')\nprocess.exit(0)\n} else {\nconsole.log('Failed')\nprocess.exit(1)\n}\n",
		},
	};

	logger.debug("package.ts: Returning package metadata: " + jsonReturn.metadata.Name + " @ " + jsonReturn.metadata.Version + " with ID " + jsonReturn.metadata.ID);
	return jsonReturn;
}

async function handleContent(content: string, url?: string) {
	const suffix = Date.now() + Math.random().toString(36).substring(7);
	const decodedContent = atob(content);

	const tempFilePath = "./temp/pkg_" + suffix + ".zip";
	const unzipPath = "./temp/pkg_unzip_" + suffix;
	await Deno.mkdir("./temp", { recursive: true });
	await Deno.mkdir(unzipPath, { recursive: true });

	await Deno.writeFile(tempFilePath, new Uint8Array([...decodedContent].map((c) => c.charCodeAt(0))));
	await Deno.run({ cmd: ["unzip", "-q", tempFilePath, "-d", unzipPath] }).status();

	const packageJSON = await parsePackageJSON(unzipPath);
	await uploadZipToSQLite(unzipPath, tempFilePath, packageJSON);

	if (url != "No repository URL" && url) { packageJSON.url = url; }
	if (packageJSON.url != "No repository URL") {
		logger.debug("package.ts: Fake calling phase 1 on: " + packageJSON.url);
	} else {
		logger.debug("package.ts: No repository URL found in package.json for " + packageJSON.name + ", not running Phase 1");
	}

	await Deno.remove(tempFilePath);
	await Deno.remove(unzipPath, { recursive: true });
	await Deno.remove("./temp", { recursive: true });

	return packageJSON;
}

async function handleURL(url: string) {
	let response = await fetch(url + "/zipball/master");
	if (!response.ok) {
		response = await fetch(url + "/zipball/main");
	}

	if (!response.ok) {
		const errMsg = `Failed to fetch: ${response.status} ${response.statusText}`;
		logger.warning("package.ts: " + errMsg);
		throw new Error(errMsg);
	}

	const content = await response.arrayBuffer();
	const base64Content = btoa(
		new Uint8Array(content).reduce((data, byte) => data + String.fromCharCode(byte), ""),
	);

	const packageJSON = await handleContent(base64Content, url);
	return packageJSON;
}

async function parsePackageJSON(filePath: string) {
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
			logger.warning("package.ts: package.json not found - status 400");
			throw new Response("package.json not found", { status: 400 });
		}
	}

	return {
		author: packageJSON.author || "No author",
		name: packageJSON.name.split("/").pop() || "No name",
		version: packageJSON.version || "No version",
		url: packageJSON.repository?.url || packageJSON.url || "No repository URL",
		json: packageJSON || {},
	};
}

async function uploadZipToSQLite(unzipPath: string, tempFilePath: string, packageJSON: any) {
	const db = new DB(DB_PATH);

	const zipData = await Deno.readFile(tempFilePath);
	const zipBase64 = btoa(new Uint8Array(zipData).reduce((data, byte) => data + String.fromCharCode(byte), ""));

	logger.debug("package.ts: Adding package zip named [" + packageJSON.name + "] @ [" + packageJSON.version + "] located at " + tempFilePath + " to SQLite database");

	db.query(
		"INSERT OR IGNORE INTO packages (name, url, version, base64_content) VALUES (?, ?, ?, ?)",
		[packageJSON.name, packageJSON.url, packageJSON.version, zipBase64],
	);

	db.close();
}
