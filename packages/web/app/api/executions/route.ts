import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

// GET /api/executions - List recent executions for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const workflowId = searchParams.get("workflowId");

    const executions = await prisma.execution.findMany({
      where: {
        userId,
        ...(workflowId ? { workflowId } : {}),
      },
      include: {
        workflow: { select: { name: true } },
        logs: {
          orderBy: { createdAt: "asc" },
          take: 20,
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ executions });
  } catch (error) {
    console.error("[Executions API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
