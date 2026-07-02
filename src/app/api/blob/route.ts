import { get } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions";

export async function GET(request: NextRequest) {
  // Authenticate the request before serving the Blob.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  if (!url.includes('vercel-storage.com')) {
    // If it's a legacy external URL, redirect to it directly
    return NextResponse.redirect(url);
  }

  try {
    const result = await get(url, {
      access: "private",
    });
    
    if (result === null) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Cache-Control": "private, max-age=86400", // cache for a day securely
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error fetching private blob:", error);
    return new NextResponse("Error fetching blob", { status: 500 });
  }
}
