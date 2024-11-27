import { getMetrics } from "~/src/metrics/getMetrics.ts";
import { Octokit } from "npm:@octokit/rest";

// read in the urls from the file
const urls = await Deno.readTextFile("./tests/resources/sample_url.txt");
console.log(urls);
const LOGFILE = "adjMetrics.log";
const encoder = new TextEncoder();

// create array of metrics
const busFactor = [];
const correctness = [];
const license = [];
const rampUp = [];
const responsiveMaintainer = [];
const dependencyPinning = [];
const reviewPercentage = [];
const netScore = [];

// get curernt api token status
const token = Deno.env.get("GITHUB_TOKEN");
if (!token) {
    console.error("No token provided");
    Deno.exit(1);
} else {
    const OCTOKIT = new Octokit({ auth: token });
    const status = await OCTOKIT.rateLimit.get();
    console.log("Rate limit remaining: ", status.data.rate.remaining);
}

let passcnt = 0;
// loop through each url and get the metrics
for (const url of urls.split("\n")) {
    // console.log(url);
    const metrics = await getMetrics(url);
    const json = JSON.parse(metrics);
    busFactor.push(json.BusFactor);
    correctness.push(json.Correctness);
    license.push(json.License);
    rampUp.push(json.RampUp);
    responsiveMaintainer.push(json.ResponsiveMaintainer);
    dependencyPinning.push(json.DependencyPinning);
    reviewPercentage.push(json.ReviewPercentage);
    netScore.push(json.NetScore);

    // count how many pass
    if (
        busFactor[busFactor.length - 1] >= 0.5 && correctness[correctness.length - 1] >= 0.5 &&
        license[license.length - 1] >= 0.5 && rampUp[rampUp.length - 1] >= 0.5 &&
        responsiveMaintainer[responsiveMaintainer.length - 1] >= 0.5 &&
        dependencyPinning[dependencyPinning.length - 1] >= 0.5 &&
        reviewPercentage[reviewPercentage.length - 1] >= 0.5 && netScore[netScore.length - 1] >= 0.5
    ) {
        passcnt++;
    }

    // console.log(json);
    Deno.writeFileSync(LOGFILE, encoder.encode(JSON.stringify(json) + "\n"), { append: true });
}

// calculate the average for each metric
const averageBusFactor = busFactor.reduce((a, b) => a + b, 0) / busFactor.length;
const averageCorrectness = correctness.reduce((a, b) => a + b, 0) / correctness.length;
const averageLicense = license.reduce((a, b) => a + b, 0) / license.length;
const averageRampUp = rampUp.reduce((a, b) => a + b, 0) / rampUp.length;
const averageResponsiveMaintainer = responsiveMaintainer.reduce((a, b) => a + b, 0) / responsiveMaintainer.length;
const averageDependencyPinning = dependencyPinning.reduce((a, b) => a + b, 0) / dependencyPinning.length;
const averageReviewPercentage = reviewPercentage.reduce((a, b) => a + b, 0) / reviewPercentage.length;
const averageNetScore = netScore.reduce((a, b) => a + b, 0) / netScore.length;

// print out the averages
// console.log("\nMetrics Averages");
// console.log("Average Bus Factor: ", averageBusFactor);
// console.log("Average Correctness: ", averageCorrectness);
// console.log("Average License: ", averageLicense);
// console.log("Average Ramp Up: ", averageRampUp);
// console.log("Average Responsive Maintainer: ", averageResponsiveMaintainer);
// console.log("Average Dependency Pinning: ", averageDependencyPinning);
// console.log("Average Review Percentage: ", averageReviewPercentage);
// console.log("Average Net Score: ", averageNetScore);
Deno.writeFileSync(LOGFILE, encoder.encode("\nMetrics Averages\n"), { append: true });
Deno.writeFileSync(LOGFILE, encoder.encode("Average Bus Factor: " + averageBusFactor + "\n"), { append: true });
Deno.writeFileSync(LOGFILE, encoder.encode("Average Correctness: " + averageCorrectness + "\n"), { append: true });
Deno.writeFileSync(LOGFILE, encoder.encode("Average License: " + averageLicense + "\n"), { append: true });
Deno.writeFileSync(LOGFILE, encoder.encode("Average Ramp Up: " + averageRampUp + "\n"), { append: true });
Deno.writeFileSync(LOGFILE, encoder.encode("Average Responsive Maintainer: " + averageResponsiveMaintainer + "\n"), {
    append: true,
});
Deno.writeFileSync(LOGFILE, encoder.encode("Average Dependency Pinning: " + averageDependencyPinning + "\n"), {
    append: true,
});
Deno.writeFileSync(LOGFILE, encoder.encode("Average Review Percentage: " + averageReviewPercentage + "\n"), {
    append: true,
});
Deno.writeFileSync(LOGFILE, encoder.encode("Average Net Score: " + averageNetScore + "\n"), { append: true });
Deno.writeFileSync(LOGFILE, encoder.encode("Pass Count: " + passcnt + "\n"), { append: true });
