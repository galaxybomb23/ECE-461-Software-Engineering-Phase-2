import { logger } from "../logFile.ts";
import { getTimestampWithThreeDecimalPlaces } from "./getLatency.ts";
import { fetchJsonFromApi } from "../API.ts";
import { getGitHubAPILink } from "../githubData.ts";
import { MetricsResult, PullRequest } from "../../types/Phase1Types.ts";

export async function getReviewPercentage(
	URL: string,
): Promise<MetricsResult> {
	const latency_start = getTimestampWithThreeDecimalPlaces();

	let ratio = 0;

	try {
		// Get all PRs (open, closed, merged, etc.)
		const allPRsAPI = `${getGitHubAPILink(URL)}/pulls?state=all&per_page=100`;
		const allPullRequests = await fetchJsonFromApi(allPRsAPI);

		if (!Array.isArray(allPullRequests)) {
			logger.error(
				`getReviewPercentage: Unexpected allPullRequests response: ${JSON.stringify(allPullRequests)}`,
			);
			return { score: 0, latency: 0 };
		}

		const totalPRCount = allPullRequests.length;

		// Filter PRs that have `merged_at` not null
		const mergedPRs = (allPullRequests as PullRequest[]).filter((pr) => pr.merged_at !== null);
		const mergedPRCount = mergedPRs.length;

		// Calculate ratio of merged PRs to total PRs
		if (totalPRCount > 0) {
			ratio = mergedPRCount / totalPRCount;
		}

		logger.debug(
			`getReviewPercentage: Merged PRs: ${mergedPRCount}, Total PRs: ${totalPRCount}, Ratio: ${ratio}`,
		);
	} catch (error) {
		logger.error(`getReviewPercentage Error fetching data from GitHub: ${error}`);
	}

	// Calculate latency in milliseconds
	const latencyMs = parseFloat((getTimestampWithThreeDecimalPlaces() - latency_start).toFixed(3));
	logger.debug(`getReviewPercentage: Calculated fetch latency. Latency: ${latencyMs} ms`);

	return { score: parseFloat(ratio.toFixed(1)), latency: latencyMs };
}
