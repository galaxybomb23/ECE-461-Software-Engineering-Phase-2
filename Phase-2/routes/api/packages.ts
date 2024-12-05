// API Endpoint: POST /packages
// Description: Get the packages from the registry. (BASELINE)
import { Handlers } from "https://deno.land/x/fresh@1.7.2/server.ts";
import { PackageMetadata, PackageQuery, packagesRequest } from "../../types/index.ts";
import { displayRequest, logger } from "~/src/logFile.ts";
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import type { Row } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import * as semver from "https://deno.land/x/semver@v1.4.0/mod.ts";
import { DATABASEFILE } from "~/utils/dbSingleton.ts";
import { getUserAuthInfo } from "~/utils/validation.ts";

/**
 * Handles POST requests to list packages.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response object.
 *
 * The handler performs the following steps:
 * 1. Parses the JSON body of the request.
 * 2. Validates that the body is a non-empty array.
 * 3. Extracts and validates the 'X-Authorization' token from the request headers.
 * 4. Extracts the 'offset' query parameter for pagination.
 * 5. Validates the fields of the first item in the request body.
 * 6. Checks the validity of the authentication token.
 * 7. Constructs a `packagesRequest` object.
 * 8. Calls the `listPackages` function to list the packages.
 *
 * Response Codes:
 * - 200: Successfully retrieved the list of packages.
 * - 400: Invalid request format or missing required fields.
 * - 403: Unauthorized request due to invalid token.
 * - 413: Too many packages returned.
 */
export const handler: Handlers = {
	// Handles POST request to list packages
	async POST(req: Request): Promise<Response> {
		logger.info("--> /packages: POST");
		displayRequest(req);
		let body;
		try {
			body = await req.json();
		} catch (error) {
			logger.warn("Invalid JSON format in request body: " + error);
			return new Response("Invalid JSON format in request body", {
				status: 400,
			});
		}

		// Ensure the body is an array with at least one item
		if (!Array.isArray(body) || body.length === 0) {
			logger.warn("Request body must be a non-empty array");
			return new Response("Request body must be a non-empty array", {
				status: 400,
			});
		}

		const requestBodyarr = Array.from(new Set(body.map((item: PackageQuery) => JSON.stringify(item)))).map((
			item: string,
		) => JSON.parse(item)) as PackageQuery[];

		// Extract and validate the 'X-Authentication' token
		const authToken = req.headers.get("X-Authorization") ?? "";
		if (!authToken) {
			logger.warn("Invalid request: missing authentication token");
			return new Response("Invalid request: missing authentication token", {
				status: 400,
			});
		}

		// Extract query parameter (offset for pagination)
		const url = new URL(req.url);
		const offset = url.searchParams.get("offset");
		const offsetValue = offset ? parseInt(offset, 10) : undefined;

		// Validate PackageQuery field of each item in the request body
		for (const requestBody of requestBodyarr) {
			if (!requestBody.Name) {
				logger.warn("Invalid request: missing Name fields");
				return new Response("Invalid request: missing Name fields", {
					status: 400,
				});
			}
			if (typeof requestBody.Name !== "string") {
				logger.warn("Invalid request: name field must be a string");
				return new Response("Invalid request: name field must be a string", {
					status: 400,
				});
			}
			// // apparently this is not needed
			// if(requestBody.Version && typeof requestBody.Version !== "string") {
			// 	logger.warn("Invalid request: 'Version' field must be a string");
			// 	return new Response("Invalid request: 'Version' field must be a string", {
			// 		status: 400,
			// 	});
		}

		// Check the validity of the authentication token
		if (!getUserAuthInfo(authToken).is_token_valid) {
			logger.warn("Unauthorized request: invalid token");
			return new Response("Unauthorized access", { status: 403 });
		}

		// Construct packagesRequest
		const packagesRequest: packagesRequest = {
			authToken,
			requestBody: requestBodyarr,
			offset: offsetValue,
		};

		// Implement package listing logic
		const response = await listPackages(packagesRequest);
		logger.verbose(`Response: ${await response.clone().text()}\n`);
		return response;
	},
};

/**
 * Retrieves a paginated list of packages that match the specified name and version criteria.
 *
 * @param {packagesRequest} req - The request object containing query parameters, including package name, version type, and version value.
 * @param {any} db - The database instance used to query for package data. Defaults to a new DB instance.
 * @param {boolean} autoCloseDB - A flag indicating whether to close the database connection after querying. Defaults to true. used for testing.
 * @returns {Promise<Response>} - A promise resolving to an HTTP response containing the paginated package list as JSON.
 *
 * Response Codes:
 * - 200: Successfully retrieved the list of packages.
 * - 413: Too many packages returned.
 */
