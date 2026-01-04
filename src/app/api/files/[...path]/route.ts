import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// Get the upload directory - uses env var in production, falls back to public/uploads locally
function getUploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
}

// MIME types for images
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

// GET /api/files/[...path] - Serve uploaded files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = pathSegments.join("/");

    // Validate path - prevent directory traversal
    if (filePath.includes("..") || filePath.startsWith("/")) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }

    // Build full file path
    const uploadDir = getUploadDir();
    const fullPath = path.join(uploadDir, filePath);

    // Security check: ensure the resolved path is within upload directory
    const resolvedPath = path.resolve(fullPath);
    const resolvedUploadDir = path.resolve(uploadDir);

    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }

    // Check file exists and get stats
    try {
      const stats = await stat(fullPath);
      if (!stats.isFile()) {
        return NextResponse.json(
          { error: "Not found" },
          { status: 404 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    // Get MIME type
    const ext = path.extname(fullPath).toLowerCase();
    const mimeType = MIME_TYPES[ext];

    if (!mimeType) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    // Read and return file
    const fileBuffer = await readFile(fullPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
