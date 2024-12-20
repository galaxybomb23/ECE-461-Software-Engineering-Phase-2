// API Endpoint: DELETE /reset
// Description: Reset the registry. (BASELINE)

import { Handlers } from "$fresh/server.ts";
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { displayRequest, logger } from "~/src/logFile.ts";
import { getUserAuthInfo, type userAuthInfo } from "~/utils/validation.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

/**
 * Handles DELETE request to reset the database.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - A promise that resolves to a Response object indicating the result of the operation.
 *
 * Response Codes:
 * - 200: Database reset successfully.
 * - 401: Unauthorized access.
 * - 403: Invalid request or unauthorized request.
 */
export const handler: Handlers = {
	// Handles DELETE request to reset the database
	async DELETE(req) {
		logger.info("--> /reset: DELETE");

		await displayRequest(req);
		const authToken = req.headers.get("X-Authorization") ?? "";
		if (!authToken) {
			logger.warn("Invalid request: missing authentication token");
			return new Response("Invalid request: missing authentication token", {
				status: 403,
			});
		}
		const userAuthInfo: userAuthInfo = await getUserAuthInfo(authToken);
		// Check the validity of the authentication token
		if (!userAuthInfo.is_token_valid) {
			logger.warn("Unauthorized request: invalid token");
			logger.debug(`Token: ${authToken}`);
			return new Response("Unauthorized request: invalid token", {
				status: 403,
			});
		}

		// check permissions // make sure the user is an admin or however we want to handle this
		if (!userAuthInfo.is_admin) {
			logger.debug("Unauthorized request: insufficient permissions");
			return new Response("Unauthorized access", { status: 401 });
		}

		const ret = await resetDatabase();
		logger.debug(`Response: ${await ret.clone().text()}\n`);
		return ret;
	},
};

/**
 * Resets the database by deleting all records from the 'packages' and 'users' tables,
 * resetting their sequences, and adding a default admin user.
 *
 * @param {DB} db - The database connection object.
 * @param {boolean} autoCloseDB - Flag to determine whether to automatically close the database connection.
 * @returns {Promise<Response>} - A promise that resolves to a Response object indicating the result of the operation.
 *
 * Response Codes:
 * - 200: Database reset successfully.
 */
export async function resetDatabase(
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
): Promise<Response> {
	logger.silly("resetDatabase()");
	try {
		// database open
		// delete all packages
		const packages = await db.query("SELECT name FROM packages");
		await db.execute("DELETE FROM packages");
		logger.debug(`Packages deleted (${db.changes}): ${packages.toString()}`);
		await db.execute("DELETE FROM sqlite_sequence WHERE name = 'packages'");

		//reset  users
		const users = await db.query("SELECT username FROM users WHERE username != 'ece30861defaultadminuser'");
		await db.execute("DELETE FROM users WHERE username != 'ece30861defaultadminuser'");
		logger.debug(`Users deleted (${db.changes}): ${users.toString()}`);
		await db.execute("DELETE FROM sqlite_sequence WHERE name = 'users'");
		await db.execute("UPDATE sqlite_sequence SET seq = 1 WHERE name = 'users'");

		logger.info("Database reset successfully");
		return new Response("Database reset", { status: 200 });
	} catch (error) {
		logger.error(`Database reset failed: ${error}`);
		return new Response("Database reset failed", { status: 500 });
	} finally {
		// mem safe close
		if (autoCloseDB) {
			db.close(true);
		}
	}
}

// Only run the following code when running this file directly
if (import.meta.main) {
	const response = await resetDatabase();
	if (response.status === 200) {
		console.log("Database reset successfully");
	}
}
