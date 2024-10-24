import { logger } from "../src/logFile.ts";
import { Database } from "jsr:@db/sqlite@0.12.0";

export async function populateDatabase(db: Database) {
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

	await db.exec(
		"CREATE TABLE IF NOT EXISTS packages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, url TEXT NOT NULL, version TEXT, license_score INTEGER, netscore INTEGER, dependency_pinning_score INTEGER, rampup_score INTEGER, review_percentage_score INTEGER, bus_factor INTEGER, correctness INTEGER, responsive_maintainer INTEGER)",
	);

	for (const entry of dbentries.packages) {
		await db.exec(
			"INSERT OR IGNORE INTO packages (name, url, version, license_score, netscore, dependency_pinning_score, rampup_score, review_percentage_score, bus_factor, correctness, responsive_maintainer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
		);
	}

	await db.exec(
		"CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, hashed_password TEXT, can_search BOOLEAN, can_download BOOLEAN, can_upload BOOLEAN, user_group TEXT, token_start_time INTEGER, token_api_interactions INTEGER, password_salt TEXT, password_rounds INTEGER)",
	);

	for (const entry of dbentries.users) {
		await db.exec(
			"INSERT OR IGNORE INTO users (username, hashed_password, can_search, can_download, can_upload, user_group, token_start_time, token_api_interactions, password_salt, password_rounds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
		);
	}

	logger.info("Database populated");
}
