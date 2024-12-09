// test suite imports
import { cleanup, setup, testLogger } from "./testSuite.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // if needed
import { assertEquals } from "jsr:@std/assert";
import { packagesRequest } from "~/types/index.ts";

//import function
import { listPackages } from "~/routes/api/packages.ts";

// Test handler
import { handler } from "~/routes/api/packages.ts"; // Update with the actual path to your handler file
import { populateDatabase } from "~/utils/populateDatabase.ts"; // Update with the actual path to your populateDatabase file
import type { FreshContext } from "$fresh/src/server/types.ts";

// test suite
Deno.test("PackagesTest...", async (t) => {
	await t.step("PackagesTest - listPackages: Exact Version", async () => {
		const TESTNAME = "PackagesTest - listPackages: Exact Version";
		// pre test setup
		testLogger.info(`TEST: ${TESTNAME}`);
		const db: DB = await setup(); // setup the database if needed
		let response: Response;

		// request package 1
		let request: packagesRequest = {
			offset: 1,
			authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			requestBody: [{
				Name: "sample-package-1",
				Version: "Exact (1.0.0)",
			}],
		};
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		let data = await response.json();
		testLogger.info(`Response for ${TESTNAME}: ${data}`);
		assertEquals(data.length, 1, `Expected 1 package, got ${data}`);
		assertEquals(
			data[0].Name,
			"sample-package-1",
			`Expected package name to be sample-package-1, got ${data[0].Name}`,
		);
		assertEquals(
			data[0].Version,
			"1.0.0",
			`Expected package version to be 1.0.0, got ${data[0].Version}`,
		);

		// request null package by name
		request = {
			offset: 1,
			authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			requestBody: [{
				Name: "invalid-package",
				Version: "Exact (1.0.0)",
			}],
		};
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		data = await response.json();
		assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

		// request null package by version
		request = {
			offset: 1,
			authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			requestBody: [{
				Name: "sample-package-1",
				Version: "Exact (2.0.0)",
			}],
		};
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		data = await response.json();
		assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

		// post test cleanup
		await cleanup(db); // cleanup the database if used
	});

	await t.step("PackagesTest - listPackages: Bounded Range", async () => {
		const TESTNAME = "PackagesTest - listPackages: Bounded Range";
		// pre test setup
		testLogger.info(`TEST: ${TESTNAME}`);
		const db: DB = await setup(); // setup the database if needed
		let response: Response;

		// request valid package 1
		let request: packagesRequest = {
			offset: 1,
			authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			requestBody: [{
				Name: "sample-package-2",
				Version: "Bounded range (1.0.0-3.0.0)",
			}],
		};
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		let data = await response.json();
		testLogger.info(`Response for ${TESTNAME}: ${data}`);
		assertEquals(data.length, 1);
		assertEquals(
			data[0].Name,
			"sample-package-2",
			`Expected package name to be sample-package-2, got ${data[0].Name}`,
		);
		assertEquals(
			data[0].Version,
			"2.1.3",
			`Expected package version to be 2.1.3, got ${data[0].Version}`,
		);

		// request null package by name
		request = {
			offset: 1,
			authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			requestBody: [{
				Name: "invalid-package",
				Version: "Bounded range (1.0.0-2.0.0)",
			}],
		};
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		data = await response.json();
		assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

		// request null package by version
		request = {
			offset: 1,
			authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			requestBody: [{
				Name: "sample-package-2",
				Version: "Bounded range (2.1.5-3.0.0)",
			}],
		};
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		data = await response.json();
		assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

		// post test cleanup
		await cleanup(db); // cleanup the database if used
	});

	await t.step("PackagesTest - listPackages: Tilde Version", async () => {
		const TESTNAME = "PackagesTest - listPackages: Tilde Version";
		// pre test setup
		testLogger.info(`TEST: ${TESTNAME}`);
		const db: DB = await setup(); // setup the database if needed
		let response: Response;

		// request valid package 1
		let request: packagesRequest = {
			offset: 1,
			authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			requestBody: [{
				Name: "sample-package-2",
				Version: "Tilde (~2.1.0)",
			}],
		};
		response = await listPackages(request, db, false);
		assertEquals(response.status, 200);
		let data = await response.json();
		testLogger.info(`Response for ${TESTNAME}: ${data}`);
		assertEquals(data.length, 1, "Request valid package 1");
		assertEquals(
			data[0].Name,
			"sample-package-2",
			`Expected package name to be sample-package-1, got ${data[0].Name}`,
		);
		assertEquals(
			data[0].Version,
			"2.1.3",
			`Expected package version to be 2.1.3, got ${data[0].Version}`,
		);

		// request null package by name
		request = {
			offset: 1,
			authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			requestBody: [{
				Name: "invalid-package",
				Version: "Tilde (~1.0.0)",
			}],
		};
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		data = await response.json();
		assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

		// request null package by version
		request = {
			offset: 1,
			authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			requestBody: [{
				Name: "sample-package-1",
				Version: "Tilde (~2.0.0)",
			}],
		};
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		data = await response.json();
		assertEquals(data.length, 0, "Null package By Version");
		// post test cleanup
		await cleanup(db); // cleanup the database if used
	});

	await t.step("PackagesTest - listPackages: Carat Version", async () => {
		const TESTNAME = "PackagesTest - listPackages: Carat Version";
		// pre test setup
		testLogger.info(`TEST: ${TESTNAME}`);
		const db: DB = await setup(); // setup the database if needed
		let response: Response;

		// request valid package 1
		let request: packagesRequest = {
			offset: 1,
			authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			requestBody: [{
				Name: "sample-package-2",
				Version: "Carat (^2.0.0)",
			}],
		};
		response = await listPackages(request, db, false);
		assertEquals(response.status, 200);
		let data = await response.json();
		testLogger.info(`Response for ${TESTNAME}: ${data}`);
		assertEquals(data.length, 1);
		assertEquals(
			data[0].Name,
			"sample-package-2",
			`Expected package name to be sample-package-1, got ${data[0].Name}`,
		);
		assertEquals(
			data[0].Version,
			"2.1.3",
			`Expected package version to be 2.1.3, got ${data[0].Version}`,
		);

		// request null package by name
		request = {
			offset: 1,
			authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			requestBody: [{
				Name: "invalid-package",
				Version: "Carat (^1.0.0)",
			}],
		};
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		data = await response.json();
		assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

		// request null package by version
		request = {
			offset: 1,
			authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			requestBody: [{
				Name: "sample-package-1",
				Version: "Carat (^2.0.0)",
			}],
		};
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		data = await response.json();
		assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

		// post test cleanup
		await cleanup(db); // cleanup the database if used
	});

	await t.step("PackagesTest - listPackages: Wildcard", async () => {
		// pre test setup
		const TESTNAME = "PackagesTest - listPackages: Wildcard";
		testLogger.info(`TEST: ${TESTNAME}`);
		const db: DB = await setup(); // setup the database if needed
		let response: Response;

		// insert a package
		const packages = [
			{
				name: "sample-package-4",
				url: "https://example.com/sample-package-1",
				version: "1.0.0",
				license_score: 80,
				netscore: 75,
				dependency_pinning_score: 90,
				rampup_score: 85,
				review_percentage_score: 70,
				bus_factor: 3,
				correctness: 95,
				responsive_maintainer: 85,
			},
			{
				name: "sample-package-5",
				url: "https://example.com/sample-package-1",
				version: "2.7.90",
				license_score: 80,
				netscore: 75,
				dependency_pinning_score: 90,
				rampup_score: 85,
				review_percentage_score: 70,
				bus_factor: 3,
				correctness: 95,
				responsive_maintainer: 85,
			},
		];

		for (const pkg of packages) {
			await db.query(
				`INSERT INTO packages (name, url, version, license_score, netscore, dependency_pinning_score, rampup_score, review_percentage_score, bus_factor, correctness, responsive_maintainer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					pkg.name,
					pkg.url,
					pkg.version,
					pkg.license_score,
					pkg.netscore,
					pkg.dependency_pinning_score,
					pkg.rampup_score,
					pkg.review_percentage_score,
					pkg.bus_factor,
					pkg.correctness,
					pkg.responsive_maintainer,
				],
			);
		}

		// test Exact version
		const request = {
			offset: 1,
			authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			requestBody: [{
				Name: "*",
				Version: "Exact (1.0.0)",
			}],
		};
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		let data = await response.json();
		assertEquals(data.length, 2, `Wildcard test failed: Exact`);

		// test Bounded Range
		request.requestBody[0].Version = "Bounded range (1.0.0-3.0.0)";
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		data = await response.json();
		assertEquals(data.length, 4, `Wildcard test failed: Bounded Range`);

		// test Tilde
		request.requestBody[0].Version = "Tilde (~2.1.0)";
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		data = await response.json();
		assertEquals(data.length, 1, `Wildcard test failed: Tilde`);

		// test Carat
		request.requestBody[0].Version = "Carat (^2.0.0)";
		response = await listPackages(request, db, false);
		assertEquals(
			response.status,
			200,
			`Expected status 200, got ${response.status}`,
		);
		data = await response.json();
		testLogger.info(`Response for ${TESTNAME}: ${data}`);
		assertEquals(data.length, 2, `Wildcard test failed: Carat`);

		// post test cleanup
		await cleanup(db); // cleanup the database if used
	});

	// call populateDatabase
	await populateDatabase();
	let mockContext: FreshContext;

	await t.step(
		"PackagesTest - Handler: Valid request should return 200",
		async () => {
			const validRequest = new Request(
				"http://localhost/api/packages?offset=1",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-Authorization": "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
					},
					body: JSON.stringify([
						{
							Version: "Exact (1.0.0)",
							Name: "sample-package-1",
						},
					]),
				},
			);

			if (handler.POST) {
				// Check if handler.POST is defined
				const response = await handler.POST(validRequest, mockContext);
				assertEquals(response.status, 200);
			} else {
				throw new Error("handler.POST is undefined");
			}
		},
	);

	await t.step("PackagesTest - Handler: Valid Request, no offset", async () => {
		const validRequest = new Request("http://localhost/api/packages", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
			},
			body: JSON.stringify([
				{
					Version: "Exact (1.0.0)",
					Name: "sample-package-1",
				},
			]),
		});

		if (handler.POST) {
			// Check if handler.POST is defined
			const response = await handler.POST(validRequest, mockContext);
			assertEquals(response.status, 200);
		} else {
			throw new Error("handler.POST is undefined");
		}
	});

	await t.step(
		"PackagesTest - Handler: Missing package query body should return 400",
		async () => {
			const invalidRequest = new Request(
				"http://localhost/api/packages?offset=1",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-Authorization": "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
					},
					body: JSON.stringify([{}]), // Missing required fields
				},
			);

			if (handler.POST) {
				// Check if handler.POST is defined
				const response = await handler.POST(invalidRequest, mockContext);
				assertEquals(response.status, 400);
				// const body = await response.text();
				// assertEquals(body, "Invalid request: 'Version' must be a string");
			} else {
				throw new Error("handler.POST is undefined");
			}
		},
	);

	await t.step(
		"PackagesTest - Handler: Invalid authentication token should return 403",
		async () => {
			const invalidAuthRequest = new Request(
				"http://localhost/api/packages?offset=1",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-Authorization": "invalid-auth-token", // Simulate invalid token
					},
					body: JSON.stringify([
						{
							Version: "Exact (1.2.3)",
							Name: "package_name",
						},
					]),
				},
			);

			if (handler.POST) {
				// Check if handler.POST is defined
				const response = await handler.POST(invalidAuthRequest, mockContext);
				assertEquals(response.status, 403);
				const body = await response.text();
				assertEquals(body, "Unauthorized access");
			} else {
				throw new Error("handler.POST is undefined");
			}
		},
	);

	await t.step(
		"PackagesTest - Handler: Missing X-Authorization header should return 400",
		async () => {
			const missingAuthRequest = new Request(
				"http://localhost/api/packages?offset=1",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify([
						{
							Version: "Exact (1.2.3)",
							Name: "package_name",
						},
					]),
				},
			);

			if (handler.POST) {
				// Check if handler.POST is defined
				const response = await handler.POST(missingAuthRequest, mockContext);
				assertEquals(response.status, 400);
				const body = await response.text();
				testLogger.debug(body);
				assertEquals(body, "Invalid request: missing authentication token");
			} else {
				throw new Error("handler.POST is undefined");
			}
		},
	);
});
