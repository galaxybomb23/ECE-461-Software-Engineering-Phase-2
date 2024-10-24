import { resetDatabase } from "../routes/api/reset.ts";
import { DB, Row } from "https://deno.land/x/sqlite/mod.ts";
import { assertEquals } from "jsr:@std/assert";
import { cleanup, setup, testLogger } from "./testSuite.ts";

const TESTNAME = "resetDatabase";

Deno.test(TESTNAME, async () => {
    // pre test setup
    testLogger.info(`TEST: ${TESTNAME}`);
    let db: DB | null = null;

    db = await setup(TESTNAME);
    await resetDatabase(db);

    const packages: Row[] = await db.query(`SELECT * FROM packages`);
    const users: Row[] = await db.query(`SELECT * FROM users`);

    assertEquals(packages.length, 0, "Packages table should be empty");
    assertEquals(users.length, 2, "Users table should have 2 entries");

    testLogger.debug("resetDatabase test passed");

    if (db) {
        await cleanup(db, TESTNAME);
    }
});
