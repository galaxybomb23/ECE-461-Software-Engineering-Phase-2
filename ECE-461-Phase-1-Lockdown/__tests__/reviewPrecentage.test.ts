import { getReviewPercentage } from '../src/metrics/reviewPrecentage';
import { getGitHubAPILink } from '../src/githubData';
import { fetchJsonFromApi } from '../src/API';
import { getTimestampWithThreeDecimalPlaces } from '../src/metrics/getLatency';

jest.mock('../src/githubData', () => ({
  getGitHubAPILink: jest.fn(),
}));

jest.mock('../src/API', () => ({
  fetchJsonFromApi: jest.fn(),
}));

jest.mock('../src/metrics/getLatency', () => ({
  getTimestampWithThreeDecimalPlaces: jest.fn(),
}));

describe('getReviewPercentage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate the review percentage and latency correctly', async () => {
    const mockUrl = 'https://api.github.com/repos/test/repo';
    
    // Explicitly define types for mock data
    const mockPullRequests: any[] = [
      { number: 1, merged_at: '2023-01-01', additions: 50, deletions: 10 },
      { number: 2, merged_at: '2023-01-02', additions: 30, deletions: 5 },
      { number: 3, merged_at: null, additions: 20, deletions: 5 }, // Not merged
    ];

    const mockReviewsPR1: any[] = [{ id: 101 }];
    const mockReviewsPR2: any[] = []; // No reviews

    (getGitHubAPILink as jest.Mock).mockReturnValue(mockUrl);
    (fetchJsonFromApi as jest.Mock)
      .mockResolvedValueOnce(mockPullRequests) // First call for PRs
      .mockResolvedValueOnce(mockReviewsPR1)   // Second call for reviews for PR1
      .mockResolvedValueOnce(mockReviewsPR2);  // Third call for reviews for PR2

    // Mock latency start and end timestamps
    (getTimestampWithThreeDecimalPlaces as jest.Mock)
      .mockReturnValueOnce(1000)  // Start time
      .mockReturnValueOnce(1500); // End time

    const { score, latency } = await getReviewPercentage(mockUrl);

    expect(getGitHubAPILink).toHaveBeenCalledWith(mockUrl);
    expect(fetchJsonFromApi).toHaveBeenCalledTimes(3); // 1 for PRs, 2 for Reviews

    // Total lines (PR1: 60 lines, PR2: 35 lines) => 95 lines total
    // Reviewed lines (PR1: 60 lines reviewed) => score = 60 / 95
    expect(score).toBeCloseTo(60 / 95);

    // Latency should be calculated
    expect(latency).toBeCloseTo(500); // 1500 - 1000 ms = 500 ms
  });

  it('should handle cases with no merged pull requests', async () => {
    const mockUrl = 'https://api.github.com/repos/test/repo';
    
    const mockPullRequests: any[] = [
      { number: 1, merged_at: null, additions: 50, deletions: 10 }, // Not merged
    ];

    (getGitHubAPILink as jest.Mock).mockReturnValue(mockUrl);
    (fetchJsonFromApi as jest.Mock).mockResolvedValueOnce(mockPullRequests); // First call for PRs

    (getTimestampWithThreeDecimalPlaces as jest.Mock)
      .mockReturnValueOnce(1000)  // Start time
      .mockReturnValueOnce(1500); // End time

    const { score, latency } = await getReviewPercentage(mockUrl);

    expect(getGitHubAPILink).toHaveBeenCalledWith(mockUrl);
    expect(fetchJsonFromApi).toHaveBeenCalledTimes(1); // Only PRs call (no reviews needed)
    
    // No merged PRs, so score should be 0
    expect(score).toBe(0);

    // Latency should be calculated
    expect(latency).toBeCloseTo(500); // 1500 - 1000 ms = 500 ms
  });

  it('should handle errors gracefully', async () => {
    const mockUrl = 'https://api.github.com/repos/test/repo';

    (getGitHubAPILink as jest.Mock).mockReturnValue(mockUrl);
    (fetchJsonFromApi as jest.Mock).mockRejectedValueOnce(new Error('API error'));

    (getTimestampWithThreeDecimalPlaces as jest.Mock)
      .mockReturnValueOnce(1000)  // Start time
      .mockReturnValueOnce(1500); // End time

    const { score, latency } = await getReviewPercentage(mockUrl);

    expect(getGitHubAPILink).toHaveBeenCalledWith(mockUrl);
    expect(fetchJsonFromApi).toHaveBeenCalledTimes(1); // Only PRs call

    // Since an error occurred, score should remain 0
    expect(score).toBe(0);

    // Latency should still be calculated
    expect(latency).toBeCloseTo(500); // 1500 - 1000 ms = 500 ms
  });
});
