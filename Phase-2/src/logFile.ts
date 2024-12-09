// import * as fs from "node:fs";
// import * as path from "node:path";
import dotenv from "npm:dotenv";
import { createLogger, format, Logger, transports } from "npm:winston";
import process from "node:process";
import type { FreshContext } from "$fresh/server.ts";

dotenv.config();

// Environment variables for the log file path and name
const logFilePath = process.env.LOG_FILE;
const env_logLevel = process.env.LOG_LEVEL?.toLowerCase();

if (!logFilePath || !env_logLevel) {
	// this logic does not check to see if the input variables are invalid or not
	throw new Error(
		"LOG_FILE or LOG_LEVEL is not defined in the environment variables.",
	);
}

let log_level;
if (env_logLevel == "0") {
	log_level = "error";
} else if (env_logLevel == "1") {
	log_level = "info";
} else if (env_logLevel == "2") {
	log_level = "debug";
} else {
	log_level = env_logLevel;
}

const customLevels = {
	levels: {
		error: 0,
		warn: 1,
		info: 2,
		http: 3,
		debug: 4,
		verbose: 5,
		silly: 6,
		shadowRealm: 7,
	},
	colors: {
		error: "red",
		warn: "yellow",
		info: "green",
		http: "magenta",
		verbose: "cyan",
		debug: "blue",
		silly: "gray",
		shadowRealm: "gray",
	},
};

const formatTimestamp = (): string => {
	return new Intl.DateTimeFormat("en-US", {
		timeZone: "America/New_York",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	}).format(new Date());
};

export const logger: Logger = createLogger({
	levels: customLevels.levels,
	level: log_level,
	format: format.combine(
		format.timestamp({
			format: formatTimestamp,
		}),
		format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`),
	),
	transports: [
		new transports.File({ filename: logFilePath, options: { flags: "a" } }),
		new transports.File({ filename: "logs/server-all.log", level: "shadowRealm", options: { flags: "a" } }),
	],
});

export async function displayRequest(req: Request, Ctx?: FreshContext): Promise<void> {
	try {
		const reqet = await req.clone().json();
		if (!Ctx) {
			logger.verbose(`\nStartRequest==>\nRequest:${Deno.inspect(reqet)}\n<==EndRequest`);
			return;
		} else {
			const contet = JSON.stringify(Ctx);
			logger.verbose(`\nStartRequest==>\nRequest:\n${Deno.inspect(reqet)},\nCtx:${contet}\n<==EndRequest`);
		}
	} catch {
		// logger.error(`Error in displayRequest: ${e}`); // this error is not useful
		if (!Ctx) {
			logger.verbose(`\nStartRequest==>\n${Deno.inspect(req)}\n<==EndRequest`);
			return;
		} else {
			logger.verbose(
				`\nStartRequest==>\n${Deno.inspect(req)},\nCtx:${Deno.inspect(Ctx)}\n<==EndRequest`,
			);
		}
	}
}
