import axios from "npm:axios";
import dotenv from "npm:dotenv";
import { logger } from "./logFile.ts";
import process from "node:process";
dotenv.config();

/**
 * Fetches JSON data from a given API endpoint.
 *
 * This function performs an HTTP GET request to the specified `apiLink`
 * and returns the response data in JSON format. If an error occurs during
 * the request, it logs the error and returns an empty object if the error
 * is for the "license" endpoint.
 *
 * @async
 * @param {string} apiLink - The URL of the API endpoint from which to fetch data.
 * @returns {Promise<any>} - A promise that resolves to the JSON data
 * from the API response or an empty object if there is an error for
 * the "license" endpoint.
 * @throws {Error} - Throws an error if the HTTP request fails and the
 * endpoint is not "license".
 */
export async function fetchJsonFromApi<T = unknown>(
	apiLink: string,
): Promise<T | Record<string, never>> {
	// Get the token from environment variables
	const token = process.env.GITHUB_TOKEN;
	logger.shadowRealm(
		`fetchJsonFromApi - Start Preparing to fetch JSON data from the API. API link: ${apiLink}`,
	);

	// Set up headers for the API request
	const headers: Record<string, string> = {
		"Accept": "application/vnd.github.v3+json",
	};

	// Add authorization token if available
	if (token) {
		headers["Authorization"] = `token ${token}`;
	} else {
		logger.error(
			"fetchJsonFromApi - Authorization No authorization token found. Proceeding without authorization token.",
		);
	}

	try {
		const response = await axios.get(apiLink, { headers });
		logger.debug(
			"fetchJsonFromApi - Response Received Successfully received data from the API. Data successfully fetched and returned as JSON.",
		);
		return response.data as T; // Return the response as JSON
	} catch (error) {
		logger.error(
			`fetchJsonFromApi - Error Error occurred during the API request. Error message: ${error}`,
		);

		// If the error is from the license endpoint, return an empty object
		if (apiLink.includes("/license")) {
			logger.error(
				"fetchJsonFromApi - License Error Returning empty object due to error on the license endpoint. No data found or the request failed.",
			);
			return {}; // Return empty dataset if no data can be retrieved
		}

		throw new Error(`API request failed: ${error}`); // Rethrow the error for other cases
	}
}

// COPIED FROM OUR PHASE 1 SINCE CONVERT NPM TO GITHUB IS BROKEN IN THEIR PHASE 1 CODE
export async function getGithubUrlFromNpm(npmUrl: string): Promise<string | null> {
	try {
		// Extract package name from npm URL
		const packageName = npmUrl.split("/package").pop();
		if (!packageName) return null;

		// Fetch package details from npm registry
		const npmApiUrl = `https://registry.npmjs.org/${packageName}`;
		const response = await axios.get(npmApiUrl);

		// Check if the package has a repository field
		const repoUrl = response.data.repository?.url;
		if (repoUrl && repoUrl.includes("github.com")) {
			// Normalize the URL (remove 'git+', 'ssh://git@', and '.git' if present)
			logger.info(`Found GitHub URL for ${npmUrl}: ${repoUrl}`);
			const normalizedUrl = repoUrl.replace(/^git\+/, "").replace(/^ssh:\/\/git@github.com/, "https://github.com")
				.replace(/\.git$/, "").replace(/^git:\/\//, "https://");
			return normalizedUrl;
		} else {
			return null;
		}
	} catch (error) {
		logger.error(`Error fetching GitHub URL for ${npmUrl}:`, error);
		return null;
	}
}
