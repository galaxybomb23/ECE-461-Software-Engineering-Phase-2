import { resetDatabase } from "../routes/api/reset.ts";
import { Database } from "jsr:@db/sqlite@0.12.0";
import { assertEquals } from "jsr:@std/assert";
import { cleanup, setup, testLogger } from "./testSuite.ts";

Deno.test("resetDatabase", async () => {
	// pre test setup
	testLogger.info("TEST: resetDatabase");
	const db: Database = await setup();

	// test
	await resetDatabase(db);

	// check if the database is empty
	const packages = await db.sql`SELECT * FROM packages`;
	const users = await db.sql`SELECT * FROM users`;

	// close the database
	await db.close();

	// asserts
	try {
		assertEquals(packages.length, 0);
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
