export interface Advocate {
    id?: number;
    firstName: string;
    lastName: string;
    city: string;
    degree: string;
    specialties: string[];
    yearsOfExperience: number;
    phoneNumber: number;
    searchText: string;
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

export interface ExperienceRange {
    label: string;
    min: number;
    max: number;
}

export interface FilterOptions {
    cities: string[];
    degrees: string[];
    experienceRanges: ExperienceRange[];
    specialties: string[];
}

export interface FilterState {
    search: string;
    city: string[];
    degree: string[];
    experienceMin: number;
    experienceMax: number;
    experienceRanges: string[];
    specialties: string[];
}

// Type-safe filter change handler
export type FilterChangeHandler = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
) => void; 