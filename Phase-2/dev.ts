#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // SQLite3 import
import "$std/dotenv/load.ts";
import { populateDatabase } from "~/utils/populateDatabase.ts";

// await populateDatabase();
await dev(import.meta.url, "./main.ts", config);
