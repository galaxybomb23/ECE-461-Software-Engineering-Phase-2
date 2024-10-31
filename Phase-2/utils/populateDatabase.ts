import { logger } from "../src/logFile.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

/**
 * @function populateDatabase
 * @async
 * @param {DB} db - The database instance to populate.
 * @description Populates the database with initial sample data for packages and users. Open and close is the responsibility of the caller.
 * @throws {Error} If there's an issue with database operations.
 */
export async function populateDatabase(db: DB) {
	// open the database if it is not already open

	const dbentries = {
		packages: [
			{
				name: "sample-package-1",
				url: "https://example.com/sample-package-1",
				version: "1.0.0",
				base64_content: "UEsDBBQAAAAIAK2YbU7bQwAAAEwAA...",
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
				name: "sample-package-2",
				url: "https://example.com/sample-package-2",
				version: "2.1.3",
				base64_content: "UEsDBBQAAAAIAK2YbU7bQwAAAEwAA...",
				license_score: 95,
				netscore: 88,
				dependency_pinning_score: 85,
				rampup_score: 80,
				review_percentage_score: 75,
				bus_factor: 4,
				correctness: 90,
				responsive_maintainer: 92,
			},
		],
		users: [
			{
				username: "admin",
				hashed_password: "hashed_admin_password",
				can_search: true,
				can_download: true,
				can_upload: true,
				user_group: "admin",
				token_start_time: Date.now(),
				token_api_interactions: 0,
				password_salt: "admin_salt",
				password_rounds: 10000,
			},
			{
				username: "user1",
				hashed_password: "hashed_user1_password",
				can_search: true,
				can_download: true,
				can_upload: false,
				user_group: "user",
				token_start_time: Date.now(),
				token_api_interactions: 0,
				password_salt: "user1_salt",
				password_rounds: 4324,
			},
		],
	};

	// create the packages table
	await db.execute(
		`CREATE TABLE IF NOT EXISTS packages (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            name TEXT NOT NULL UNIQUE,
            url TEXT NOT NULL,
            version TEXT UNIQUE,
			base64_content TEXT,
            license_score INTEGER, 
            netscore INTEGER, 
            dependency_pinning_score INTEGER, 
            rampup_score INTEGER, 
            review_percentage_score INTEGER, 
            bus_factor INTEGER, 
            correctness INTEGER, 
            responsive_maintainer INTEGER
        )`,
	);

	// insert the packages into the database
	const pkgQuery = await db.prepareQuery(
		`INSERT OR IGNORE INTO packages (name, url, version, base64_content, license_score, netscore, dependency_pinning_score, rampup_score, review_percentage_score, bus_factor, correctness, responsive_maintainer) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	);
	for (const entry of dbentries.packages) {
		await pkgQuery.execute([
			entry.name,
			entry.url,
			entry.version,
			entry.base64_content,
			entry.license_score,
			entry.netscore,
			entry.dependency_pinning_score,
			entry.rampup_score,
			entry.review_percentage_score,
			entry.bus_factor,
			entry.correctness,
			entry.responsive_maintainer,
		]);
	}

	// create the users table
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
            password_rounds INTEGER
        )`,
	);

	// insert the users into the database
	const userQuery = await db.prepareQuery(
		`INSERT OR IGNORE INTO users (username, hashed_password, can_search, can_download, can_upload, user_group, token_start_time, token_api_interactions, password_salt, password_rounds) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	);
	for (const entry of dbentries.users) {
		await userQuery.execute([
			entry.username,
			entry.hashed_password,
			entry.can_search,
			entry.can_download,
			entry.can_upload,
			entry.user_group,
			entry.token_start_time,
			entry.token_api_interactions,
			entry.password_salt,
			entry.password_rounds,
		]);
	}

	logger.info("Database populated");
}

populateDatabase(new DB("data/data.db"));
