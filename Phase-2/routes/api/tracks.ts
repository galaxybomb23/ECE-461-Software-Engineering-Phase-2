// API Endpoint: GET /tracks
// Description: Get the list of tracks a student has planned to implement in their code

import { Handlers } from "$fresh/server.ts";
import { displayRequest, logger } from "~/src/logFile.ts";

export const handler: Handlers = {
	// Handles GET request to retrieve planned tracks
	GET(req) {
		// Implement tracks retrieval logic here
		logger.info(`--> /tracks: GET`);
		displayRequest(req);
		try {
			const tracks = {
				plannedTracks: [
					// "Performance track",
					// "High assurance track",
					// "ML inside track",
					"Access control track",
				],
			};
			const ret = new Response(JSON.stringify(tracks), {
				headers: { "Content-Type": "application/json" },
				status: 200,
			});
			logger.verbose(`Response: ${JSON.stringify(tracks)}\n`);
			return ret;
		} catch (error) { // Error handling
			logger.error(`Error in getting planned tracks: ${error}`);
			return new Response("Error in getting planned tracks", { status: 500 });
		}
	},
};
