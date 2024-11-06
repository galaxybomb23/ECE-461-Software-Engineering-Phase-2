// API Endpoint: POST /packages
// Description: Get the packages from the registry. (BASELINE)
import { Handlers } from "https://deno.land/x/fresh@1.7.2/server.ts";
import { PackageMetadata, PackageQuery } from "../../types/index.ts";
import { isToken } from "$std/media_types/_util.ts";
import { logger } from "~/src/logFile.ts";
import { dbInstance } from "~/utils/dbSingleton.ts";
import type { Row } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import * as semver from "https://deno.land/x/semver@v1.4.0/mod.ts";

interface packagesRequest {
	offset?: number;
	authToken: string;
	requestBody: PackageQuery;
}

export const handler: Handlers = {
	// Handles POST request to list packages
	async POST(req) {
		// Read in the request body
		const requestBody: packagesRequest = await req.json();
		logger.info("Received request to list packages");
		logger.debug(requestBody);

		// check validate the AuthToken
		if (!requestBody.authToken || !isToken(requestBody.authToken)) {
			logger.info("Unauthorized request: invalid token");
			return new Response("Unauthorized", { status: 403 });
		}

		// validate the PackageQuery
		if (
			!requestBody.requestBody || !requestBody.requestBody.Version || !requestBody.requestBody.Name
		) {
			logger.info("Invalid request: invalid package query");
			return new Response("Invalid request body", { status: 400 });
		} else {
			// Implement package listing logic here
			return await listPackages(requestBody);
		}
	},
};

/**
 * Retrieves a paginated list of packages that match the specified name and version criteria.
 *
 * @param {packagesRequest} req - The request object containing query parameters, including package name, version type, and version value.
 * @param {any} db - The database instance used to query for package data. Defaults to a singleton instance.
 * @returns {Promise<Response>} - A promise resolving to an HTTP response containing the paginated package list as JSON.
 */
