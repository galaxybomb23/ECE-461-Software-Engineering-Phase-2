import { logger } from "../logFile.ts";
import { getTimestampWithThreeDecimalPlaces } from "./getLatency.ts";
import { fetchJsonFromApi } from "../API.ts";
import { getGitHubAPILink } from "../githubData.ts";
import { Buffer } from "npm:buffer";
import { ManifestData, MetricsResult } from "../../types/Phase1Types.ts";

export async function calculateDependencyPinning(
	URL: string,
): Promise<MetricsResult> {
	// default scores and latency
	let totalDependencies = 0;
	let pinnedDependencies = 0;

	const latency_start = getTimestampWithThreeDecimalPlaces();
	const API_link = getGitHubAPILink(URL);
	const manifestPaths = [
		"package.json",
		"requirements.txt",
		"Pipfile",
		"Cargo.toml",
	];

	for (const manifest of manifestPaths) {
		const manifestApiUrl = `${API_link}/contents/${manifest}`;

		try {
			// Fetch the manifest file from the GitHub API
			const manifestData = (await fetchJsonFromApi(manifestApiUrl)) as ManifestData;
			const manifestContent = Buffer.from(manifestData.content, "base64")
				.toString("utf-8");

			const dependencies = parseDependencies(manifestContent, manifest);
			totalDependencies += dependencies.length;

			logger.debug(`calculateDependencyPinning - Manifest: ${manifest}`);

			// Check if all dependencies are pinned to major.minor
			for (const dependency of dependencies) {
				if (isPinnedToMajorMinor(dependency.version)) {
					pinnedDependencies++;
					logger.debug(
						`calculateDependencyPinning - Pinned: ${dependency.name} - ${dependency.version}`,
					);
				} else {
					logger.debug(
						`calculateDependencyPinning - Not Pinned: ${dependency.name} - ${dependency.version}`,
					);
				}
			}
		} catch (error) {
			// Files not found, this is ok
			logger.debug(`calculateDependencyPinning - Error: ${error}`);
		}
	}

	// Score is 1 if there are no dependencies, otherwise it is the ratio of pinned dependencies to total dependencies
	let score = totalDependencies === 0 ? 1 : pinnedDependencies / totalDependencies;
	score = Math.max(0, Math.min(1, score + .45)); // mean shifting
	logger.log(
		"info",
		`calculateDependencyPinning - Score: ${score}, Latency: ${
			getTimestampWithThreeDecimalPlaces() - latency_start
		}ms for URL: ${URL}`,
	);
	const latencyMs = parseFloat(
		(getTimestampWithThreeDecimalPlaces() - latency_start).toFixed(3),
	);
	return { score: parseFloat(score.toFixed(1)), latency: latencyMs }; // Return score rounded to 1 decimal place and latency
}

function parseDependencies(
	fileContent: string,
	fileType: string,
): Array<{ name: string; version: string }> {
	let dependencies: Array<{ name: string; version: string }> = [];

	if (fileType === "package.json") {
		// Parse package.json (JavaScript/Node.js)
		const parsed = JSON.parse(fileContent);

		// Handle both dependencies and devDependencies
		const allDependencies = {
			...(parsed.dependencies || {}),
			...(parsed.devDependencies || {}),
		};

		dependencies = Object.entries(allDependencies).map((
			[name, version],
		) => ({
			name,
			version: version as string,
		}));
	} else if (fileType === "requirements.txt") {
		// Parse requirements.txt (Python)
		const lines = fileContent.split("\n").filter((line) => line.trim() && !line.startsWith("#")); // Ignore comments
		dependencies = lines.map((line) => {
			const [name, version] = line.split("==");
			return {
				name: name.trim(),
				version: version ? version.trim() : "",
			};
		});
	} else if (fileType === "Pipfile") {
		// Parse Pipfile (Python, TOML format)
		const lines = fileContent.split("\n").filter((line) => line.trim() && !line.startsWith("#")); // Ignore comments
		let inPackagesSection = false;
		let inDevPackagesSection = false;

		for (const line of lines) {
			// Check which section we're in
			if (line.startsWith("[packages]")) {
				inPackagesSection = true;
				inDevPackagesSection = false;
				continue;
			} else if (line.startsWith("[dev-packages]")) {
				inDevPackagesSection = true;
				inPackagesSection = false;
				continue;
			}

			// If we're in a packages or dev-packages section, extract the dependency
			if (
				(inPackagesSection || inDevPackagesSection) &&
				line.includes("=")
			) {
				const [name, version] = line.split("=").map((item) => item.trim().replace(/["']/g, "")); // Remove quotes around version
				dependencies.push({
					name,
					version: version === "*" ? "latest" : version,
				});
			}
		}
	} else if (fileType === "Cargo.toml") {
		// Parse Cargo.toml (Rust)
		const lines = fileContent.split("\n").filter((line) => line.trim() && !line.startsWith("#")); // Ignore comments
		let inDependenciesSection = false;
		for (const line of lines) {
			if (line.startsWith("[dependencies]")) {
				inDependenciesSection = true;
				continue;
			}

			if (
				inDependenciesSection && line.includes("=") &&
				!line.startsWith("[")
			) {
				const [name, version] = line.split("=").map((item) => item.trim().replace(/["']/g, "")); // Remove quotes around version
				dependencies.push({ name, version });
			}
		}
	}

	return dependencies;
}

function isPinnedToMajorMinor(version: string): boolean {
	// Matches versions pinned to major+minor or those starting with ~, like 1.0, ~1.0, 1.0.x
	const regex = /^(~?)(\d+)\.(\d+)(\.\d+|\.x)?$/;

	return regex.test(version);
}
