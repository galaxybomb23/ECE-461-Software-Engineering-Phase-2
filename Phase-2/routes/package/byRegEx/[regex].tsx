import { FreshContext } from "$fresh/server.ts";
import Navbar from "~/islands/Navbar.tsx";
import Pagination from "~/islands/Pagination.tsx";
import { APIBaseURL, PackageMetadata } from "~/types/index.ts";

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
			console.error("DEBUG: Missing auth token");
			return ctx.render({
				errorMessage: "You must be logged in to perform this search.",
				packages: [],
			});
		}

		// Debug: Log the regex and token (redacted)
		console.log("DEBUG: Regex pattern:", decodeURIComponent(regex));
		console.log("DEBUG: Auth token retrieved");

		// Prepare the fetch request
		const requestBody = JSON.stringify({ RegEx: decodeURIComponent(regex) });
		const fetchUrl = `${APIBaseURL}/api/package/byRegEx`;

		// Debug: Log the fetch details
		console.log("DEBUG: Fetch URL:", fetchUrl);
		console.log("DEBUG: Request Body:", requestBody);

		const response = await fetch(fetchUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": authToken, // Pass the token here
			},
			body: requestBody,
		});

		// Debug: Log the response status
		console.log("DEBUG: Response Status:", response.status);

		if (!response.ok) {
			// Read the error message from the response body
			const errorText = await response.text();
			console.error("DEBUG: Response Error Body:", errorText);

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

		// Debug: Log the parsed response
		console.log("DEBUG: Parsed Response Packages:", packages);

		return ctx.render({ packages, errorMessage: null });
	} catch (error) {
		// Debug: Log the error encountered
		console.error("DEBUG: Unhandled error:", error);

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
					{errorMessage ? (
						<p className="error-message">{errorMessage}</p>
					) : packages.length > 0 ? (
						<Pagination packages={packages} />
					) : (
						<p>No results found.</p>
					)}
				</div>
			</div>
		</div>
	);
}
