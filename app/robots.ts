import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/**
 * Answer engines have to read the page to recommend the shop, so the
 * crawlers behind ChatGPT, Perplexity, Claude, Gemini and Copilot are
 * allowed explicitly instead of relying on the wildcard.
 */
const answerEngineCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "DuckAssistBot",
  "Bingbot",
  "DuckDuckBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...answerEngineCrawlers.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
