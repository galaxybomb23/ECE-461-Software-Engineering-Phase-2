import { calculateDependencyPinning } from '../src/metrics/dependencyPinning';
import { fetchJsonFromApi } from '../src/API';
import { getGitHubAPILink } from '../src/githubData';
import { getTimestampWithThreeDecimalPlaces } from '../src/metrics/getLatency';
import exp from 'constants';
import { describe } from 'node:test';
import { logger } from '../src/logFile';

// Mock dependencies
jest.mock('../src/githubData', () => ({
    getGitHubAPILink: jest.fn(),
}));

jest.mock('../src/API', () => ({
    fetchJsonFromApi: jest.fn(),
}));

jest.mock('../src/metrics/getLatency', () => ({
    getTimestampWithThreeDecimalPlaces: jest.fn(),
}));

describe('calculateDependencyPinning', () => {
    const mockURL = 'https://github.com/cloudinary/cloudinary_npm';


    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should accurately return scores for various URLS', async () => {
        (getGitHubAPILink as jest.Mock).mockReturnValue(mockURL);

        (fetchJsonFromApi as jest.Mock).mockResolvedValue({ content: Buffer.from(JSON.stringify({}), 'utf-8').toString('base64') });

        // compute dependencyPinning
        const result = await calculateDependencyPinning(mockURL);
        
        // ensure latency > 0 and score near 0.245
        expect(result.score).toBeCloseTo(0.245, 1);
        expect(result.latency).toBeGreaterThan(0);
    }
    );
});