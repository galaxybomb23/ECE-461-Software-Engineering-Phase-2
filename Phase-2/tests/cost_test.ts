import { cleanup, setup, testLogger } from "./testSuite.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // if needed
import { assertEquals } from "jsr:@std/assert";

// Import functions to be tested
import { calcPackageCost } from "~/routes/api/package/[id]/cost.ts";

Deno.test("CostTests", async (t) => {
	await t.step("getCostExistingPackage", async () => {
		testLogger.info("TEST: queryExistingPackage");

		const db: DB = await setup();

		// no dependency
		const response = await calcPackageCost(1, false, db, false);
		const body = await response.json();

		// expect: {"1":{"totalCost":0.1}}
		assertEquals(response.status, 200);
		assertEquals(body["1"].totalCost, 0.1);
		assertEquals(Object.keys(body["1"]).length, 1); // no other fields should be present

		// now try with dependency
		const response2 = await calcPackageCost(1, true, db, false);
		const body2 = await response2.json();

		// expect {"1":{"totalCost":0.1,"standaloneCost":0.1}}
		assertEquals(response2.status, 200);
		assertEquals(body2["1"].totalCost, 0.1);
		assertEquals(body2["1"].standaloneCost, 0.1);
		assertEquals(Object.keys(body2["1"]).length, 2); // no other fields should be present

		await cleanup(db);
	});

	await t.step("getCostAnotherValidPackage", async () => {
		testLogger.info("TEST: queryAnotherValidPackage");

		const db: DB = await setup();

		// no dependency
		const response = await calcPackageCost(2, false, db, false);
		const body = await response.json();

		// expect: {"2":{"totalCost":0.19}}'
		assertEquals(response.status, 200);
		assertEquals(body["2"].totalCost, 0.19);
		assertEquals(Object.keys(body["2"]).length, 1); // no other fields should be present

		// now try with dependency
		const response2 = await calcPackageCost(2, true, db, false);
		const body2 = await response2.json();

		// expect {"1":{"totalCost":0.1,"standaloneCost":0.1},"2":{"totalCost":0.29,"standaloneCost":0.19}}
		assertEquals(response2.status, 200);
		assertEquals(body2["1"].totalCost, 0.1);
		assertEquals(body2["1"].standaloneCost, 0.1);
		assertEquals(body2["2"].totalCost, 0.29);
		assertEquals(body2["2"].standaloneCost, 0.19);
		assertEquals(Object.keys(body2["2"]).length, 2); // no other fields should be present
		assertEquals(Object.keys(body2["1"]).length, 2); // no other fields should be present

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
