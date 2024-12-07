// API Endpoint: POST /packages/byRegEx
// Description: Get the packages from the registry that match the given regular expression. (BASELINE)

import { Handlers } from "$fresh/server.ts";
import { displayRequest, logger } from "~/src/logFile.ts";
import { getUserAuthInfo } from "~/utils/validation.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";
import { PackageMetadata, regexRequest } from "~/types/index.ts";
import XRegExp from "https://deno.land/x/xregexp/src/index.js";

export const handler: Handlers = {
	async POST(req) {
		logger.info("--> /package/byRegEx: POST");
		await displayRequest(req);
		// Extract and validate the 'X-Authentication' token
		const authToken = req.headers.get("X-Authorization") ?? "";
		if (!authToken) {
			logger.warn("Invalid request: missing authentication token");
			return new Response("Invalid request: missing authentication token", {
				status: 403,
			});
		}
		if (!getUserAuthInfo(authToken).is_token_valid) {
			logger.warn("Unauthorized request: invalid token");
			return new Response("Unauthorized request: invalid token", {
				status: 403,
			});
		}

		// validate regex
		let body: regexRequest;
		try {
			body = (await req.json()) as regexRequest;
		} catch (error) {
			logger.warn("Invalid JSON format in request body: " + error);
			return new Response("Invalid JSON format in request body", {
				status: 400,
			});
		}
		logger.debug("Request body: " + JSON.stringify(body));
		if (!body.RegEx) {
			logger.warn(`Invalid request: missing regex`);
			return new Response("Invalid request: missing regex", { status: 400 });
		}

		if (!isValidRegex(body.RegEx)) {
			logger.warn("Invalid request: invalid regex");
			return new Response("Invalid request: invalid regex", { status: 400 });
		}
		// handle error codes 200, 404 in function
		const ret: Response = getPackagesByRegEx(body);
		logger.debug(`Response: ${await ret.clone().text()}\n`);
		return ret;
	},
};

/**
 * @function getPackagesByRegEx
 * @param {PackageRegex} body - The request body containing the regular expression.
 * @returns {Response} The response containing the packages that match the regular expression.
 */
export function getPackagesByRegEx(
	body: regexRequest,
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
): Response {
	logger.silly(`getPackagesByRegEx(${JSON.stringify(body)})`);
	try {
		// Query the database
		const query = db.query(`SELECT name, version, id, readme FROM packages `) as Array<
			[string, string, string, string]
		>;
		const regEx = new RegExp(body.RegEx);

		const packages: PackageMetadata[] = [];
		for (const [name, version, id, readme] of query) {
			if (regEx.test(name) || regEx.test(readme)) {
				packages.push({ Name: name, Version: version, ID: id });
			}
		}

		if (packages.length === 0) {
			return new Response("No packages found", { status: 404 });
		}

		logger.debug(`Found ${packages.length} packages matching the regex`);
		for (const pkg of packages) {
			logger.debug(`	Package: ${JSON.stringify(pkg)}`);
		}
		return new Response(JSON.stringify(packages), { status: 200 });
	} finally {
		if (autoCloseDB) {
			db.close();
		}
	}
}

function isValidRegex(pattern: string): boolean {
	logger.silly(`isValidRegex(${pattern})`);
	try {
		new XRegExp(pattern);
		return true; // Regex is valid
	} catch {
		return false; // Regex is invalid
	}
}
