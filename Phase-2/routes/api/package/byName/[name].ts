// API Endpoint: GET /package/byName/{name}
// Description: Return the history of this package (all versions). (NON-BASELINE)

import { Handlers } from "$fresh/server.ts";
import { PackageHistoryEntry } from "~/types/index.ts";
import { logger } from "~/src/logFile.ts";
import { getUserAuthInfo } from "~/utils/validation.ts";
// import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
// import { DATABASEFILE } from "~/utils/dbSingleton.ts";

export const handler: Handlers = {
	// Handles GET request to retrieve package history by name
	async GET(req, ctx) {
		logger.info(`--> /package/byName/{name}: GET`);
		logger.verbose(`Request: ${Deno.inspect(req, { depth: 10, colors: false })}`);
		logger.verbose(`Ctx: ${Deno.inspect(ctx, { depth: 10, colors: false })}`);
		const { name } = ctx.params;

		// check name
		if (!name) {
			logger.warn("Invalid request: missing package name");
			return new Response("Invalid request: missing package name", { status: 400 });
		}
		// Extract and validate the 'X-Authentication' token
		const authToken = req.headers.get("X-Authorization") ?? "";
		if (!authToken) {
			logger.warn("Invalid request: missing authentication token");
			return new Response("Invalid request: missing authentication token", { status: 403 });
		}
		if (!getUserAuthInfo(authToken).is_token_valid) {
			logger.warn("Unauthorized request: invalid token");
			return new Response("Unauthorized request: invalid token", { status: 403 });
		}
		// check permissions??

		// handle error codes 200, 404 in function
		const ret = await getPackageHistory(name);
		logger.debug(`Response: ${await ret.clone().text()}\n`);
		return ret;
	},
};

/**
 * @function getPackageHistory
 * @param {string} name - The package name to retrieve the history for.
 * @returns {Response} The response containing the package history.
 */
export function getPackageHistory(
	name: string,
	// db = new DB(DATABASEFILE),
	// autoCloseDB = true,
): Response {
	logger.silly(`getPackageHistory(${name})`);
	logger.warn("This function is a placeholder and does not actually retrieve package history.");
	// handle if package not found

	// Placeholder for the history logic
	let history: PackageHistoryEntry[] = [];
	history = [
		{
			"User": {
				"name": "James Davis",
				"isAdmin": true,
			},
			"Date": "2023-03-23T23:11:15Z",
			"PackageMetadata": {
				"Name": "Underscore",
				"Version": "1.0.0",
				"ID": "underscore",
			},
			"Action": "DOWNLOAD",
		},
		{
			"User": {
				"name": "James Davis",
				"isAdmin": true,
			},
			"Date": "2023-03-22T23:06:25Z",
			"PackageMetadata": {
				"Name": "Underscore",
				"Version": "1.0.0",
				"ID": "underscore",
			},
			"Action": "UPDATE",
		},
		{
			"User": {
				"name": "James Davis",
				"isAdmin": true,
			},
			"Date": "2023-03-21T22:59:40Z",
			"PackageMetadata": {
				"Name": "Underscore",
				"Version": "1.0.0",
				"ID": "underscore",
			},
			"Action": "RATE",
		},
		{
			"User": {
				"name": "James Davis",
				"isAdmin": true,
			},
			"Date": "2023-03-20T22:45:31Z",
			"PackageMetadata": {
				"Name": "Underscore",
				"Version": "1.0.0",
				"ID": "underscore",
			},
			"Action": "CREATE",
		},
	];

	return new Response(JSON.stringify(history), {
		headers: { "Content-Type": "application/json" },
		status: 200,
	});
}
