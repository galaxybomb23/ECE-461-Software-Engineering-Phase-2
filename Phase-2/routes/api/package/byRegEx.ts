// API Endpoint: POST /packages/byRegEx
// Description: Get the packages from the registry that match the given regular expression. (BASELINE)

import { Handlers } from "$fresh/server.ts";
import { logger } from "~/src/logFile.ts";
import { getUserAuthInfo } from "~/utils/validation.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";
import { PackageQuery, regexRequest } from "~/types/index.ts";

export const handler: Handlers = {
	async POST(req) {
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

		// validate regex
		let body;
		try {
			body = await req.json() as regexRequest;
		} catch (error) {
			logger.info("Invalid JSON format in request body");
			return new Response("Invalid JSON format in request body", { status: 400 });
		}

		if (!body.regex) {
			logger.info("Invalid request: missing regex");
			return new Response("Invalid request: missing regex", { status: 400 });
		}

		// handle error codes 200, 404 in function
		return await getPackagesByRegEx(body);
	},
};

/**
 * @function getPackagesByRegEx
 * @param {PackageRegex} body - The request body containing the regular expression.
 * @returns {Response} The response containing the packages that match the regular expression.
 */
export async function getPackagesByRegEx(
	body: regexRequest,
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
): Promise<Response> {
	// Placeholder for the regular expression logic
	// check if package exists

	const regexResponse: PackageQuery[] = [
		{
			"Version": "1.2.3",
			"Name": "Underscore",
		},
		{
			"Version": "1.2.3-2.1.0",
			"Name": "Lodash",
		},
		{
			"Version": "^1.2.3",
			"Name": "React",
		},
	];
	if (autoCloseDB) db.close();
	return new Response(JSON.stringify(regexResponse), { status: 200 });
}
