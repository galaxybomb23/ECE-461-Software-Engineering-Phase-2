// This file is used to get the status of the API key

import { logger } from "~/src/logFile.ts";
import { Octokit } from "https://esm.sh/octokit";
import process, { exit } from "node:process";
// logger.info(`Processing URLs from file: ${filePath}`);
// let status = await OCTOKIT.rateLimit.get();
// logger.debug(`Rate limit status: ${status.data.rate.remaining} remaining out of ${status.data.rate.limit}`);

export async function getApiStatus(apiKey: string) {
	const OCTOKIT = new Octokit({
		auth: apiKey,
	});

	try {
		const response = await OCTOKIT.request("GET /rate_limit");
		logger.debug(
			`Rate limit status: ${response.data.rate.remaining} remaining out of ${response.data.rate.limit}`,
		);
		if (import.meta.main) {
			console.log(
				`Rate limit status: ${response.data.rate.remaining} remaining out of ${response.data.rate.limit}`,
			);
		}
	} catch (error) {
		logger.error("Error getting rate limit:", error);
		throw error;
	}
}

if (import.meta.main) {
	console.log("Checking API status...");
	const apiKey = process.env.GITHUB_TOKEN || "";
	await getApiStatus(apiKey).catch((err) => {
		console.error("Error checking API status:", err);
	});
	exit(0);
}
