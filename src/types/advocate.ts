export interface Advocate {
    id: number;
    firstName: string;
    lastName: string;
    city: string;
    degree: string;
    specialties: string[];
    yearsOfExperience: number;
    phoneNumber: number;
    createdAt: string;
}

export interface PaginationInfo {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface AdvocatesResponse {
    data: Advocate[];
    pagination: PaginationInfo;
} 