// API Endpoint: GET /package/{id}/cost
// Description: Get the cost of a package (BASELINE)

import { Handlers } from "$fresh/server.ts";
import { PackageCost } from "~/types/index.ts";
import { logger } from "~/src/logFile.ts";
import { getUserAuthInfo } from "~/utils/validation.ts";
import { DB, Row } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

export const handler: Handlers = {
	// Handles GET request to retrieve package cost
	async GET(req, ctx) {
		logger.info(`--> /package/{id}/cost: GET`);
		logger.debug(`Request: ${JSON.stringify(req)}`);
		logger.debug(`Ctx: ${JSON.stringify(ctx)}`);
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
		const ret = await calcPackageCost(id, dependency);
		logger.debug(`Response: ${await ret.clone().text()}\n`);
		return ret;
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
	logger.silly(`calcPackageCost(${id},${dependency} )`);
	try {
		const qr = await db.query(
			"SELECT dependency_cost FROM packages WHERE id = ?",
			[id],
		)[0] as Row;

		if (qr === undefined) {
			logger.error(`Package with ID ${id} not found`);
			return new Response(`Package with ID ${id} not found`, { status: 404 });
		}

		const depencency_cost = qr[0] as string;

		// split with comma
		const dependency_cost = depencency_cost.split(",");
		const base_pkg_cost = parseInt(dependency_cost[0]);

		// calculate total cost of all dependencies
		let totalCost = base_pkg_cost;
		for (let i = 0; i < dependency_cost.length; i++) {
			if (dependency_cost[i] == "") continue;
			// const id = dependency_cost[i].split(":")[0];
			const cost = dependency_cost[i].split(":")[1] ?? 0;
			totalCost += parseInt(cost);
		}

		const fullCost = 1024 * 1024; // 1MB, since db holds size in B
		if (dependency) {
			let packageCost: PackageCost = {};

			// calculate total and standalone cost for each dependency
			for (let i = 0; i < dependency_cost.length; i++) {
				if (dependency_cost[i] == "") continue;

				// pkg_id is either the dependency's ID or current package's ID
				let pkg_id = dependency_cost[i].split(":")[0];
				let pkg_cost = parseInt(dependency_cost[i].split(":")[1] ?? 0);

				if (i == 0) {
					pkg_id = id.toString();
					pkg_cost = base_pkg_cost;
				}

				// populate the packageCost object
				packageCost = {
					...packageCost,
					[pkg_id]: {
						totalCost: +(totalCost / fullCost).toFixed(2),
						standaloneCost: +(pkg_cost / fullCost).toFixed(2),
					},
				};
				totalCost -= pkg_cost;
			}
			return new Response(JSON.stringify(packageCost), { status: 200 });
		} else {
			const packageCost: PackageCost = {
				[id]: {
					totalCost: +(base_pkg_cost / fullCost).toFixed(2),
				},
			};
			return new Response(JSON.stringify(packageCost), { status: 200 });
		}
	} catch (error) {
		logger.error(`Error calculating package cost: ${error}`);
		return new Response("Error calculating package cost: " + error, { status: 500 });
	} finally {
		if (autoCloseDB) db.close();
	}
}
