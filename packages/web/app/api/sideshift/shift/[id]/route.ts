import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

const SIDESHIFT_API_BASE = "https://sideshift.ai/api/v2";

// GET /api/sideshift/shift/:id - Get shift status (proxy)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log(`[SideShift Status] Fetching shift ${id}`);

    const response = await fetch(`${SIDESHIFT_API_BASE}/shifts/${id}`);
    const data = await response.json();

    if (!response.ok) {
      console.error("[SideShift Status] API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "SideShift API error" },
        { status: response.status }
      );
    }

    // Update shift status in database
    try {
      await prisma.sideShiftOrder.updateMany({
        where: { shiftId: id },
        data: {
          status: data.status,
          depositHash: data.deposits?.[0]?.depositHash,
          settleHash: data.deposits?.[0]?.settleHash,
          updatedAt: new Date(),
        },
      });
      console.log(`[SideShift Status] Updated shift ${id} status: ${data.status}`);
    } catch (dbError) {
      console.error("[SideShift Status] Database error:", dbError);
      // Don't fail the request if DB update fails
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[SideShift Status] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
