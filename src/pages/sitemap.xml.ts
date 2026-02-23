import type { APIRoute } from "astro";

const canonicalOrigin = "https://climp.net";
const indexablePaths = ["/"];
const buildDate = new Date().toISOString();

const normalizePathname = (pathname: string) => {
  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
};

const toCanonicalUrl = (origin: string, path: string) => {
  const url = new URL(path, origin);
  url.pathname = normalizePathname(url.pathname);
  url.search = "";
  url.hash = "";
  return url.toString();
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin ?? canonicalOrigin;
  const entries = indexablePaths
    .map((path) => {
      const canonicalUrl = toCanonicalUrl(origin, path);
      return `  <url>
    <loc>${escapeXml(canonicalUrl)}</loc>
    <lastmod>${buildDate}</lastmod>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
