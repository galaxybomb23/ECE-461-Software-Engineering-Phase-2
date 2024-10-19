// API Endpoint: GET /package/byName/{name}
// Description: Return the history of this package (all versions). (NON-BASELINE)

import { Handlers } from "$fresh/server.ts";
import { PackageHistoryEntry } from "../../../../types/index.ts";

export const handler: Handlers = {
  // Handles GET request to retrieve package history by name
  async GET(req, ctx) {
    const { name } = ctx.params;
    // Implement package history retrieval logic here
    const history: PackageHistoryEntry[] = [];
    return new Response(JSON.stringify(history), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
