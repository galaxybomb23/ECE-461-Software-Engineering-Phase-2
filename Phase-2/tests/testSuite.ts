import { createLogger, format, Logger, transports } from "npm:winston";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { populateDatabase } from "../utils/populateDatabase.ts";

export async function setup(dbname: string) {
    //setup test database
    const db = new DB(`tests/${dbname}.db`);
    await populateDatabase(db);
    return db;
}

export const testLogger: Logger = createLogger({
    level: "debug",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) =>
            `${timestamp} [${level.toUpperCase()}]: ${message}`
        ),
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

    // delete the data.db file
    try {
        if (!db.isClosed) {
            await db.close(true);
        }
        await Deno.remove(`tests/${filename}.db`);
        testLogger.debug(
            `Test database file ${filename} deleted successfully`,
        );
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            testLogger.debug("Test database file not found, skipping deletion");
        } else if (error instanceof Error) {
            testLogger.error(
                `Error deleting test database file: ${error.message}`,
            );
        } else {
            testLogger.error(
                "Unknown error occurred while deleting test database file",
            );
        }
    }
    testLogger.debug("End Test");
}
