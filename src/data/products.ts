import { getCollection, type CollectionEntry } from "astro:content";

type ProductEntry = CollectionEntry<"products">;
export type Product = ProductEntry["data"] & { slug: string; entry: ProductEntry };
type ProductIdentity = Pick<Product, "name" | "sku">;

function slugFromEntry(entry: ProductEntry): string {
  return entry.id.replace(/\.(md|mdx)$/, "");
}

function byOrderThenName(a: Product, b: Product): number {
  return a.order - b.order || a.name.localeCompare(b.name);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function skuSuffixPattern(sku: string): RegExp {
  const flexibleSku = sku
    .split("-")
    .map(escapeRegExp)
    .join("[\\s-]*");

  return new RegExp("(?:\\s*[-–—|/]\\s*)?" + flexibleSku + "\\s*$", "i");
}

function comparableProductText(value: string, product: ProductIdentity): string {
  return value
    .trim()
    .replace(/[.!?…,:;]+$/g, "")
    .trim()
    .replace(skuSuffixPattern(product.sku), "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export async function getProducts(): Promise<Product[]> {
  const entries = await getCollection("products", ({ data }) => data.published);
  return entries
    .map((entry: ProductEntry) => ({
      slug: slugFromEntry(entry),
      entry,
      ...entry.data,
    }))
    .sort(byOrderThenName);
}

export function getRelated(products: Product[], slug: string, limit = 3): Product[] {
  const current = products.find((product) => product.slug === slug);
  if (!current) return products.slice(0, limit);

  return products
    .filter((product) => product.slug !== slug)
    .sort((a, b) => {
      const aScore = a.category === current.category ? -1 : 1;
      const bScore = b.category === current.category ? -1 : 1;
      return aScore - bScore || byOrderThenName(a, b);
    })
    .slice(0, limit);
}

export function getProductFilters(products: Product[]): {
  categories: string[];
} {
  return {
    categories: [...new Set(products.map((product) => product.category))],
  };
}

export function productDisplayName(product: ProductIdentity): string {
  const displayName = product.name.replace(skuSuffixPattern(product.sku), "").trim();
  return displayName || product.name.trim();
}

export function hasMeaningfulProductDescription(
  product: ProductIdentity,
  value: string | undefined,
): boolean {
  if (!value?.trim()) return false;

  return (
    comparableProductText(value, product) !==
    comparableProductText(productDisplayName(product), product)
  );
}

export function hasDistinctProductSubcategory(
  product: ProductIdentity & { subcategory?: string },
): boolean {
  if (!product.subcategory?.trim()) return false;
  const normalize = (value: string) =>
    comparableProductText(value, product)
      .replace(/\b(statue|planter|sphere|fountain|sculpture|column|fireplace|bath)s\b/g, "$1")
      .replace(/\bbenches\b/g, "bench");
  return normalize(product.subcategory) !== normalize(productDisplayName(product));
}

/** Keep unverified values in content, but do not present them as specifications. */
export function confirmedValue(value: string | undefined): string | undefined {
  return value && value.trim().toLowerCase() !== "to be confirmed" ? value : undefined;
}
