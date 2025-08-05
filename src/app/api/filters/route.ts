import { advocateData } from "../../../db/seed/advocates";

export async function GET() {
  try {
    const cities = [...new Set(advocateData.map(advocate => advocate.city))].sort();
    const degrees = [...new Set(advocateData.map(advocate => advocate.degree))].sort();
    const experienceRanges = [
      { label: "0-5 years", min: 0, max: 5 },
      { label: "6-10 years", min: 6, max: 10 },
      { label: "11-15 years", min: 11, max: 15 },
      { label: "16+ years", min: 16, max: 999 }
    ];
    const allSpecialties = advocateData.flatMap(advocate => advocate.specialties);
    const specialties = [...new Set(allSpecialties)].sort();

    return Response.json({
      cities,
      degrees,
      experienceRanges,
      specialties
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return Response.json({ error: "Failed to fetch filter options" }, { status: 500 });
  }
} 