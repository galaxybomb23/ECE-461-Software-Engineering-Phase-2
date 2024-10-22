// API Endpoint: GET /package/{id}/cost
// Description: Get the cost of a package (BASELINE)

import { Handlers } from "$fresh/server.ts";
import { PackageCost } from "~/types/index.ts";

export const handler: Handlers = {
  // Handles GET request to retrieve package cost
  async GET(req, ctx) {
    const { id } = ctx.params;
    // Implement package cost calculation logic here
    const cost: PackageCost = {
      [id]: {
        standaloneCost: 0, //ADD CODE HERE
        totalCost: 0, //ADD CODE HERE
      },
    };
    return new Response(JSON.stringify(cost), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
