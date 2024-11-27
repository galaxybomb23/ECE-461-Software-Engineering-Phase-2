import { getGitHubAPILink } from "../githubData.ts";
import { fetchJsonFromApi } from "../API.ts";
import { getTimestampWithThreeDecimalPlaces } from "./getLatency.ts";
import { logger } from "../logFile.ts";
import { Issue, MetricsResult, RepoData } from "../../types/Phase1Types.ts";

/**
 * Calculates the Responsive Maintainer score based on the recency of updates.
 * A higher score is given if the package has been updated within the last 6 months.
 *
 * @param {string} URL - The GitHub repository URL.
 * @returns {Promise<MetricsResult>} - The Responsive Maintainer score (0-1) and fetch latency.
 */
export async function calculateResponsiveMaintainer(
	URL: string,
): Promise<MetricsResult> {
	const latency_start = getTimestampWithThreeDecimalPlaces();
	const API_link = getGitHubAPILink(URL);
	const [repoData, issuesData] = await Promise.all([
		fetchJsonFromApi(API_link),
		fetchJsonFromApi(`${API_link}/issues?state=all`),
	]);

	let openIssuesCount = 0;
	let closedIssuesCount = 0;

	// Count open and closed issues
	for (const issue of issuesData as Issue[]) {
		if (issue.closed_at) {
			closedIssuesCount++;
		} else {
			openIssuesCount++;
		}
	}
	logger.debug(
		`calculateResponsiveMaintainer Counted issues - Open: ${openIssuesCount}, Closed: ${closedIssuesCount}`,
	);

	// Use open_issues_count from repoData if available
	openIssuesCount = (repoData as RepoData).open_issues_count ||
		openIssuesCount;

	// Calculate the ratio of open to closed issues
	const ratio = closedIssuesCount > 0 ? openIssuesCount / closedIssuesCount : 0; // Avoid division by zero
	let score = parseFloat((1 / (1 + ratio)).toFixed(2)); // Calculate score
	score = Math.max(0, Math.min(1, score + .3)); // Ensure score is between 0 and 1
	logger.debug(
		`calculateResponsiveMaintainer Calculated Responsive Maintainer score. Score: ${score}`,
	);

	// Calculate latency in milliseconds
	const latencyMs = parseFloat(
		(getTimestampWithThreeDecimalPlaces() - latency_start).toFixed(3),
	);
	logger.debug(
		`calculateResponsiveMaintainer Calculated fetch latency. Latency: ${latencyMs} ms`,
	);

	return { score: score, latency: latencyMs }; // Return score and latency
}
