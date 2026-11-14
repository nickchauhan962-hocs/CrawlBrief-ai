import { NextRequest, NextResponse } from "next/server";
import { hashReportToken } from "@/lib/report/assemble";
import { getAuditReportByTokenHash } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || typeof token !== "string" || token.length < 16) {
      return NextResponse.json({ error: "Invalid report token" }, { status: 404 });
    }

    const tokenHash = hashReportToken(token);
    const report = await getAuditReportByTokenHash(tokenHash);

    if (!report) {
      return NextResponse.json(
        { error: "Report not found or has expired (reports are retained for 7 days)." },
        { status: 404 }
      );
    }

    // Do not return raw tokens or internal secrets
    const { public_token, ...safeReport } = report;

    return NextResponse.json(safeReport);
  } catch (err: any) {
    console.error("Report retrieval error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
