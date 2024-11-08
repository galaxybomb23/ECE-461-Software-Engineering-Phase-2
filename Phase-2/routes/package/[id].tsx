import { FreshContext } from "$fresh/server.ts";
import Navbar from "~/components/Navbar.tsx";
import { APIBaseURL, Package, PackageCost, PackageRating } from "~/types/index.ts";
import DownloadButton from "~/islands/DownloadButton.tsx";

export const handler = async (req: Request, ctx: FreshContext) => {
	const { id } = ctx.params;

	try {
		const packageResponse = await fetch(`${APIBaseURL}/api/package/${id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": `bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485`, // TODO: Update this token
			},
		});
		if (!packageResponse.ok) throw new Error("Package data fetch failed");
		const packageData: Package = await packageResponse.json();

		const costResponse = await fetch(`${APIBaseURL}/api/package/${id}/cost`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": `bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485`, // TODO: Update this token
			},
		});
		if (!costResponse.ok) throw new Error("Cost data fetch failed");
		const costData: PackageCost = await costResponse.json();
		console.log(costData);

		const rateResponse = await fetch(`${APIBaseURL}/api/package/${id}/rate`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-Authorization": `bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485`, // TODO: Update this token
			},
		});
		if (!rateResponse.ok) throw new Error("Rating data fetch failed");
		const rateData: PackageRating = await rateResponse.json();

		return ctx.render({ packageData, costData, rateData });
	} catch (error) {
		console.warn(`API unavailable, using mock data:`, error);

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
	data: { packageData, costData, rateData },
}: {
	data: { packageData: Package | null; costData: PackageCost | null; rateData: PackageRating | null };
}) {
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

						{/* Use the DownloadButton island */}
						<DownloadButton
							base64Content={packageData.data?.Content ?? ""}
							fileName={packageData.metadata.Name}
						/>

						<p>
							<strong>Standalone Cost:</strong>{" "}
							{Object.values(costData ?? {})[0]?.standaloneCost ?? "N/A"}
						</p>
						<p>
							<strong>Total Cost:</strong> {Object.values(costData ?? {})[0]?.totalCost ?? "N/A"}
						</p>

						<p>
							<strong>Net Score:</strong> {rateData?.NetScore}
						</p>
						<h3>Rating Breakdown:</h3>
						<ul>
							<li>
								<strong>Bus Factor:</strong> {rateData?.BusFactor}
							</li>
							<li>
								<strong>Correctness:</strong> {rateData?.Correctness}
							</li>
							<li>
								<strong>Ramp Up:</strong> {rateData?.RampUp}
							</li>
							<li>
								<strong>Responsive Maintainer:</strong> {rateData?.ResponsiveMaintainer}
							</li>
							<li>
								<strong>License Score:</strong> {rateData?.LicenseScore}
							</li>
							<li>
								<strong>Good Pinning Practice:</strong> {rateData?.GoodPinningPractice}
							</li>
							<li>
								<strong>Pull Request:</strong> {rateData?.PullRequest}
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
