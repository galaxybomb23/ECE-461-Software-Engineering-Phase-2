// test suite imports
import { assertNotEquals } from "$std/assert/assert_not_equals.ts";
import { cleanup, setup, testLogger } from "./testSuite.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // if needed
import { assertEquals } from "jsr:@std/assert";
import { assert } from "https://deno.land/std/testing/asserts.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

//import the function to be tested
import { queryPackageById } from "~/routes/api/package/[id].ts";
import { updatePackageContent } from "~/routes/api/package/[id].ts";
import { deletePackage } from "~/routes/api/package/[id].ts";

// test suite
let TESTNAME = "queryExistingPackage";
Deno.test(TESTNAME, async () => {
	// pre test setup
	testLogger.info(`TEST: ${TESTNAME}`);
	const db: DB = await setup();

	// test code
	const id = "1";
	const pkg = await queryPackageById(id, "", "", db, false);

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
	await new Promise((r) => setTimeout(r, 10));
	await cleanup(db); // cleanup the database if used
});

TESTNAME = "queryNonExistingPackage";
Deno.test(TESTNAME, async () => {
	// pre test setup
	testLogger.info(`TEST: ${TESTNAME}`);
	const db: DB = await setup();

	// test code
	const id = "100";
	const pkg = await queryPackageById(id, "", "", db, false);

	assertEquals(pkg, null, "Package should be null");

	// post test cleanup
	await new Promise((r) => setTimeout(r, 10));
	await cleanup(db); // cleanup the database if used
});

TESTNAME = "updateExistingPackage";
Deno.test(TESTNAME, async () => {
	// pre test setup
	testLogger.info(`TEST: ${TESTNAME}`);
	const db: DB = await setup();

	// Fetch the package to update
	const id = "1";
	const name = "sample-package-1";
	const version = "1.0.0";
	const content = "UEsDBBQAAAAIAK2YbU7bQwAAAEwAA...";
	const pkg = await queryPackageById(id, name, version, db, false);
	assertNotEquals(pkg, null, "Package should not be null");

	if (pkg) {
		assertEquals(pkg.metadata.Name, name, "Package name should be sample-package-1");
		assertEquals(pkg.metadata.Version, version, "Package version should be 1.0.0");
		assertEquals(pkg.metadata.ID.toString(), id, "Package ID should be 1");
		assertEquals(
			pkg.data.Content,
			content,
			"Package content should be the correct base64 string",
		);
	}

	// We have verified package exists, now update the content
	const newContent = "New content";
	const newURL = "https://new-url.com";
	const success = await updatePackageContent(id, newURL, newContent, db, false);
	assertEquals(success, true, "Package should be updated");

	// Fetch the package again to verify the content is updated
	const updatedPkg = await queryPackageById(id, name, version, db, false);
	assertNotEquals(updatedPkg, null, "Package should not be null");
	if (updatedPkg) {
		assertEquals(updatedPkg.data.Content, newContent, "Package content should be updated");
		assertEquals(updatedPkg.metadata.Version, version, "Package version should not be updated");
		assertEquals(updatedPkg.metadata.Name, name, "Package name should not be updated");
		assertEquals(updatedPkg.metadata.ID.toString(), id, "Package ID should not be updated");
	}

	// post test cleanup
	await new Promise((r) => setTimeout(r, 10));
	await cleanup(db); // cleanup the database if used
});

TESTNAME = "updateNonExistingPackage";
Deno.test(TESTNAME, async () => {
	// pre test setup
	testLogger.info(`TEST: ${TESTNAME}`);
	const db: DB = await setup();

	// test code
	const id = "100";
	const name = "non-existing-package";
	const version = "1.0.0";
	const content = "UEsDBBQAAAAIAK2YbU7bQwAAAEwAA...";
	const pkg = await queryPackageById(id, name, version, db, false);
	assertEquals(pkg, null, "Package should be null");

	// Attempt to update the non-existing package
	const success = await updatePackageContent(id, "https://new-url.com", "New content", db, false);
	assertEquals(success, false, "Package should not be updated");

	// Fetch the package again to verify the content is updated
	const updatedPkg = await queryPackageById(id, name, version, db, false);
	assertEquals(updatedPkg, null, "Package should still be null");

	// post test cleanup
	await new Promise((r) => setTimeout(r, 10));
	await cleanup(db); // cleanup the database if used
});

TESTNAME = "deleteExistingPackage";
Deno.test(TESTNAME, async () => {
	// pre test setup
	testLogger.info(`TEST: ${TESTNAME}`);
	const db: DB = await setup();

	// Fetch the package to delete
	const id = "1";
	const name = "sample-package-1";
	const version = "1.0.0";
	const content = "UEsDBBQAAAAIAK2YbU7bQwAAAEwAA...";
	const pkg = await queryPackageById(id, name, version, db, false);
	assertNotEquals(pkg, null, "Package should not be null");

	if (pkg) {
		assertEquals(pkg.metadata.Name, name, "Package name should be sample-package-1");
		assertEquals(pkg.metadata.Version, version, "Package version should be 1.0.0");
		assertEquals(pkg.metadata.ID.toString(), id, "Package ID should be 1");
		assertEquals(
			pkg.data.Content,
			content,
			"Package content should be the correct base64 string",
		);
	}

	// We have verified package exists, now delete the package
	const success = await deletePackage(id, db, false);
	assertEquals(success, true, "Package should be deleted");

	// Fetch the package again to verify the package is deleted
	const deletedPkg = await queryPackageById(id, name, version, db, false);
	assertEquals(deletedPkg, null, "Package should be null");

	// post test cleanup
	await new Promise((r) => setTimeout(r, 10));
	await cleanup(db); // cleanup the database if used
});

TESTNAME = "deleteNonExistingPackage";
Deno.test(TESTNAME, async () => {
	// pre test setup
	testLogger.info(`TEST: ${TESTNAME}`);
	const db: DB = await setup();

	// Ensure package does not exist
	const id = "100";
	const pkg = await queryPackageById(id, "", "", db, false);
	assertEquals(pkg, null, "Package should be null");

	// test code
	const success = await deletePackage(id, db, false);
	assertEquals(success, false, "Package should not be deleted");

	// Fetch the package again to verify the package is deleted
	const deletedPkg = await queryPackageById(id, "", "", db, false);
	assertEquals(deletedPkg, null, "Package should still be null");

	// post test cleanup
	await new Promise((r) => setTimeout(r, 10));
	await cleanup(db); // cleanup the database if used
});
