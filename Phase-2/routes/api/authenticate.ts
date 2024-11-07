// API Endpoint: PUT /authenticate
// Description: Authenticate this user -- get an access token. (NON-BASELINE)

import { Handlers } from "$fresh/server.ts";
import { AuthenticationRequest, AuthenticationToken } from "../../types/index.ts";
import { login, LoginResponse } from "~/utils/userManagement.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { logger } from "../../src/logFile.ts";

const db = new DB("./data/data.db");

export const handler: Handlers = {
	async PUT(req) {
		let name, is_admin, password;

		try {
			const auth_request = await req.json() as AuthenticationRequest;

			name = auth_request.User.name;
			is_admin = auth_request.User.isAdmin;
			password = auth_request.Secret.password;

			if (name === undefined || is_admin === undefined || password === undefined) {
				throw Error("");
			}
		} catch (error) {
			logger.debug(`${error}`);
			return new Response("There is missing field(s) in the AuthenticationRequest or it is formed improperly.", {
				status: 400,
			});
		}

		try {
			const { isAuthenticated, token } = login(db, name, password, is_admin);

			if (isAuthenticated) {
				logger.info(`${name} login was successful`);
				return new Response(JSON.stringify({ token }), { headers: { "Content-Type": "application/json" } });
			} else {
				logger.info(`${name} login was unsuccessful`);
				return new Response("The user or password is invalid.", { status: 401 });
			}
		} catch (error) {
			logger.error(error);
			return new Response(`Internal Exception: ${error}`, { status: 500 });
		}
	},
};

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
