import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/login", "/register", "/profile"],
    },
    sitemap: "https://rentalmobildisemarang.com/sitemap.xml",
  };
}
