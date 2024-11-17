import { setup, testLogger } from "./testSuite.ts";
import { assert, assertEquals } from "https://deno.land/std@0.105.0/testing/asserts.ts";
import { handler } from "~/routes/api/authenticate.ts";
import { resetDatabase } from "~/routes/api/reset.ts";
import { populateDatabase } from "~/utils/populateDatabase.ts";
import type { FreshContext } from "$fresh/src/server/types.ts";

Deno.test("AuthenticateTest...", async (t) => {
	testLogger.info(`TEST: authenticate`);

	await resetDatabase();
	await populateDatabase();
	const mockContext: FreshContext = {} as FreshContext;

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

		const response = await handler.PUT!(loginRequest, mockContext);
		assertEquals(response.status, 200);

		const responseData = await response.json();
		assert(responseData.token);
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

		const response = await handler.PUT!(loginRequest, mockContext);
		assertEquals(response.status, 401);

		await response.body?.cancel();
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

		const response = await handler.PUT!(loginRequest, mockContext);
		assertEquals(response.status, 401);

		await response.body?.cancel();
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

		const response = await handler.PUT!(loginRequest, mockContext);
		assertEquals(response.status, 200);

		const responseData = await response.json();
		assert(responseData.token);
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

		const response = await handler.PUT!(loginRequest, mockContext);
		assertEquals(response.status, 401);

		await response.body?.cancel();
	});

	await t.step("Incorrectly Formatted JSON", async () => {
		const loginRequest = new Request("http://localhost:8000/api/authenticate", {
			method: "PUT",
			body: "{ This: Is , An `` Improper :} formatted JSON Body",
		});

		const response = await handler.PUT!(loginRequest, mockContext);
		assertEquals(response.status, 400);

		await response.body?.cancel();
	});

	await resetDatabase();
});
