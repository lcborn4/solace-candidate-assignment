"use client";

import { useEffect, useState, useCallback } from "react";
import { Advocate, AdvocatesResponse, FilterOptions, FilterState } from "../types/advocate";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    cities: [],
    degrees: [],
    experienceRanges: [],
    specialties: []
  });
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    city: [],
    degree: [],
    experienceMin: 0,
    experienceMax: 999,
    experienceRanges: [],
    specialties: []
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/filters');
      const options: FilterOptions = await response.json();
      setFilterOptions(options);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, []);

  const fetchAdvocates = useCallback(async (currentFilters = filters, page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.city.length > 0) params.append('city', currentFilters.city.join(','));
      if (currentFilters.degree.length > 0) params.append('degree', currentFilters.degree.join(','));
      if (currentFilters.experienceMin > 0) params.append('experienceMin', currentFilters.experienceMin.toString());
      if (currentFilters.experienceMax < 999) params.append('experienceMax', currentFilters.experienceMax.toString());
      if (currentFilters.specialties.length > 0) params.append('specialties', currentFilters.specialties.join(','));
      params.append('page', page.toString());
      params.append('pageSize', '20');
      
      const url = `/api/advocates?${params.toString()}`;
      const response = await fetch(url);
      const jsonResponse: AdvocatesResponse = await response.json();
      
      setAdvocates(jsonResponse.data);
      setPagination(jsonResponse.pagination);
    } catch (error) {
      console.error("Error fetching advocates:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFilterOptions();
    fetchAdvocates();
  }, [fetchFilterOptions, fetchAdvocates]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAdvocates(filters, 1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, fetchAdvocates]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      city: [],
      degree: [],
      experienceMin: 0,
      experienceMax: 999,
      experienceRanges: [],
      specialties: []
    });
  };

  const handlePageChange = (newPage: number) => {
    fetchAdvocates(filters, newPage);
  };

  const formatPhoneNumber = (phoneNumber: number) => {
    const phoneStr = phoneNumber.toString();
    return `(${phoneStr.slice(0, 3)}) ${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`;
  };

  // Custom dropdown component
  const CustomDropdown = ({ 
    label, 
    value, 
    options, 
    onChange, 
    placeholder = "Select option",
    multiple = false 
  }: {
    label: string;
    value: string | string[];
    options: string[];
    onChange: (value: string | string[]) => void;
    placeholder?: string;
    multiple?: boolean;
  }) => {
    const isOpen = openDropdown === label;
    const displayValue = multiple 
      ? (value as string[]).length > 0 
        ? `${(value as string[]).length} selected`
        : placeholder
      : value || placeholder;

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : label)}
          className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors duration-200"
        >
          <span className={`block truncate ${value && value !== '' ? 'text-gray-900' : 'text-gray-500'}`}>
            {displayValue}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {multiple ? (
              <div className="p-2">
                {options.map((option) => (
                  <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(value as string[]).includes(option)}
                      onChange={(e) => {
                        const currentValue = value as string[];
                        if (e.target.checked) {
                          onChange([...currentValue, option]);
                        } else {
                          onChange(currentValue.filter(v => v !== option));
                        }
                      }}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="py-1">
                <button
                  onClick={() => {
                    onChange('');
                    setOpenDropdown(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100"
                >
                  {placeholder}
                </button>
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onChange(option);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Find Your Perfect Advocate
          </h1>
          <p className="text-lg text-gray-600">
            Connect with experienced mental health professionals who can help you on your journey
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Advocates
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Search by name, city, degree, or specialty..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Clear All
            </button>
          </div>
          {filters.search && (
            <p className="mt-2 text-sm text-gray-600">
              Searching for: <span className="font-medium">{filters.search}</span>
            </p>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                                {(filters.city.length > 0 || filters.degree.length > 0 || filters.experienceRanges.length > 0 || filters.specialties.length > 0) && (
                <div className="ml-2 flex items-center space-x-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Active
                  </span>
                  {filters.city.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {filters.city.length} location{filters.city.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {filters.degree.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {filters.degree.length} degree{filters.degree.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {filters.experienceRanges.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {filters.experienceRanges.length} experience range{filters.experienceRanges.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {filters.specialties.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      {filters.specialties.length} specialty{filters.specialties.length !== 1 ? 'ies' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* City Filter */}
                <CustomDropdown
                  label="Location"
                  value={filters.city}
                  options={filterOptions.cities}
                  onChange={(value) => handleFilterChange('city', value)}
                  placeholder="All Locations"
                  multiple={true}
                />

                {/* Degree Filter */}
                <CustomDropdown
                  label="Degree Type"
                  value={filters.degree}
                  options={filterOptions.degrees}
                  onChange={(value) => handleFilterChange('degree', value)}
                  placeholder="All Degrees"
                  multiple={true}
                />

                {/* Experience Range Filter */}
                <CustomDropdown
                  label="Experience"
                  value={filters.experienceRanges || []}
                  options={filterOptions.experienceRanges.map(range => range.label)}
                  onChange={(value) => {
                    if (Array.isArray(value)) {
                      // Update the experienceRanges array
                      handleFilterChange('experienceRanges', value);
                      
                      // For multi-select, we need to find the min and max across all selected ranges
                      const selectedRanges = filterOptions.experienceRanges.filter(r => value.includes(r.label));
                      if (selectedRanges.length > 0) {
                        const min = Math.min(...selectedRanges.map(r => r.min));
                        const max = Math.max(...selectedRanges.map(r => r.max));
                        handleFilterChange('experienceMin', min);
                        handleFilterChange('experienceMax', max);
                      } else {
                        handleFilterChange('experienceMin', 0);
                        handleFilterChange('experienceMax', 999);
                      }
                    }
                  }}
                  placeholder="All Experience Levels"
                  multiple={true}
                />

                {/* Specialties Filter */}
                <CustomDropdown
                  label="Specialties"
                  value={filters.specialties}
                  options={filterOptions.specialties}
                  onChange={(value) => handleFilterChange('specialties', value)}
                  placeholder="Select specialties"
                  multiple={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading advocates...</span>
            </div>
          ) : advocates.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No advocates found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search terms or clear the search to see all advocates.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Degree
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specialties
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {advocates.map((advocate, index) => (
                      <tr key={advocate.id || index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-800">
                                  {advocate.firstName[0]}{advocate.lastName[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {advocate.firstName} {advocate.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{advocate.city}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {advocate.degree}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {advocate.specialties.slice(0, 3).map((specialty, specialtyIndex) => (
                              <span
                                key={specialtyIndex}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {specialty}
                              </span>
                            ))}
                            {advocate.specialties.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                +{advocate.specialties.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {advocate.yearsOfExperience} year{advocate.yearsOfExperience !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatPhoneNumber(advocate.phoneNumber)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{((pagination.page - 1) * pagination.pageSize) + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.totalCount}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={!pagination.hasPrevPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={!pagination.hasNextPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Results Count */}
        {!loading && advocates.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {advocates.length} of {pagination.totalCount} advocate{pagination.totalCount !== 1 ? 's' : ''}
            {filters.search && ` matching "${filters.search}"`}
          </div>
        )}
      </div>
    </div>
  );
}
