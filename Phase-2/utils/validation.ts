import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { getUnixTimeInSeconds } from "~/utils/userManagement.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

export interface userAuthInfo {
	can_search: boolean;
	can_download: boolean;
	can_upload: boolean;
	is_token_valid: boolean;
	user_group: string;
	is_admin: boolean;
	username: string;
}

export function getUserAuthInfo(token: string, db = new DB(DATABASEFILE), autoCloseDB = true): userAuthInfo {
	type UserRow = [boolean, boolean, boolean, number, number, string, boolean, string];
	const query = db.query(
		`SELECT can_search, can_download, can_upload, token_start_time, token_api_interactions, user_group, is_admin, username FROM users WHERE token = ?`,
		[token],
	);
	if (autoCloseDB) db.close(); // close the database if it was opened in this function

	// cheeck if query is empty
	if (query.length === 0) {
		return {
			can_search: false,
			can_download: false,
			can_upload: false,
			is_token_valid: false,
			user_group: "",
			is_admin: false,
			username: "",
		};
	}

	const user = query[0] as UserRow;
	const token_start_time = user[3];
	const token_api_interactions = user[4];
	const token_validity = isTokenValid(token_start_time, token_api_interactions);
	return {
		can_search: user[0],
		can_download: user[1],
		can_upload: user[2],
		is_token_valid: token_validity,
		user_group: user[5],
		is_admin: user[6],
		username: user[7],
	};
}

function isTokenValid(token_start_time: number, token_api_interactions: number): boolean {
	const token_overused = token_api_interactions >= 1000;

	const ten_hours = 60 * 60 * 10;
	const current_time = getUnixTimeInSeconds();
	const token_expired = (current_time - token_start_time) > ten_hours;

	const is_token_valid = !(token_overused || token_expired);

	return is_token_valid;
}
