import { populateDatabase } from "../utils/populateDatabase.ts";
import { DB, Row } from "https://deno.land/x/sqlite/mod.ts";
import { assertEquals } from "jsr:@std/assert";
import { cleanup, setup, testLogger } from "./testSuite.ts";

const TESTNAME = "populateDatabase";

Deno.test(TESTNAME, async () => {
	// setup
	testLogger.info(`TEST: ${TESTNAME}`);
	let db: DB | null = null;

	try {
		db = await setup(TESTNAME);
		await populateDatabase(db);
		const packages: Row[] = await db.query(`SELECT * FROM packages`);
		assertEquals(packages.length, 2, "Packages table should have 2 entries");
		const users: Row[] = await db.query(`SELECT * FROM users`);
		assertEquals(users.length, 2, "Users table should have 2 entries");

		testLogger.debug("populateDatabase test passed");
	} catch (error) {
		testLogger.error(`Test failed: ${error}`);
	} finally {
		if (db) {
			// cleanup
			await cleanup(db, TESTNAME);
		}
	}
});
