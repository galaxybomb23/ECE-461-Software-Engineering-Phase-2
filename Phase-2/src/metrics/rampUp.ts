import { getGitHubAPILink } from "../githubData.ts";
import { fetchJsonFromApi } from "../API.ts";
import { getTimestampWithThreeDecimalPlaces } from "./getLatency.ts";
import { logger } from "../logFile.ts";
import { MetricsResult, RepoData } from "../../types/Phase1Types.ts";

/**
 * Calculates the RampUp score and fetch latency for GitHub repositories.
 * The smaller the repository size, the higher the score.
 *
 * @param {string} repoURL - The GitHub repository URL.
 * @returns {Promise<{ score: number, latency: number }>} - The RampUp score and latency.
 */
export async function calculateRampUp(
	repoURL: string,
): Promise<MetricsResult> {
	// Start latency tracking
	const latency_start = getTimestampWithThreeDecimalPlaces();
	const MAX_SIZE_KB = 150000; // Arbitrary maximum repository size in KB (50MB)

	// Construct GitHub API URL for repository information
	const apiLink = getGitHubAPILink(repoURL);

	// Fetch repository data from GitHub
	let repoData;
	try {
		repoData = await fetchJsonFromApi(apiLink);
		logger.debug(
			`calculateRampUp Fetched repository data successfully.${repoData}`,
		);
	} catch (error) {
		logger.error(
			`calculateRampUp Error fetching repository data from GitHub.${error}`,
		);
		throw new Error("Error fetching repository data from GitHub");
	}

	// Calculate repo size in KB
	const sizeInKb = (repoData as RepoData).size || 0;
	if (sizeInKb <= 0) {
		logger.error(
			`calculateRampUp 'Invalid repository size detected. Defaulting size to 0. Size: ${sizeInKb}`,
		);
	}

	// Calculate the RampUp score (between 0 and 1)
	let score = parseFloat(
		((1 - Math.min(sizeInKb / MAX_SIZE_KB, 1)) + .05).toFixed(1), // mean shifting
	);
	score = Math.max(0, score); // Ensure score is not negative
	score = Math.min(1, score); // Ensure score is not greater
	logger.debug("calculateRampUp Calculated RampUp score.", `Score: ${score}`);

	// Calculate latency in milliseconds
	const latencyMs = parseFloat(
		(getTimestampWithThreeDecimalPlaces() - latency_start).toFixed(3),
	);
	logger.debug(
		`calculateRampUp', ['Calculated fetch latency. Latency: ${latencyMs} ms`,
	);

	return { score: score, latency: latencyMs }; // Return score and latency
}
