import { FreshContext } from "$fresh/server.ts";
import Navbar from "~/islands/Navbar.tsx";
import Pagination from "~/islands/Pagination.tsx";
import { APIBaseURL, PackageMetadata } from "~/types/index.ts";

export const handler = async (_req: Request, _ctx: FreshContext) => {
	const body = [{
		Version: "Bounded range (0.0.0-99999.9.9)",
		Name: "*", // wildcard search
	}];

	const endpoint = `${APIBaseURL}/api/packages`;
	const packages: Response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Authorization": "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485", // system token
			offset: 1,
		},
		body: JSON.stringify(body),
	});

	if (packages.status !== 200) {
		return _ctx.render({ packages: [] });
	}

	// Parse the response body as JSON
	const packagesData: PackageMetadata[] = await packages.json();

	return _ctx.render({ packages: packagesData });
};

export default function Home({ data }: { data: { packages: PackageMetadata[] } }) {
	const { packages } = data;
	return (
		<div>
			<Navbar />
			<div className="horizontal-container">
				<div className="vertical-container">
					<div className="admin-title">Home</div>
					<Pagination packages={packages} />
				</div>
			</div>
		</div>
	);
}
