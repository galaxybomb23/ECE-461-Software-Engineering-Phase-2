import { calculateDependencyPinning } from '../src/metrics/dependencyPinning';
import { fetchJsonFromApi } from '../src/API';
import { getGitHubAPILink } from '../src/githubData';
import { getTimestampWithThreeDecimalPlaces } from '../src/metrics/getLatency';
import exp from 'constants';

// Mock dependencies
jest.mock('../src/API');
jest.mock('../src/githubData');
jest.mock('../src/metrics/getLatency');

describe('calculateDependencyPinning', () => {
    const mockURLNoDependencies = 'https://github.com/Coop8/Coop8';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a score of 1 for a repository with no dependencies', async () => {
        const { score, latency } = await calculateDependencyPinning(mockURLNoDependencies);

        expect(score).toEqual(1); // No dependencies, so score should be 1
        expect(latency).toBeGreaterThan(0); // Latency should be greater than 0
    });
});