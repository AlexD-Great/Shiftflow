import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const guestWorkflowSchema = z.object({
  sessionId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  conditions: z.array(z.any()),
  actions: z.array(z.any()),
});

// POST /api/guest-workflows - Save guest workflow
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = guestWorkflowSchema.parse(body);
    
    // Get user agent and IP
    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = req.headers.get("x-forwarded-for") || 
                      req.headers.get("x-real-ip") || 
                      undefined;
    
    // Save guest workflow
    const guestWorkflow = await prisma.guestWorkflow.create({
      data: {
        sessionId: validatedData.sessionId,
        name: validatedData.name,
        description: validatedData.description,
        conditions: validatedData.conditions,
        actions: validatedData.actions,
        userAgent,
        ipAddress,
      },
    });
    
    return NextResponse.json({ 
      success: true,
      guestWorkflow 
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error saving guest workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/guest-workflows - List all guest workflows (admin only)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    const guestWorkflows = await prisma.guestWorkflow.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
    
    const total = await prisma.guestWorkflow.count();
    
    return NextResponse.json({ 
      guestWorkflows,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error("Error fetching guest workflows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
