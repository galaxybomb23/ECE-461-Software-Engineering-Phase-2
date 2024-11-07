import { FreshContext } from "$fresh/server.ts";
import Navbar from "~/components/Navbar.tsx";
import Pagination from "~/islands/Pagination.tsx";
import { APIBaseURL, PackageMetadata } from "~/types/index.ts";

export const handler = async (_req: Request, _ctx: FreshContext) => {
	const offset = 1;
	const response = await fetch(`${APIBaseURL}/api/packages?offset=${offset}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Authorization": `bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485`, // TODO: Update this token
		},
		body: JSON.stringify([{ Name: "*", Version: "Bounded range (0.0.0-99999.9.9)" }]),
	});

	const packages = response.ok ? await response.json() as PackageMetadata[] : [];
	return _ctx.render({ packages });
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
