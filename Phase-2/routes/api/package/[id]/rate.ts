// API Endpoint: GET /package/{id}/rate
// Description: Get ratings for this package. (BASELINE)

import { Handlers } from "$fresh/server.ts";
import { PackageRating } from "~/types/index.ts";
import { logger } from "~/src/logFile.ts";
import { getUserAuthInfo } from "~/utils/validation.ts";
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

export const handler: Handlers = {
	// Handles GET request to retrieve package rating
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

		// handle error codes 400, 404, 500, and 200 in function
		return calcPackageRating(id);
	},
};

/**
 * @function calcPackageRating
 * @param {number} id - The package ID to calculate the rating for.
 * @returns {Response} The response containing the package rating.
 */
export async function calcPackageRating(id: number, db = new DB(DATABASEFILE), autoCloseDB = true): Promise<Response> {
	// placeholder for the rating calculation logic
	const rating: PackageRating = {
		"BusFactor": 0,
		"BusFactorLatency": 0,
		"Correctness": 0,
		"CorrectnessLatency": 0,
		"RampUp": 0,
		"RampUpLatency": 0,
		"ResponsiveMaintainer": 0,
		"ResponsiveMaintainerLatency": 0,
		"LicenseScore": 0,
		"LicenseScoreLatency": 0,
		"GoodPinningPractice": 0,
		"GoodPinningPracticeLatency": 0,
		"PullRequest": 0,
		"PullRequestLatency": 0,
		"NetScore": 0,
		"NetScoreLatency": 0,
	};

	if (autoCloseDB) {
		db.close();
	}
	return new Response(JSON.stringify(rating), {
		headers: { "Content-Type": "application/json" },
		status: 200,
	});
}
