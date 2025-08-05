import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { eq, ilike, or } from "drizzle-orm";

// Constants to replace magic numbers
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE = 1;
const MAX_EXPERIENCE = 999;
const MIN_EXPERIENCE = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const city = searchParams.get('city')?.split(',').filter(s => s) || [];
    const degree = searchParams.get('degree')?.split(',').filter(s => s) || [];
    const experienceMin = parseInt(searchParams.get('experienceMin') || MIN_EXPERIENCE.toString());
    const experienceMax = parseInt(searchParams.get('experienceMax') || MAX_EXPERIENCE.toString());
    const specialties = searchParams.get('specialties')?.split(',').filter(s => s) || [];
    const page = Math.max(parseInt(searchParams.get('page') || DEFAULT_PAGE.toString()), 1);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE.toString()), MAX_PAGE_SIZE);
    const limitCount = pageSize;
    const offsetCount = (page - 1) * limitCount;

    // Uncomment this line to use a database
    // const data = await db.select().from(advocates);

    const data = advocateData;

    // Filter data based on all criteria
    let filteredData = data;

    // Text search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchKeywords = searchLower.split(' ').filter(keyword => keyword.length > 0);

      filteredData = filteredData.filter((advocate) => {
        // Create a searchable text from all fields
        const searchableText = `${advocate.firstName} ${advocate.lastName} ${advocate.city} ${advocate.degree} ${advocate.yearsOfExperience} ${advocate.specialties.join(' ')}`.toLowerCase();

        // If multiple keywords, check if ALL keywords are found
        if (searchKeywords.length > 1) {
          return searchKeywords.every(keyword => searchableText.includes(keyword));
        }

        // Single keyword search - check all fields
        return (
          advocate.firstName.toLowerCase().includes(searchLower) ||
          advocate.lastName.toLowerCase().includes(searchLower) ||
          advocate.city.toLowerCase().includes(searchLower) ||
          advocate.degree.toLowerCase().includes(searchLower) ||
          advocate.specialties.some((specialty: string) =>
            specialty.toLowerCase().includes(searchLower)
          ) ||
          advocate.yearsOfExperience.toString().includes(searchTerm)
        );
      });
    }

    // City filter
    if (city.length > 0) {
      filteredData = filteredData.filter(advocate => city.includes(advocate.city));
    }

    // Degree filter
    if (degree.length > 0) {
      filteredData = filteredData.filter(advocate => degree.includes(advocate.degree));
    }

    // Experience range filter
    if (experienceMin > MIN_EXPERIENCE || experienceMax < MAX_EXPERIENCE) {
      filteredData = filteredData.filter(advocate =>
        advocate.yearsOfExperience >= experienceMin && advocate.yearsOfExperience <= experienceMax
      );
    }

    // Specialties filter
    if (specialties.length > 0) {
      filteredData = filteredData.filter(advocate =>
        specialties.some(specialty => advocate.specialties.includes(specialty))
      );
    }

    // Apply pagination
    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / limitCount);
    const paginatedData = filteredData.slice(offsetCount, offsetCount + limitCount);

    return Response.json({
      data: paginatedData,
      pagination: {
        page,
        pageSize: limitCount,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching advocates:", error);
    return Response.json({ error: "Failed to fetch advocates" }, { status: 500 });
  }
}
