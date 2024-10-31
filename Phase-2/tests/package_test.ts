import { handleContent, handleURL, parsePackageJSON, uploadZipToSQLite } from "../routes/api/package.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { assertEquals } from "jsr:@std/assert";
import { cleanup, setup, testLogger } from "./testSuite.ts";
import { assertGreaterOrEqual } from "$std/assert/assert_greater_or_equal.ts";
import { assertThrows } from "$std/assert/assert_throws.ts";

// enum of name to idx in db
const IDX = 0;
const NAME = 1;
const URL = 2;
const VERSION = 3;
const BASE64_CONTENT = 4;

// function to assert function throws error async
async function assertThrowsAsyncWithMessage(fn: () => Promise<void>, message: string) {
	try {
		await fn();
		throw new Error("Function did not throw");
	} catch (e) {
		assertEquals((e as Error).message, message);
	}
}

let TESTNAME = "packageUploadURL-Lodash";
Deno.test(TESTNAME, async () => {
	// pre test setup
	testLogger.info(`TEST: ${TESTNAME}`);
	const db: DB = await setup(TESTNAME);

	// test code
	const url = "https://github.com/lodash/lodash";
	await assertThrowsAsyncWithMessage(async () => {
		await handleURL(db, url);
	}, "Package is not uploaded due to the disqualified rating");

	// Read db and ensure package is NOT uploaded
	const packages = await db.query("SELECT * FROM packages WHERE NAME = 'lodash'");
	assertEquals(packages.length, 0, "Package should NOT be uploaded due to metric < 0.5");

	await cleanup(db, TESTNAME); // cleanup the database if used
});

TESTNAME = "packageUploadContent-simplenpmpackage";
Deno.test(TESTNAME, async () => {
	// pre test setup
	testLogger.info(`TEST: ${TESTNAME}`);
	const db: DB = await setup(TESTNAME);

	// test code
	const content =
		"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";

	await assertThrowsAsyncWithMessage(async () => {
		await handleContent(db, content);
	}, "Package is not uploaded due to the disqualified rating");

	// Read db and ensure package is NOT uploaded
	const packages = await db.query("SELECT * FROM packages WHERE NAME = 'simple-npm-package'");
	assertEquals(packages.length, 0, "Package should NOT be uploaded due to metric < 0.5");

	await cleanup(db, TESTNAME); // cleanup the database if used
});
