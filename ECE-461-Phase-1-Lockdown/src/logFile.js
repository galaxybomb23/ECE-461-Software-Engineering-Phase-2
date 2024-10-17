"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var dotenv = require("dotenv");
var winston_1 = require("winston");
dotenv.config();
// Environment variables for the log file path and name
var logFilePath = process.env.LOG_FILE;
var env_logLevel = (_a = process.env.LOG_LEVEL) === null || _a === void 0 ? void 0 : _a.toLowerCase();
if (!logFilePath || !env_logLevel) {
    // this logic does not check to see if the input variables are invalid or not 
    throw new Error('LOG_FILE or LOG_LEVEL is not defined in the environment variables.');
}
var log_level;
if (env_logLevel == "0") {
    log_level = "error";
}
else if (env_logLevel == "1") {
    log_level = "info";
}
else if (env_logLevel == "2") {
    log_level = "debug";
}
else {
    log_level = env_logLevel;
}
exports.logger = (0, winston_1.createLogger)({
    level: log_level,
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.printf(function (_a) {
        var timestamp = _a.timestamp, level = _a.level, message = _a.message;
        return "".concat(timestamp, " [").concat(level.toUpperCase(), "]: ").concat(message);
    })),
    transports: [
        new winston_1.transports.File({ filename: logFilePath, options: { flags: 'a' } })
    ],
});
