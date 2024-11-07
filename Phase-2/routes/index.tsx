import { FreshContext } from "$fresh/server.ts";
import Navbar from "~/components/Navbar.tsx";
import Pagination from "~/islands/Pagination.tsx";
import { APIBaseURL, PackageMetadata, packagesRequest } from "~/types/index.ts";
import { listPackages } from "~/routes/api/packages.ts";

export const handler = async (_req: Request, _ctx: FreshContext) => {
	const request: packagesRequest = {
		offset: 1,
		authToken: "",
		requestBody: {
			Version: "Bounded range (0.0.0-99999.9.9)",
			Name: "*",
		},
	};
	const packages: Response = await listPackages(request, undefined, undefined, true);

	if (packages.status !== 200) {
		return _ctx.render({ packages: [] });
	}

	// Parse the response body as JSON
	const packagesData: PackageMetadata[] = await packages.json();

	console.log(packagesData);
	return _ctx.render({ packages: packagesData });
};

export default function Home({ data }: { data: { packages: PackageMetadata[] } }) {
	const { packages } = data;
	return (
		<div>
			<Navbar />
			<div className="horizontal-container">
				<div className="vertical-container">
					<div className="title">Home</div>
					<Pagination packages={packages} />
				</div>
			</div>
		</div>
	);
}
