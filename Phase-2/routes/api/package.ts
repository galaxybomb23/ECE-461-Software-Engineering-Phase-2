import { Handlers } from "$fresh/server.ts";
import { PackageData } from "../../types/index.ts";
import { open } from "sqlite/mod.ts"; // Import sqlite3 library

export const handler: Handlers = {
    // Handles POST request to add a new package to the registry
    async POST(req) {
        // Extract the package data from the request body
        const packageData = await req.json() as PackageData;

        // Validate the package data
        if (!packageData.Content && !packageData.URL && !packageData.JSProgram) {
            return new Response("Invalid package data", { status: 400 });
        }

        // We will have either Content or URL, but not both
        if (packageData.Content) {
            await handleContent(packageData.Content);
        } else if (packageData.URL) {
            handleURL(packageData.URL);
        }
        else {
            // Return 400 for malformed package data
            return new Response("Invalid package data", { status: 400 });
        }

        // Return success response after processing
        return new Response("Package added", { status: 200 });
    },
};

// Content handling logic (unzipping and uploading to SQLite)
async function handleContent(content: string) {
    // content is a base64 encoded string of a .zip file
    const decodedContent = atob(content);

    // Write the decoded content to a temp zip
    const tempFilePath = "./pkg.zip";
    await Deno.writeFile(tempFilePath, new Uint8Array([...decodedContent].map(c => c.charCodeAt(0))));

    // Unzip the content
    const unzipPath = "./pkg_unzip"; // Directory to store unzipped content
    await Deno.mkdir(unzipPath, { recursive: true });
    await Deno.run({ cmd: ["unzip", tempFilePath, "-d", unzipPath],}).status();

    // Open the SQLite database
    const db = await open("./database_path/data.db");

    //
    // Below code is untested, will verify after issue #6 is resolved (move phase 1 code into phase 2)
    //

    // Loop through the unzipped files, insert the content into the database
    for await (const item of Deno.readDir(unzipPath)) {
        if (item.isFile) {
            const filePath = `${unzipPath}/${item.name}`;
            const fileContent = await Deno.readTextFile(filePath);

            // Insert file content into the SQLite database
            await db.execute(
                "INSERT INTO packages (filename, content) VALUES (?, ?)",
                [item.name, fileContent],
            );
        }
    }

    // Clean up the temporary files after processing
    await Deno.remove(tempFilePath);
    await Deno.remove(unzipPath, { recursive: true });

    // Close the database
    await db.close();
}

// URL handling logic
function handleURL(url: string) {
    // Implement URL handling logic here (e.g., fetch content from URL and store it)
}
