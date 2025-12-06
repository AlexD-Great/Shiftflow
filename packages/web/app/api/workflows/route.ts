import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const workflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  conditions: z.array(z.any()),
  actions: z.array(z.any()),
  safeAddress: z.string().optional(),
  safeNetwork: z.string().optional(),
  maxExecutions: z.number().optional(),
});

// GET /api/workflows - List user's workflows
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const workflows = await prisma.workflow.findMany({
      where: {
        userId,
        ...(status && { status: status as any }),
      },
      include: {
        _count: {
          select: { executions: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/workflows - Create new workflow
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[API] Session:', session ? 'exists' : 'null', session?.user ? `user: ${(session.user as any).id}` : 'no user');
    
    if (!session?.user) {
      console.log('[API] Unauthorized: No session or user');
      return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    console.log('[API] Creating workflow for user:', userId);
    const body = await req.json();

    // Validate input
    const validatedData = workflowSchema.parse(body);

    // Create workflow
    const workflow = await prisma.workflow.create({
      data: {
        userId,
        name: validatedData.name,
        description: validatedData.description,
        conditions: validatedData.conditions,
        actions: validatedData.actions,
        safeAddress: validatedData.safeAddress,
        safeNetwork: validatedData.safeNetwork,
        maxExecutions: validatedData.maxExecutions,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
