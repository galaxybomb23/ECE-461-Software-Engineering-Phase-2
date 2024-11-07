// API Endpoint: DELETE /reset
// Description: Reset the registry. (BASELINE)

import { Handlers } from "$fresh/server.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { logger } from "~/src/logFile.ts";
import { getUserAuthInfo, type userAuthInfo } from "~/utils/validation.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

export const handler: Handlers = {
	// Handles DELETE request to reset the database
	async DELETE(req) {
		logger.info("Reset request received");
		// Extract and validate the 'X-Authentication' token
		const authToken = req.headers.get("X-Authorization") ?? "";
		if (!authToken) {
			logger.debug("Invalid request: missing authentication token");
			return new Response("Invalid request: missing authentication token", { status: 403 });
		}
		const userAuthInfo: userAuthInfo = getUserAuthInfo(authToken);
		// Check the validity of the authentication token
		if (!userAuthInfo.is_token_valid) {
			logger.debug("Unauthorized request: invalid token");
			return new Response("Unauthorized request: invalid token", { status: 403 });
		}

		// check permissions // make sure the user is an admin or however we want to handle this
		if (!userAuthInfo.is_admin) {
			logger.debug("Unauthorized request: insufficient permissions");
			return new Response("Unauthorized access", { status: 401 });
		}

		return resetDatabase();
	},
};

export async function resetDatabase(db = new DB(DATABASEFILE), autoCloseDB = true): Promise<Response> {
	const packages = await db.query("SELECT * FROM packages");
	await db.execute("DELETE FROM packages");
	logger.debug(`Packages deleted (${db.changes}): ${packages.toString()}`);

	//reset package sequence
	await db.execute("DELETE FROM sqlite_sequence WHERE name = 'packages'");
	// await db.exec("DELETE FROM users");
	// logger.debug("Users deleted: changed rows: " + db.changes);

	// mem safe close
	if (autoCloseDB) db.close();

	return new Response("Database reset", { status: 200 });
}
