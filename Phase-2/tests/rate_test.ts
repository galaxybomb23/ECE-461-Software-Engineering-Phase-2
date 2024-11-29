import { assertNotEquals } from "$std/assert/assert_not_equals.ts";
import { cleanup, setup, testLogger } from "./testSuite.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // if needed
import { assertEquals } from "jsr:@std/assert";

// Import functions to be tested
import { calcPackageRating, queryPackageById } from "~/routes/api/package/[id]/rate.ts";

Deno.test("RateTests", async (t) => {
	await t.step("getRatingsExistingPackage", async () => {
		testLogger.info("TEST: queryExistingPackage");
		const db: DB = await setup();

		const pkg = await queryPackageById("1", db, false);
		assertNotEquals(pkg, null, "Package should not be null");

		// Check rating values
		const response = await calcPackageRating(1, db, false);
		const rating = await response.json();
		assertEquals(rating.LicenseScore, 80);
		assertEquals(rating.LicenseScoreLatency, 10);
		assertEquals(rating.NetScore, 75);
		assertEquals(rating.NetScoreLatency, 12);
		assertEquals(rating.GoodPinningPractice, 90);
		assertEquals(rating.GoodPinningPracticeLatency, 8);
		assertEquals(rating.RampUp, 85);
		assertEquals(rating.RampUpLatency, 15);
		assertEquals(rating.PullRequest, 70);
		assertEquals(rating.PullRequestLatency, 7);
		assertEquals(rating.BusFactor, 3);
		assertEquals(rating.BusFactorLatency, 9);
		assertEquals(rating.Correctness, 95);
		assertEquals(rating.CorrectnessLatency, 11);
		assertEquals(rating.ResponsiveMaintainer, 85);
		assertEquals(rating.ResponsiveMaintainerLatency, 14);

		await cleanup(db);
	});

	await t.step("getRatingsNonExistingPackage", async () => {
		testLogger.info("TEST: rateNonExistingPackage");

		const db: DB = await setup();
		const response = await calcPackageRating(-1234567, db, false);
		assertEquals(response.status, 404);
		assertEquals(await response.text(), "Package does not exist");

		await cleanup(db);
	});

	await t.step("getRatingsAnotherValidPackage", async () => {
		testLogger.info("TEST: rateAnotherValidPackage");

		const db: DB = await setup();
		const pkg = await queryPackageById("2", db, false);
		assertNotEquals(pkg, null, "Package should not be null");

		// Check rating values
		const response = await calcPackageRating(2, db, false);
		const rating = await response.json();
		assertEquals(rating.LicenseScore, 95);
		assertEquals(rating.LicenseScoreLatency, 11);
		assertEquals(rating.NetScore, 88);
		assertEquals(rating.NetScoreLatency, 13);
		assertEquals(rating.GoodPinningPractice, 85);
		assertEquals(rating.GoodPinningPracticeLatency, 9);
		assertEquals(rating.RampUp, 80);
		assertEquals(rating.RampUpLatency, 16);
		assertEquals(rating.PullRequest, 75);
		assertEquals(rating.PullRequestLatency, 8);
		assertEquals(rating.BusFactor, 4);
		assertEquals(rating.BusFactorLatency, 10);
		assertEquals(rating.Correctness, 90);
		assertEquals(rating.CorrectnessLatency, 12);
		assertEquals(rating.ResponsiveMaintainer, 92);
		assertEquals(rating.ResponsiveMaintainerLatency, 13);

		await cleanup(db);
	});
});
