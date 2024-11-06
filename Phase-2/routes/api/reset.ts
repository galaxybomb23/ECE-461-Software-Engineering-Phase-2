// API Endpoint: DELETE /reset
// Description: Reset the registry. (BASELINE)

import { Handlers } from "$fresh/server.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { logger } from "~/src/logFile.ts";
import { ResetRequest } from "../../types/index.ts";
import { getUserAuthInfo } from "../../utils/validation.ts";
import { adminCreateAccount, login } from "../../src/userManagement.ts";

const db = new DB("./data/data.db");

export const handler: Handlers = {
	// Handles DELETE request to reset the database
	async DELETE(req) {
		let auth_token, username, is_token_valid, is_admin;

		try {
			const auth_request = await req.json() as ResetRequest;

			auth_token = auth_request["X-Authorization"];

			if (auth_token === undefined) {
				throw Error("Missing Authenticatoin Token");
			}

			const authInfo = getUserAuthInfo(db, auth_token);
			username = authInfo.username;
			is_token_valid = authInfo.is_token_valid;
			is_admin = authInfo.is_admin;

			if (username === undefined || !is_token_valid) {
				throw Error("Invalid Authernication Token");
			}
		} catch (error) {
			logger.debug(`${error}`);
			return new Response("Authentication failed due to invalid or missing AuthenticationToken.", {
				status: 403,
			});
		}

		try {
			if (is_admin) { // confirm that admins and only admins can reset the db
				logger.info(`${username} triggered a db reset.`);
				resetDatabase(db);
				return new Response("Registry is reset.", { status: 200 });
			} else {
				logger.debug(
					`${username} unsuccessfully triggered a db reset. Reason: is_admin:${is_admin}::is_token_valid${is_token_valid}`,
				);
				return new Response("You do not have permission to reset the registry.", { status: 401 });
			}
		} catch (error) {
			logger.error(error);
			return new Response(`Internal Exception: ${error}`, { status: 500 });
		}
	},
};

export async function resetDatabase(db: DB) {
	await db.execute("DELETE FROM sqlite_sequence WHERE name='packages';");
	await db.execute("DELETE FROM sqlite_sequence WHERE name='users';");
	await db.execute("DROP TABLE packages;");
	await db.execute("DROP TABLE users;");

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

	adminCreateAccount(
		db,
		"ece30861defaultadminuser",
		"correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;",
		true,
		true,
		true,
		"admin",
		true,
	);
}
