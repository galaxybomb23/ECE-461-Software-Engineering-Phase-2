// API Endpoint: DELETE /reset
// Description: Reset the registry. (BASELINE)

import { Handlers } from "$fresh/server.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { logger } from "~/src/logFile.ts";

export const handler: Handlers = {
	// Handles DELETE request to reset the database
	async DELETE(req) {
		logger.info("Reset request received");
		const db = new DB("data/data.db");
		await resetDatabase(db);
		await db.close();
		return new Response("Registry reset", { status: 200 });
	},
};

export async function resetDatabase(db: DB) {
	const packages = await db.query("SELECT * FROM packages");
	await db.execute("DELETE FROM packages");
	logger.debug(`Packages deleted (${db.changes}): ${packages.toString()}`);

	// await db.exec("DELETE FROM users");
	// logger.debug("Users deleted: changed rows: " + db.changes);
}
