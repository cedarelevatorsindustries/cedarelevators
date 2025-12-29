#!/usr/bin/env node

/**
 * Cedar Interconnection Logic - Migration Script
 * 
 * This script applies the 008_create_interconnection_schema.sql migration
 * to your Supabase database.
 * 
 * PREREQUISITES:
 * - Node.js installed
 * - Supabase credentials in environment variables
 * 
 * USAGE:
 *   node scripts/apply-interconnection-migration.js
 * 
 * OR set environment variables inline:
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx node scripts/apply-interconnection-migration.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

async function main() {
  logSection('🚀 Cedar Interconnection Logic - Migration Script');

  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('❌ ERROR: Missing Supabase credentials', 'red');
    console.log('\nPlease provide:');
    console.log('  - SUPABASE_URL (your Supabase project URL)');
    console.log('  - SUPABASE_SERVICE_KEY (your service role key, NOT anon key)\n');
    console.log('Example:');
    console.log('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx node scripts/apply-interconnection-migration.js\n');
    process.exit(1);
  }

  log('✓ Environment variables found', 'green');
  log(`  Supabase URL: ${supabaseUrl}`, 'blue');

  // Read migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/008_create_interconnection_schema.sql');
  
  if (!fs.existsSync(migrationPath)) {
    log(`❌ ERROR: Migration file not found at ${migrationPath}`, 'red');
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  log('✓ Migration file loaded', 'green');
  log(`  Lines: ${migrationSQL.split('\n').length}`, 'blue');

  logSection('📋 Migration Overview');
  console.log('This migration will create:');
  console.log('  ✓ elevator_types table (with 4 seeded types)');
  console.log('  ✓ product_elevator_types junction table');
  console.log('  ✓ New columns in products table (application_id, category_id, subcategory_id, is_categorized)');
  console.log('  ✓ System categories (Erection, Testing, Service, General, Uncategorized)');
  console.log('  ✓ Helper SQL functions (get_product_hierarchy, get_category_products, etc.)');
  console.log('  ✓ RLS policies for security');
  console.log('  ✓ Storage bucket for elevator type images');

  logSection('🔧 Applying Migration');

  try {
    // Use fetch to execute SQL via Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        query: migrationSQL
      })
    });

    // Supabase doesn't have a direct SQL execution endpoint via REST API
    // So we need to use the postgres connection or SQL editor
    log('⚠️  NOTE: Cannot execute raw SQL via REST API', 'yellow');
    log('\nPlease apply the migration manually using ONE of these methods:\n', 'yellow');
    
    console.log('METHOD 1: Supabase Dashboard (Recommended)');
    console.log('  1. Go to: ' + supabaseUrl.replace('https://', 'https://app.') + '/project/_/sql');
    console.log('  2. Click "New Query"');
    console.log('  3. Copy contents from: supabase/migrations/008_create_interconnection_schema.sql');
    console.log('  4. Paste and click "Run"\n');

    console.log('METHOD 2: Supabase CLI');
    console.log('  $ supabase db push\n');

    console.log('METHOD 3: Direct PostgreSQL Connection');
    console.log('  $ psql <connection-string> < supabase/migrations/008_create_interconnection_schema.sql\n');

    logSection('📝 Migration SQL Preview');
    console.log('First 50 lines of migration:');
    console.log('---');
    console.log(migrationSQL.split('\n').slice(0, 50).join('\n'));
    console.log('...');
    console.log('---\n');

    logSection('✅ Next Steps');
    console.log('1. Apply the migration using one of the methods above');
    console.log('2. Verify tables created:');
    console.log('   - Run: SELECT * FROM elevator_types;');
    console.log('   - Should return 4 rows (Residential, Commercial, Industrial, Hospital)');
    console.log('3. Verify products table updated:');
    console.log('   - Run: SELECT column_name FROM information_schema.columns WHERE table_name = \'products\';');
    console.log('   - Should include: application_id, category_id, subcategory_id, is_categorized');
    console.log('4. Continue to Phase 6 implementation\n');

  } catch (error) {
    log('❌ ERROR: ' + error.message, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  log('❌ FATAL ERROR:', 'red');
  console.error(error);
  process.exit(1);
});
