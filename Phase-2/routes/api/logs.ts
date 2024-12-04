import { Handlers } from "$fresh/server.ts";
import { logger } from "~/src/logFile.ts";

// temp endpoint to get logs for testing
// THIS SHOULD NOT BE ON MAIN
export const handler: Handlers = {
    async GET(_req) {
        logger.info("--> /api/logs: GET");
        const logContent = await Deno.readTextFile("logs/server-all.log");
        return new Response(logContent, {
            headers: { "Content-Type": "text/plain" },
        });
    },
};
