import { logger } from '../logFile';
import { getTimestampWithThreeDecimalPlaces } from './getLatency';
import { getGitHubAPILink } from '../githubData';


export async function getReviewPercentage(URL: string): Promise<{ score: number, latency: number }> {
    const latency_start = getTimestampWithThreeDecimalPlaces();

    let score = 0;
    let totalLines = 0;
    let reviewedLines = 0;

    try {
        // Fetch pull requests from the repository
        const pullRequestAPI = `${getGitHubAPILink(URL)}/pulls?state=closed`;
        const pullRequests = await fetch(pullRequestAPI).then(res => res.json());

        // Filter the pull requests that have been merged
        const mergedPRs = pullRequests.filter((pr: any) => pr.merged_at !== null);

        for (const pr of mergedPRs) {
            // Fetch the diff stats for each merged pull request
            const prDetailsAPI = `${getGitHubAPILink(URL)}/pulls/${pr.number}`;
            const prDetails = await fetch(prDetailsAPI).then(res => res.json());

            // Sum up the total lines of code introduced in this PR (additions + deletions)
            const linesChanged = prDetails.additions + prDetails.deletions;
            totalLines += linesChanged;

            // Fetch code reviews for each merged pull request
            const reviewsAPI = `${getGitHubAPILink(URL)}/pulls/${pr.number}/reviews`;
            const reviews = await fetch(reviewsAPI).then(res => res.json());

            // If there is at least one review, count the lines from this PR as reviewed
            if (reviews.length > 0) {
                reviewedLines += linesChanged;
            }
        }

        // Calculate the fraction of reviewed lines
        if (totalLines > 0) {
            score = reviewedLines / totalLines;
        }

        logger.debug(`getReviewPercentage Calculated review percentage based on lines of code. Reviewed Lines: ${reviewedLines}, Total Lines: ${totalLines}, Score: ${score}`);

    } catch (error) {
        logger.error(`getReviewPercentage Error fetching data from GitHub: ${error}`);
    }

    // Calculate latency in milliseconds
    const latencyMs = parseFloat((getTimestampWithThreeDecimalPlaces() - latency_start).toFixed(3));
    logger.debug(`getReviewPercentage Calculated fetch latency. Latency: ${latencyMs} ms`);

    return { score, latency: latencyMs }; // Return score and latency
}