import { createLogger, format, Logger, transports } from "npm:winston";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { populateDatabase } from "../utils/populateDatabase.ts";

export async function setup(dbname: string) {
    //setup test database in memory
    const db = new DB(":memory:");
    await populateDatabase(db);
    return db;
}

export const testLogger: Logger = createLogger({
    level: "debug",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`),
    ),
    transports: [
        new transports.File({
            filename: "logs/tests.log",
            options: { flags: "a" },
        }),
    ],
});

export async function cleanup(db: DB, filename: string) {
    // delete the data.db file
    // if the database is open, close it
    if (!db.isClosed) {
        await db.close(true);
    }
    testLogger.debug("End Test");
}
