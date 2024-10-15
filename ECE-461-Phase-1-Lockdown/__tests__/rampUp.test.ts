import { calculateRampUp } from '../src/metrics/rampUp';
import { fetchJsonFromApi } from '../src/API';
import { getGitHubAPILink } from '../src/githubData';
import { getTimestampWithThreeDecimalPlaces } from '../src/metrics/getLatency';

// Mock dependencies
jest.mock('../src/API');
jest.mock('../src/githubData');
jest.mock('../src/metrics/getLatency');

describe('calculateRampUp', () => {
  const mockRepoURL = 'https://github.com/example/repo';
  const mockRepoData = { size: 10000 }; // 10 MB repository size
  const mockRepoDataInvalid = { size: 0 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a valid score for a valid repository URL', async () => {
    (getGitHubAPILink as jest.Mock).mockReturnValue('https://api.github.com/repos/example/repo');
    (fetchJsonFromApi as jest.Mock).mockResolvedValue(mockRepoData); // Simulate repo data with size 10000 KB
    (getTimestampWithThreeDecimalPlaces as jest.Mock).mockReturnValueOnce(1000).mockReturnValueOnce(1005); // Simulate latency

    const result = await calculateRampUp(mockRepoURL);

    expect(result.score).toBeGreaterThan(0); // Score should be > 0 for a repo of size 10MB
    expect(result.score).toEqual(0.8); // (1 - 10000 / 50000) = 0.8
    expect(result.latency).toEqual(5); // Latency of 5ms (1005 - 1000)
    expect(getGitHubAPILink).toHaveBeenCalledWith(mockRepoURL);
    expect(fetchJsonFromApi).toHaveBeenCalledWith('https://api.github.com/repos/example/repo');
  });

  it('should return a score of 1 for a very small repository', async () => {
    (getGitHubAPILink as jest.Mock).mockReturnValue('https://api.github.com/repos/example/repo');
    (fetchJsonFromApi as jest.Mock).mockResolvedValue({ size: 100 }); // Repo size of 100 KB
    (getTimestampWithThreeDecimalPlaces as jest.Mock).mockReturnValueOnce(1000).mockReturnValueOnce(1002); // Simulate latency

    const result = await calculateRampUp(mockRepoURL);

    expect(result.score).toEqual(1); // Small repository should have score 1
    expect(result.latency).toEqual(2); // Latency of 2ms (1002 - 1000)
  });

  it('should return a score of 0 if the repository size exceeds the max size', async () => {
    (getGitHubAPILink as jest.Mock).mockReturnValue('https://api.github.com/repos/large-repo');
    (fetchJsonFromApi as jest.Mock).mockResolvedValue({ size: 60000 }); // Repo size of 60 MB (larger than the max size)
    (getTimestampWithThreeDecimalPlaces as jest.Mock).mockReturnValueOnce(1000).mockReturnValueOnce(1006); // Simulate latency

    const result = await calculateRampUp('https://github.com/large-repo');

    expect(result.score).toEqual(0); // Score should be 0 for a repo exceeding 50 MB
    expect(result.latency).toEqual(6); // Latency of 6ms (1006 - 1000)
  });

  it('should return a score of 1 if the repository size is invalid or unavailable', async () => {
    (getGitHubAPILink as jest.Mock).mockReturnValue('https://api.github.com/repos/invalid-repo');
    (fetchJsonFromApi as jest.Mock).mockResolvedValue(mockRepoDataInvalid); // Invalid repo size
    (getTimestampWithThreeDecimalPlaces as jest.Mock).mockReturnValueOnce(1000).mockReturnValueOnce(1004); // Simulate latency

    const result = await calculateRampUp('https://github.com/invalid-repo');

    expect(result.score).toEqual(1); // The default score is 1 if the size is not available (0 is considered a small repo)
    expect(result.latency).toEqual(4); // Latency of 4ms (1004 - 1000)
  });
});