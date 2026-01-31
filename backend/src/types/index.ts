// Backend-specific types

export interface UniversityData {
  id: string;
  universityName: string;
  country: string;
  ranking: number;
  pswDuration: string;
  pswDetails: string;
  industryMatch: string;
  majorEmployers: string[];
  employabilityRank?: number;
  graduateEmploymentRate?: string;
  avgStartingSalary?: string;
  healthInsurance: string;
  visaFees: string;
  proofOfFunds: string;
  fullRideAvailable: boolean;
  fullRideDetails?: string;
  tuitionWaiverAvailable: boolean;
  tuitionWaiverDetails?: string;
  accreditationBodies: string[];
  accreditationDetails?: string;
  sourceUrl?: string;
  cachedAt: string;
}

export interface SearchRequest {
  degree: string;
}

export interface SearchResponse {
  success: boolean;
  data: {
    queryId: string;
    degree: string;
    results: UniversityData[];
  };
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}
