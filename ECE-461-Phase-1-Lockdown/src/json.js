"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initJSON = initJSON;
exports.formatJSON = formatJSON;
exports.extractLastIssuesUrlFromJson = extractLastIssuesUrlFromJson;
var logFile_1 = require("./logFile");
/**
 * Initializes a DataObject for a given repository with all metrics set to null/empty.
 *
 * @returns {DataObject} An initialized DataObject with null metrics.
 */
function initJSON() {
    var defaultData = {
        URL: '',
        NetScore: null,
        NetScore_Latency: null,
        RampUp: null,
        RampUp_Latency: null,
        Correctness: null,
        Correctness_Latency: null,
        BusFactor: null,
        BusFactor_Latency: null,
        ResponsiveMaintainer: null,
        ResponsiveMaintainer_Latency: null,
        License: null,
        License_Latency: null,
        dependencyPinning: null,
        dependencyPinning_Latency: null,
        ReviewPercenage: null,
        ReviewPercenage_Latency: null
    };
    return defaultData;
}
/**
 * Converts a DataObject to a single-line JSON string with spaces between each metric.
 *
 * @param {DataObject} data - The DataObject to be formatted.
 * @returns {string} A single-line JSON string representation of the DataObject with spaces between metrics.
 */
function formatJSON(data) {
    var jsonString = JSON.stringify(data);
    jsonString = jsonString.replace(/,(?=\S)/g, ', ');
    return jsonString;
}
/**
 * Extracts the GitHub issues URL (bugs.url) from any version of the package JSON data.
 *
 * @param {any} packageData - The package JSON data.
 * @returns {string | null} The GitHub issues URL if found, or null if not found.
 */
function extractLastIssuesUrlFromJson(packageData) {
    var versions = packageData.versions;
    var lastIssuesUrl = null;
    // Iterate through versions to find the last issues URL
    for (var version in versions) {
        if (versions.hasOwnProperty(version)) {
            var versionData = versions[version];
            if (versionData.bugs && versionData.bugs.url) {
                lastIssuesUrl = versionData.bugs.url; // Update to the latest found bugs.url
            }
        }
    }
    if (lastIssuesUrl) {
        logFile_1.logger.debug("extractLastIssuesUrlFromJson - URL Found Returning last found issues URL URL: ".concat(lastIssuesUrl));
        return lastIssuesUrl;
    }
    else {
        logFile_1.logger.debug('extractLastIssuesUrlFromJson - No URL Found No GitHub issues URL found in any version. Returning null.');
        return null;
    }
}
