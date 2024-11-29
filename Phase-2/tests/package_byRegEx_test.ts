// test suite imports
import { cleanup, setup, testLogger } from "./testSuite.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // if needed
import { assertEquals } from "jsr:@std/assert";

//import the function to be tested
// import { functionName } from "~/routes/api/<endpoint>.ts";
import { getPackagesByRegEx } from "~/routes/api/package/byRegEx.ts";

// import handler
import { handler } from "~/routes/api/package/byRegEx.ts"; // Update with the actual path to your handler file
import { populateDatabase } from "~/utils/populateDatabase.ts"; // Update with the actual path to your populateDatabase file
import type { FreshContext } from "$fresh/src/server/types.ts";
import { PackageMetadata, regexRequest } from "~/types/index.ts";

// test suite
Deno.test("PackagesByRegexTest...", async (t) => {
	await t.step("PackagesByRegex - getPackagesByRegEx: All", async () => {
		// pre test setup
		testLogger.info(`Test: All`);
		const db: DB = await setup(); // setup the database if needed

		const body: regexRequest = {
			RegEx: ".",
		};
		const expectedBody: PackageMetadata[] = [
			{
				Name: "sample-package-1",
				Version: "1.0.0",
				ID: "1",
			},
			{
				Name: "sample-package-2",
				Version: "2.1.3",
				ID: "2",
			},
		];

		// test code
		const result = await getPackagesByRegEx(body, db, false);
		assertEquals(result.status, 200);

		// assertions
		const resultBody = (await result.json()) as PackageMetadata[];
		assertEquals(await resultBody, expectedBody);

		// post test cleanup
		await cleanup(db); // cleanup the database if used
	});

	await t.step(
		"PackagesByRegex - getPackagesByRegEx: Sample-package-1",
		async () => {
			// pre test setup
			testLogger.info(`Test: Sample-package-1`);
			const db: DB = await setup(); // setup the database if needed

			const body: regexRequest = {
				RegEx: "sample-package-1",
			};
			const expectedBody: PackageMetadata[] = [
				{
					Name: "sample-package-1",
					Version: "1.0.0",
					ID: "1",
				},
			];

			// test code
			const result = await getPackagesByRegEx(body, db, false);
			assertEquals(result.status, 200);

			// assertions
			const resultBody = (await result.json()) as PackageMetadata[];
			assertEquals(await resultBody, expectedBody);

			// post test cleanup
			await cleanup(db); // cleanup the database if used
		},
	);

	await t.step(
		"PackagesByRegex - getPackagesByRegEx: Sample-package-2",
		async () => {
			// pre test setup
			testLogger.info(`Test: Sample-package-2`);
			const db: DB = await setup(); // setup the database if needed

			const body: regexRequest = {
				RegEx: "sample-package-2",
			};
			const expectedBody: PackageMetadata[] = [
				{
					Name: "sample-package-2",
					Version: "2.1.3",
					ID: "2",
				},
			];

			// test code
			const result = await getPackagesByRegEx(body, db, false);

			// assertions
			assertEquals(result.status, 200);
			const resultBody = (await result.json()) as PackageMetadata[];

			assertEquals(await resultBody, expectedBody);

			// post test cleanup
			await cleanup(db); // cleanup the database if used
		},
	);

	await t.step(
		"PackagesByRegex - getPackagesByRegEx: Query Readme",
		async () => {
			// pre test setup
			testLogger.info(`Test: Query Readme`);
			const db: DB = await setup(); // setup the database if needed

			const body: regexRequest = {
				RegEx: "another", // only in the readme of sample-package-2
			};
			const expectedBody: PackageMetadata[] = [
				{
					Name: "sample-package-2",
					Version: "2.1.3",
					ID: "2",
				},
			];

			// test code
			const result = await getPackagesByRegEx(body, db, false);

			// assertions
			assertEquals(result.status, 200);
			const resultBody = (await result.json()) as PackageMetadata[];

			assertEquals(await resultBody, expectedBody);

			// post test cleanup
			await cleanup(db); // cleanup the database if used
		},
	);

	await t.step("PackagesByRegex - getPackagesByRegEx: null Regex", async () => {
		// pre test setup
		testLogger.info(`Test: not found`);
		const db: DB = await setup(); // setup the database if needed

		const body: regexRequest = {
			RegEx: "James Davis the GOAT", // not in the database
		};

		// test code
		const result = await getPackagesByRegEx(body, db, false);

		// assertions
		assertEquals(result.status, 404);

		// post test cleanup
		await cleanup(db); // cleanup the database if used
	});

	await await populateDatabase(); // populate the database if needed
	let mockContext: FreshContext;

	// <--- Handler Test --->
	await t.step("PackagesByRegExTest - Handler: Missing X-Auth", async () => {
		const validRequest = new Request("http://localhost/api/endpoint", {
			method: "POST", //GET, POST, PUT, DELETE, etc
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				RegEx: "321321321231",
			}),
		});

		const response = await handler.POST!(validRequest, mockContext);
		assertEquals(response.status, 403);
		const body = await response.text();
		assertEquals(body, "Invalid request: missing authentication token");
	});

	await t.step("PackagesByRegExTest - Handler: Invalid X-Auth", async () => {
		const validRequest = new Request("http://localhost/api/endpoint", {
			method: "POST", //GET, POST, PUT, DELETE, etc
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": "invalid",
			},
			body: JSON.stringify({
				RegEx: "321321321231",
			}),
		});

		const response = await handler.POST!(validRequest, mockContext);
		assertEquals(response.status, 403);
		const body = await response.text();
		assertEquals(body, "Unauthorized request: invalid token");
	});

	await t.step("PackagesByRegExTest - Handler: Missing RegEx", async () => {
		const validRequest = new Request("http://localhost/api/endpoint", {
			method: "POST", //GET, POST, PUT, DELETE, etc
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			},
			body: JSON.stringify({
				RegEx: "",
			}),
		});

		const response = await handler.POST!(validRequest, mockContext);
		assertEquals(response.status, 400);
		const body = await response.text();
		assertEquals(body, "Invalid request: missing regex");
	});

	await t.step("PackagesByRegExTest - Handler: Invalid RegEx", async () => {
		const validRequest = new Request("http://localhost/api/endpoint", {
			method: "POST", //GET, POST, PUT, DELETE, etc
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			},
			body: JSON.stringify({
				RegEx: "[abc",
			}),
		});

		const response = await handler.POST!(validRequest, mockContext);
		assertEquals(response.status, 400);
		const body = await response.text();
		assertEquals(body, "Invalid request: invalid regex");
	});
});
