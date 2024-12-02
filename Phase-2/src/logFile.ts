// import * as fs from "node:fs";
// import * as path from "node:path";
import dotenv from "npm:dotenv";
import { createLogger, format, Logger, transports } from "npm:winston";
import process from "node:process";
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

export const logger: Logger = createLogger({
	level: log_level,
	format: format.combine(
		format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`),
	),
	transports: [
		new transports.File({ filename: logFilePath, options: { flags: "a" } }),
		new transports.File({ filename: "logs/server-all.log", level: "silly", options: { flags: "a" } }),
	],
});
