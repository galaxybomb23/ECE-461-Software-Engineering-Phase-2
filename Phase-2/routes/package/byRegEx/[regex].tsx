import { FreshContext } from "$fresh/server.ts";
import Navbar from "~/islands/Navbar.tsx";
import Pagination from "~/islands/Pagination.tsx";
import { APIBaseURL, PackageMetadata } from "~/types/index.ts";
import { logger } from "~/src/logFile.ts";

export const handler = async (_req: Request, ctx: FreshContext) => {
	const { regex } = ctx.params;

	try {
		// Retrieve the auth token from cookies
		const authToken = _req.headers.get("Cookie")
			?.split("; ")
			.find((row) => row.startsWith("authToken="))
			?.split("=")[1];

		// If the token is missing, display an appropriate message to the user
		if (!authToken) {
			return ctx.render({
				errorMessage: "You must be logged in to perform this search.",
				packages: [],
			});
		}

		// Prepare the fetch request
		const requestBody = JSON.stringify({ RegEx: decodeURIComponent(regex) });
		const fetchUrl = `${APIBaseURL}/api/package/byRegEx`;

		const response = await fetch(fetchUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": authToken, // Pass the token here
			},
			body: requestBody,
		});

		if (!response.ok) {
			// Read the error message from the response body
			const errorText = await response.text();
			logger.error(`Error fetching search results: ${errorText}`);

			let customMessage = "An error occurred while fetching search results. Please try again later.";
			if (response.status === 403) {
				customMessage = "You are not authorized to perform this search. Please log in.";
			} else if (response.status === 400) {
				customMessage = "The search query is invalid. Please check your input and try again.";
			} else if (response.status === 404) {
				customMessage = "No packages were found matching your search criteria.";
			}

			return ctx.render({ errorMessage: customMessage, packages: [] });
		}

		const packages: PackageMetadata[] = await response.json();

		return ctx.render({ packages, errorMessage: null });
	} catch (error) {
		logger.error(`Error fetching search results: ${error}`);
		return ctx.render({
			errorMessage: "An unexpected error occurred. Please try again later.",
			packages: [],
		});
	}
};

export default function SearchResults({
	data,
}: {
	data: { packages: PackageMetadata[]; errorMessage: string | null };
}) {
	const { packages, errorMessage } = data;

	return (
		<div>
			<Navbar />
			<div className="horizontal-container">
				<div className="vertical-container">
					<div className="title">Search Results</div>
					{errorMessage
						? <p className="error-message">{errorMessage}</p>
						: packages.length > 0
						? <Pagination packages={packages} />
						: <p>No results found.</p>}
				</div>
			</div>
		</div>
	);
}
