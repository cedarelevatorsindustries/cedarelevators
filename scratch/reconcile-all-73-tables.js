import fs from 'fs';

const part1 = {"admin_invites":0,"admin_profiles":1,"admin_settings":1,"admin_users":1,"application_categories":7,"applications":3,"banner_slides":0,"banners":0,"business_addresses":0,"business_documents":0,"business_members":7,"business_verification_documents":2,"business_verifications":4,"businesses":7,"cart_items":2,"carts":11,"categories":3,"category_subcategories":15,"checkout_sessions":0,"collections":4,"customer_meta":0,"customer_notes":0,"documents":0,"elevator_types":7,"inventory_adjustments":0,"inventory_items":96,"order_audit_log":0,"order_items":17,"orders":9,"payment_settings":1,"payment_transactions":0,"pickup_locations":1,"policies":4,"pricing_settings":1,"product_applications":99,"product_categories":78,"product_collections":30,"product_elevator_types":150,"product_reviews":0,"product_subcategories":36};

const part2 = {"product_types":0,"product_variants":96,"products":78,"profiles":0,"quote_admin_responses":0,"quote_attachments":1,"quote_audit_log":3,"quote_baskets":0,"quote_counters":10,"quote_items":5,"quotes":5,"recently_viewed":0,"shipping_settings":1,"store_settings":1,"subcategories":13,"system_settings":1,"tax_settings":1,"user_addresses":4,"user_favourites":0,"user_profiles":16,"users":11,"verification_audit_log":0,"verification_documents":0,"warranty_claim_steps":3,"warranty_coverage":3,"warranty_hero":1,"warranty_period":1,"why_choose_cta":1,"why_choose_hero":1,"why_choose_items":3,"why_choose_stats":3,"wishlist_items":4,"wishlists":5};

const liveCounts = { ...part1, ...part2 };
console.log('Total live base tables:', Object.keys(liveCounts).length);

let totalLiveRows = 0;
for (const [tbl, cnt] of Object.entries(liveCounts)) {
  totalLiveRows += cnt;
}
console.log('Total live rows across all 73 tables:', totalLiveRows);

// Check cedar_data_dump.json
const dump = JSON.parse(fs.readFileSync('backups/cedar_data_dump.json', 'utf8'));

// Ensure documents, payment_transactions, profiles are explicitly in dump as []
if (!dump.hasOwnProperty('documents')) dump.documents = [];
if (!dump.hasOwnProperty('payment_transactions')) dump.payment_transactions = [];
if (!dump.hasOwnProperty('profiles')) dump.profiles = [];

// Re-save cedar_data_dump.json so it explicitly contains all 73 tables
fs.writeFileSync('backups/cedar_data_dump.json', JSON.stringify(dump, null, 2));

// Also check brain backup directory if exists
const brainDir = 'C:/Users/manikandan/.gemini/antigravity/brain/07104594-f5c2-499b-8c4f-a5cfb47e7956/backups';
if (fs.existsSync(brainDir)) {
  const brainDumpPath = brainDir + '/cedar_data_dump.json';
  fs.writeFileSync(brainDumpPath, JSON.stringify(dump, null, 2));
}

let totalDumpRows = 0;
let mismatches = [];

for (const [tbl, expectedCnt] of Object.entries(liveCounts)) {
  const actualRows = dump[tbl] || [];
  const actualCnt = actualRows.length;
  totalDumpRows += actualCnt;
  if (expectedCnt !== actualCnt) {
    mismatches.push({ table: tbl, live: expectedCnt, dump: actualCnt });
  }
}

console.log('Total tables in dump now:', Object.keys(dump).length);
console.log('Total rows in dump now:', totalDumpRows);
console.log('Mismatches count:', mismatches.length);
if (mismatches.length > 0) {
  console.log('Mismatches:', mismatches);
} else {
  console.log('PERFECT 100% RECONCILIATION: All 73 tables match production row counts exactly!');
}
