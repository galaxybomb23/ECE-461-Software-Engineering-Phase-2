import { cleanup, setup, testLogger } from "./testSuite.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // if needed
import { assertEquals } from "jsr:@std/assert";

// Import functions to be tested
import { calcPackageCost } from "~/routes/api/package/[id]/cost.ts";

Deno.test("CostTests", async (t) => {
	await t.step("getCostExistingPackage", async () => {
		testLogger.info("TEST: queryExistingPackage");

		const db: DB = await setup();

		const response = await calcPackageCost(1, false, db, false);
		const body = await response.json();

		assertEquals(response.status, 200);
		assertEquals(body["1"].standaloneCost, 0.27);
		assertEquals(body["1"].totalCost, 0.5);

		await cleanup(db);
	});

	await t.step("getCostAnotherValidPackage", async () => {
		testLogger.info("TEST: queryAnotherValidPackage");

		const db: DB = await setup();

		const response = await calcPackageCost(2, false, db, false);
		const body = await response.json();

		assertEquals(response.status, 200);
		assertEquals(body["2"].standaloneCost, 0.27);
		assertEquals(body["2"].totalCost, 0.51);

		await cleanup(db);
	});

	await t.step("getCostNonExistingPackage", async () => {
		testLogger.info("TEST: queryNonExistingPackage");

		const db: DB = await setup();

		const response = await calcPackageCost(-1234567, false, db, false);

		assertEquals(response.status, 404);
		assertEquals(await response.text(), "Package with ID -1234567 not found");

		await cleanup(db);
	});
});
