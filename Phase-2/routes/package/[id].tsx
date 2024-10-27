import { FreshContext } from "$fresh/server.ts";
import Navbar from "~/components/Navbar.tsx";
import { Package, PackageCost, PackageRating } from "~/types/index.ts";

// Server-side handler to fetch data
export const handler = async (req: Request, ctx: FreshContext) => {
	const { id } = ctx.params;

	// Fetch package details
	const packageResponse = await fetch(`${req.url}/api/package/${id}`);
	const packageData: Package = await packageResponse.json();

	// Fetch package cost
	const costResponse = await fetch(`${req.url}/api/package/${id}/cost`);
	const costData: PackageCost = await costResponse.json();

	// Fetch package rating
	const rateResponse = await fetch(`${req.url}/api/package/${id}/rate`);
	const rateData: PackageRating = await rateResponse.json();
	
	return {
		props: {
			packageData,
			costData,
			rateData,
		},
	};
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
					<div className="title">Package {packageData.metadata.Name}</div>
					<div className="details">
						<p>
							<strong>Version:</strong> {packageData.metadata.Version}
						</p>
						<p>
							<strong>Content:</strong> {packageData.data.Content ?? "No content"}
						</p>
						<p>
							<strong>Cost:</strong> {costData.totalCost}
						</p>
						<p>
							<strong>Net Score:</strong> {rateData.NetScore}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
