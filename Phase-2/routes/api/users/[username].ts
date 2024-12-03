import { Handlers } from "$fresh/server.ts";
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";
import { deleteAccount } from "~/utils/userManagement.ts";
import { getUserAuthInfo } from "~/utils/validation.ts";
import { logger } from "~/src/logFile.ts";

export const handler: Handlers = {
	async PUT(req, ctx) {
		logger.info(`--> /users/{username}: PUT`);
		logger.verbose(`Request: ${Deno.inspect(req, { depth: 10, colors: false })}`);
		logger.verbose(`Ctx: ${Deno.inspect(ctx, { depth: 10, colors: false })}`);

		const authToken = req.headers.get("X-Authorization") ?? "";
		if (!authToken) {
			logger.warn("Invalid request: missing authentication token");
			return new Response("Invalid request: missing authentication token", { status: 403 });
		}
		if (!getUserAuthInfo(authToken).is_token_valid) {
			logger.warn("Unauthorized request: invalid token");
			return new Response("Unauthorized request: invalid token", { status: 403 });
		}

		try {
			const username = ctx.params.username;
			const body = await req.json();

			const db = new DB(DATABASEFILE);

			// Update the user in the database
			db.query(
				`UPDATE users SET can_search = ?, can_download = ?, can_upload = ?, user_group = ?, is_admin = ? WHERE username = ?`,
				[
					body.canSearch,
					body.canDownload,
					body.canUpload,
					body.userGroup,
					body.isAdmin,
					username,
				],
			);
			logger.info("User updated successfully");
			return new Response("User updated successfully", { status: 200 });
		} catch (error) {
			logger.error("Error updating user:", error);
			return new Response("Internal Server Error", { status: 500 });
		}
	},
	async DELETE(req, ctx) {
		logger.info(`--> /users/{username}: DELETE`);
		logger.debug(`Request: ${JSON.stringify(req)}`);
		logger.debug(`Ctx: ${JSON.stringify(ctx)}`);

		const authToken = req.headers.get("X-Authorization") ?? "";
		if (!authToken) {
			logger.warn("Invalid request: missing authentication token");
			return new Response("Invalid request: missing authentication token", { status: 403 });
		}
		if (!getUserAuthInfo(authToken).is_token_valid) {
			logger.warn("Unauthorized request: invalid token");
			return new Response("Unauthorized request: invalid token", { status: 403 });
		}

		const { username } = ctx.params;

		if (!username) {
			logger.warn("Invalid request: missing username");
			return new Response("Username is required.", { status: 400 });
		}

		try {
			const deleted = await deleteAccount(username);
			if (deleted) {
				logger.info("User deleted successfully.");
				return new Response("User deleted successfully.", { status: 200 });
			} else {
				logger.info("User not found.");
				return new Response("User not found.", { status: 404 });
			}
		} catch (error) {
			logger.error("Error deleting user:", error);
			return new Response("Failed to delete user.", { status: 500 });
		}
	},
};
