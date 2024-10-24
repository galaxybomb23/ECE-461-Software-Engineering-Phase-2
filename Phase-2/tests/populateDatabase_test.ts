import { populateDatabase } from "../utils/populateDatabase.ts";
import { Database } from "jsr:@db/sqlite@0.12.0";
import { assertEquals } from "jsr:@std/assert";
import { cleanup, testLogger } from "./testSuite.ts";

Deno.test("populateDatabase", async () => {
	// setup
	testLogger.info("TEST: populateDatabase");

	// test
	const db = new Database("tests/data.db");
	await populateDatabase(db);

	// check if the database is populated
	const packages = await db.sql`SELECT * FROM packages`;
	const users = await db.sql`SELECT * FROM users`;
	await db.close();

	// asserts
	try {
		assertEquals(packages.length, 2);
	} catch (error) {
		console.log("Packages:", packages);
		throw error;
	}
	try {
		assertEquals(users.length, 2);
	} catch (error) {
		console.log("Users:", users);
		throw error;
	}

	// cleanup
	await cleanup();
});
