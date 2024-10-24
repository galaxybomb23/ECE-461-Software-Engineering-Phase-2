import { createLogger, format, Logger, transports } from "npm:winston";
import { Database } from "jsr:@db/sqlite@0.12.0";
import { populateDatabase } from "~/utils/populateDatabase.ts";

export async function setup() {
	//setup test database
	const db = new Database("tests/data.db");
	await populateDatabase(db);

	return db;
}

export const testLogger: Logger = createLogger({
	level: "debug",
	format: format.combine(format.timestamp(), format.json()),
	transports: [
		new transports.File({
			filename: "logs/tests.log",
			options: { flags: "a" },
		}),
	],
});

export async function cleanup() {
	testLogger.debug("End Test");
	// delete the data.db file
	try {
		await Deno.remove("tests/data.db");
		testLogger.debug("Test database file deleted successfully");
	} catch (error) {
		if (error instanceof Deno.errors.NotFound) {
			testLogger.debug("Test database file not found, skipping deletion");
		} else if (error instanceof Error) {
			testLogger.error(
				`Error deleting test database file: ${error.message}`,
			);
		} else {
			testLogger.error(
				"Unknown error occurred while deleting test database file",
			);
		}
	}
}
