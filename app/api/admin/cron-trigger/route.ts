import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  if (userRole !== "SUPER_ADMIN" && userRole !== "FRANCHISE_OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { type } = await request.json();

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured on server" },
      { status: 500 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  let endpoint: string;
  if (type === "recap") {
    endpoint = `${baseUrl}/api/cron/weekly-recap`;
  } else if (type === "generate") {
    endpoint = `${baseUrl}/api/cron/weekly-generate`;
  } else {
    return NextResponse.json({ error: "Invalid cron type" }, { status: 400 });
  }

  const cronResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  });

  const data = await cronResponse.json().catch(() => ({}));
  return NextResponse.json(data, { status: cronResponse.status });
}
