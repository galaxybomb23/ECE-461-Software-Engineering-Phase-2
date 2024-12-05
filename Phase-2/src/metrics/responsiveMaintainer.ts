import { getGitHubAPILink } from "../githubData.ts";
import { getTimestampWithThreeDecimalPlaces } from "./getLatency.ts";
import { logger } from "../logFile.ts";
import { MetricsResult } from "../../types/Phase1Types.ts";

export async function calculateResponsiveMaintainer(
	URL: string,
): Promise<MetricsResult> {
	const latency_start = getTimestampWithThreeDecimalPlaces();
	const API_link = getGitHubAPILink(URL);

	// Fetch total open and closed issues
	const [openIssuesCount, closedIssuesCount] = await Promise.all([
		getIssueCount(API_link, "open"),
		getIssueCount(API_link, "closed"),
	]);

	logger.debug(
		`calculateResponsiveMaintainer Counted issues - Open: ${openIssuesCount}, Closed: ${closedIssuesCount}`,
	);

	// Calculate the ratio of open to closed issues
	const ratio = closedIssuesCount > 0 ? openIssuesCount / closedIssuesCount : 0; // Avoid division by zero
	const score = parseFloat((1 / (1 + ratio)).toFixed(2)); // Calculate score
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

	return { score, latency: latencyMs }; // Return score and latency
}

/**
 * Fetches the total count of issues with a specific state (open/closed).
 */
async function getIssueCount(API_link: string, state: "open" | "closed"): Promise<number> {
	// Fetch issues with ?per_page=1 to minimize response size
	const response = await fetch(
		`${API_link}/issues?state=${state}&per_page=1`,
		{ method: "GET" },
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch ${state} issues: ${response.statusText}`);
	}

	// Check the Link header for total count
	const linkHeader = response.headers.get("Link");
	if (linkHeader) {
		const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
		if (match) {
			return parseInt(match[1], 10); // Extract total pages (i.e., total count)
		}
	}

	// If no Link header, fallback to counting manually
	const issuesData = await response.json();
	return issuesData.length;
}
