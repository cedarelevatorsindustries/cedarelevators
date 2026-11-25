import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  isProductInStock,
  normalizeOptionKey,
  normalizeOptionValue,
  extractVariantOptions,
  parseCatalogFiltersFromURL,
  buildCatalogFilterSearchParams,
  applyCatalogFilters,
  type CatalogFilterState,
} from "../filter-utils"
import type { Product } from "../../types/domain"

const makeProduct = (overrides: Record<string, any>): Product =>
  ({
    id: "prod-1",
    title: "Test Product",
    name: "Test Product",
    handle: "test-product",
    slug: "test-product",
    description: "Test description",
    sku: "SKU-001",
    price: 1000,
    stock_quantity: 10,
    track_inventory: true,
    allow_backorders: false,
    created_at: "2026-01-10T00:00:00Z",
    categories: [],
    subcategories: [],
    applications: [],
    variants: [],
    tags: [],
    ...overrides,
  }) as unknown as Product

const SAMPLE_PRODUCTS: Product[] = [
  makeProduct({
    id: "p-wire-05",
    title: "Wire Coil 0.5 sq mm",
    name: "Wire Coil 0.5 sq mm",
    sku: "WC-05",
    price: 1500,
    stock_quantity: 20,
    created_at: "2026-01-01T00:00:00Z",
    categories: [{ id: "cat-elec", handle: "electrical-components", name: "Electrical Components" }],
    applications: [{ id: "app-erec", slug: "erection", name: "Erection" }],
    variants: [{ id: "v1", options: { size: "0.5" }, inventory_quantity: 10, sku: "WC-05-V1" }],
  }),
  makeProduct({
    id: "p-wire-07",
    title: "Wire Coil 0.7 sq mm",
    name: "Wire Coil 0.7 sq mm",
    sku: "WC-07",
    price: 1800,
    stock_quantity: 0,
    created_at: "2026-01-05T00:00:00Z",
    categories: [{ id: "cat-elec", handle: "electrical-components", name: "Electrical Components" }],
    applications: [{ id: "app-serv", slug: "service", name: "Service" }],
    variants: [{ id: "v2", options: { Size: "0.7" }, inventory_quantity: 0, sku: "WC-07-V1" }],
  }),
  makeProduct({
    id: "p-wire-075",
    title: "Wire Coil 0.75 sq mm",
    name: "Wire Coil 0.75 sq mm",
    sku: "WC-075",
    price: 2100,
    stock_quantity: 5,
    created_at: "2026-01-10T00:00:00Z",
    categories: [{ id: "cat-elec", handle: "electrical-components", name: "Electrical Components" }],
    applications: [{ id: "app-erec", slug: "erection", name: "Erection" }],
    variants: [{ id: "v3", options: { size: "0.75" }, inventory_quantity: 5, sku: "WC-075-V1" }],
  }),
  makeProduct({
    id: "p-rope-10mm",
    title: "Steel Wire Rope 10mm",
    name: "Steel Wire Rope 10mm",
    sku: "SWR-10",
    price: null,
    stock_quantity: 0,
    track_inventory: false,
    created_at: "2026-02-01T00:00:00Z",
    categories: [{ id: "cat-mech", handle: "mechanical-components", name: "Mechanical Components" }],
    applications: [{ id: "app-erec", slug: "erection", name: "Erection" }],
    variants: [{ id: "v4", options: { Size: "10mm", Meterial: "MS" }, inventory_quantity: 0, sku: "SWR-10-MS" }],
  }),
  makeProduct({
    id: "p-guide-10-mm",
    title: "Guide Shoe Liner 10 mm",
    name: "Guide Shoe Liner 10 mm",
    sku: "GSL-10",
    price: 950,
    stock_quantity: 12,
    created_at: "2026-02-15T00:00:00Z",
    categories: [{ id: "cat-mech", handle: "mechanical-components", name: "Mechanical Components" }],
    subcategories: [{ id: "sub-guide", slug: "guide-shoes", name: "Guide Shoes" }],
    applications: [{ id: "app-test", slug: "testing", name: "Testing" }],
    variants: [{ id: "v5", options: { Size: "10 mm", Meterial: "SS" }, inventory_quantity: 12, sku: "GSL-10-SS" }],
  }),
]

