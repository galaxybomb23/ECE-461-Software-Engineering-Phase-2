#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";
import "$std/dotenv/load.ts";
import { logger } from "~/src/logFile.ts";

// await populateDatabase();
logger.info("Starting dev server...");
await dev(import.meta.url, "./main.ts", config);
