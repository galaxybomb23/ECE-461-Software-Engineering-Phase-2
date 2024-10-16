import { getGitHubAPILink } from '../githubData';
import { fetchJsonFromApi } from '../API';
import { getTimestampWithThreeDecimalPlaces } from './getLatency';
import { logger } from '../logFile';

/**
 * Calculates the percentage of dependencies pinned to a specific major+minor version.
 * No dependencies pinned to a specific version will result in a score of 1.0
 * 
 * @param {string} repoURL - The GitHub repository URL.
 * @returns {Promise<{ score: number, latency: number }>} - The DependencyPinning score and latency.
 */
export async function calculateDependencyPinning(repoURL: string): Promise<{ score: number, latency: number }> {
    // Start latency tracking
    const latency_start = getTimestampWithThreeDecimalPlaces();
    process.stdout.write(`calculateDependencyPinning latency_start: ${latency_start}\n`);
    const apiLink = getGitHubAPILink(repoURL);

    const manifestPaths = ['package.json', 'requirements.txt', 'Pipfile', 'Cargo.toml'];

    let pinnedCount = 0;
    let totalDependencies = 0;

    // Fetch repository data from GitHub
    let repoData;
    for (const path of manifestPaths) {
        const fileApiLink = `${apiLink}/contents/${path}`;
        const fileData = await fetchJsonFromApi(fileApiLink);

        if (!fileData){
            continue;
        }

        const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const dependencies = parseDependencies(decodedContent, path); // Parse based on file type

        totalDependencies += dependencies.length;

        // Check if dependencies are pinned (pinned to major+minor)
        for (const dep of dependencies) {
            if (isPinnedToMajorMinor(dep.version)) {
                pinnedCount++;
            }
        }
    }
    



    // Calculate the DependencyPinning score (between 0 and 1)
    const score = totalDependencies === 0 ? 1 : pinnedCount / totalDependencies;
    logger.debug(`calculateDependencyPinning Calculated DependencyPinning score. Score: ${score}`);

    // Calculate latency in milliseconds
    const latencyMs = parseFloat((getTimestampWithThreeDecimalPlaces() - latency_start).toFixed(3));
    logger.debug(`calculateDependencyPinning Calculated fetch latency. Latency: ${latencyMs} ms`);
    
    return { score, latency: latencyMs }; // Return score and latency
}

function parseDependencies(fileContent: string, fileType: string): Array<{ name: string, version: string }> {
    let dependencies: Array<{ name: string, version: string }> = [];

    if (fileType === 'package.json') {
        // Parse package.json (JavaScript/Node.js)
        const parsed = JSON.parse(fileContent);
        dependencies = Object.entries(parsed.dependencies || {}).map(([name, version]) => ({ name, version: version as string }));

    } else if (fileType === 'requirements.txt') {
        // Parse requirements.txt (Python)
        const lines = fileContent.split('\n').filter(line => line.trim() && !line.startsWith('#')); // Ignore comments
        dependencies = lines.map(line => {
            const [name, version] = line.split('==');
            return { name: name.trim(), version: version ? version.trim() : '' };
        });

    } else if (fileType === 'Pipfile') {
        // Parse Pipfile (Python)
        const parsed = JSON.parse(fileContent);
        dependencies = Object.entries(parsed.packages || {}).map(([name, version]) => ({ name, version: version as string }));

    } else if (fileType === 'Cargo.toml') {
        // Parse Cargo.toml (Rust)
        const lines = fileContent.split('\n').filter(line => line.trim() && !line.startsWith('#')); // Ignore comments
        let inDependenciesSection = false;
        for (const line of lines) {
            if (line.startsWith('[dependencies]')) {
                inDependenciesSection = true;
                continue;
            }

            if (inDependenciesSection && line.includes('=') && !line.startsWith('[')) {
                const [name, version] = line.split('=').map(item => item.trim().replace(/["']/g, '')); // Remove quotes around version
                dependencies.push({ name, version });
            }
        }
    }

    return dependencies;
}

function isPinnedToMajorMinor(version: string): boolean {
    // matches versions pinned to major+minor like 1.2.3, 1.2.x, of any length
    const regex = /^\d+\.\d+(\.\d+|\.x)?$/;

    return regex.test(version);
}