import { calculateDependencyPinning } from '../src/metrics/dependencyPinning';
import { fetchJsonFromApi } from '../src/API';
import { getGitHubAPILink } from '../src/githubData';
import { getTimestampWithThreeDecimalPlaces } from '../src/metrics/getLatency';
import exp from 'constants';
import { describe } from 'node:test';
import { logger } from '../src/logFile';

describe('calculateDependencyPinning', () => {
    const mockURL = 'https://github.com/cloudinary/cloudinary_npm';


    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should accurately return scores for various URLS', async () => {
        // compute dependencyPinning
        const result = await calculateDependencyPinning(mockURL);
        
        // ensure latency > 0 and score near 0.245
        expect(result.score).toBeCloseTo(0, 1);
        expect(result.latency).toBeGreaterThan(0);
    }
    );
});