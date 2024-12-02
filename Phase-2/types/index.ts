export const APIBaseURL = new URL("http://localhost:8000/");

export interface Package {
	metadata: PackageMetadata;
	data: PackageData;
}

export interface PackageMetadata {
	Name: string;
	Version: string;
	ID: string;
}

export interface PackageData {
	Content?: string;
	URL?: string;
	debloat?: boolean;
	JSProgram?: string;
}

// Used in package.ts for returning cost
export interface ExtendedPackage extends Package {
	data: PackageData & {
		Dependencies: string;
	};
}

export interface DatabasePackageRow {
	id: number;
	name: string;
	url: string;
	version: string;
	base64_content: string;
	license_score: number;
	license_latency: number;
	netscore: number;
	netscore_latency: number;
	dependency_pinning_score: number;
	dependency_pinning_latency: number;
	rampup_score: number;
	rampup_latency: number;
	review_percentage_score: number;
	review_percentage_latency: number;
	bus_factor: number;
	bus_factor_latency: number;
	correctness: number;
	correctness_latency: number;
	responsive_maintainer: number;
	responsive_maintainer_latency: number;
}

export interface PackageRating {
	BusFactor: number;
	BusFactorLatency: number;
	Correctness: number;
	CorrectnessLatency: number;
	RampUp: number;
	RampUpLatency: number;
	ResponsiveMaintainer: number;
	ResponsiveMaintainerLatency: number;
	LicenseScore: number;
	LicenseScoreLatency: number;
	GoodPinningPractice: number;
	GoodPinningPracticeLatency: number;
	PullRequest: number;
	PullRequestLatency: number;
	NetScore: number;
	NetScoreLatency: number;
}

// <--- for use in /package/{id}/cost --->
export interface PackageCost {
	[key: string]: {
		standaloneCost?: number;
		totalCost: number;
	};
}

// <--- for use in /package/byName/{name} --->
export interface PackageHistoryEntry {
	User: User;
	Date: string;
	PackageMetadata: PackageMetadata;
	Action: "CREATE" | "UPDATE" | "DOWNLOAD" | "RATE";
}

export interface User {
	name: string;
	isAdmin: boolean;
}

// <--- for use in /package/byRegx
export interface regexRequest {
	RegEx: string;
}
export interface AuthenticationRequest {
	User: User;
	Secret: {
		password: string;
	};
}

export type AuthenticationToken = string;

// <--- for use in /packages --->
export interface packagesRequest {
	offset?: number;
	authToken: string;
	requestBody: PackageQuery;
}

export interface PackageQuery {
	Version: string;
	Name: string;
}
