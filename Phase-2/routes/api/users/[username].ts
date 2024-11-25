import { Handlers } from "$fresh/server.ts";
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";
import { deleteAccount } from "~/utils/userManagement.ts";

export const handler: Handlers = {
	async PUT(req, ctx) {
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

			return new Response("User updated successfully", { status: 200 });
		} catch (error) {
			console.error("Error updating user:", error);
			return new Response("Internal Server Error", { status: 500 });
		}
	},
	async DELETE(req, ctx) {
		const { username } = ctx.params;

		if (!username) {
			return new Response("Username is required.", { status: 400 });
		}

		try {
			const deleted = await deleteAccount(username);
			if (deleted) {
				return new Response("User deleted successfully.", { status: 200 });
			} else {
				return new Response("User not found.", { status: 404 });
			}
		} catch (error) {
			console.error("Error deleting user:", error);
			return new Response("Failed to delete user.", { status: 500 });
		}
	},
};
