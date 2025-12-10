import { NextRequest, NextResponse } from "next/server";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

// GET /api/prices?ids=bitcoin,ethereum - Fetch prices from CoinGecko (proxy)
// This endpoint proxies CoinGecko API calls to avoid CORS issues
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids");

    if (!ids) {
      return NextResponse.json(
        { error: "Missing 'ids' parameter. Example: ?ids=bitcoin,ethereum" },
        { status: 400 }
      );
    }

    console.log(`[Price API] Fetching prices for: ${ids}`);

    // Make request to CoinGecko API
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          "Accept": "application/json",
        },
        // Cache for 30 seconds to avoid rate limiting
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      console.error("[Price API] CoinGecko error:", response.status);
      return NextResponse.json(
        { error: "Failed to fetch prices from CoinGecko" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[Price API] Success - Fetched ${Object.keys(data).length} prices`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Price API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
