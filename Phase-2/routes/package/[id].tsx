import { FreshContext } from "$fresh/server.ts";
import Navbar from "~/components/Navbar.tsx";
import { Package, PackageCost, PackageRating } from "~/types/index.ts";

// Mock data
const mockPackageData: Package = {
	metadata: {
		Name: "Mock Package",
		Version: "1.0.0",
		ID: "mock-package",
	},
	data: {
		Content: "This is a mock package for testing purposes.",
		URL: "https://example.com",
		debloat: false,
		JSProgram: "console.log('Hello, world!');",
	},
};

const mockCostData: PackageCost = {
	["1"]: {
		standaloneCost: 0.5,
		totalCost: 0.75,
	},
};

const mockRateData: PackageRating = {
	BusFactor: 0.8,
	Correctness: 0.9,
	RampUp: 0.7,
	ResponsiveMaintainer: 0.95,
	LicenseScore: 0.85,
	GoodPinningPractice: 1.0,
	PullRequest: 0.75,
	NetScore: 0.87,
};

export const handler = async (req: Request, ctx: FreshContext) => {
	const { id } = ctx.params;

	try {
		// Attempt to fetch actual package data
		const packageResponse = await fetch(`${req.url}/api/package/${id}`);
		if (!packageResponse.ok) throw new Error("Package data fetch failed");
		const packageData: Package = await packageResponse.json();

		const costResponse = await fetch(`${req.url}/api/package/${id}/cost`);
		if (!costResponse.ok) throw new Error("Cost data fetch failed");
		const costData: PackageCost = await costResponse.json();

		const rateResponse = await fetch(`${req.url}/api/package/${id}/rate`);
		if (!rateResponse.ok) throw new Error("Rating data fetch failed");
		const rateData: PackageRating = await rateResponse.json();

		return new Response(
			JSON.stringify({
				packageData,
				costData,
				rateData,
			}),
			{ headers: { "Content-Type": "application/json" } },
		);
	} catch (error) {
		console.warn("API unavailable, using mock data:", error);

		// Return mock data in a Response object if API fails
		return new Response(
			JSON.stringify({
				packageData: mockPackageData,
				costData: mockCostData,
				rateData: mockRateData,
			}),
			{ headers: { "Content-Type": "application/json" } },
		);
	}
};

export default function Ident({
	packageData,
	costData,
	rateData,
}: {
	packageData: Package;
	costData: PackageCost;
	rateData: PackageRating;
}) {
	return (
		<div>
			<Navbar />
			<div className="horizontal-container">
				<div className="vertical-container">
					<div className="title">Package Details for {packageData.metadata.Name}</div>
					<div className="details">
						<p>
							<strong>Version:</strong> {packageData.metadata.Version}
						</p>
						<p>
							<strong>Content:</strong> {packageData.data.Content ?? "No content"}
						</p>
						<p>
							<strong>Standalone Cost:</strong> {costData.standaloneCost ?? "N/A"}
						</p>
						<p>
							<strong>Total Cost:</strong> {costData.totalCost}
						</p>
						<p>
							<strong>Net Score:</strong> {rateData.NetScore}
						</p>
						<h3>Rating Breakdown:</h3>
						<ul>
							<li>
								<strong>Bus Factor:</strong> {rateData.BusFactor}
							</li>
							<li>
								<strong>Correctness:</strong> {rateData.Correctness}
							</li>
							<li>
								<strong>Ramp Up:</strong> {rateData.RampUp}
							</li>
							<li>
								<strong>Responsive Maintainer:</strong> {rateData.ResponsiveMaintainer}
							</li>
							<li>
								<strong>License Score:</strong> {rateData.LicenseScore}
							</li>
							<li>
								<strong>Good Pinning Practice:</strong> {rateData.GoodPinningPractice}
							</li>
							<li>
								<strong>Pull Request:</strong> {rateData.PullRequest}
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
