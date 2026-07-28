import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions";

// Client-side uploads bypass the server-action body limit (1MB by default, and a hard
// 4.5MB request cap on Vercel), which is what makes demo videos possible at all.
const MAX_BYTES = 50 * 1024 * 1024;

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // The token is only minted for a signed-in user; without this any caller
        // could upload to the store.
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        return {
          allowedContentTypes: ALLOWED,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },
      onUploadCompleted: async () => {
        // The URL is persisted by the form action that triggered the upload.
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 400 }
    );
  }
}
