import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const analyticsSchema = z.object({
  eventType: z.enum(['preview_generated', 'guest_saved', 'workflow_created', 'builder_visited']),
  workflowData: z.any(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

// POST /api/analytics - Track analytics event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = analyticsSchema.parse(body);
    
    // Get user agent and IP
    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = req.headers.get("x-forwarded-for") || 
                      req.headers.get("x-real-ip") || 
                      undefined;
    
    // Save analytics event
    const analytics = await prisma.workflowAnalytics.create({
      data: {
        eventType: validatedData.eventType,
        workflowData: validatedData.workflowData,
        sessionId: validatedData.sessionId,
        userId: validatedData.userId,
        userAgent,
        ipAddress,
      },
    });
    
    return NextResponse.json({ 
      success: true,
      analytics 
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error tracking analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/analytics - Get analytics data (admin only)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get("eventType");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    const analytics = await prisma.workflowAnalytics.findMany({
      where: eventType ? { eventType } : undefined,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
    
    const total = await prisma.workflowAnalytics.count({
      where: eventType ? { eventType } : undefined,
    });
    
    // Get summary stats
    const stats = await prisma.workflowAnalytics.groupBy({
      by: ['eventType'],
      _count: {
        id: true,
      },
    });
    
    return NextResponse.json({ 
      analytics,
      total,
      limit,
      offset,
      stats: stats.map(s => ({
        eventType: s.eventType,
        count: s._count.id,
      })),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
