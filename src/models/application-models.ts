export interface ApplicationRequestBody {
    metadata?: object
}

export interface Application {
    id: string;
    group: string;
    createdAt: number;
    updatedAt: number;
    metadata?: object;
}

export interface GroupSummary {
    group: string;
    instances: number;
    createdAt: number;
    lastUpdatedAt: number;
}