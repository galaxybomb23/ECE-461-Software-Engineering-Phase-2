import { getBusFactor } from "./busFactor.ts";
import { getLicenseScore } from "./license.ts";
import { formatJSON, initJSON } from "../json.ts";
import { URLType } from "../URL.ts";
import { getNodeJsAPILink } from "../npmjsData.ts";
import { calculateCorrectness } from "./correctness.ts";
import { calculateRampUp } from "./rampUp.ts";
import { calculateResponsiveMaintainer } from "./responsiveMaintainer.ts";
import { calculateDependencyPinning } from "./dependencyPinning.ts";
import { getReviewPercentage } from "./reviewPercentage.ts";
import { getNetScore, getNetScoreLatency } from "./netScore.ts";
import { getNumberOfCores } from "../multithread.ts";
import { logger } from "../logFile.ts";
import { RepoMetrics } from "../../types/Phase1Types.ts";

/**
 * Fetches and calculates various metrics for a given GitHub or npm repository URL.
 *
 * @param {string} URL - The repository URL to analyze.
 * @returns {Promise<string>} A promise that resolves to a formatted JSON string containing the calculated metrics.
 */
export async function getMetrics(URL: string): Promise<string> {
	const repo_data: RepoMetrics = initJSON(); // Initialize an empty JSON object for storing results
	const _num_cores = getNumberOfCores(); // Get the number of processing cores available
	repo_data.URL = URL; // Store the original URL in the JSON object

	// Convert npmjs URL to Node.js API link if necessary
	if (URLType(URL) === "npmjs") {
		URL = await getNodeJsAPILink(URL); // Fetch the Node.js API link
	} else {
		// Normalize the URL (remove 'git+', 'ssh://git@', and '.git' if present)
		URL = URL.replace(/^git\+/, "").replace(/^ssh:\/\/git@github.com/, "https://github.com").replace(/\.git$/, "")
			.replace(/^git:\/\//, "https://");
	}

	// Fetch various metrics concurrently
	const [
		{ score: busFactorScore, latency: busFactorLatency },
		{ score: correctnessScore, latency: correctnessLatency },
		{ score: licenseScore, latency: licenseLatency },
		{ score: rampUpScore, latency: rampUpLatency },
		{
			score: responsiveMaintainerScore,
			latency: responsiveMaintainerLatency,
		},
		{ score: DependencyPinningScore, latency: DependencyPinningLatency },
		{ score: reviewPercentageScore, latency: reviewPercentageLatency },
	] = await Promise.all([
		getBusFactor(URL),
		calculateCorrectness(URL),
		getLicenseScore(URL),
		calculateRampUp(URL),
		calculateResponsiveMaintainer(URL),
		calculateDependencyPinning(URL),
		getReviewPercentage(URL),
	]);

	// Store the calculated metrics and their latencies in the JSON object
	repo_data.BusFactor = busFactorScore;
	repo_data.BusFactor_Latency = busFactorLatency;
	repo_data.Correctness = correctnessScore;
	repo_data.Correctness_Latency = correctnessLatency;
	repo_data.License = licenseScore;
	repo_data.License_Latency = licenseLatency;
	repo_data.RampUp = rampUpScore;
	repo_data.RampUp_Latency = rampUpLatency;
	repo_data.ResponsiveMaintainer = responsiveMaintainerScore;
	repo_data.ResponsiveMaintainer_Latency = responsiveMaintainerLatency;
	repo_data.DependencyPinning = DependencyPinningScore;
	repo_data.DependencyPinning_Latency = DependencyPinningLatency;
	repo_data.ReviewPercentage = reviewPercentageScore;
	repo_data.ReviewPercentage_Latency = reviewPercentageLatency;

	const netScore = await getNetScore(
		rampUpScore,
		correctnessScore,
		busFactorScore,
		responsiveMaintainerScore,
		licenseScore,
		DependencyPinningScore,
		reviewPercentageScore,
	);

	const netScore_Latency = await getNetScoreLatency(
		rampUpLatency,
		correctnessLatency,
		busFactorLatency,
		responsiveMaintainerLatency,
		licenseLatency,
		DependencyPinningLatency,
		reviewPercentageLatency,
	);

	logger.debug(
		`getMetrics Score Latency calculated. Net Score Latency: ${netScore}`,
	);
	logger.debug(
		`getMetrics Net Score Latency calculated. Net Score Latency: ${netScore_Latency}`,
	);

	// Store the Net Score and latency
	repo_data.NetScore = netScore;
	repo_data.NetScore_Latency = netScore_Latency;

	return formatJSON(repo_data); // Return the formatted JSON string
}


// Test function
async function testResponsiveMaintainer() {
	const URL = "https://github.com/inversify/InversifyJS";
  
	const result = await getMetrics(URL);
  
	// Parse the result and filter out keys ending with "_Latency"
	const metrics = JSON.parse(result);
	const filteredMetrics = Object.fromEntries(
	  Object.entries(metrics).filter(([key]) => !key.endsWith("_Latency"))
	);
  
	// Print the filtered metrics in a structured format
	console.log("=== Metrics Report ===");
	console.log(JSON.stringify(filteredMetrics, null, 2));
	console.log("======================");
  }

if (import.meta.main) {
	await testResponsiveMaintainer();
}
