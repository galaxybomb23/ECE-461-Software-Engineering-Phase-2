import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { adminCreateAccount, deleteAccount, login } from "~/utils/userManagement.ts";
import { testLogger } from "./testSuite.ts";
import { assert, assertEquals } from "https://deno.land/std@0.105.0/testing/asserts.ts";

Deno.test("UserManagementTest...", async () => {
	testLogger.info(`TEST: userManagement`);
	const db: DB = new DB(":memory:");

	// Create the users table
	await db.execute(
		`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            username TEXT NOT NULL UNIQUE, 
            hashed_password TEXT, 
            can_search BOOLEAN, 
            can_download BOOLEAN, 
            can_upload BOOLEAN, 
            user_group TEXT, 
            token_start_time INTEGER, 
            token_api_interactions INTEGER, 
            password_salt TEXT, 
            password_rounds INTEGER,
			is_admin BOOLEAN,
			token TEXT
        );`,
	);

	const username = "rushil";
	const password = "password";

	// Test for deleting a non-existing user - should return false
	assert(
		!(await deleteAccount(username, db, false)),
		"Delete non-existing user should return false",
	);

	// Test for logging in with a non-existing user - should return false
	assert(
		!(await login(username, password, true, db, false)).isAuthenticated,
		"Login non-existing user should return false",
	);

	// Test for creating a new user - should return true
	assert(
		await adminCreateAccount(
			username,
			password,
			true,
			false,
			true,
			"rushilsJob",
			true,
			db,
			false,
		),
		"Create new user should return true",
	);

	// Test for correct login - should return true
	assert(
		await login(username, password, true, db, false),
		"Correct login should return true",
	);

	// Test for duplicate user creation - should return false
	assert(
		!(await adminCreateAccount(
			username,
			password,
			true,
			false,
			true,
			"rushilsJob",
			true,
			db,
			false,
		)),
		"Duplicate user creation should return false",
	);

	// Test for incorrect password - should return false
	assert(
		!(await login(username, "notTheRightPassword", true, db, false))
			.isAuthenticated,
		"Login with wrong password should return false",
	);

	// Test for deleting the account - should return true
	assert(
		await deleteAccount(username, db, false),
		"Delete existing user should return true",
	);

	// Test for logging in after deletion - should return false
	assert(
		!(await login(username, password, true, db, false)).isAuthenticated,
		"Login after deletion should return false",
	);

	// Check that the users table is empty after deletion
	assertEquals(
		Array.from(db.query("SELECT * FROM users")),
		[],
		"Users table should be empty after deletion",
	);

	// TODO - Write a test that checks for SQL Injection

	// db.close();
});
