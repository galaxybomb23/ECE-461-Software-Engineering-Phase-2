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

export interface PackageRating {
	BusFactor: number;
	Correctness: number;
	RampUp: number;
	ResponsiveMaintainer: number;
	LicenseScore: number;
	GoodPinningPractice: number;
	PullRequest: number;
	NetScore: number;
}

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
