import { logger } from "../src/logFile.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";
import { getUnixTimeInSeconds } from "./userManagement.ts";

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
					base64_content: "UEsDBBQAAAAIAK2YbU7bQwAAAEwAA...",
					license_score: 80,
					license_latency: 10,
					netscore: 75,
					netscore_latency: 12,
					dependency_pinning_score: 90,
					dependency_pinning_latency: 8,
					rampup_score: 85,
					rampup_latency: 15,
					review_percentage_score: 70,
					review_percentage_latency: 7,
					bus_factor: 3,
					bus_factor_latency: 9,
					correctness: 95,
					correctness_latency: 11,
					responsive_maintainer: 85,
					responsive_maintainer_latency: 14,
				},
				{
					name: "sample-package-2",
					url: "https://example.com/sample-package-2",
					version: "2.1.3",
					base64_content: "UEsDBBQAAAAIAK2YbU7bQwAAAEwAA...",
					license_score: 95,
					license_latency: 11,
					netscore: 88,
					netscore_latency: 13,
					dependency_pinning_score: 85,
					dependency_pinning_latency: 9,
					rampup_score: 80,
					rampup_latency: 16,
					review_percentage_score: 75,
					review_percentage_latency: 8,
					bus_factor: 4,
					bus_factor_latency: 10,
					correctness: 90,
					correctness_latency: 12,
					responsive_maintainer: 92,
					responsive_maintainer_latency: 13,
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
					token_start_time: getUnixTimeInSeconds(),
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
					token_start_time: getUnixTimeInSeconds(),
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
			base64_content TEXT,
            license_score INTEGER, 
            license_latency INTEGER,
            netscore INTEGER, 
            netscore_latency INTEGER,
            dependency_pinning_score INTEGER, 
            dependency_pinning_latency INTEGER,
            rampup_score INTEGER, 
            rampup_latency INTEGER,
            review_percentage_score INTEGER, 
            review_percentage_latency INTEGER,
            bus_factor INTEGER, 
            bus_factor_latency INTEGER,
            correctness INTEGER, 
            correctness_latency INTEGER,
            responsive_maintainer INTEGER,
            responsive_maintainer_latency INTEGER
        )`,
		);

		// insert the packages into the database
		for (const entry of dbentries.packages) {
			await db.query(
				`INSERT OR IGNORE INTO packages (name, url, version, base64_content, license_score, license_latency, netscore, netscore_latency, dependency_pinning_score, dependency_pinning_latency, rampup_score, rampup_latency, review_percentage_score, review_percentage_latency, bus_factor, bus_factor_latency, correctness, correctness_latency, responsive_maintainer, responsive_maintainer_latency) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					entry.name,
					entry.url,
					entry.version,
					entry.base64_content,
					entry.license_score,
					entry.license_latency,
					entry.netscore,
					entry.netscore_latency,
					entry.dependency_pinning_score,
					entry.dependency_pinning_latency,
					entry.rampup_score,
					entry.rampup_latency,
					entry.review_percentage_score,
					entry.review_percentage_latency,
					entry.bus_factor,
					entry.bus_factor_latency,
					entry.correctness,
					entry.correctness_latency,
					entry.responsive_maintainer,
					entry.responsive_maintainer_latency,
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
