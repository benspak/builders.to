import { NextRequest, NextResponse } from "next/server";
import {
  isExternalPreviewUrl,
  getExternalSource,
  LinkPreviewData,
  ExternalSource,
} from "@/lib/link-preview";

export const runtime = "nodejs";

// Allowed domains for external preview
const ALLOWED_DOMAINS = [
  "producthunt.com",
  "www.producthunt.com",
  "reddit.com",
  "www.reddit.com",
  "old.reddit.com",
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com",
];

/**
 * GET /api/link-preview-external?url=https://...
 * Fetches Open Graph metadata from external URLs
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json(
      { error: "Invalid URL" },
      { status: 400 }
    );
  }

  // Check if domain is allowed
  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    return NextResponse.json(
      { error: "Domain not supported for preview" },
      { status: 400 }
    );
  }

  if (!isExternalPreviewUrl(url)) {
    return NextResponse.json(
      { error: "URL not supported for preview" },
      { status: 400 }
    );
  }

  try {
    const source = getExternalSource(url);
    if (!source) {
      return NextResponse.json(
        { error: "Unknown source" },
        { status: 400 }
      );
    }

    const previewData = await fetchOpenGraphData(url, source);

    if (!previewData) {
      return NextResponse.json(
        { error: "Could not fetch preview data" },
        { status: 404 }
      );
    }

    return NextResponse.json(previewData, {
      headers: {
        // Cache for 10 minutes for external content
        "Cache-Control": "public, max-age=600, s-maxage=600",
      },
    });
  } catch (error) {
    console.error("Error fetching external link preview:", error);
    return NextResponse.json(
      { error: "Failed to fetch preview" },
      { status: 500 }
    );
  }
}

/**
 * Fetches and parses Open Graph metadata from a URL
 */
async function fetchOpenGraphData(
  url: string,
  source: ExternalSource
): Promise<LinkPreviewData | null> {
  try {
    // Fetch the HTML with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Builders.to/1.0; +https://builders.to)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Parse Open Graph and Twitter Card metadata
    const ogData = parseOpenGraphTags(html);

    if (!ogData.title) {
      // Try to get title from <title> tag
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        ogData.title = decodeHtmlEntities(titleMatch[1].trim());
      }
    }

    if (!ogData.title) {
      return null;
    }

    // Build the preview data
    const previewData: LinkPreviewData = {
      url,
      type: source,
      title: ogData.title,
      description: ogData.description,
      image: ogData.image,
      siteName: ogData.siteName || getSiteNameFromSource(source),
      favicon: getFaviconUrl(url, source),
    };

    // Add source-specific metadata
    if (source === "reddit" && ogData.subreddit) {
      previewData.meta = {
        subreddit: ogData.subreddit,
      };
    }

    if (source === "x" && ogData.author) {
      previewData.author = {
        name: ogData.author,
        image: ogData.authorImage,
      };
    }

    if (source === "producthunt") {
      // Product Hunt often includes upvote count in description or we can extract from page
      if (ogData.upvotes) {
        previewData.stats = {
          upvotes: ogData.upvotes,
        };
      }
    }

    return previewData;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error(`Timeout fetching ${url}`);
    } else {
      console.error(`Error fetching ${url}:`, error);
    }
    return null;
  }
}

interface ParsedOGData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  author?: string;
  authorImage?: string;
  subreddit?: string;
  upvotes?: number;
}

/**
 * Parses Open Graph and Twitter Card meta tags from HTML
 */
function parseOpenGraphTags(html: string): ParsedOGData {
  const data: ParsedOGData = {};

  // Open Graph tags
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  if (ogTitleMatch) {
    data.title = decodeHtmlEntities(ogTitleMatch[1]);
  }

  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
  if (ogDescMatch) {
    data.description = decodeHtmlEntities(ogDescMatch[1]);
  }

  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (ogImageMatch) {
    data.image = ogImageMatch[1];
  }

  const ogSiteMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i);
  if (ogSiteMatch) {
    data.siteName = decodeHtmlEntities(ogSiteMatch[1]);
  }

  // Twitter Card tags (fallback)
  if (!data.title) {
    const twitterTitleMatch = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:title["']/i);
    if (twitterTitleMatch) {
      data.title = decodeHtmlEntities(twitterTitleMatch[1]);
    }
  }

  if (!data.description) {
    const twitterDescMatch = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:description["']/i);
    if (twitterDescMatch) {
      data.description = decodeHtmlEntities(twitterDescMatch[1]);
    }
  }

  if (!data.image) {
    const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
    if (twitterImageMatch) {
      data.image = twitterImageMatch[1];
    }
  }

  // Twitter/X author
  const twitterCreatorMatch = html.match(/<meta[^>]*name=["']twitter:creator["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:creator["']/i);
  if (twitterCreatorMatch) {
    data.author = twitterCreatorMatch[1].replace("@", "");
  }

  // Meta description fallback
  if (!data.description) {
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    if (metaDescMatch) {
      data.description = decodeHtmlEntities(metaDescMatch[1]);
    }
  }

  return data;
}

/**
 * Decodes HTML entities in a string
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x27;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
    "&#x2F;": "/",
    "&#47;": "/",
  };

  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, "gi"), char);
  }

  // Handle numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (_, num) =>
    String.fromCharCode(parseInt(num, 10))
  );
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  return decoded;
}

/**
 * Gets the site name from the source type
 */
function getSiteNameFromSource(source: ExternalSource): string {
  switch (source) {
    case "producthunt":
      return "Product Hunt";
    case "reddit":
      return "Reddit";
    case "x":
      return "X";
    default:
      return "";
  }
}

/**
 * Gets the favicon URL for a source
 */
function getFaviconUrl(url: string, source: ExternalSource): string {
  switch (source) {
    case "producthunt":
      return "https://ph-static.imgix.net/ph-ios-icon.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=32&h=32";
    case "reddit":
      return "https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png";
    case "x":
      return "https://abs.twimg.com/responsive-web/client-web/icon-ios.77d25eba.png";
    default:
      try {
        const urlObj = new URL(url);
        return `${urlObj.origin}/favicon.ico`;
      } catch {
        return "";
      }
  }
}
