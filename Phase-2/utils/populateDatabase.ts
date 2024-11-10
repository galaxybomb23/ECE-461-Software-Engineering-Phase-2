import { logger } from "../src/logFile.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

/**
 * @function populateDatabase
 * @async
 * @param {DB} db - The database instance to populate.
 * @description Populates the database with initial sample data for packages and users. Open and close is the responsibility of the caller.
 * @throws {Error} If there's an issue with database operations.
 * NOTE: this function does not Close the Database connection.
 */
export async function populateDatabase(db = new DB(DATABASEFILE), autoCloseDB = true): Promise<void> {
	try {
		const dbentries = {
			packages: [
				{
					name: "sample-package-1",
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
					name: "sample-package-2",
					url: "https://example.com/sample-package-2",
					version: "2.1.3",
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
					username: "ece30861defaultadminuser",
					hashed_password: "6af977a963ed05684b582b87299dad067dd2783557a9ebcd6bc209b8229a6eaa", // password is "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;"
					can_search: true,
					can_download: true,
					can_upload: true,
					user_group: "admin",
					token_start_time: Date.now(),
					token_api_interactions: 0,
					password_salt: "f5429e4041729b8a",
					password_rounds: 5227,
					is_admin: true,
					token: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
				},
				{
					username: "pi",
					hashed_password: "f636675642fc2a2b777d34a137210866d3dd1cc5bcdb5ec03406d381adfe3143", // password is "password"
					can_search: true,
					can_download: true,
					can_upload: false,
					user_group: "user",
					token_start_time: Date.now(),
					token_api_interactions: 0,
					password_salt: "7913fd0effdbdc62",
					password_rounds: 5125,
					is_admin: false,
					token: "bearer 1f62b376-a9f7-4088-9a8d-a245d1998566",
				},
			],
		};

		// create the packages table
		await db.execute(
			`CREATE TABLE IF NOT EXISTS packages (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            name TEXT NOT NULL, 
            url TEXT NOT NULL, 
            version TEXT, 
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
		for (const entry of dbentries.packages) {
			await db.query(
				`INSERT OR IGNORE INTO packages (name, url, version, license_score, netscore, dependency_pinning_score, rampup_score, review_percentage_score, bus_factor, correctness, responsive_maintainer) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					entry.name,
					entry.url,
					entry.version,
					entry.license_score,
					entry.netscore,
					entry.dependency_pinning_score,
					entry.rampup_score,
					entry.review_percentage_score,
					entry.bus_factor,
					entry.correctness,
					entry.responsive_maintainer,
				],
			);
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
            password_rounds INTEGER,
			is_admin BOOLEAN,
			token TEXT
        )`,
		);

		// insert the users into the database
		for (const entry of dbentries.users) {
			await db.query(
				`INSERT OR IGNORE INTO users (username, hashed_password, can_search, can_download, can_upload, user_group, token_start_time, token_api_interactions, password_salt, password_rounds, is_admin, token) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
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
					entry.is_admin,
					entry.token,
				],
			);
		}

		// await all queries to finish
		logger.info("Database populated");
	} finally {
		// mem safety close
		if (autoCloseDB) db.close(true);
	}
}

// if main, run the function
if (import.meta.main) {
	console.log("Populating the database...");
	await populateDatabase();
}
