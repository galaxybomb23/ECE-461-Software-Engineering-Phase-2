import { get_valid_urls } from "./URL.ts";
import { getMetrics } from "./metrics/getMetrics.ts";
import { logger } from "./logFile.ts";
import { checkGitHubToken, checkLogFile } from "./checkEnv.ts";
import process from "node:process";

/**
 * Main function to process command line arguments, fetch valid URLs,
 * gather metrics for each valid URL, and output the results.
 */
async function main() {
	const args = process.argv.slice(2);
	logger.info("main - Starting");

	// Check for invalid number of arguments
	if (args.length !== 1) {
		logger.error(
			`main - Invalid Arguments Invalid number of arguments provided. Arguments length: ${args.length}`,
		);
		process.exit(1);
	}

	// Check for GitHub Token
	if (!checkGitHubToken()) {
		logger.error("main - Invalid Arguments NO GITHUB TOKEN ENTERED");
		process.exit(1);
	}

	// Check for Log File
	if (!checkLogFile()) {
		logger.error("main - Invalid Arguments NO LOG FILE ENTERED");
		process.exit(1);
	}

	const filename = args[0];

	logger.debug(
		"main - Fetching Valid URLs Fetching valid URLs from the provided filename. Awaiting results from get_valid_urls.",
	);
	const valid_urls = await get_valid_urls(filename);
	logger.debug(
		`main - Valid URLs Valid URLs fetched: ${
			JSON.stringify(valid_urls)
		} Proceeding to gather metrics for each valid URL.`,
	);

	const repo_stats: string[] = [];

	for (let i = 0; i < valid_urls.length; i++) {
		repo_stats.push(await getMetrics(valid_urls[i]));
	}

	for (let i = 0; i < repo_stats.length; i++) {
		console.log(repo_stats[i]);
	}

	logger.info(
		"main - End Main function completed successfully - Exiting the application",
	);
}

// Execute the main function
main();
