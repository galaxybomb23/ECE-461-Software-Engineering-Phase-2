// API Endpoints:
// GET /package/{id} - Retrieve a package (BASELINE)
// PUT /package/{id} - Update a package (BASELINE)
// DELETE /package/{id} - Delete a package (NON-BASELINE)

import { Handlers } from "$fresh/server.ts";
import { logger } from "~/src/logFile.ts";
import { Package, PackageData, PackageMetadata } from "~/types/index.ts";
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts"; // SQLite3 import
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

export const handler: Handlers = {
	// Handles GET request to retrieve a package
	async GET(req, ctx) {
		const { id } = ctx.params;

		try {
			const pkg = await queryPackageById(id);

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

	// Handles PUT request to update a package
	async PUT(req, ctx) {
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

			// Query target package: MUST match all of ID, Name, and Version of an existing package
			const pkg = await queryPackageById(body.metadata.ID, body.metadata.Name, body.metadata.Version);

			if (pkg) {
				// Update the package based on the provided data
				const success = await updatePackageContent(body.metadata.ID, body.data.URL, body.data.Content);

				if (success) {
					logger.info(
						`PUT /package/{id}: Package updated - ID: ${body.metadata.ID}, URL: ${
							body.data.URL || "unchanged"
						} and Content: ${body.data.Content || "unchanged"}`,
					);
					return new Response("Package updated", { status: 200 });
				} else {
					logger.error(`PUT /package/{id}: Package not updated`);
					return new Response("Package not updated", { status: 400 });
				}
			} else {
				return new Response("Package not found", { status: 404 });
			}
		} catch (error) {
			logger.error(`PUT /package/{id}: Error - ${error}`);
			return new Response(
				"There is missing field(s) in the PackageID or it is formed improperly, or is invalid - " + error,
				{ status: 400 },
			);
		}
	},

	// Handles DELETE request to delete a package
	async DELETE(req, ctx) {
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
	URL?: string,
	content?: string,
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
) {
	try {
		let query = "UPDATE packages SET ";
		const params: (string | null)[] = [];

		// Conditionally add URL and/or Content to the query
		if (URL) {
			query += "url = ?";
			params.push(URL);
		}

		if (content) {
			// If URL is already included, append a comma
			if (params.length > 0) query += ", ";
			query += "base64_content = ?";
			params.push(content);
		}

		// Add WHERE clause
		query += " WHERE ID = ?";
		params.push(id);

		// Execute the query
		await db.query(query, params);

		// Return true if rows were updated, false otherwise
		return db.changes > 0;
	} finally {
		if (autoCloseDB) db.close();
	}
}

export async function queryPackageById(
	id: string,
	name?: string,
	version?: string,
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
) {
	try {
		let query = "SELECT * FROM packages WHERE ID = ?";
		const queryParams = [id];

		// Add additional conditions if name and version are provided
		if (name) {
			query += " AND Name = ?";
			queryParams.push(name);
		}
		if (version) {
			query += " AND Version = ?";
			queryParams.push(version);
		}

		// Find the package with the given ID, Name, and Version
		const matchedPackages = await db.query(query, queryParams);

		// If a package is found, return the package object
		if (matchedPackages.length > 0) {
			logger.debug(
				`queryPackage: Found package with ID: ${id}${name ? `, Name: ${name}` : ""}${
					version ? `, Version: ${version}` : ""
				}`,
			);

			const pkg = {
				metadata: {
					ID: matchedPackages[0][0],
					Name: matchedPackages[0][1],
					Version: matchedPackages[0][3],
				} as PackageMetadata,
				data: {
					Content: matchedPackages[0][4],
					URL: matchedPackages[0][5],
				} as PackageData,
			} as Package;
			return pkg;
		} else {
			return null;
		}
	} finally {
		if (autoCloseDB) db.close();
	}
}