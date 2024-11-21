import { FreshContext } from "$fresh/server.ts";
import Navbar from "~/components/Navbar.tsx";
import { APIBaseURL, Package, PackageCost, PackageRating } from "~/types/index.ts";
import DownloadButton from "~/islands/DownloadButton.tsx";
import DeleteButton from "~/islands/DeleteButton.tsx";
import UpdateButton from "~/islands/UpdateButton.tsx";

export const handler = async (req: Request, ctx: FreshContext) => {
	const { id } = ctx.params;

	try {
		// Retrieve token from localStorage
		const authToken = localStorage.getItem("authToken");

		// Check if the token exists
		if (!authToken) {
			console.warn("User is not logged in.");
			throw new Error("Not logged in. Please log in to view package details.");
		}

		// Fetch package data
		const packageResponse = await fetch(`${APIBaseURL}/api/package/${id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": authToken, // Use the token from localStorage
			},
		});
		if (!packageResponse.ok) throw new Error("Package data fetch failed");
		const packageData: Package = await packageResponse.json();

		// Fetch cost data
		const costResponse = await fetch(`${APIBaseURL}/api/package/${id}/cost`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": authToken, // Use the token from localStorage
			},
		});
		if (!costResponse.ok) throw new Error("Cost data fetch failed");
		const costData: PackageCost = await costResponse.json();

		// Fetch rating data
		const rateResponse = await fetch(`${APIBaseURL}/api/package/${id}/rate`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": authToken, // Use the token from localStorage
			},
		});
		if (!rateResponse.ok) throw new Error("Rating data fetch failed");
		const rateData: PackageRating = await rateResponse.json();

		console.debug("Package data:", packageData);
		console.debug("Cost data:", costData);
		console.debug("Rating data:", rateData);

		return ctx.render({ packageData, costData, rateData });
	} catch (error) {
		console.warn(`API unavailable, using mock data:`, error);

		// If not logged in, render a clear message
		if (error instanceof Error && error.message === "Not logged in. Please log in to view package details.") {
			return ctx.render({
				packageData: null,
				costData: null,
				rateData: null,
				notLoggedIn: true, // Add a flag to indicate login status
			});
		}
		

		// Return mock data for other errors
		return ctx.render({
			packageData: {
				metadata: { Name: "Mock Package", Version: "1.0.0", ID: "mock-package" },
				data: {
					Content: "This is a mock package for testing purposes.",
					URL: "https://example.com",
					debloat: false,
					JSProgram: "console.log('Hello, world!');",
				},
			},
			costData: { "1": { standaloneCost: 0.5, totalCost: 0.75 } },
			rateData: {
				BusFactor: 0.8,
				Correctness: 0.9,
				RampUp: 0.7,
				ResponsiveMaintainer: 0.95,
				LicenseScore: 0.85,
				GoodPinningPractice: 1.0,
				PullRequest: 0.75,
				NetScore: 0.87,
			},
		});
	}
};

export default function Ident({
	data: { packageData, costData, rateData, notLoggedIn },
}: {
	data: {
		packageData: Package | null;
		costData: PackageCost | null;
		rateData: PackageRating | null;
		notLoggedIn?: boolean;
	};
}) {
	// If the user is not logged in
	if (notLoggedIn) {
		return (
			<div>
				<Navbar />
				<div className="horizontal-container">
					<div className="vertical-container">
						<div className="title">Package Details</div>
						<p>You are not logged in. Please log in to view package details.</p>
					</div>
				</div>
			</div>
		);
	}

	// If package data is not available
	if (!packageData || !packageData.metadata) {
		return (
			<div>
				<Navbar />
				<div className="horizontal-container">
					<div className="vertical-container">
						<div className="title">Package Details</div>
						<p>Package data is not available.</p>
					</div>
				</div>
			</div>
		);
	}

	// Render package details
	return (
		<div className="page-container">
			<Navbar />
			<div className="content-wrapper">
				<div className="action-buttons-container">
					<UpdateButton metadata={packageData.metadata} />
					<DeleteButton packageId={packageData.metadata.ID} />
				</div>
				<div className="card">
					<h1 className="title">Package Details for {packageData?.metadata?.Name ?? "Package"}</h1>

					<div className="details">
						<p>
							<strong>Version:</strong> {packageData?.metadata?.Version ?? "N/A"}
						</p>

						<DownloadButton
							base64Content={packageData?.data?.Content ?? ""}
							fileName={packageData?.metadata?.Name ?? "Package"}
						/>

						<p>
							<strong>Standalone Cost:</strong>{" "}
							{Object.values(costData ?? {})[0]?.standaloneCost ?? "N/A"}
						</p>
						<p>
							<strong>Total Cost:</strong> {Object.values(costData ?? {})[0]?.totalCost ?? "N/A"}
						</p>

						<p>
							<strong>Net Score:</strong> {rateData?.NetScore ?? "N/A"}
						</p>

						<h3 className="rating-title">Rating Breakdown:</h3>
						<ul className="rating-list">
							<li>
								<strong>Bus Factor:</strong> {rateData?.BusFactor ?? "N/A"}
							</li>
							<li>
								<strong>Correctness:</strong> {rateData?.Correctness ?? "N/A"}
							</li>
							<li>
								<strong>Ramp Up:</strong> {rateData?.RampUp ?? "N/A"}
							</li>
							<li>
								<strong>Responsive Maintainer:</strong> {rateData?.ResponsiveMaintainer ?? "N/A"}
							</li>
							<li>
								<strong>License Score:</strong> {rateData?.LicenseScore ?? "N/A"}
							</li>
							<li>
								<strong>Good Pinning Practice:</strong> {rateData?.GoodPinningPractice ?? "N/A"}
							</li>
							<li>
								<strong>Pull Request:</strong> {rateData?.PullRequest ?? "N/A"}
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
