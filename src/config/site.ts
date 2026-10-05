import type { ImageMetadata } from "astro";

export const siteConfig = {
  brandName: "Lumavia Stone",
  siteUrl: "https://lumaviastone.com",
  tagline: "Natural Stone & Garden Sculpture",
  description: "Natural stone products, garden sculpture, and custom stone carving crafted in Quyang, China.",
  emails: {
    info: "info@lumaviastone.com",
    studio: "lumaviastone@gmail.com",
  },
  // No suitable brand-neutral asset yet. Set an imported image or public image path when available.
  defaultSocialImage: undefined as ImageMetadata | string | undefined,
  contactPath: "/about/#studio",
  navigation: [
    { href: "/", label: "Home" },
    { href: "/catalog/", label: "Catalogue" },
    { href: "/about/", label: "About" },
  ],
} as const;
