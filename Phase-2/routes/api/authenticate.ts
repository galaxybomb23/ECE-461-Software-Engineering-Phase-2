// API Endpoint: PUT /authenticate
// Description: Authenticate this user -- get an access token. (NON-BASELINE)

import { Handlers } from "$fresh/server.ts";
import { AuthenticationRequest, AuthenticationToken } from "../../types/index.ts";
import { login, LoginResponse } from "../../src/userManagement.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { logger } from "../../src/logFile.ts";

const db = new DB("./data/data.db");

export const handler: Handlers = {
	async PUT(req) {
		try {
			const { User, Secret }: AuthenticationRequest = await req.json();
			if (!User || !Secret) {
				logger.debug("Missing parameters");
				return new Response(
					"There is missing field(s) in the AuthenticationRequest or it is formed improperly.",
					{
						status: 400,
					},
				);
			}
			const { name, isAdmin } = User;
			const { password } = Secret;
			if (name === undefined || isAdmin === undefined || password === undefined) {
				logger.debug("Missing info");
				return new Response(
					"There is missing field(s) in the AuthenticationRequest or it is formed improperly.",
					{
						status: 400,
					},
				);
			}

			const { isAuthenticated, token } = login(db, name, password);

			if (isAuthenticated) {
				return new Response(JSON.stringify({ token }), { headers: { "Content-Type": "application/json" } });
			} else {
				return new Response("The user or password is invalid.", { status: 401 });
			}
		} catch (error) {
			logger.debug(error);
			return new Response(`Internal Exception: ${error}`, { status: 500 });
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
