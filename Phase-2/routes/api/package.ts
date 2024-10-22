import { Handlers } from "$fresh/server.ts";
import { PackageData } from "../../types/index.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // SQLite3 import

const DB_PATH = "./database_path/data.db";

export const handler: Handlers = {
    async POST(req) {
        const packageData = await req.json() as PackageData;
        
        if (packageData.URL) {
            console.log("[*] Received package data with URL: " + packageData.URL);
            handleURL(packageData.URL);
        }
        else if (packageData.Content) {
            console.log("[*] Received package data with content");
            await handleContent(packageData.Content);
        }
        else { return new Response("Invalid package data", { status: 400 }); }

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
    await Deno.writeFile(tempFilePath, new Uint8Array([...decodedContent].map(c => c.charCodeAt(0))));    
    await Deno.run({cmd: ["unzip", "-q", tempFilePath, "-d", unzipPath]}).status();

    // Upload package (unzipped) to SQLite database
    await uploadFolderToSQLite(unzipPath);

    // call Phase 1 on the packageJSON.url
    const packageJSON = await parsePackageJSON(unzipPath);
    if (url) { packageJSON.url = url } // Use the URL from the request if provided
    if (packageJSON.url) {
        console.log("  [Y] Fake calling phase 1 on: " + packageJSON.url);
        //phase1(packageJSON.url);
    }
    else { console.log("  [N] No repository URL found in package.json for " + packageJSON.name + ", not running Phase 1"); }

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
        new Uint8Array(content).reduce((data, byte) => data + String.fromCharCode(byte), '')
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

    const packageJSONPath = `${filePath}/${packageFolder.name}/package.json`;
    if (!await Deno.stat(packageJSONPath).then(stat => stat.isFile)) {
        throw new Response("package.json not found", { status: 400 });
    }
    const packageJSON = JSON.parse(await Deno.readTextFile(packageJSONPath));
    return {
        author: packageJSON.author,
        name: packageJSON.name.split("/").pop(),
        version: packageJSON.version,
        url: packageJSON.repository?.url || "",
        json: packageJSON,
    };
}


async function uploadFolderToSQLite(filePath: string) {
    // UNCOMMENT ONCE DB IS IMPLEMENTED
    // const db = new DB(DB_PATH);  // Open the SQLite database
    console.log("  [*] Fake uploading files from: " + filePath);

    // Helper function to process files recursively
    async function processDirectory(dirPath: string) {
        for await (const item of Deno.readDir(dirPath)) {
            const itemPath = `${dirPath}/${item.name}`;
            if (item.isFile) {
                const fileContent = await Deno.readTextFile(itemPath);

                //console.log("  Fake uploading file: " + itemPath.replace(filePath, ''));

                // UNCOMMENT ONCE DB IS IMPLEMENTED
                // Insert file content into the SQLite database
                // await db.execute(
                //     "INSERT INTO packages (filename, content) VALUES (?, ?)",
                //     [itemPath.replace(filePath, ''), fileContent],  // Store relative path
                // );

            } else if (item.isDirectory) {
                // Recurse into subdirectory
                await processDirectory(itemPath);
            }
        }
    }

    // Start processing the folder
    await processDirectory(filePath);

    // UNCOMMENT ONCE DB IS IMPLEMENTED
    //db.close();  // Close the database connection
}