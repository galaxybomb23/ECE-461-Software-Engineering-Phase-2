import { DB } from "https://deno.land/x/sqlite/mod.ts";

export interface userInfo {
	can_search: boolean;
	can_download: boolean;
	can_upload: boolean;
	is_token_valid: boolean;
	user_group: string;
}

export function getUserPermissions(db: DB, token: string): userInfo {
	const query = db.query(
		`SELECT can_search, can_download, can_upload, token_start_time, token_api_interactions, user_group FROM users WHERE token = ?`,
		[token],
	);
	const user = query[0];

	const token_start_time = user[3];
	const token_api_interactions = user[4];

	const token_validity = is_token_valid(token_start_time, token_api_interactions);

	return {
		can_search: user[0],
		can_download: user[1],
		can_upload: user[2],
		is_token_valid: token_validity,
		user_group: user[5],
	};
}

function is_token_valid(token_start_time: number, token_api_interactions: number): boolean {
	const token_overused = token_api_interactions >= 1000;

	const current_time = new Date().getTime();
	const ten_hours = 60 * 10;
	const token_expired = (current_time - token_start_time) > ten_hours;

	const is_token_valid = !(token_overused || token_expired);

	return is_token_valid;
}
