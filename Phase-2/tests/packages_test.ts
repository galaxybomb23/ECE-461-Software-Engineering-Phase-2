// test suite imports
import { cleanup, setup, testLogger } from "./testSuite.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // if needed
import { assertEquals } from "jsr:@std/assert";
import { PackageQuery } from "~/types/index.ts";

//import function
import { listPackages } from "~/routes/api/packages.ts";
import test from "node:test";
interface packagesRequest {
    offset?: number;
    authToken: string;
    requestBody: PackageQuery;
}

// test suite

let TESTNAME = "PackagesTest - listPackages: Exact Version";

Deno.test(TESTNAME, async () => {
    // pre test setup
    testLogger.info(`TEST: ${TESTNAME}`);
    const db: DB = await setup(TESTNAME); // setup the database if needed
    let response: Response;

    // request package 1
    let request: packagesRequest = {
        offset: 1,
        authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
        requestBody: {
            Name: "sample-package-1",
            Version: "Exact (1.0.0)",
        },
    };
    response = await listPackages(request, db);
    testLogger.info(`Response for ${TESTNAME}: ${response}`);
    assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
    let data = await response.json();
    assertEquals(data.length, 1, `Expected 1 package, got ${data}`);
    assertEquals(data[0].Name, "sample-package-1", `Expected package name to be sample-package-1, got ${data[0].Name}`);
    assertEquals(data[0].Version, "1.0.0", `Expected package version to be 1.0.0, got ${data[0].Version}`);

    // request null package by name
    request = {
        offset: 1,
        authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
        requestBody: {
            Name: "invalid-package",
            Version: "Exact (1.0.0)",
        },
    };
    response = await listPackages(request, db);
    assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
    data = await response.json();
    assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

    // request null package by version
    request = {
        offset: 1,
        authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
        requestBody: {
            Name: "sample-package-1",
            Version: "Exact (2.0.0)",
        },
    };
    response = await listPackages(request, db);
    assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
    data = await response.json();
    assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

    // post test cleanup
    await cleanup(db, TESTNAME); // cleanup the database if used
});

TESTNAME = "PackagesTest - listPackages: Bounded Range";
Deno.test(TESTNAME, async () => {
    // pre test setup
    testLogger.info(`TEST: ${TESTNAME}`);
    const db: DB = await setup(TESTNAME); // setup the database if needed
    let response: Response;

    // request valid package 1
    let request: packagesRequest = {
        offset: 1,
        authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
        requestBody: {
            Name: "sample-package-2",
            Version: "Bounded range (1.0.0-3.0.0)",
        },
    };
    response = await listPackages(request, db);
    assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
    let data = await response.json();
    assertEquals(data.length, 1);
    assertEquals(data[0].Name, "sample-package-2", `Expected package name to be sample-package-2, got ${data[0].Name}`);
    assertEquals(data[0].Version, "2.1.3", `Expected package version to be 2.1.3, got ${data[0].Version}`);

    // request null package by name
    request = {
        offset: 1,
        authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
        requestBody: {
            Name: "invalid-package",
            Version: "Bounded range (1.0.0-2.0.0)",
        },
    };
    response = await listPackages(request, db);
    assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
    data = await response.json();
    assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

    // request null package by version
    request = {
        offset: 1,
        authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
        requestBody: {
            Name: "sample-package-2",
            Version: "Bounded range (2.1.5-3.0.0)",
        },
    };
    response = await listPackages(request, db);
    assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
    data = await response.json();
    assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

    // post test cleanup
    await cleanup(db, TESTNAME); // cleanup the database if used
});

TESTNAME = "PackagesTest - listPackages: Carat Version";
Deno.test(TESTNAME, async () => {
    // pre test setup
    testLogger.info(`TEST: ${TESTNAME}`);
    const db: DB = await setup(TESTNAME); // setup the database if needed
    let response: Response;

    // request valid package 1
    let request: packagesRequest = {
        offset: 1,
        authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
        requestBody: {
            Name: "sample-package-2",
            Version: "Carat (^2.0.0)",
        },
    };
    response = await listPackages(request, db);
    assertEquals(response.status, 200);
    let data = await response.json();
    testLogger.info(`Response for ${TESTNAME}: ${data}`);
    assertEquals(data.length, 1);
    assertEquals(data[0].Name, "sample-package-2", `Expected package name to be sample-package-1, got ${data[0].Name}`);
    assertEquals(data[0].Version, "2.1.3", `Expected package version to be 2.1.3, got ${data[0].Version}`);

    // request null package by name
    request = {
        offset: 1,
        authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
        requestBody: {
            Name: "invalid-package",
            Version: "Carat (^1.0.0)",
        },
    };
    response = await listPackages(request, db);
    assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
    data = await response.json();
    assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

    // request null package by version
    request = {
        offset: 1,
        authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
        requestBody: {
            Name: "sample-package-1",
            Version: "Carat (^2.0.0)",
        },
    };
    response = await listPackages(request, db);
    assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
    data = await response.json();
    assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

    // post test cleanup
    await cleanup(db, TESTNAME); // cleanup the database if used
});

TESTNAME = "PackagesTest - listPackages: Tilde Version";
Deno.test(TESTNAME, async () => {
    // pre test setup
    testLogger.info(`TEST: ${TESTNAME}`);
    const db: DB = await setup(TESTNAME); // setup the database if needed
    let response: Response;

    // request valid package 1
    let request: packagesRequest = {
        offset: 1,
        authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
        requestBody: {
            Name: "sample-package-2",
            Version: "Tilde (~2.1.0)",
        },
    };
    response = await listPackages(request, db);
    assertEquals(response.status, 200);
    let data = await response.json();
    testLogger.info(`Response for ${TESTNAME}: ${data}`);
    assertEquals(data.length, 1, "Request valid package 1");
    assertEquals(data[0].Name, "sample-package-2", `Expected package name to be sample-package-1, got ${data[0].Name}`);
    assertEquals(data[0].Version, "2.1.3", `Expected package version to be 2.1.3, got ${data[0].Version}`);

    // request null package by name
    request = {
        offset: 1,
        authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
        requestBody: {
            Name: "invalid-package",
            Version: "Tilde (~1.0.0)",
        },
    };
    response = await listPackages(request, db);
    assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
    data = await response.json();
    assertEquals(data.length, 0, `Expected 0 packages, got ${data}`);

    // request null package by version
    request = {
        offset: 1,
        authToken: "bearer 613ebe28-bc19-4a6c-a5f8-fd2f3ec38485",
        requestBody: {
            Name: "sample-package-1",
            Version: "Tilde (~2.0.0)",
        },
    };
    response = await listPackages(request, db);
    assertEquals(response.status, 200, `Expected status 200, got ${response.status}`);
    data = await response.json();
    assertEquals(data.length, 0, "Null package By Version");
    // post test cleanup
    await cleanup(db, TESTNAME); // cleanup the database if used
});
