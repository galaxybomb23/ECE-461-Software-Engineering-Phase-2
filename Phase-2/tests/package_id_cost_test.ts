// test suite imports
import { cleanup, setup, testLogger } from "./testSuite.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // if needed
import { assertEquals } from "jsr:@std/assert";

//import the function to be tested
import { calcPackageCost } from "~/routes/api/package/%5Bid%5D/cost.ts";

// import handler
import { handler } from "~/routes/api/package/[id]/cost.ts"; // Update with the actual path to your handler file
import { populateDatabase } from "~/utils/populateDatabase.ts"; // Update with the actual path to your populateDatabase file
import type { FreshContext } from "$fresh/src/server/types.ts";

//

// test suite
Deno.test("packageIdCostTest", async (t) => {
	await t.step("packageIdCostTest - Function Test Name", async () => {
		// pre test setup
		testLogger.info(`Test: Not yet implemented`);
		const db: DB = await setup(); // setup the database if needed

		// test code
		assertEquals(true, true, "This is the error message");

		// post test cleanup
		await cleanup(db); // cleanup the database if used
	});

	await populateDatabase(); // populate the database if needed
	let mockContext: FreshContext;

	// <--- Handler Test --->
	// await t.step("EndpointTest - Handler: yetImplimented", async () => {
	//     const validRequest = new Request("http://localhost/api/package/23/cost?dependency=false", {
	//         method: "GET", //GET, POST, PUT, DELETE, etc
	//         headers: {
	//             "Content-Type": "application/json",
	//             "X-Authorization": "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
	//         },
	//     });

	//     if (handler.GET) { // Check if handler.POST is defined
	//         const response = await handler.GET(validRequest, mockContext);
	//         assertEquals(response.status, 200);
	//     } else {
	//         throw new Error("handler.POST is undefined");
	//     }
	// });

	// await t.step("EndpointTest - Handler: Missing AuthToken", async () => {
	//     const validRequest = new Request("http://localhost/api/package/23/cost?dependency=true", {
	//         method: "GET", //GET, POST, PUT, DELETE, etc
	//         headers: {
	//             "Content-Type": "application/json",
	//         },
	//     });

	//     if (handler.GET) { // Check if handler.POST is defined
	//         const response = await handler.GET(validRequest, mockContext);
	//         assertEquals(response.status, 403);
	//     } else {
	//         throw new Error("handler.GET is undefined");
	//     }
	// });

	// await t.step("EndpointTest - Handler: Invalid AuthToken", async () => {
	//     const validRequest = new Request("http://localhost/api/package/23/cost?dependency=true", {
	//         method: "GET", //GET, POST, PUT, DELETE, etc
	//         headers: {
	//             "Content-Type": "application/json",
	//             "X-Authorization": "bearer asdfads",
	//         },
	//     });

	//     if (handler.GET) { // Check if handler.POST is defined
	//         const response = await handler.GET(validRequest, mockContext);
	//         assertEquals(response.status, 403);
	//     } else {
	//         throw new Error("handler.GET is undefined");
	//     }
	// });
});
