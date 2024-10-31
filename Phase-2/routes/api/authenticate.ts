// API Endpoint: PUT /authenticate
// Description: Authenticate this user -- get an access token. (NON-BASELINE)

import { Handlers } from "$fresh/server.ts";
import { AuthenticationRequest, AuthenticationToken } from "../../types/index.ts";
import { admin_create_account, delete_account, login } from "../../src/userManagement.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("./data/data.db");

// export interface AuthenticationRequest {
// 	User: User;
// 	Secret: {
// 		password: string;
// 	};
// }

export const handler: Handlers = {
	async PUT(req) {
		try {
			const { User, Secret }: AuthenticationRequest = await req.json();
			const { name, isAdmin } = User;
			const { password } = Secret;

			const isAuthenticated = login(db, name, password);

			if (isAuthenticated) {
				const token: AuthenticationToken = `bearer ${btoa(name + ":" + password)}`; // is this correct?
				return new Response(JSON.stringify({ token }), { headers: { "Content-Type": "application/json" } });
			} else {
				return new Response("The user or password is invalid.", { status: 401 });
			}
		} catch (error) {
			return new Response("There is missing field(s) in the AuthenticationRequest or it is formed improperly.", {
				status: 400,
			});
		}
	},
	// async POST(req) {
	// 	// check if user is Admin

	// 	const { username, password, can_search, can_download, can_upload, user_group, is_admin } = await req.json();
	// 	const isCreated = admin_create_account(
	// 		db,
	// 		username,
	// 		password,
	// 		can_search,
	// 		can_download,
	// 		can_upload,
	// 		user_group,
	// 		is_admin
	// 	);

	// 	return new Response(isCreated ? "Account created" : "Account creation failed", {
	// 		status: isCreated ? 201 : 400,
	// 	});
	// },

	// async DELETE(req) {
	// 	// check if user is admin

	// 	const { username } = await req.json();
	// 	delete_account(db, username);
	// 	return new Response("Account deleted", { status: 200 });
	// },
};
