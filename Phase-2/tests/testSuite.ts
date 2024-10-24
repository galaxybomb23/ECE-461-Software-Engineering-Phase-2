import { createLogger, format, Logger, transports } from "npm:winston";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { populateDatabase } from "../utils/populateDatabase.ts";

/**
 * @brief Sets up a test database in memory
 * @param dbname The name of the database (not used in this implementation)
 * @return Promise<DB> A promise that resolves to the initialized database
 */
export async function setup(dbname: string) {
	//setup test database in memory
	const db = new DB(":memory:");
	await populateDatabase(db);
	return db;
}

export const testLogger: Logger = createLogger({
	level: "debug",
	format: format.combine(
		format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`),
	),
	transports: [
		new transports.File({
			filename: "logs/tests.log",
			options: { flags: "a" },
		}),
	],
});

/**
 * @brief Cleans up the test environment
 * @param db The database to clean up
 * @param filename The name of the test file being cleaned up
 * @return Promise<void>
 */
export async function cleanup(db: DB | undefined, filename: string) {
	// delete the data.db file
	// if the database is open, close it
	if (db && !db.isClosed) {
		await db.close(true);
	}

	testLogger.debug(`End Test: ${filename}`);
}
