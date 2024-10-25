import * as crypto from "node:crypto";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db: DB = new DB("./data/data.db");

function sha256(data: string) {
	return crypto.createHash("sha256").update(data).digest("hex");
}

export function login(db: DB, username: string, password: string) {
	let result = db.query(`SELECT hashed_password, password_salt, password_rounds FROM users WHERE username = ?`, [
		username,
	]);
	if (result === undefined || result.length == 0) { // make sure the username exist
		return false;
	}

	let user = result[0];
	// get the values needed to calculate the password hash
	const known_password_hash = user[0];
	const password_salt = user[1];
	const password_rounds = user[2] as number;

	// calculate the password hash
	let to_check_password_hash = password;
	for (let i = 0; i < password_rounds; i++) {
		to_check_password_hash = sha256(to_check_password_hash + password_salt);
	}

	return known_password_hash == to_check_password_hash;
}

export function admin_create_account(
	db: DB,
	username: string,
	password: string,
	can_search: boolean,
	can_download: boolean,
	can_upload: boolean,
	user_group: string,
): boolean {
	// make sure username doesn't exist - if it does return false
	let result = db.query(`SELECT id FROM users WHERE username = ?`, [username]);
	if (result.length > 0) {
		return false;
	}

	// another variable is token_start_time, token_api_interaction
	const now = new Date();
	const token_start_time = Math.floor(now.getTime() / 1000); // Get the total seconds since the epoch
	const token_api_interactions = 1000;

	// another variable is password_salt, password_rounds, password_hash, password_algorithm, = sha256 (will not send this one)
	const password_salt = crypto.randomBytes(8).toString("hex");
	const password_rounds = crypto.randomInt(1000) + 4500;
	var hashed_password = password;
	for (let i = 0; i < password_rounds; i++) {
		hashed_password = sha256(hashed_password + password_salt);
	}

	// send all variables to .db
	const userQuery = db.prepareQuery(
		`INSERT OR IGNORE INTO users (username, hashed_password, can_search, can_download, can_upload, user_group, token_start_time, token_api_interactions, password_salt, password_rounds) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
	]);

	return true;
}

export function delete_account(db: DB, username: string) {
	db.query(`DELETE FROM users WHERE username = ?`, [username]);
	return db.changes > 0; // if the username existed then the amount of lines changed should be more than zero. 
}
