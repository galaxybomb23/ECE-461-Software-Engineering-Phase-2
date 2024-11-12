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
				"There is missing field(s) in the PackageID or it is formed improperly, or is invalid",
				{ status: 400 },
			);
		}
	},

	// Handles PUT request to update a package
	async PUT(req, ctx) {
		const { id } = ctx.params;
		// Implement package update logic here
		return new Response("Package updated", { status: 200 });
	},

	// Handles DELETE request to delete a package
	// This is a non-baseline endpoint
	async DELETE(req, ctx) {
		const { id } = ctx.params;
		// Implement package deletion logic here
		return new Response("Package deleted", { status: 200 });
	},
};

export async function queryPackageById(
	id: string,
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
): Promise<Package | null> {
	try {
		const matchedPackages = await db.query("SELECT * FROM packages WHERE ID = ?", [id]);

		if (matchedPackages.length > 0) {
			logger.debug(`queryPackageById: Found package with ID: ${id}`);
			const pkg = {
				metadata: {
					ID: matchedPackages[0][0],
					Name: matchedPackages[0][1],
					Version: matchedPackages[0][3],
				} as PackageMetadata,
				data: {
					Content: matchedPackages[0][4],
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
