import type { APIRoute } from "astro";

const canonicalOrigin = "https://climp.net";
const nonProductionRobots = `User-agent: *
Disallow: /
`;

const buildProductionRobots = (origin: string) => `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${origin}/sitemap.xml
`;

export const GET: APIRoute = ({ site }) => {
  const isProduction = import.meta.env.VERCEL_ENV === "production";
  const origin = site?.origin ?? canonicalOrigin;
  const body = isProduction
    ? buildProductionRobots(origin)
    : nonProductionRobots;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
