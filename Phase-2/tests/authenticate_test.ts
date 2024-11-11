import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { setup, testLogger } from "./testSuite.ts";
import { assert, assertEquals } from "https://deno.land/std@0.105.0/testing/asserts.ts";
import { handler } from "~/routes/api/reset.ts";
import { resetDatabase } from "~/routes/api/reset.ts";
import { populateDatabase } from "../utils/populateDatabase.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

Deno.test("authenticate", async (t) => {
	testLogger.info(`TEST: authenticate`);

	const db: DB = new DB(DATABASEFILE);
	await populateDatabase(db, false);

	await t.step("Testing Successful Admin Login", async () => {
		// Define the login request
		const adminLoginRequest = new Request("http://localhost:8000/api/authenticate", {
			method: "PUT",
			body: JSON.stringify({
				User: {
					name: "ece30861defaultadminuser",
					isAdmin: true,
				},
				Secret: {
					password: "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;",
				},
			}),
		});

		// Make the request and get the response
		const response = await fetch(adminLoginRequest);

		// Check if the response status is OK (200)
		assertEquals(response.status, 200);

		const responseData = await response.json();

		assert(responseData.token);
	});

	await t.step("Testing Incorrect Password Login", async () => {
		// Initialize the database
		const db: DB = await setup();

		// Define the login request
		const adminLoginRequest = new Request("http://localhost:8000/api/authenticate", {
			method: "PUT",
			body: JSON.stringify({
				User: {
					name: "ece30861defaultadminuser",
					isAdmin: true,
				},
				Secret: {
					password: "this is the wrong password",
				},
			}),
		});

		// Make the request and get the response
		const response = await fetch(adminLoginRequest);

		// Check if the response status is Unauthorized (401)
		assertEquals(response.status, 401);

		await response.body?.cancel();
	});

	await t.step("Testing Admin Login as Non Admin", async () => {
		// Initialize the database
		const db: DB = await setup();

		// Define the login request
		const adminLoginRequest = new Request("http://localhost:8000/api/authenticate", {
			method: "PUT",
			body: JSON.stringify({
				User: {
					name: "ece30861defaultadminuser",
					isAdmin: false,
				},
				Secret: {
					password: "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;",
				},
			}),
		});

		// Make the request and get the response
		const response = await fetch(adminLoginRequest);

		// Check if the response status is Unauthorized (401)
		assertEquals(response.status, 401);

		await response.body?.cancel();
	});

	await t.step("Testing Successful User Login", async () => {
		// Initialize the database
		const db: DB = await setup();

		// Define the login request
		const adminLoginRequest = new Request("http://localhost:8000/api/authenticate", {
			method: "PUT",
			body: JSON.stringify({
				User: {
					name: "pi",
					isAdmin: false,
				},
				Secret: {
					password: "password",
				},
			}),
		});

		// Make the request and get the response
		const response = await fetch(adminLoginRequest);

		// Check if the response status is OK (200)
		assertEquals(response.status, 200);

		const responseData = await response.json();

		assert(responseData.token);
	});

	await t.step("Testing User login as Admin", async () => {
		// Initialize the database
		const db: DB = await setup();

		// Define the login request
		const adminLoginRequest = new Request("http://localhost:8000/api/authenticate", {
			method: "PUT",
			body: JSON.stringify({
				User: {
					name: "pi",
					isAdmin: true,
				},
				Secret: {
					password: "password",
				},
			}),
		});

		// Make the request and get the response
		const response = await fetch(adminLoginRequest);

		// Check if the response status is Unauthorized (401)
		assertEquals(response.status, 401);

		await response.body?.cancel();
	});

	await resetDatabase(db, true);
});
