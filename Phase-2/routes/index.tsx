import { FreshContext } from "$fresh/server.ts";
import Navbar from "~/components/Navbar.tsx";
import Pagination from "~/islands/Pagination.tsx";
import { APIBaseURL, PackageMetadata } from "~/types/index.ts";

export const handler = async (_req: Request, _ctx: FreshContext) => {
    const offset = 0; // Starting offset for the initial page
    const response = await fetch(`${APIBaseURL}/api/packages?offset=${offset}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ Name: "*" }]), // Adjust this body as per your needs
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