import { Handlers } from "$fresh/server.ts";
import { adminCreateAccount, get_all_user_info } from "~/utils/userManagement.ts";

export const handler: Handlers = {
	async GET(_, ctx) {
		try {
			// Use 'await' to resolve the Promise
			const users = await get_all_user_info();
			const userList = [];
			for (const user of users) {
				userList.push({
					username: user[7],
					isAdmin: user[6],
					canSearch: user[0],
					canDownload: user[1],
					canUpload: user[2],
					userGroup: user[5],
					tokenStartTime: user[3],
					tokenApiInteractions: user[4],
				});
			}
			return new Response(JSON.stringify(userList), { status: 200 });
		} catch (error) {
			console.error("Error fetching user info:", error);
			return new Response("Internal Server Error", { status: 500 });
		}
	},
	async POST(req, _ctx) {
		try {
			// Parse the request body
			const body = await req.json();
			const { username, password, canSearch, canDownload, canUpload, userGroup, isAdmin } = body;

			// Validate input
			if (!username || !password || userGroup === undefined || isAdmin === undefined) {
				return new Response(
					JSON.stringify({ error: "Missing required fields." }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}

			// Call the adminCreateAccount function
			const success = await adminCreateAccount(
				username,
				password,
				canSearch || false,
				canDownload || false,
				canUpload || false,
				userGroup,
				isAdmin || false,
			);

			if (!success) {
				return new Response(
					JSON.stringify({ error: "User creation failed. The username may already exist." }),
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}

			// Respond with success
			return new Response(
				JSON.stringify({ message: "User created successfully." }),
				{ status: 201, headers: { "Content-Type": "application/json" } },
			);
		} catch (error) {
			console.error("Error creating user:", error);
			return new Response(
				JSON.stringify({ error: "An unexpected error occurred." }),
				{ status: 500, headers: { "Content-Type": "application/json" } },
			);
		}
	},
};