const baseFilters: CatalogFilterState = {
  availability: "all",
  options: {},
  categories: [],
  subcategories: [],
  applications: [],
  sort: "featured",
  q: "",
}

describe("Cedar Elevators Filter System", () => {
  describe("isProductInStock", () => {
    it("treats untracked inventory and backorder-enabled products as in stock", () => {
      assert.equal(isProductInStock({ stock_quantity: 0, track_inventory: false }), true)
      assert.equal(isProductInStock({ stock_quantity: 0, track_inventory: true, allow_backorders: true }), true)
    })

    it("checks variant stock and product-level stock accurately", () => {
      assert.equal(isProductInStock(SAMPLE_PRODUCTS[0]), true)
      assert.equal(isProductInStock(SAMPLE_PRODUCTS[1]), false)
      assert.equal(isProductInStock({ stock_quantity: 5, track_inventory: true, variants: [] }), true)
      assert.equal(isProductInStock({ stock_quantity: 0, track_inventory: true, variants: [] }), false)
    })
  })

  describe("Option normalization & extraction", () => {
    it("normalizes option keys and unit spacing consistently without conflating 0.7 and 0.75", () => {
      assert.equal(normalizeOptionKey("size"), "Size")
      assert.equal(normalizeOptionValue("10 mm"), "10mm")
      assert.equal(normalizeOptionValue("10mm"), "10mm")
      assert.notEqual(normalizeOptionValue("0.7"), normalizeOptionValue("0.75"))
    })

    it("extracts deduplicated, naturally sorted variant options across products", () => {
      const extracted = extractVariantOptions(SAMPLE_PRODUCTS)
      assert.deepEqual(
        extracted.Size.map((o) => o.label),
        ["0.5", "0.7", "0.75", "10 mm"]
      )
      const tenMm = extracted.Size.find((o) => o.label === "10 mm")
      assert.equal(tenMm?.count, 2)
    })
  })

  describe("URL state parsing & serialization", () => {
    it("parses comma-separated and repeated params cleanly", () => {
      const params = new URLSearchParams("availability=in_stock&option_Size=0.5,0.7,0.75,10+mm&option_Size=0.5&sort=price_asc&q=+wire+")
      const parsed = parseCatalogFiltersFromURL(params)
      assert.equal(parsed.availability, "in_stock")
      assert.deepEqual(parsed.options.Size, ["0.5", "0.7", "0.75", "10 mm"])
      assert.equal(parsed.sort, "price_asc")
      assert.equal(parsed.q, "wire")
    })

    it("falls back safely on invalid availability or sort params", () => {
      const params = new URLSearchParams("availability=invalid&sort=bogus")
      const parsed = parseCatalogFiltersFromURL(params)
      assert.equal(parsed.availability, "all")
      assert.equal(parsed.sort, "featured")
    })

    it("preserves context params and resets page when updating filters", () => {
      const current = new URLSearchParams("category=electrical-components&page=3&availability=in_stock")
      const next = buildCatalogFilterSearchParams(current, {
        availability: "out_of_stock",
        options: { Size: ["0.5", "10 mm"] },
      })
      assert.equal(next.get("category"), "electrical-components")
      assert.equal(next.get("page"), null)
      assert.equal(next.get("availability"), "out_of_stock")
      assert.equal(next.get("option_Size"), "0.5,10 mm")
    })

    it("clears all filter params while preserving base context", () => {
      const current = new URLSearchParams("category=electrical-components&availability=in_stock&option_Size=0.5&sort=price_asc&page=2")
      const cleared = buildCatalogFilterSearchParams(current, {
        availability: "all",
        options: {},
        categories: [],
        subcategories: [],
        applications: [],
        sort: "featured",
      })
      assert.equal(cleared.toString(), "category=electrical-components")
    })
  })

  describe("applyCatalogFilters", () => {
    it("filters All, In Stock, and Out of Stock accurately", () => {
      assert.equal(applyCatalogFilters(SAMPLE_PRODUCTS, baseFilters).length, 5)
      const inStock = applyCatalogFilters(SAMPLE_PRODUCTS, { ...baseFilters, availability: "in_stock" })
      assert.deepEqual(inStock.map((p) => p.id), ["p-wire-05", "p-wire-075", "p-rope-10mm", "p-guide-10-mm"])
      const outOfStock = applyCatalogFilters(SAMPLE_PRODUCTS, { ...baseFilters, availability: "out_of_stock" })
      assert.deepEqual(outOfStock.map((p) => p.id), ["p-wire-07"])
    })

    it("applies OR within a size group and handles 10 mm / 10mm equivalence", () => {
      const res = applyCatalogFilters(SAMPLE_PRODUCTS, {
        ...baseFilters,
        options: { Size: ["0.5", "0.7", "0.75", "10 mm"] },
      })
      assert.equal(res.length, 5)

      const only07 = applyCatalogFilters(SAMPLE_PRODUCTS, {
        ...baseFilters,
        options: { Size: ["0.7"] },
      })
      assert.deepEqual(only07.map((p) => p.id), ["p-wire-07"])
    })

    it("applies AND across different filter groups (Availability + Size + Category + Application + Search)", () => {
      const combined = applyCatalogFilters(SAMPLE_PRODUCTS, {
        ...baseFilters,
        availability: "in_stock",
        options: { Size: ["0.5", "0.7", "0.75", "10 mm"] },
        categories: ["cat-elec"],
        applications: ["app-erec"],
        q: "WC-075",
      })
      assert.deepEqual(combined.map((p) => p.id), ["p-wire-075"])
    })

    it("filters by subcategory and returns empty array for non-matching combinations", () => {
      const subRes = applyCatalogFilters(SAMPLE_PRODUCTS, {
        ...baseFilters,
        subcategories: ["sub-guide"],
      })
      assert.deepEqual(subRes.map((p) => p.id), ["p-guide-10-mm"])

      const emptyRes = applyCatalogFilters(SAMPLE_PRODUCTS, {
        ...baseFilters,
        availability: "out_of_stock",
        categories: ["cat-mech"],
      })
      assert.deepEqual(emptyRes, [])
    })

    it("sorts by price ascending/descending with null prices placed at the end", () => {
      const asc = applyCatalogFilters(SAMPLE_PRODUCTS, { ...baseFilters, sort: "price_asc" })
      assert.deepEqual(asc.map((p) => p.id), [
        "p-guide-10-mm",
        "p-wire-05",
        "p-wire-07",
        "p-wire-075",
        "p-rope-10mm",
      ])

      const desc = applyCatalogFilters(SAMPLE_PRODUCTS, { ...baseFilters, sort: "price_desc" })
      assert.deepEqual(desc.map((p) => p.id), [
        "p-wire-075",
        "p-wire-07",
        "p-wire-05",
        "p-guide-10-mm",
        "p-rope-10mm",
      ])
    })

    it("sorts alphabetically and by newest/oldest", () => {
      const nameAsc = applyCatalogFilters(SAMPLE_PRODUCTS, { ...baseFilters, sort: "name_asc" })
      assert.equal(nameAsc[0].id, "p-guide-10-mm")
      const newest = applyCatalogFilters(SAMPLE_PRODUCTS, { ...baseFilters, sort: "newest" })
      assert.equal(newest[0].id, "p-guide-10-mm")
      const oldest = applyCatalogFilters(SAMPLE_PRODUCTS, { ...baseFilters, sort: "oldest" })
      assert.equal(oldest[0].id, "p-wire-05")
    })
  })
})
