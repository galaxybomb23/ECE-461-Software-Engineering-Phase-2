import { Handlers } from "$fresh/server.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";

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
};