async function listPackages(req: packagesRequest, db = dbInstance): Promise<Response> {
	const entriesPerPage = 10;
	const { Version, Name } = req.requestBody; // Assuming single package query for now
	//validate the offset
	if (!req.offset || req.offset < 1) {
		req.offset = 1;
	}

	// Parse the version type and value from the Version field
	let versionType: string;
	let versionValue: string;

	if (Version?.startsWith("Exact")) {
		versionType = "Exact";
		versionValue = Version.replace("Exact (", "").replace(")", "").trim();
	} else if (Version?.startsWith("Bounded range")) {
		versionType = "Bounded range";
		versionValue = Version.replace("Bounded range (", "").replace(")", "").trim();
	} else if (Version?.startsWith("Carat")) {
		versionType = "Carat";
		versionValue = Version.replace("Carat (", "").replace(")", "").trim();
	} else if (Version?.startsWith("Tilde")) {
		versionType = "Tilde";
		versionValue = Version.replace("Tilde (", "").replace(")", "").trim();
	} else {
		throw new Error("Unknown version type");
	}
	logger.debug(`Parsed version type: ${versionType}, value: ${versionValue}`);

	// Query the database for packages with the specified name
	const rows: Row[] = db.query("SELECT id, name, version FROM packages WHERE name = ?", [Name]);

	// check for "too many results" error // NOTE: 100 is an arbitrary limit set by me
	if (rows.length > 100) {
		logger.error("Too many results: ", rows.length);
		return new Response("Too many Packages returned", { status: 413 });
	}

	// Map rows to PackageMetadata
	const packages: PackageMetadata[] = rows.map(mapRowToPackage);

	// Filter packages based on parsed versionType and versionValue
	let filteredPackages: PackageMetadata[] = [];
	switch (versionType) {
		case "Exact":
			filteredPackages = packages.filter((pkg) => semver.eq(pkg.Version, versionValue));
			break;

		case "Bounded range": {
			const [minVersion, maxVersion] = versionValue.split("-");
			filteredPackages = packages.filter((pkg) =>
				semver.gte(pkg.Version, minVersion) && semver.lte(pkg.Version, maxVersion)
			);
			break;
		}
		case "Carat": {
			// "^1.2.3" matches versions >=1.2.3 <2.0.0
			filteredPackages = packages.filter((pkg) => semver.satisfies(pkg.Version, `^${versionValue}`));
			break;
		}
		case "Tilde": {
			// "~1.2.0" matches versions >=1.2.0 <1.3.0
			filteredPackages = packages.filter((pkg) => semver.satisfies(pkg.Version, `~${versionValue}`));
			break;
		}
		default:
			// This should never happen
			logger.error("Unknown version type");
			throw new Error("Unknown version type");
	}

	// Old code
	// switch (versionType) {
	// 	case "Exact": {
	// 		filteredPackages = packages.filter((pkg) => pkg.Version === versionValue);
	// 		break;
	// 	}

	// 	case "Bounded range": {
	// 		const [minVersion, maxVersion] = versionValue.split("-");
	// 		filteredPackages = packages.filter((pkg) => {
	// 			const [pkgMajor, pkgMinor, pkgPatch] = pkg.Version.split(".").map(Number);
	// 			const [minMajor, minMinor, minPatch] = minVersion.split(".").map(Number);
	// 			const [maxMajor, maxMinor, maxPatch] = maxVersion.split(".").map(Number);
	// 			return (
	// 				(pkgMajor > minMajor || (pkgMajor === minMajor && pkgMinor > minMinor) ||
	// 					(pkgMajor === minMajor && pkgMinor === minMinor && pkgPatch >= minPatch)) &&
	// 				(pkgMajor < maxMajor || (pkgMajor === maxMajor && pkgMinor < maxMinor) ||
	// 					(pkgMajor === maxMajor && pkgMinor === maxMinor && pkgPatch <= maxPatch))
	// 			);
	// 		});
	// 		break;
	// 	}
	// 	case "Carat": {
	// 		// "^1.2.3" matches versions >= 1.2.3 < 2.0.0
	// 		const [minMajor, minMinor, MinPatch] = versionValue.split(".").map(Number);
	// 		filteredPackages = packages.filter((pkg) => {
	// 			const [pkgMajor, pkgMinor, pkgPatch] = pkg.Version.split(".").map(Number);
	// 			return (
	// 				pkgMajor === minMajor && (pkgMinor > minMinor || (pkgMinor === minMinor && pkgPatch >= MinPatch))
	// 			);
	// 		});
	// 		break;
	// 	}
	// 	case "Tilde": {
	// 		// "~1.2.0" matches versions >= 1.2.0 < 1.3.0
	// 		const [tildeMajor, tildeMinor] = versionValue.split(".").map(Number);
	// 		filteredPackages = packages.filter((pkg) => {
	// 			const [pkgMajor, pkgMinor] = pkg.Version.split(".").map(Number);
	// 			return pkgMajor === tildeMajor && pkgMinor === tildeMinor;
	// 		});
	// 		break;
	// 	}
	// 	default:
	// 		logger.error("Unknown version type");
	// 		throw new Error("Unknown version type");
	// }

	// Implement pagination
	const paginatedPackages = filteredPackages.slice((req.offset - 1, 0) * entriesPerPage, req.offset * entriesPerPage);

	// Return the paginated packages
	return new Response(JSON.stringify(paginatedPackages), {
		headers: { "Content-Type": "application/json" },
		status: 200,
	});
}

/**
 * Maps a database row object to a PackageMetadata object.
 *
 * @param {Row} row - The database row object containing package data.
 * @returns {PackageMetadata} - A package metadata object with fields mapped from the database row.
 */
// Helper function to map Row to PackageMetadata
function mapRowToPackage(row: Row): PackageMetadata {
	return {
		ID: row[0] as string, // Adjust indices based on your table schema
		Name: row[1] as string,
		Version: row[2] as string,
		// Map other fields accordingly
	};
}
