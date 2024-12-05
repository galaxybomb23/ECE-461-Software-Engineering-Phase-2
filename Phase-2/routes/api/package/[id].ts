// API Endpoints:
// GET /package/{id} - Retrieve a package (BASELINE)
// POST /package/{id} - Update a package (BASELINE)
// DELETE /package/{id} - Delete a package (NON-BASELINE)

import { Handlers } from "$fresh/server.ts";
import { displayRequest, logger } from "~/src/logFile.ts";
import { Package, PackageData, PackageMetadata } from "~/types/index.ts";
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts"; // SQLite3 import
import { DATABASEFILE } from "~/utils/dbSingleton.ts";
import { getUserAuthInfo } from "~/utils/validation.ts";

// uploading functionality
import { handleContent, handleURL } from "~/routes/api/package.ts";

export const handler: Handlers = {
	// Handles GET request to retrieve a package
	async GET(req, ctx) {
		logger.info(`--> /package/{id}: GET`);
		await displayRequest(req);
		logger.verbose(`Ctx: ${Deno.inspect(ctx, { depth: 10, colors: false })}`);

		const { id } = ctx.params;

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

		try {
			const pkg = await queryPackageById(id);
			logger.debug(`Package(s): ${await pkg}\n`);

			if (pkg) {
				return new Response(JSON.stringify(pkg), { status: 200 });
			} else {
				return new Response("Package not found", { status: 404 });
			}
		} catch (error) {
			logger.error(`GET /package/{id}: Error - ${error}`);
			return new Response(
				"There is missing field(s) in the PackageID or it is formed improperly, or is invalid: " + error,
				{ status: 400 },
			);
		}
	},

	// Handles POST request to update a package
	async POST(req, ctx) {
		logger.info(`--> /package/{id}: POST`);
		logger.debug(`Request: ${JSON.stringify(req)}`);
		logger.debug(`Ctx: ${JSON.stringify(ctx)}`);
		const body = await req.json();

		try {
			if (
				!body.metadata || !body.metadata.ID || !body.metadata.Name || !body.metadata.Version ||
				!body.data
			) {
				return new Response("Missing required fields in the request body", { status: 400 });
			}

			// Ensure that at least one of URL or Content is provided
			if (!body.data.URL && !body.data.Content) {
				return new Response("At least one of URL or Content must be provided", { status: 400 });
			}

			// Query target package
			const pkg = await queryPackageById(undefined, body.metadata.Name, undefined);
			if (!pkg) return new Response("Package not found", { status: 404 });

			// get versions of existing packages matching the name
			let version: [string] = [body.metadata.Version];
			if (Array.isArray(pkg)) {
				version = [pkg[0].metadata.Version];
				for (let i = 1; i < pkg.length; i++) {
					version.push(pkg[i].metadata.Version);
				}
			}
			// Update the package based on the provided data, pass version array to check if the patch version is higher inside handleContent
			const success = await updatePackageContent(
				body.metadata.ID,
				body.metadata.Name,
				version,
				body.data.URL,
				body.data.Content,
			);

			if (success) {
				logger.info(
					`POST /package/{id}: Package updated - ID: ${body.metadata.ID}, URL: ${
						body.data.URL || "unchanged"
					} and Content: ${body.data.Content || "unchanged"}`,
				);
				return new Response("Package updated", { status: 200 });
			} else {
				logger.error(`POST /package/{id}: Package not updated`);
				return new Response("Package not updated", { status: 400 });
			}
		} catch (error) {
			logger.error(`POST /package/{id}: Error - ${error}`);
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
			} else if ((error as Error).message.includes("Package version is lower than the current version")) {
				return new Response("Package patch version is lower than the current version", { status: 409 });
			} else if ((error as Error).message.includes("Package name does not match the proposed name")) {
				return new Response("Package name does not match the proposed name", { status: 400 });
			} else {
				return new Response(
					"There is missing field(s) in the PackageData or it is formed improperly (e.g. Content and URL ar both set)" +
						(error as Error).message,
					{ status: 400 },
				);
			}
		}
	},

	// Handles DELETE request to delete a package
	async DELETE(req, ctx) {
		logger.info(`--> /package/{id}: DELETE`);
		logger.debug(`Request: ${JSON.stringify(req)}`);
		logger.debug(`Ctx: ${JSON.stringify(ctx)}`);
		const { id } = ctx.params;

		try {
			// First ensure the package exists
			const pkg = await queryPackageById(id);
			if (!pkg) return new Response("Package not found", { status: 404 });

			// Package exists, delete it
			const success = await deletePackage(id);

			if (success) {
				logger.info(`DELETE /package/{id}: Package deleted - ID: ${id}`);
				return new Response("Package deleted", { status: 200 });
			} else {
				logger.error(`DELETE /package/{id}: Package not deleted`);
				return new Response("Package not deleted", { status: 400 });
			}
		} catch (error) {
			logger.error(`DELETE /package/{id}: Error - ${error}`);
			return new Response(
				"There is missing field(s) in the PackageID or it is formed improperly, or is invalid - " + error,
				{ status: 400 },
			);
		}
	},
};

export async function deletePackage(id: string, db = new DB(DATABASEFILE), autoCloseDB = true) {
	try {
		const query = "DELETE FROM packages WHERE ID = ?";
		const params = [id];
		await db.query(query, params);

		// Return true if rows were deleted, false otherwise
		return db.changes > 0;
	} finally {
		if (autoCloseDB) db.close();
	}
}

// Update the package (URL or Content, or both) based on what is provided
export async function updatePackageContent(
	id: string,
	name: string, // Name of the package
	version: [string],
	URL?: string,
	content?: string,
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
) {
	try {
		// Check if the package already exists
		if (await queryPackageById(id, name, undefined, db, false)) {
			let packageJSON: Package | null = null;
			if (content) {
				packageJSON = await handleContent(content, undefined, 1, db, false, version);
			}
			if (URL) {
				packageJSON = await handleURL(URL, db, false, undefined);
			}

			if (packageJSON) {
				// check name matches proposed name
				if (packageJSON.metadata.Name !== name) {
					throw new Error("Package name does not match the proposed name");
				}
			}
		} else {
			logger.debug("Package not found");
			return false;
		}
		return true;
	} catch (error) {
		logger.error(error);
		return false;
	} finally {
		if (autoCloseDB) db.close();
	}
}

export async function queryPackageById(
	id?: string,
	name?: string,
	version?: string,
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
) {
	try {
		let query = "SELECT * FROM packages";
		const queryParams: string[] = [];
		const conditions: string[] = [];

		// Add conditions dynamically
		if (id) {
			conditions.push("ID = ?");
			queryParams.push(id);
		}
		if (name) {
			conditions.push("Name = ?");
			queryParams.push(name);
		}
		if (version) {
			conditions.push("Version = ?");
			queryParams.push(version);
		}

		// If conditions exist, append them to the query
		if (conditions.length > 0) {
			query += " WHERE " + conditions.join(" AND ");
		}

		// Execute the query
		const matchedPackages = await db.query(query, queryParams);

		// If no packages are found, return null
		if (matchedPackages.length === 0) {
			return null;
		}

		// Map database rows to package objects
		const packages = matchedPackages.map((row) => ({
			metadata: {
				ID: row[0],
				Name: row[1],
				Version: row[3],
			} as PackageMetadata,
			data: {
				Content: row[4],
				URL: row[5],
			} as PackageData,
		} as Package));

		// Return the list if multiple packages are found, or the single package if only one
		return packages.length === 1 ? packages[0] : packages;
	} finally {
		if (autoCloseDB) db.close();
	}
}
