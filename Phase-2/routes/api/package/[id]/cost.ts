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
		// const authToken = req.headers.get("X-Authorization") ?? "";
		// if (!authToken) {
		// 	logger.info("Invalid request: missing authentication token");
		// 	return new Response("Invalid request: missing authentication token", { status: 403 });
		// }
		// if (!getUserAuthInfo(authToken).is_token_valid) {
		// 	logger.info("Unauthorized request: invalid token");
		// 	return new Response("Unauthorized request: invalid token", { status: 403 });
		// }

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
	// TODO: `dependency` is unused currently since no way to retrieve dependencies.
	// Current approach just uses total NUMBER of dependencies..
	dependency: boolean,
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
): Promise<Response> {
	try {
		const depencency_cost_and_base64 = await db.query(
			"SELECT dependency_cost, base64_content FROM packages WHERE id = ?",
			[id],
		)[0];

		if (!depencency_cost_and_base64) {
			logger.error(`Package with ID ${id} not found`);
			return new Response(`Package with ID ${id} not found`, { status: 404 });
		}

		const dependency_cost = depencency_cost_and_base64[0] as number;
		const base64_content = depencency_cost_and_base64[1] as string;
		const program_length = base64_content.length;

		if (!dependency_cost || !base64_content) {
			logger.error(`Error retrieving package cost for ID ${id}`);
			return new Response(`Error retrieving package cost for ID ${id}`, { status: 500 });
		}

		// function to scale the cost of the package based on the program length and dependency cost
		const logisticScale = (x: number, x0: number, k: number = 0.01): number => {
			const scaledValue = 1 / (1 + Math.exp(-k * (x - x0)));
			return parseFloat(scaledValue.toFixed(2)); // Round to 2 decimal places
		};

		// Calculate the cost of the package
		const packageCost: PackageCost = {
			[id]: {
				standaloneCost: logisticScale(program_length, 10000000, 0.0000001), // Scale program length
				totalCost: logisticScale(dependency_cost, 15),
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
