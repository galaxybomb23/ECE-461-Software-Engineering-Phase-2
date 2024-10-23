export interface RepoData {
	size: number;
	open_issues_count: number;
}

export interface SearchResult {
	standaloneCost: number;
	totalCost: number;
}

export interface Issue {
	closed_at: string | null;
	created_at: string;
	updated_at: string;
	title: string;
	body: string;
	user: {
		login: string;
	};
}

export interface PRDetails {
	additions: number;
	deletions: number;
}

export interface Review {
	user: {
		login: string;
	};
}

export interface Contributor {
	contributions: number;
}

export interface ManifestData {
	content: string;
}

export interface Dependency {
	name: string;
	version: string;
}

export interface PullRequest {
	merged_at: string | null;
	number: number;
	user: {
		login: string;
	};
}

export interface NpmPackageData {
	repository?: {
		url?: string;
	};
	versions?: {
		[version: string]: {
			bugs?: {
				url?: string;
			};
		};
	};
}

export interface MetricsResult {
	score: number;
	latency: number;
}

export interface RepoMetrics {
	URL: string;
	NetScore: number | null;
	NetScore_Latency: number | null;
	RampUp: number | null;
	RampUp_Latency: number | null;
	Correctness: number | null;
	Correctness_Latency: number | null;
	BusFactor: number | null;
	BusFactor_Latency: number | null;
	ResponsiveMaintainer: number | null;
	ResponsiveMaintainer_Latency: number | null;
	License: number | null;
	License_Latency: number | null;
	dependencyPinning: number | null;
	dependencyPinning_Latency: number | null;
	ReviewPercentage: number | null;
	ReviewPercentage_Latency: number | null;
}
