// API Endpoint: PUT /authenticate
// Description: Authenticate this user -- get an access token. (NON-BASELINE)

import { Handlers } from "$fresh/server.ts";
import { AuthenticationRequest, AuthenticationToken } from "../../types/index.ts";
import { login, LoginResponse } from "~/utils/userManagement.ts";
import { logger } from "../../src/logFile.ts";

export const handler: Handlers = {
	/**
	 * Handles the PUT request for user authentication.
	 *
	 * @param req - The incoming request object containing the authentication details.
	 * @returns A Response object indicating the result of the authentication process.
	 *
	 * The function performs the following steps:
	 * 1. Parses the incoming request to extract the authentication details (name, is_admin, password).
	 * 2. Validates the presence of required fields in the authentication request.
	 * 3. Attempts to authenticate the user using the provided credentials.
	 * 4. Returns a success response with a token if authentication is successful.
	 * 5. Returns an error response if authentication fails or if there are missing/invalid fields.
	 * 6. Ensures the database connection is safely closed after the operation.
	 *
	 * Possible response statuses:
	 * - 200: Authentication successful, returns a JSON object with the token.
	 * - 400: Missing or improperly formed fields in the authentication request.
	 * - 401: Invalid user or password.
	 * - 500: Internal server error during the authentication process.
	 */
	async PUT(req) {
		let name, is_admin, password;

		try { // database open
			try {
				// Parse the incoming request to extract the authentication details
				const auth_request = await req.json() as AuthenticationRequest;

				// Extract the necessary fields from the authentication request
				name = auth_request.User.name;
				is_admin = auth_request.User.isAdmin;
				password = auth_request.Secret.password;

				// Validate the presence of required fields in the authentication request
				if (name === undefined || is_admin === undefined || password === undefined) {
					throw Error("");
				}
			} catch (error) {
				// Log the error for debugging purposes
				logger.debug(`${error}`);

				// Return a response indicating that there are missing or improperly formed fields
				return new Response(
					"There is missing field(s) in the AuthenticationRequest or it is formed improperly.",
					{
						status: 400,
					},
				);
			}

			try {
				// Attempt to authenticate the user using the provided credentials
				const { isAuthenticated, token } = await login(name, password, is_admin);

				// Check if the authentication was successful
				if (isAuthenticated) {
					// Log the successful login attempt
					logger.info(`${name} login was successful`);

					// Return a success response with the authentication token
					return new Response(JSON.stringify({ token }), {
						headers: { "Content-Type": "application/json" },
						status: 200,
					});
				} else {
					// Log the unsuccessful login attempt
					logger.info(`${name} login was unsuccessful`);

					// Return a response indicating invalid user or password
					return new Response("The user or password is invalid.", { status: 401 });
				}
			} catch (error) {
				// Log the error for debugging purposes
				logger.error(error);

				// Return a response indicating an internal server error
				return new Response(`Internal Exception: ${error}`, { status: 500 });
			}
		} finally {
			// logger.debug("")
		}
	},
};
