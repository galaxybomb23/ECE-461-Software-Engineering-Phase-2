// API Endpoint: DELETE /reset
// Description: Reset the registry. (BASELINE)

import { Handlers } from "$fresh/server.ts";
import { Database } from "jsr:@db/sqlite@0.12.0";
import { logger } from "../../src/logFile.ts";

export const handler: Handlers = {
	// Handles DELETE request to reset the database
	async DELETE(req) {
		logger.info("Reset request received");
		const db = new Database("data/data.db");
		await resetDatabase(db);
		await db.close();
		return new Response("Registry reset", { status: 200 });
	},
};

export async function resetDatabase(db: Database) {
	const stmt = await db.prepare("SELECT * FROM packages");
	const packages = await stmt.all();
	await db.exec("DELETE FROM packages");
	logger.debug(`Packages deleted (${db.changes}): ${packages.toString()}`);

	// await db.exec("DELETE FROM users");
	// logger.debug("Users deleted: changed rows: " + db.changes);
}
