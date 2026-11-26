
import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);

    return Response.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Health Check] Database connection failed:", error);

    return Response.json(
      {
        status: "error",
        database: "disconnected",
      },
      { status: 503 }
    );
  }
}
