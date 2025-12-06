import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

const SIDESHIFT_API_BASE = "https://sideshift.ai/api/v2";
const SIDESHIFT_SECRET = process.env.SIDESHIFT_SECRET!;
const AFFILIATE_ID = process.env.AFFILIATE_ID!;

// POST /api/sideshift/shift/fixed - Create fixed shift (proxy)
// CRITICAL: This endpoint implements Mike's requirement to pass x-user-ip header
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const userId = (session.user as any).id;
    
    // Get user's IP address - CRITICAL for Mike's requirement
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const userIp = forwardedFor?.split(",")[0] || realIp || "unknown";

    console.log(`[SideShift Fixed] Creating fixed shift for user IP: ${userIp}`);

    // Make request to SideShift API with x-user-ip header
    const response = await fetch(`${SIDESHIFT_API_BASE}/shifts/fixed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sideshift-secret": SIDESHIFT_SECRET,
        "x-user-ip": userIp, // CRITICAL: Pass user's IP to SideShift
      },
      body: JSON.stringify({
        ...body,
        affiliateId: AFFILIATE_ID,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[SideShift Fixed] API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "SideShift API error" },
        { status: response.status }
      );
    }

    // Store shift in database for tracking
    try {
      await prisma.sideShiftOrder.create({
        data: {
          userId,
          shiftId: data.id,
          quoteId: body.quoteId,
          status: data.status || "pending",
          depositCoin: data.depositCoin,
          depositNetwork: data.depositNetwork,
          depositAmount: data.depositAmount,
          depositAddress: data.depositAddress,
          settleCoin: data.settleCoin,
          settleNetwork: data.settleNetwork,
          settleAmount: data.settleAmount,
          settleAddress: data.settleAddress,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        },
      });
      console.log(`[SideShift Fixed] Stored shift ${data.id} in database`);
    } catch (dbError) {
      console.error("[SideShift Fixed] Database error:", dbError);
      // Don't fail the request if DB storage fails
    }

    console.log(`[SideShift Fixed] Success - Shift ID: ${data.id}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[SideShift Fixed] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
