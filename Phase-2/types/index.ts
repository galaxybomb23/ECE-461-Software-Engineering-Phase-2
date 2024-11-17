export const APIBaseURL = "http://localhost:8001";

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
