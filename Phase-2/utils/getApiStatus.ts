// This file is used to get the status of the API key

import { logger } from "../src/logFile.ts";
import { Octokit } from "https://esm.sh/octokit@2.0.11";
// logger.info(`Processing URLs from file: ${filePath}`);
// let status = await OCTOKIT.rateLimit.get();
// logger.debug(`Rate limit status: ${status.data.rate.remaining} remaining out of ${status.data.rate.limit}`);

export async function getApiStatus(apiKey: string) {
	const OCTOKIT = new Octokit({
		auth: apiKey,
	});

	const status = await OCTOKIT.rateLimit.get();
	logger.debug(
		`Rate limit status: ${status.data.rate.remaining} remaining out of ${status.data.rate.limit}`,
	);
}
