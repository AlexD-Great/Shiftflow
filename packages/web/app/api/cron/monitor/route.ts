import { NextRequest, NextResponse } from "next/server";
import { WorkflowMonitor } from "@/lib/services/workflow-monitor";

/**
 * Cron job endpoint for monitoring workflows
 * Called by Vercel Cron every minute
 * 
 * IMPORTANT: Protected by CRON_SECRET to prevent unauthorized access
 */
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    console.error("[Cron] Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  console.log("[Cron] Starting workflow monitor...");

  try {
    const monitor = new WorkflowMonitor();
    await monitor.checkAllWorkflows();

    const duration = Date.now() - startTime;
    console.log(`[Cron] Workflow monitor completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error("[Cron] Workflow monitor error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering (with same auth)
export async function POST(req: NextRequest) {
  return GET(req);
}
