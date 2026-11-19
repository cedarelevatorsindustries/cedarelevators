import fs from 'fs';

const filePath = 'backups/cedar_complete_schema.sql';
let sql = fs.readFileSync(filePath, 'utf8');

// 1. Remove dummy table definitions for the 4 views
const views = ['cart_items_detailed', 'checkout_analytics', 'low_stock_products', 'out_of_stock_products'];

views.forEach(v => {
  const dummyTableRegex = new RegExp('-- Table: public\\.' + v + '[\\s\\S]*?\\);\\n*', 'g');
  sql = sql.replace(dummyTableRegex, '');
});

// 2. Remove invalid ALTER TABLE ... ENABLE ROW LEVEL SECURITY on views
views.forEach(v => {
  const rlsRegex = new RegExp('ALTER TABLE public\\."' + v + '" ENABLE ROW LEVEL SECURITY;\\n*', 'g');
  sql = sql.replace(rlsRegex, '');
});

// 3. Define the real SQL view definitions
const viewDefinitions = `
-- -----------------------------------------------------------------------------
-- 4.2 DATABASE VIEWS
-- -----------------------------------------------------------------------------

-- View: public.cart_items_detailed
CREATE OR REPLACE VIEW public.cart_items_detailed AS
 SELECT ci.id,
    ci.cart_id,
    ci.product_id,
    ci.variant_id,
    ci.quantity,
    ci.unit_price,
    p.name AS product_name,
    p.slug AS product_slug,
    pv.name AS variant_name,
    pv.sku
   FROM ((public.cart_items ci
     JOIN public.products p ON ((ci.product_id = p.id)))
     LEFT JOIN public.product_variants pv ON ((ci.variant_id = pv.id)));

-- View: public.checkout_analytics
CREATE OR REPLACE VIEW public.checkout_analytics AS
 SELECT date_trunc('day'::text, started_at) AS date,
    source,
    count(*) AS total_sessions,
    count(completed_at) AS completed_sessions,
    count(abandoned_at) AS abandoned_sessions,
    round((((count(completed_at))::numeric / (NULLIF(count(*), 0))::numeric) * (100)::numeric), 2) AS conversion_rate,
    avg(EXTRACT(epoch FROM (COALESCE(completed_at, abandoned_at, now()) - started_at))) AS avg_duration_seconds
   FROM public.checkout_sessions
  GROUP BY (date_trunc('day'::text, started_at)), source
  ORDER BY (date_trunc('day'::text, started_at)) DESC;

-- View: public.low_stock_products
CREATE OR REPLACE VIEW public.low_stock_products AS
 SELECT p.id,
    p.name,
    p.sku,
    pv.id AS variant_id,
    pv.name AS variant_name,
    pv.inventory_quantity,
    10 AS low_stock_threshold
   FROM (public.products p
     JOIN public.product_variants pv ON ((p.id = pv.product_id)))
  WHERE ((pv.inventory_quantity <= 10) AND (pv.inventory_quantity > 0));

-- View: public.out_of_stock_products
CREATE OR REPLACE VIEW public.out_of_stock_products AS
 SELECT p.id,
    p.name,
    p.sku,
    pv.id AS variant_id,
    pv.name AS variant_name,
    pv.inventory_quantity
   FROM (public.products p
     JOIN public.product_variants pv ON ((p.id = pv.product_id)))
  WHERE ((pv.inventory_quantity = 0) OR (pv.inventory_quantity IS NULL));

`;

// Insert the views section right before "-- 5. FOREIGN KEY CONSTRAINTS" or right after section 4
const insertMarker = '-- -----------------------------------------------------------------------------\n-- 5. FOREIGN KEY CONSTRAINTS';
if (sql.includes(insertMarker)) {
  sql = sql.replace(insertMarker, viewDefinitions + insertMarker);
} else {
  sql += viewDefinitions;
}

// Update the header comments to accurately specify 73 base tables, 4 views
sql = sql.replace(
  'Includes: Extensions, Enums, Sequences, Tables, Constraints, Indexes,',
  'Includes: Extensions, Enums, Sequences, 73 Base Tables, 4 Views, Constraints, Indexes,'
);

fs.writeFileSync(filePath, sql, 'utf8');
console.log('Successfully refined cedar_complete_schema.sql!');

// Also mirror to brain directory
const brainSchema = 'C:/Users/manikandan/.gemini/antigravity/brain/07104594-f5c2-499b-8c4f-a5cfb47e7956/backups/cedar_complete_schema.sql';
if (fs.existsSync(brainSchema)) {
  fs.writeFileSync(brainSchema, sql, 'utf8');
  console.log('Successfully mirrored to brain backups directory!');
}
