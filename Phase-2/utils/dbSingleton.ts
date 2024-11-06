import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { logger } from "~/src/logFile.ts";

class DBSingleton {
    private static instance: DB | null = null;

    private constructor() {}

    static getInstance(): DB {
        if (!DBSingleton.instance) {
            logger.info("Creating a new database connection...");
            DBSingleton.instance = new DB("data/data.db");
        }
        return DBSingleton.instance;
    }

    static close(): void {
        if (DBSingleton.instance) {
            logger.info("Closing the database connection...");
            DBSingleton.instance.close(true);
            DBSingleton.instance = null;
        }
    }
}

// Create and export the instance directly
export const dbInstance = DBSingleton.getInstance();

// Register signal listeners for graceful shutdown
const shutdown = () => {
    logger.info("Shutting detected...");
    DBSingleton.close();
    Deno.exit(); // Ensure the process exits
};

// Handle shutdown on common exit signals
Deno.addSignalListener("SIGINT", shutdown);
Deno.addSignalListener("SIGTERM", shutdown);

// Handle shutdown on process exit
globalThis.addEventListener("unload", () => {
    DBSingleton.close();
});
