import { assertNotEquals } from "$std/assert/assert_not_equals.ts";
import { cleanup, setup, testLogger } from "./testSuite.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // if needed
import { assertEquals } from "jsr:@std/assert";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

// Import functions to be tested
import { deletePackage, queryPackageById, updatePackageContent } from "~/routes/api/package/[id].ts";

// Test suite
Deno.test("PackagesTest", async (t) => {
	await t.step("queryExistingPackage", async () => {
		testLogger.info("TEST: queryExistingPackage");
		const db: DB = await setup();

		const id = "1";
		const pkg = await queryPackageById(id, "", "", db, false);
		assertNotEquals(pkg, null, "Package should not be null");

		assertEquals(!Array.isArray(pkg), true, "Package should not be an array");
		if (pkg && !Array.isArray(pkg)) {
			assertEquals(pkg.metadata.Name, "sample-package-1", "Package name should be sample-package-1");
			assertEquals(pkg.metadata.Version, "1.0.0", "Package version should be 1.0.0");
			assertEquals(pkg.metadata.ID.toString(), "1", "Package ID should be 1");
			assertEquals(
				pkg.data.Content,
				"UEsDBBQAAAAIAK2YbU7bQwAAAEwAA...",
				"Package content should be the correct base64 string",
			);
		}

		await new Promise((r) => setTimeout(r, 10));
		await cleanup(db);
	});

	await t.step("queryNonExistingPackage", async () => {
		testLogger.info("TEST: queryNonExistingPackage");
		const db: DB = await setup();

		const id = "100";
		const pkg = await queryPackageById(id, "", "", db, false);
		assertEquals(pkg, null, "Package should be null");

		await new Promise((r) => setTimeout(r, 10));
		await cleanup(db);
	});

	await t.step("updateExistingPackage", async () => {
		testLogger.info("TEST: updateExistingPackage");
		const db: DB = await setup();

		const id = "1";
		const name = "sample-package-1";
		const version = "1.0.0";
		const content = "UEsDBBQAAAAIAK2YbU7bQwAAAEwAA...";
		const pkg = await queryPackageById(id, name, version, db, false);
		assertNotEquals(pkg, null, "Package should not be null");

		if (pkg && !Array.isArray(pkg)) {
			assertEquals(pkg.metadata.Name, name, "Package name should be sample-package-1");
			assertEquals(pkg.metadata.Version, version, "Package version should be 1.0.0");
			assertEquals(pkg.metadata.ID.toString(), id, "Package ID should be 1");
			assertEquals(pkg.data.Content, content, "Package content should be the correct base64 string");
		}

		const newContent = "New content";
		const newURL = "https://new-url.com";
		const success = await updatePackageContent(id, newURL, newContent, db, false);
		assertEquals(success, true, "Package should be updated");

		const updatedPkg = await queryPackageById(id, name, version, db, false);
		assertNotEquals(updatedPkg, null, "Package should not be null");

		assertEquals(!Array.isArray(updatedPkg), true, "Package should not be an array");
		if (updatedPkg && !Array.isArray(updatedPkg)) {
			assertEquals(updatedPkg.data.Content, newContent, "Package content should be updated");
			assertEquals(updatedPkg.metadata.Version, version, "Package version should not be updated");
			assertEquals(updatedPkg.metadata.Name, name, "Package name should not be updated");
			assertEquals(updatedPkg.metadata.ID.toString(), id, "Package ID should not be updated");
		}

		await new Promise((r) => setTimeout(r, 10));
		await cleanup(db);
	});

	await t.step("updateNonExistingPackage", async () => {
		testLogger.info("TEST: updateNonExistingPackage");
		const db: DB = await setup();

		const id = "100";
		const name = "non-existing-package";
		const version = "1.0.0";
		const content = "UEsDBBQAAAAIAK2YbU7bQwAAAEwAA...";
		const pkg = await queryPackageById(id, name, version, db, false);
		assertEquals(pkg, null, "Package should be null");

		const success = await updatePackageContent(id, "https://new-url.com", "New content", db, false);
		assertEquals(success, false, "Package should not be updated");

		const updatedPkg = await queryPackageById(id, name, version, db, false);
		assertEquals(updatedPkg, null, "Package should still be null");

		await new Promise((r) => setTimeout(r, 10));
		await cleanup(db);
	});

	await t.step("deleteExistingPackage", async () => {
		testLogger.info("TEST: deleteExistingPackage");
		const db: DB = await setup();

		const id = "1";
		const name = "sample-package-1";
		const version = "1.0.0";
		const content = "UEsDBBQAAAAIAK2YbU7bQwAAAEwAA...";
		const pkg = await queryPackageById(id, name, version, db, false);
		assertNotEquals(pkg, null, "Package should not be null");

		assertEquals(!Array.isArray(pkg), true, "Package should not be an array");
		if (pkg && !Array.isArray(pkg)) {
			assertEquals(pkg.metadata.Name, name, "Package name should be sample-package-1");
			assertEquals(pkg.metadata.Version, version, "Package version should be 1.0.0");
			assertEquals(pkg.metadata.ID.toString(), id, "Package ID should be 1");
			assertEquals(pkg.data.Content, content, "Package content should be the correct base64 string");
		}

		const success = await deletePackage(id, db, false);
		assertEquals(success, true, "Package should be deleted");

		const deletedPkg = await queryPackageById(id, name, version, db, false);
		assertEquals(deletedPkg, null, "Package should be null");

		await new Promise((r) => setTimeout(r, 10));
		await cleanup(db);
	});

	await t.step("deleteNonExistingPackage", async () => {
		testLogger.info("TEST: deleteNonExistingPackage");
		const db: DB = await setup();

		const id = "100";
		const pkg = await queryPackageById(id, "", "", db, false);
		assertEquals(pkg, null, "Package should be null");

		const success = await deletePackage(id, db, false);
		assertEquals(success, false, "Package should not be deleted");

		const deletedPkg = await queryPackageById(id, "", "", db, false);
		assertEquals(deletedPkg, null, "Package should still be null");

		await new Promise((r) => setTimeout(r, 10));
		await cleanup(db);
	});
});
