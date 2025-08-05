import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

interface DatabaseWithInsert {
  insert: (table: any) => {
    values: (data: any[]) => {
      returning: () => Promise<any[]>;
    };
  };
}

export async function POST() {
  try {
    // Check if database is available (has insert method)
    if ('insert' in db && typeof (db as DatabaseWithInsert).insert === 'function') {
      const records = await (db as DatabaseWithInsert).insert(advocates).values(advocateData).returning();
      return Response.json({ advocates: records });
    } else {
      // Database not available, return mock data
      return Response.json({ advocates: advocateData });
    }
  } catch (error) {
    console.error("Error seeding database:", error);
    // Return mock data on error
    return Response.json({ advocates: advocateData });
  }
}
