// Define all the types from the OpenAPI spec here
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

export interface PackageHistoryEntry {
  User: User;
  Date: string;
  PackageMetadata: PackageMetadata;
  Action: 'CREATE' | 'UPDATE' | 'DOWNLOAD' | 'RATE';
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

export interface PackageQuery {
  Version?: string;
  Name: string;
}
