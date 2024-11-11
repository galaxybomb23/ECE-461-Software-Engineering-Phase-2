import { DB, Row } from "https://deno.land/x/sqlite/mod.ts";
import { assertEquals } from "jsr:@std/assert";
import { cleanup, setup, testLogger } from "./testSuite.ts";
import { login, LoginResponse } from "~/utils/userManagement.ts";

// Test Handler
import { handler } from "~/routes/api/reset.ts";
import { populateDatabase } from "~/utils/populateDatabase.ts";
import type { FreshContext } from "$fresh/src/server/types.ts";

// import the function to test
import { resetDatabase } from "~/routes/api/reset.ts";

Deno.test("ResetTest", async (t) => {
	await t.step("ResetTest - resetDatabase: base functionality", async () => {
		// pre test setup
		testLogger.info(`TEST: Reset Database`);
		const db: DB = await setup();

		// test code
		await resetDatabase(db, false);

		// check if packages and users tables are empty
		const packages: Row[] = await db.query(`SELECT * FROM packages`);
		const users: Row[] = await db.query(`SELECT * FROM users`);
		const packageSequence: Row[] = await db.query(
			`SELECT * FROM sqlite_sequence WHERE name = 'packages'`,
		);
		const userSequence: Row[] = await db.query(
			`SELECT * FROM sqlite_sequence WHERE name = 'users'`,
		);
		// assets
		assertEquals(packages.length, 0, "Packages table should be empty");
		assertEquals(users.length, 1, "Users table should have 1 entries");
		assertEquals(
			packageSequence.length,
			0,
			"Package sequence should be reset to 0",
		);
		assertEquals(
			userSequence.length,
			1,
			"User sequence should be 1 for 2 users",
		);
		testLogger.debug(`Packages: ${packages.toString()}`);

		// post test cleanup
		await cleanup(db);
		db.close(true);

		//wait for the cleanup to finish
	});

	// call the populateDatabase function to populate the database
	await populateDatabase();
	let mockContext: FreshContext;

	// <--- Test the Handler --->
	await t.step("ResetTest - Handler: Missing AuthToken", async () => {
		const invalidRequest = new Request("http://localhost:8000/api/reset", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (handler.DELETE) {
			const response = await handler.DELETE(invalidRequest, mockContext);
			assertEquals(response.status, 403, "Response status should be 403");
		} else {
			throw new Error("Handler.DELETE not defined");
		}
	});

	await t.step("ResetTest - Handler: Invalid AuthToken", async () => {
		const invalidRequest = new Request("http://localhost:8000/api/reset", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": "bearer",
			},
		});

		if (handler.DELETE) {
			const response = await handler.DELETE(invalidRequest, mockContext);
			assertEquals(response.status, 403, "Response status should be 403");
		} else {
			throw new Error("Handler.DELETE not defined");
		}
	});

	await t.step("ResetTest - Handler: invalid Permission", async () => {
		const invalidRequest = new Request("http://localhost:8000/api/reset", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": `bearer 1f62b376-a9f7-4088-9a8d-a245d1998566`, // pi user (not admin)
			},
		});

		if (handler.DELETE) {
			const response = await handler.DELETE(invalidRequest, mockContext);
			assertEquals(response.status, 401, "Response status should be 401");
		} else {
			throw new Error("Handler.DELETE not defined");
		}
	});

	await t.step("ResetTest - Handler: Valid Reset Request", async () => {
		const validRequest = new Request("http://localhost:8000/api/reset", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			},
		});

		if (handler.DELETE) {
			const response = await handler.DELETE(validRequest, mockContext);
			assertEquals(response.status, 200, "Response status should be 200");
		} else {
			throw new Error("Handler.DELETE not defined");
		}
	});
});
