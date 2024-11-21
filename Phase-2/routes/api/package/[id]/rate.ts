// API Endpoint: GET /package/{id}/rate
// Description: Get ratings for this package. (BASELINE)

import { Handlers } from "$fresh/server.ts";
import { type DatabasePackageRow, PackageRating } from "~/types/index.ts";
import { logger } from "~/src/logFile.ts";
import { getUserAuthInfo } from "~/utils/validation.ts";
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

export const handler: Handlers = {
	// Handles GET request to retrieve package rating
	async GET(req, ctx) {
		try {
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

			return calcPackageRating(id);
		} catch (error) {
			logger.error(`GET /package/{id}/rate: Error - ${error}`);
			return new Response("Invalid package ID or other error:", { status: 400 });
		}
	},
};

/**
 * @function calcPackageRating
 * @param {number} id - The package ID to calculate the rating for.
 * @returns {Response} The response containing the package rating.
 */
export async function calcPackageRating(id: number, db = new DB(DATABASEFILE), autoCloseDB = true): Promise<Response> {
	try {
		const pkg = await queryPackageById(id.toString(), db, false);

		if (!pkg) {
			return new Response("Package does not exist", { status: 404 });
		}

		// Aiming to find a better solution than this which doesn't directly index
		// since the order of the columns in the database might change. However query
		// returns an array, and DatabasePackageRow cannot be directly assigned as.
		const rating: PackageRating = {
			BusFactor: pkg[15] as number,
			BusFactorLatency: pkg[16] as number,
			Correctness: pkg[17] as number,
			CorrectnessLatency: pkg[18] as number,
			RampUp: pkg[11] as number,
			RampUpLatency: pkg[12] as number,
			ResponsiveMaintainer: pkg[19] as number,
			ResponsiveMaintainerLatency: pkg[20] as number,
			LicenseScore: pkg[5] as number,
			LicenseScoreLatency: pkg[6] as number,
			GoodPinningPractice: pkg[9] as number,
			GoodPinningPracticeLatency: pkg[10] as number,
			PullRequest: pkg[13] as number,
			PullRequestLatency: pkg[14] as number,
			NetScore: pkg[7] as number,
			NetScoreLatency: pkg[8] as number,
		};

		return new Response(JSON.stringify(rating), {
			headers: { "Content-Type": "application/json" },
			status: 200,
		});
	} finally {
		if (autoCloseDB) {
			db.close();
		}
	}
}

export async function queryPackageById(
	id: string,
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
) {
	try {
		const query = "SELECT * FROM packages WHERE ID = ?";
		const queryParams = [id];

		const result = await db.query(query, queryParams);
		if (result.length === 0) {
			return null;
		}
		return result[0];
	} finally {
		if (autoCloseDB) db.close();
	}
}
