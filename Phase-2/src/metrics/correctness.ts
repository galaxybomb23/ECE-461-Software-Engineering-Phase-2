import { getGitHubAPILink } from "../githubData.ts";
import { getTimestampWithThreeDecimalPlaces } from "./getLatency.ts";
import { logger } from "../logFile.ts";
import { MetricsResult, RepoData } from "../../types/Phase1Types.ts";
import { fetchJsonFromApi } from "../API.ts";

/**
 * Calculates the Correctness score based on various repository factors such as open issues,
 * closed pull requests, and merge rates. Fetches data efficiently using pagination headers.
 *
 * @param {string} URL - The GitHub repository URL.
 * @returns {Promise<MetricsResult>} - The Correctness score (0-1) and fetch latency.
 */
export async function calculateCorrectness(
	URL: string,
): Promise<MetricsResult> {
	const latency_start = getTimestampWithThreeDecimalPlaces();

	const API_link = getGitHubAPILink(URL);

	// Fetch the data in parallel
	const [_repoData, openIssuesCount, closedIssuesCount, openPullsCount, closedPullsCount] = await Promise.all([
		fetchJsonFromApi(API_link) as Promise<RepoData>, // Fetch repository data (includes open issues count)
		getIssueCount(API_link, "open"), // Fetch open issues count
		getIssueCount(API_link, "closed"), // Fetch closed issues count
		getPullRequestCount(API_link, "open"), // Fetch open pull requests count
		getPullRequestCount(API_link, "closed"), // Fetch closed pull requests count
	]);

	// Calculate total issues and pull requests
	const totalIssues = openIssuesCount + closedIssuesCount;
	const totalPullRequests = openPullsCount + closedPullsCount;

	// Calculate metrics
	const issueResolutionRate = totalIssues ? closedIssuesCount / totalIssues : 1; // Rate of resolved issues
	const pullRequestMergeRate = totalPullRequests ? closedPullsCount / totalPullRequests : 1; // Rate of merged pull requests

	// Define reasonable maximums for issues and pull requests
	const MAX_ISSUES = 150;
	const MAX_PULL_REQUESTS = 300;

	// Normalize scores
	const issueScore = 1 - Math.min(openIssuesCount / MAX_ISSUES, 1); // Score based on open issues
	const pullRequestScore = Math.min(closedPullsCount / MAX_PULL_REQUESTS, 1); // Score based on closed pull requests
	logger.debug(
		`calculateCorrectness Normalizing scores. Issue Score: ${issueScore}, Pull Request Score: ${pullRequestScore}`,
	);

	// Combine the metrics with defined weights
	const combinedScore = 0.4 * issueScore + 0.3 * pullRequestScore +
		0.15 * issueResolutionRate + 0.15 * pullRequestMergeRate;

	// Round the score to 1 decimal place
	const roundedScore = parseFloat(combinedScore.toFixed(1));
	logger.debug(
		`calculateCorrectness Combined score calculated. Rounded Score: ${roundedScore}`,
	);

	// Calculate latency in milliseconds
	const latencyMs = parseFloat(
		(getTimestampWithThreeDecimalPlaces() - latency_start).toFixed(3),
	);
	logger.debug(
		`calculateCorrectness Latency calculated. Latency: ${latencyMs} ms`,
	);

	return { score: roundedScore, latency: latencyMs }; // Return the final score and latency
}

/**
 * Fetches the total count of issues with a specific state (open/closed).
 */
async function getIssueCount(API_link: string, state: "open" | "closed"): Promise<number> {
	const response = await fetch(`${API_link}/issues?state=${state}&per_page=1`, { method: "GET" });
	if (!response.ok) {
		logger.error(`Failed to fetch ${state} issues: ${response.statusText}`);
		// Return a 0 count if the request fails
		return 0;
	}

	// Check the Link header for total count
	const linkHeader = response.headers.get("Link");
	if (linkHeader) {
		const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
		if (match) {
			return parseInt(match[1], 10); // Extract total pages (i.e., total count)
		}
	}

	// Fallback to single issue count if no pagination data is available
	const issuesData = await response.json();
	return issuesData.length;
}

/**
 * Fetches the total count of pull requests with a specific state (open/closed).
 */
async function getPullRequestCount(API_link: string, state: "open" | "closed"): Promise<number> {
	const response = await fetch(`${API_link}/pulls?state=${state}&per_page=1`, { method: "GET" });
	if (!response.ok) {
		logger.error(`Failed to fetch ${state} pull requests: ${response.statusText}`);
		// Return a 0 count if the request fails
		return 0;
	}

	// Check the Link header for total count
	const linkHeader = response.headers.get("Link");
	if (linkHeader) {
		const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
		if (match) {
			return parseInt(match[1], 10); // Extract total pages (i.e., total count)
		}
	}

	// Fallback to single pull request count if no pagination data is available
	const pullRequestData = await response.json();
	return pullRequestData.length;
}
