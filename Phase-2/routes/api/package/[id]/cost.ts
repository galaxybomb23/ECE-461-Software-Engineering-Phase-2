// API Endpoint: GET /package/{id}/cost
// Description: Get the cost of a package (BASELINE)

import { Handlers } from "$fresh/server.ts";
import { type Package, PackageCost } from "~/types/index.ts";
import { logger } from "~/src/logFile.ts";
import { getUserAuthInfo } from "~/utils/validation.ts";
import { DB, Row } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

export const handler: Handlers = {
	// Handles GET request to retrieve package cost
	async GET(req, ctx) {
		// Extract the package ID from the request parameters
		const id = parseInt(ctx.params.id);

		// Extract and validate the 'X-Authentication' token
		const authToken = req.headers.get("X-Authorization") ?? "";
		if (!authToken) {
			logger.info("Invalid request: missing authentication token");
			return new Response("Invalid request: missing authentication token", { status: 403 });
		}
		if (!getUserAuthInfo(authToken).is_token_valid) {
			logger.info("Unauthorized request: invalid token");
			return new Response("Unauthorized request: invalid token", { status: 403 });
		}

		// Extract query parameter (offset for pagination)
		const url = new URL(req.url);
		const dependency: boolean = url.searchParams.get("dependency") === "true";

		// Validate the package ID
		return calcPackageCost(id, dependency);
	},
};

/**
 * @function calcPackageCost
 * @param {number} id - The package ID to calculate the cost for.
 * @param {boolean} dependency - Whether to include dependencies in the cost calculation.
 * @returns {Response} The response containing the package cost.
 */

export async function calcPackageCost(
	id: number,
	dependency: boolean,
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
): Promise<Response> {
	// Placeholder for the cost calculation logic
	// check if package exists
	try {
		const pkgRow: Row[] = await db.query("SELECT * FROM packages WHERE id = ?", [id]);
		if (pkgRow.length === 0) {
			return new Response("Package not found", { status: 404 });
		}

		// // get dependencies NOTE THIS IS PLACEHOLDER CODE
		// let dependencies: PackageCost[] = [];
		// let dependencyIDs = await db.query("SELECT dependency_ids FROM dependencies WHERE package_id = ?", [id]);
		// let allDependencyIDs = new Set();
		// let newDependencyIDs = new Set(dependencyIDs.map(dep => dep.id));

		// // get all dependencies recursively

		// while (newDependencyIDs.size > 0) {
		// 	for (let depID of newDependencyIDs) {
		// 		let depPackageCost: PackageCost = { standaloneCost: 0, totalCost: 0 };
		// 		let depcost = await db.query("SELECT S FROM packages WHERE id = ?", [depID]);
		// 		if (depcost.length === 0) {
		// 			return new Response("Dependency not found", { status: 400 });
		// 		}
		// 		depPackageCost.standaloneCost = depcost[0].S;
		// 		depPackageCost.totalCost = depcost[0].S; // Assuming totalCost is the same as standaloneCost for simplicity
		// 		depPackageCost.id = depID;
		// 		dependencies.push(depPackageCost);

		// 		let subDependencyIDs = await db.query("SELECT dependency_ids FROM dependencies WHERE package_id = ?", [depID]);
		// 		subDependencyIDs.forEach(subDep => {
		// 			if (!allDependencyIDs.has(subDep.id)) {
		// 				newDependencyIDs.add(subDep.id);
		// 			}
		// 		});
		// 	}
		// 	allDependencyIDs = new Set([...allDependencyIDs, ...newDependencyIDs]);
		// 	newDependencyIDs = new Set();
		// }

		// // sum standalone costs of dependencies and update total cost for this package
		// let packageCost: PackageCost = { standaloneCost: 0, totalCost: 0 };
		// dependencies.forEach(dep => {
		// 	packageCost.totalCost += dep.standaloneCost;
		// });

		// // cache the total cost for this package
		// await db.query("UPDATE packages SET S = ? WHERE id = ?", [packageCost.totalCost, id]);

		// // construct the response
		// // IDRK what to do here
		const packageCost: PackageCost = {
			"2345235235": {
				standaloneCost: 10,
				totalCost: 90,
			},
		};
		return new Response(JSON.stringify(packageCost), { status: 200 });
	} catch (error) {
		logger.error(`Error calculating package cost: ${error}`);
		return new Response("Error calculating package cost", { status: 500 });
	} finally {
		if (autoCloseDB) db.close();
	}
}