export async function listPackages(
	requests: packagesRequest,
	db = new DB(DATABASEFILE),
	_autoCloseDB = true,
): Promise<Response> {
	logger.silly(`listPackages(${JSON.stringify(requests)})`);
	try {
		// database open
		logger.debug(
			`Listing packages with query: ${JSON.stringify(requests.requestBody)}`,
		);
		const entriesPerPage = 10;
		let offset = requests.offset ?? 1;

		//validate the offset
		if (!offset || offset < 1) {
			offset = 1;
		}

		let finalPackages: PackageMetadata[] = [];
		// OR all the requests together
		for (const req in requests.requestBody) {
			const { Version, Name } = requests.requestBody[req] as PackageQuery; // Assuming single package query for now

			// Query the database for packages with the specified name
			const rows: Row[] = Name === "*"
				? await db.query("SELECT id, name, version FROM packages")
				: await db.query(
					"SELECT id, name, version FROM packages WHERE name = ?",
					[Name],
				);

			// check for "too many results" error // NOTE: 100 is an arbitrary limit set by me
			if (rows.length > 100) {
				logger.error("Too many results: ", rows.length);
				return new Response("Too many Packages returned", { status: 413 });
			}

			// Parse the version type and value from the Version field
			let versionType: string;
			let versionValue: string;

			// Parse filter based on version type
			let filteredPackages: PackageMetadata[] = [];

			const packages: PackageMetadata[] = rows.map(mapRowToPackage);
			if (!Version || Name === "*") { // just use name
				filteredPackages = packages;
				versionType = "All";
				versionValue = "All";
			} else if (Version?.startsWith("Exact")) {
				versionType = "Exact";
				versionValue = Version.replace("Exact (", "").replace(")", "").trim();
				filteredPackages = packages.filter((pkg) => semver.eq(pkg.Version, versionValue));
			} else if (Version?.startsWith("Bounded range")) {
				versionType = "Bounded range";
				versionValue = Version.replace("Bounded range (", "")
					.replace(")", "")
					.trim();
				const [minVersion, maxVersion] = versionValue.split("-");
				filteredPackages = packages.filter(
					(pkg) =>
						semver.gte(pkg.Version, minVersion) &&
						semver.lte(pkg.Version, maxVersion),
				);
			} else if (Version?.startsWith("Carat")) {
				versionType = "Carat";
				versionValue = Version.replace("Carat (", "").replace(")", "").trim();
				filteredPackages = packages.filter((pkg) => semver.satisfies(pkg.Version, `${versionValue}`));
			} else if (Version?.startsWith("Tilde")) {
				versionType = "Tilde";
				versionValue = Version.replace("Tilde (", "").replace(")", "").trim();
				filteredPackages = packages.filter((pkg) => semver.satisfies(pkg.Version, `${versionValue}`));
			} else {
				logger.error("Unknown version type: ", Version);
				throw new Error(`Unknown version type: ${Version}`);
			}
			logger.debug(`Parsed version type: ${versionType}, value: ${versionValue}`);

			finalPackages = finalPackages.concat(filteredPackages);
		}

		//remove duplicates
		finalPackages = Array.from(new Set(finalPackages.map((a) => a.ID))).map((id) => {
			return finalPackages.find((a) => a.ID === id) as PackageMetadata;
		});

		// Implement pagination
		const paginatedPackages = finalPackages.slice(
			(offset - 1) * entriesPerPage,
			offset * entriesPerPage,
		);
		logger.debug(`Returning ${paginatedPackages.length} packages`);
		for (const pkg of paginatedPackages) {
			logger.debug(`	Package: ${pkg.Name} - ${pkg.Version}`);
		}

		// Return the paginated packages
		return new Response(JSON.stringify(paginatedPackages), {
			headers: { "Content-Type": "application/json" },
			status: 200,
		});
	} finally {
		// mem safety close
		if (_autoCloseDB) {
			db.close(true);
		}
	}
}

/**
 * Maps a database row object to a PackageMetadata object.
 *
 * @param {Row} row - The database row object containing package data.
 * @returns {PackageMetadata} - A package metadata object with fields mapped from the database row.
 */
// Helper function to map Row to PackageMetadata
function mapRowToPackage(row: Row): PackageMetadata {
	// logger.silly(`mapRowToPackage(${JSON.stringify(row)})`); // Uncomment bc it's not needed
	return {
		ID: row[0] as string, // Adjust indices based on your table schema
		Name: row[1] as string,
		Version: row[2] as string,
		// Map other fields accordingly
	};
}
