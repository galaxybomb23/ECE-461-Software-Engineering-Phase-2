// test suite imports
import { cleanup, setup, testLogger } from "./testSuite.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // if needed
import { assertEquals } from "jsr:@std/assert";

//import the function to be tested
// import { functionName } from "~/routes/api/<endpoint>.ts";

// test suite
const TESTNAME = "templateTest";

Deno.test(TESTNAME, async () => {
	// pre test setup
	testLogger.info(`TEST: ${TESTNAME}`);
	const db: DB = await setup(TESTNAME); // setup the database if needed

	// test code
	assertEquals(true, true, "This is the error message");

	// post test cleanup
	await cleanup(db, TESTNAME); // cleanup the database if used
});
