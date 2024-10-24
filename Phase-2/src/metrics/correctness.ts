import { getGitHubAPILink } from "../githubData.ts";
import { fetchJsonFromApi } from "../API.ts";
import { getTimestampWithThreeDecimalPlaces } from "./getLatency.ts";
import { logger } from "../logFile.ts";
import { Issue, MetricsResult, PullRequest, RepoData } from "../../types/Phase1Types.ts";
/**
 * Calculates the Correctness score based on various repository factors such as open issues,
 * closed pull requests, and merge rates. Fetches data in parallel to speed up the process.
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
	const [
		repoData,
		closedPullData,
		openPullData,
		closedIssuesData,
		openIssuesData,
	] = await Promise.all([
		fetchJsonFromApi(API_link) as Promise<RepoData>, // Fetch repository data (open issues count)
		fetchJsonFromApi(API_link + "/pulls?state=closed") as Promise<
			PullRequest[]
		>, // Fetch closed pull requests
		fetchJsonFromApi(API_link + "/pulls?state=open") as Promise<
			PullRequest[]
		>, // Fetch open pull requests
		fetchJsonFromApi(API_link + "/issues?state=closed") as Promise<Issue[]>, // Fetch closed issues
		fetchJsonFromApi(API_link + "/issues?state=open") as Promise<Issue[]>, // Fetch open issues
	]);

	// Calculate useful metrics
	const totalIssues: number = closedIssuesData.length + openIssuesData.length;
	const totalPullRequests: number = closedPullData.length +
		openPullData.length;

	const issueResolutionRate = totalIssues ? closedIssuesData.length / totalIssues : 1; // Calculate issue resolution rate
	const pullRequestMergeRate = totalPullRequests ? closedPullData.length / totalPullRequests : 1; // Calculate pull request merge rate

	const openIssuesCount = repoData.open_issues_count || openIssuesData.length; // Get the count of open issues

	// Define reasonable maximums for issues and pull requests
	const MAX_ISSUES = 150;
	const MAX_PULL_REQUESTS = 300;

	// Normalize the open issues and pull requests to create a score
	const issueScore = 1 - Math.min(openIssuesCount / MAX_ISSUES, 1); // Score based on open issues
	const pullRequestScore = Math.min(
		closedPullData.length / MAX_PULL_REQUESTS,
		1,
	); // Score based on closed pull requests
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
