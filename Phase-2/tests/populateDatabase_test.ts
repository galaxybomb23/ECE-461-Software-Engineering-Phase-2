import { populateDatabase } from "../utils/populateDatabase.ts";
import { DB, Row } from "https://deno.land/x/sqlite/mod.ts";
import { assertEquals } from "jsr:@std/assert";
import { cleanup, setup, testLogger } from "./testSuite.ts";

const TESTNAME = "populateDatabase";

Deno.test(TESTNAME, async (t) => {
	await t.step(TESTNAME, async () => {
	// setup
	testLogger.info(`TEST: ${TESTNAME}`);
	const db: DB = new DB(":memory:"); //cant use setup bc populateDatabase used in setup

	// test code
	await populateDatabase(db, false);
	// check if packages and users tables are populated
	const packages: Row[] = await db.query(`SELECT * FROM packages`);
	assertEquals(packages.length, 2, "Packages table should have 2 entries");
	const users: Row[] = await db.query(`SELECT * FROM users`);
	assertEquals(users.length, 2, "Users table should have 2 entries");

	// cleanup
	await cleanup(db);
	db.close(true);
	});
});
