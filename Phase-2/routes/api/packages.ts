import { FreshContext } from "$fresh/server.ts";
import { PackageMetadata } from "~/types/index.ts";

export const handler = async (req: Request, _ctx: FreshContext) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    // Parse the request body and offset query parameter
    const offset = new URL(req.url).searchParams.get("offset");
    const offsetNumber = parseInt(offset || "0");
    
    // Mock data response (replace with actual database or external API call as needed)
    const packages: PackageMetadata[] = [
        { Version: "1.2.3", Name: "Underscore", ID: "underscore" },
        { Version: "1.2.3-2.1.0", Name: "Lodash", ID: "lodash" },
        { Version: "^1.2.3", Name: "React", ID: "react" },
        { Version: "2.0.0", Name: "Vue", ID: "vue" },
        { Version: "3.0.0", Name: "Angular", ID: "angular" },
        // Add more items as needed for pagination simulation
    ].slice(offsetNumber, offsetNumber + 10);

    return new Response(JSON.stringify(packages), {
        headers: { "Content-Type": "application/json" },
    });
};
