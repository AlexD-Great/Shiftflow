import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

const SIDESHIFT_API_BASE = "https://sideshift.ai/api/v2";
const SIDESHIFT_SECRET = process.env.SIDESHIFT_SECRET;
const AFFILIATE_ID = process.env.SIDESHIFT_AFFILIATE_ID;

// POST /api/sideshift/quote - Request a quote (proxy)
// CRITICAL: This endpoint implements Mike's requirement to pass x-user-ip header
export async function POST(req: NextRequest) {
  try {
    // Check if SideShift credentials are configured
    if (!SIDESHIFT_SECRET) {
      console.error("[SideShift Quote] SIDESHIFT_SECRET not configured");
      return NextResponse.json(
        { error: "SideShift API not configured. Please add SIDESHIFT_SECRET to environment variables." },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Get user's IP address - CRITICAL for Mike's requirement
    // This extracts the real user IP from the forwarded headers
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const userIp = forwardedFor?.split(",")[0] || realIp || "unknown";

    console.log(`[SideShift Quote] Requesting quote for user IP: ${userIp}`);

    // Make request to SideShift API with x-user-ip header
    const response = await fetch(`${SIDESHIFT_API_BASE}/quotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sideshift-secret": SIDESHIFT_SECRET,
        "x-user-ip": userIp, // CRITICAL: Pass user's IP to SideShift
      },
      body: JSON.stringify({
        ...body,
        ...(AFFILIATE_ID && { affiliateId: AFFILIATE_ID }), // Include affiliate ID if configured
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[SideShift Quote] API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "SideShift API error" },
        { status: response.status }
      );
    }

    console.log(`[SideShift Quote] Success - Quote ID: ${data.id}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[SideShift Quote] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
