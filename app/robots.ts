import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/dashboard/", "/api/", "/onboarding/"],
        },
        sitemap: "https://roborumble.in/sitemap.xml",
    };
}
