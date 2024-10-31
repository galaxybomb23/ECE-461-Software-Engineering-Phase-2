// test suite imports
import { assertNotEquals } from "$std/assert/assert_not_equals.ts";
import { cleanup, setup, testLogger } from "./testSuite.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // if needed
import { assertEquals } from "jsr:@std/assert";

//import the function to be tested
import { queryPackageById } from "~/routes/api/package/[id].ts";

// test suite
let TESTNAME = "queryExistingPackage";
Deno.test(TESTNAME, async () => {
	// pre test setup
	testLogger.info(`TEST: ${TESTNAME}`);
	const db: DB = await setup(TESTNAME);

	// test code
	const id = "1";
	const pkg = await queryPackageById(db, id);

	assertNotEquals(pkg, null, "Package should not be null");

	if (pkg) {
		assertEquals(pkg.metadata.Name, "sample-package-1", "Package name should be sample-package-1");
		assertEquals(pkg.metadata.Version, "1.0.0", "Package version should be 1.0.0");
		assertEquals(pkg.metadata.ID.toString(), "1", "Package ID should be 1");
		assertEquals(
			pkg.data.Content,
			"UEsDBBQAAAAIAK2YbU7bQwAAAEwAA...",
			"Package content should be the correct base64 string",
		);
	}

	// post test cleanup
	await cleanup(db, TESTNAME); // cleanup the database if used
});
