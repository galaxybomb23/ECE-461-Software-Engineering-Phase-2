import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { setup, testLogger } from "./testSuite.ts";
import { assert, assertEquals } from "https://deno.land/std@0.105.0/testing/asserts.ts";
import { handler } from "~/routes/api/authenticate.ts";
import { resetDatabase } from "~/routes/api/reset.ts";
import { populateDatabase } from "../utils/populateDatabase.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";
import type { FreshContext } from "$fresh/src/server/types.ts";

Deno.test("authenticate", async (t) => {
	testLogger.info(`TEST: authenticate`);

	const db: DB = new DB(DATABASEFILE);
	await populateDatabase(db, false);
	let mockContext: FreshContext;

	await t.step("Testing Successful Admin Login", async () => {
		const loginRequest = new Request("http://localhost:8000/api/authenticate", {
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

		// Check if handler.PUT is defined before calling
		if (handler.PUT) {
			const response = await handler.PUT(loginRequest, mockContext);
			assertEquals(response.status, 200);

			const responseData = await response.json();
			assert(responseData.token);
		} else {
			throw new Error("PUT method not implemented in handler");
		}
	});

	await t.step("Testing Incorrect Password Login", async () => {
		const loginRequest = new Request("http://localhost:8000/api/authenticate", {
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

		if (handler.PUT) {
			const response = await handler.PUT(loginRequest, mockContext);
			assertEquals(response.status, 401);

			await response.body?.cancel();
		} else {
			throw new Error("PUT method not implemented in handler");
		}
	});

	await t.step("Testing Admin Login as Non Admin", async () => {
		const loginRequest = new Request("http://localhost:8000/api/authenticate", {
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

		if (handler.PUT) {
			const response = await handler.PUT(loginRequest, mockContext);
			assertEquals(response.status, 401);

			await response.body?.cancel();
		} else {
			throw new Error("PUT method not implemented in handler");
		}
	});

	await t.step("Testing Successful User Login", async () => {
		const loginRequest = new Request("http://localhost:8000/api/authenticate", {
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

		if (handler.PUT) {
			const response = await handler.PUT(loginRequest, mockContext);
			assertEquals(response.status, 200);

			const responseData = await response.json();
			assert(responseData.token);
		} else {
			throw new Error("PUT method not implemented in handler");
		}
	});

	await t.step("Testing User login as Admin", async () => {
		const loginRequest = new Request("http://localhost:8000/api/authenticate", {
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

		if (handler.PUT) {
			const response = await handler.PUT(loginRequest, mockContext);
			assertEquals(response.status, 401);

			await response.body?.cancel();
		} else {
			throw new Error("PUT method not implemented in handler");
		}
	});

	await t.step("Incorrectly Formatted JSON", async () => {
		const loginRequest = new Request("http://localhost:8000/api/authenticate", {
			method: "PUT",
			body: "{ This: Is , An `` Improper :} formatted JSON Body",
		});

		// Check if handler.PUT is defined before calling
		if (handler.PUT) {
			const response = await handler.PUT(loginRequest, mockContext);
			assertEquals(response.status, 400);

			await response.body?.cancel();
		} else {
			throw new Error("PUT method not implemented in handler");
		}
	});

	await resetDatabase(db, true);
});
