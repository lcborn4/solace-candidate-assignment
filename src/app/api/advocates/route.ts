import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { eq, ilike, or } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const limitCount = Math.min(pageSize, 100); // Cap at 100 items per page
  const offsetCount = (page - 1) * limitCount;

  // Uncomment this line to use a database
  // const data = await db.select().from(advocates);

  const data = advocateData;

  // Filter data based on search term
  let filteredData = data;
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    const searchKeywords = searchLower.split(' ').filter(keyword => keyword.length > 0);
    
    filteredData = data.filter((advocate) => {
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
}
