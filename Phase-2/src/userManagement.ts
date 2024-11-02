import * as crypto from "node:crypto";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { logger } from "./logFile.ts";

function sha256(data: string) {
	return crypto.createHash("sha256").update(data).digest("hex");
}

export interface LoginResponse {
	isAuthenticated: boolean;
	token?: string;
}

export function login(db: DB, username: string, password: string, is_admin: boolean): LoginResponse {
	const result = db.query(
		`SELECT hashed_password, password_salt, password_rounds, is_admin FROM users WHERE username = ?`,
		[
			username,
		],
	);
	if (result === undefined || result.length == 0) { // make sure the username exist
		logger.debug(`there was no result from the db. result: {result}`);
		return { isAuthenticated: false };
	}

	const user = result[0];
	// get the values needed to calculate the password hash
	const known_password_hash = user[0];
	const password_salt = user[1];
	const password_rounds = user[2] as number;
	const user_admin_status = user[3] as boolean;

	// calculate the password hash
	let to_check_password_hash = password;
	for (let i = 0; i < password_rounds; i++) {
		to_check_password_hash = sha256(to_check_password_hash + password_salt);
	}

	if (known_password_hash == to_check_password_hash && is_admin == user_admin_status) { // can admins login as not admins?
		const token = `bearer ${crypto.randomUUID()}`;
		db.query(`UPDATE users SET token_start_time = ?, token_api_interactions = 0, token = ? WHERE username = ?;`, [
			Math.floor(new Date().getTime() / 1000),
			token,
			username,
		]);
		return { isAuthenticated: true, token: token };
	} else {
		return { isAuthenticated: false };
	}
}

export function admin_create_account(
	db: DB,
	username: string, // this parameter and the next are for the new users
	password: string,
	can_search: boolean,
	can_download: boolean,
	can_upload: boolean,
	user_group: string,
	is_admin: boolean,
): boolean {
	// make sure username doesn't exist - if it does return false
	const result = db.query(`SELECT id FROM users WHERE username = ?`, [username]);
	if (result.length > 0) {
		return false;
	}

	// another variable is token_start_time, token_api_interaction
	const now = new Date();
	const token_start_time = Math.floor(now.getTime() / 1000); // Get the total seconds since the epoch
	const token_api_interactions = 0;

	// another variable is password_salt, password_rounds, password_hash, password_algorithm, = sha256 (will not send this one)
	const password_salt = crypto.randomBytes(8).toString("hex");
	const password_rounds = crypto.randomInt(1000) + 4500;
	let hashed_password = password;
	for (let i = 0; i < password_rounds; i++) {
		hashed_password = sha256(hashed_password + password_salt);
	}

	const token = "";

	// send all variables to .db
	const userQuery = db.prepareQuery(
		`INSERT OR IGNORE INTO users (username, hashed_password, can_search, can_download, can_upload, user_group, token_start_time, token_api_interactions, password_salt, password_rounds, is_admin, token) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	);
	userQuery.execute([
		username,
		hashed_password,
		can_search,
		can_download,
		can_upload,
		user_group,
		token_start_time,
		token_api_interactions,
		password_salt,
		password_rounds,
		is_admin,
		token,
	]);

	return true;
}

export function delete_account(db: DB, username: string) {
	db.query(`DELETE FROM users WHERE username = ?`, [username]);
	return db.changes > 0; // if the username existed then the amount of lines changed should be more than zero.
}
