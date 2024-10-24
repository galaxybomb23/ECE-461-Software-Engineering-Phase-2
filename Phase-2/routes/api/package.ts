import { Handlers } from "$fresh/server.ts";
import { PackageData } from "../../types/index.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // SQLite3 import

const DB_PATH = "data/data.db";

export const handler: Handlers = {
	async POST(req) {
		const packageData = await req.json() as PackageData;

		if (packageData.URL) {
			console.log("[*] Received package data with URL: " + packageData.URL);
			handleURL(packageData.URL);
		} else if (packageData.Content) {
			console.log("[*] Received package data with content");
			await handleContent(packageData.Content);
		} else return new Response("Invalid package data", { status: 400 });

		return new Response("Package added", { status: 201 });
	},
};

async function handleContent(content: string, url?: string) {
	const suffix = Date.now() + Math.random().toString(36).substring(7);
	const decodedContent = atob(content);

	// Write paths for zip and unzip
	const tempFilePath = "./temp/pkg_" + suffix + ".zip";
	const unzipPath = "./temp/pkg_unzip_" + suffix;
	await Deno.mkdir("./temp", { recursive: true });
	await Deno.mkdir(unzipPath, { recursive: true });

	// write zip and unzip
	await Deno.writeFile(tempFilePath, new Uint8Array([...decodedContent].map((c) => c.charCodeAt(0))));
	await Deno.run({ cmd: ["unzip", "-q", tempFilePath, "-d", unzipPath] }).status();

	// Upload package (unzipped) to SQLite database
    const packageJSON = await parsePackageJSON(unzipPath);
	await uploadZipToSQLite(unzipPath, tempFilePath, packageJSON);

	// call Phase 1 on the packageJSON.url
    if (url != "No repository URL") { packageJSON.url = url; } // Use the URL from the POST request if available
	if (packageJSON.url) {
		console.log("  [Y] Fake calling phase 1 on: " + packageJSON.url);
		//phase1(packageJSON.url);
	} else {console.log(
			"  [N] No repository URL found in package.json for " + packageJSON.name + ", not running Phase 1",
		);}

	// Clean up
	await Deno.remove(tempFilePath);
	await Deno.remove(unzipPath, { recursive: true });
	await Deno.remove("./temp", { recursive: true });

	console.log("  \u2713 Package added!");
}

async function handleURL(url: string) {
	// Try both Master and Main branches
	let response = await fetch(url + "/zipball/master");
	if (!response.ok) {
		response = await fetch(url + "/zipball/main");
	}

	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
	}

	const content = await response.arrayBuffer();
	const base64Content = btoa(
		new Uint8Array(content).reduce((data, byte) => data + String.fromCharCode(byte), ""),
	);
	await handleContent(base64Content, url);
}

async function parsePackageJSON(filePath: string) {
	const dirEntries = Deno.readDir(filePath);
	let packageFolder: Deno.DirEntry | null = null;

	// .zip file always contains a single directory, find it
	for await (const entry of dirEntries) {
		if (entry.isDirectory) {
			packageFolder = entry; // Store the first directory found
			break; // Exit the loop after finding the first directory
		}
	}

    console.log("  [*] Fake reading package.json");
    let packageJSON: any;
    const rootPath = `${filePath}/package.json`;
    const subDirPath = `${filePath}/${packageFolder?.name}/package.json`;

    try {
        packageJSON = JSON.parse(await Deno.readTextFile(rootPath));
        console.log("  [*] Found package.json in root");
    } catch {
        try {
            packageJSON = JSON.parse(await Deno.readTextFile(subDirPath));
            console.log("  [*] Found package.json in subdirectory");
        } catch {
            throw new Response("package.json not found", { status: 400 });
        }
    }

    return {
        author: packageJSON.author || "No author",
        name: packageJSON.name.split("/").pop() || "No name",
        version: packageJSON.version || "No version",
        url: packageJSON.repository?.url || "No repository URL",
        json: packageJSON || {},
    };
}

async function uploadZipToSQLite(unzipPath: string, tempFilePath: string, packageJSON: any) {
    // Open SQLite database
    const db = new DB(DB_PATH);

    // base64 encode the zip at tempFilePath and add to SQLite database at packages/<package_name>/<package_version>
    const zipData = await Deno.readFile(tempFilePath);
    const zipBase64 = btoa(new Uint8Array(zipData).reduce((data, byte) => data + String.fromCharCode(byte), ""));

    console.log("  [*] Fake adding package zip named [" + packageJSON.name + "] @ [" + packageJSON.version + "] located at " + tempFilePath + " to SQLite database");

    // Add base64 encoded zip to SQLite database
    db.query(
        "INSERT OR IGNORE INTO packages (name, url, version, base64_content) VALUES (?, ?, ?, ?)",
        [packageJSON.name, packageJSON.url, packageJSON.version, zipBase64],
    );

    // Close SQLite database
    db.close();
}
