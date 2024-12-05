import { DATABASEFILE } from "~/utils/dbSingleton.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { logger } from "~/src/logFile.ts";

export function logDatabase(
	db = new DB(DATABASEFILE),
	autoCloseDB = true,
): void {
	logger.silly(`logDatabase()`);
	// Log the database

	// log packages
	logger.verbose("  Packages:");
	const rows = db.query("SELECT * FROM packages");
	for (const row of rows) {
		logger.verbose(`    ${JSON.stringify(row)}`);
	}

	// log users
	logger.verbose("  Users:");
	const users = db.query("SELECT * FROM users");
	for (const user of users) {
		logger.verbose(`    ${JSON.stringify(user)}`);
	}

	if (autoCloseDB) {
		db.close();
	}
}
