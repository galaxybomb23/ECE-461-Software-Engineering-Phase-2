import { resetDatabase } from "~/routes/api/reset.ts";
import { DB, Row } from "https://deno.land/x/sqlite/mod.ts";
import { assertEquals } from "jsr:@std/assert";
import { cleanup, setup, testLogger } from "./testSuite.ts";

const TESTNAME = "resetDatabase";

Deno.test(TESTNAME, async () => {
	// pre test setup
	testLogger.info(`TEST: ${TESTNAME}`);
	const db: DB = await setup(TESTNAME);

	// test code
	await resetDatabase(db);

	// check if packages and users tables are empty
	const packages: Row[] = await db.query(`SELECT * FROM packages`);
	const users: Row[] = await db.query(`SELECT * FROM users`);
	const packageSequence: Row[] = await db.query(
		`SELECT * FROM sqlite_sequence WHERE name = 'packages'`,
	);
	const userSequence: Row[] = await db.query(
		`SELECT * FROM sqlite_sequence WHERE name = 'users'`,
	);

	assertEquals(packages.length, 0, "Packages table should be empty");
	assertEquals(users.length, 1, "Users table should have 2 entries");
	assertEquals(packageSequence.length, 0, "Package sequence should be reset to 0");
	assertEquals(userSequence.length, 1, "User sequence should be 1 for 2 users");

	// post test cleanup
	await cleanup(db, TESTNAME);
});
