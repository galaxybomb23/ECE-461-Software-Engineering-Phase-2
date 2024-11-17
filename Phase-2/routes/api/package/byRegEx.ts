// API Endpoint: POST /packages/byRegEx
// Description: Get the packages from the registry that match the given regular expression. (BASELINE)

import { Handlers } from "$fresh/server.ts";
import { logger } from "~/src/logFile.ts";
import { getUserAuthInfo } from "~/utils/validation.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";
import { PackageMetadata, regexRequest } from "~/types/index.ts";

export const handler: Handlers = {
	async POST(req) {
		logger.info("Request to /packages/byRegEx");
		// Extract and validate the 'X-Authentication' token
		const authToken = req.headers.get("X-Authorization") ?? "";
		if (!authToken) {
			logger.info("Invalid request: missing authentication token");
			return new Response("Invalid request: missing authentication token", {
				status: 403,
			});
		}
		if (!getUserAuthInfo(authToken).is_token_valid) {
			logger.info("Unauthorized request: invalid token");
			return new Response("Unauthorized request: invalid token", {
				status: 403,
			});
		}

		// validate regex
		let body: regexRequest;
		try {
			body = (await req.json()) as regexRequest;
		} catch (error) {
			logger.info("Invalid JSON format in request body");
			return new Response("Invalid JSON format in request body", {
				status: 400,
			});
		}
		logger.debug("Request body: " + JSON.stringify(body));
		if (!body.RegEx) {
			logger.info(`Invalid request: missing regex`);
			return new Response("Invalid request: missing regex", { status: 400 });
		}

		if (!isValidRegex(body.RegEx)) {
			logger.info("Invalid request: invalid regex");
			return new Response("Invalid request: invalid regex", { status: 400 });
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
	try {
		// add regex function to sqlite
		db.createFunction(
			(pattern: string, value: string): boolean => {
				try {
					const regex = new RegExp(pattern);
					return regex.test(value);
				} catch {
					return false; // Return false for invalid regex patterns
				}
			},
			{ name: "REGEXP", deterministic: true },
		);

		// Query the database
		const query = `SELECT name, version, id FROM packages WHERE name REGEXP ? OR readme REGEXP ?`;
		const params = [body.RegEx, body.RegEx];

		const packages: PackageMetadata[] = [];
		for (const [name, version, id] of db.query(query, params)) {
			packages.push({
				Name: String(name),
				Version: String(version),
				ID: String(id),
			});
		}

		if (packages.length === 0) {
			return new Response("No packages found", { status: 404 });
		}

		return new Response(JSON.stringify(packages), { status: 200 });
	} finally {
		if (autoCloseDB) {
			db.close();
		}
	}
}

function isValidRegex(pattern: string): boolean {
	try {
		new RegExp(pattern);
		return true; // Regex is valid
	} catch {
		return false; // Regex is invalid
	}
}
