// API Endpoint: DELETE /reset
// Description: Reset the registry. (BASELINE)

import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  // Handles DELETE request to reset the registry
  async DELETE(req) {
    // Implement registry reset logic here
    return new Response("Registry reset", { status: 200 });
  },
};
