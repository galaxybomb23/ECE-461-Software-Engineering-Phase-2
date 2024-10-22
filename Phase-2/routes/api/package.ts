import { Handlers } from "$fresh/server.ts";
import { PackageData } from "../../types/index.ts";
import { open } from "sqlite/mod.ts"; // Import sqlite3 library}

const DB_PATH = "./database_path/data.db";

export const handler: Handlers = {
    // Handles POST request to add a new package to the registry
    async POST(req) {
        const packageData = await req.json() as PackageData;
        if (!packageData.Content && !packageData.URL && !packageData.JSProgram) {
            return new Response("Invalid package data", { status: 400 });
        }

        // We will have either Content or URL, but not both
        if (packageData.URL) {
            handleURL(packageData.URL);
        }
        else if (packageData.Content) {
            await handleContent(packageData.Content);
        }  
        else {
            return new Response("Invalid package data", { status: 400 });
        }

        // Success response (201 = Created content)
        return new Response("Package added", { status: 201 });
    },
};

// Bsae64 content handling logic (unzipping and uploading to SQLite)
async function handleContent(content: string) {
    // decode the base64 content
    const decodedContent = atob(content);

    // Write the decoded content to a temp zip
    const tempFilePath = "./pkg_ " + Math.random().toString(36).substring(7) + ".zip";
    await Deno.writeFile(tempFilePath, new Uint8Array([...decodedContent].map(c => c.charCodeAt(0))));

    // Unzip the content
    const unzipPath = "./pkg_unzip_" + Math.random().toString(36).substring(7);
    await Deno.mkdir(unzipPath, { recursive: true });
    await Deno.run({ cmd: ["unzip", tempFilePath, "-d", unzipPath],}).status();

    // Upload the unzipped content to SQLite
    await uploadFolderToSQLite(unzipPath);

    // Clean up the temporary files after processing
    await Deno.remove(tempFilePath);
    await Deno.remove(unzipPath, { recursive: true });

    // cannot run phase1 since requires a URL
}

// URL handling logic
async function handleURL(url: string) {
    // Convert GitHub URL to zip download 
    const downloadURL = url.split("github.com").join("codeload.github.com") + "/zip/refs/heads/main";

    // Download .zip
    const response = await fetch(downloadURL);
    if (!response.ok) {
        throw new Response("Failed to download the package", { status: 400 });
    }

    // Read and handle the content since it's base64 encoded zip
    const content = await response.arrayBuffer();
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(content)));
    await handleContent(base64Content);

    // Run phase1 index.ts code
    // await runPhase1(url);
}

// UNTESTED: Will test when #6 PR goes through to merge Phase 1 into Phase 2 folder
async function uploadFolderToSQLite(filePath: string) {
    // Open the SQLite database
    const db = open(DB_PATH);

    // Loop through the files in the folder
    for await (const item of Deno.readDir(filePath)) {
        if (item.isFile) {
            const fileContent = await Deno.readTextFile(`${filePath}/${item.name}`);

            // Insert file content into the SQLite database
            await db.execute(
                "INSERT INTO packages (filename, content) VALUES (?, ?)",
                [item.name, fileContent],
            );
        }
    }

    // Close the database connection
    await db.close();
}