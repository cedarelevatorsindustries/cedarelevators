/**
 * Environment Configuration Helper for Admin Authentication
 * 
 * This script helps you set up the required environment variables
 * for the admin authentication system.
 * 
 * Run: node scripts/setup-admin-env.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('\n🔧 Cedar Elevators - Admin Authentication Setup\n');
console.log('═'.repeat(50));

// Generate a secure admin setup key
function generateAdminSetupKey() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
    const length = 24;
    const randomBytes = crypto.randomBytes(length);

    let key = '';
    for (let i = 0; i < length; i++) {
        key += chars[randomBytes[i] % chars.length];
    }

    // Format as XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
    return 'CEADM-2025-' + key.match(/.{1,4}/g).join('-');
}

// Main setup
console.log('\n📋 Step 1: Generated Admin Setup Key');
console.log('─'.repeat(50));
const adminSetupKey = generateAdminSetupKey();
console.log(`\n✅ ADMIN_SETUP_KEY=${adminSetupKey}\n`);
console.log('⚠️  IMPORTANT: Keep this key secure! You\'ll need it for initial admin setup.\n');

console.log('\n📋 Step 2: Get Supabase Service Role Key');
console.log('─'.repeat(50));
console.log('\n1. Go to: https://hbkdbrxzqaraarivudej.supabase.co');
console.log('2. Navigate to: Settings → API');
console.log('3. Copy the "service_role" key (⚠️ Keep this secret!)');
console.log('4. Add it to your .env file\n');

console.log('\n📋 Step 3: Update .env File');
console.log('─'.repeat(50));
console.log('\nAdd these lines to your .env file:\n');
console.log('# ═══════════════════════════════════════════════');
console.log('# Admin Authentication Configuration');
console.log('# ═══════════════════════════════════════════════');
console.log(`ADMIN_SETUP_KEY=${adminSetupKey}`);
console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
console.log('# ═══════════════════════════════════════════════\n');

console.log('\n📋 Step 4: Next Steps');
console.log('─'.repeat(50));
console.log('\n1. Update your .env file with the keys above');
console.log('2. Restart your development server');
console.log('3. Navigate to: http://localhost:3000/admin/setup');
console.log('4. Complete the super admin setup form');
console.log('5. Save the recovery key that is generated');
console.log('6. Login at: http://localhost:3000/admin/login\n');

console.log('═'.repeat(50));
console.log('\n✨ Database tables are already created and ready!');
console.log('   - admin_settings ✓');
console.log('   - admin_profiles ✓');
console.log('   - RLS policies ✓');
console.log('   - Indexes ✓\n');

// Optionally write to a config file
const configPath = path.join(__dirname, '..', 'admin-config.txt');
const configContent = `Cedar Elevators - Admin Authentication Configuration
Generated: ${new Date().toISOString()}

ADMIN_SETUP_KEY=${adminSetupKey}
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

⚠️  CRITICAL SECURITY NOTES:
1. Never commit these keys to version control
2. Store the ADMIN_SETUP_KEY securely
3. The SUPABASE_SERVICE_ROLE_KEY has full database access
4. The recovery key (generated during setup) is shown only once

Next Steps:
1. Add these keys to your .env file
2. Replace 'your_service_role_key_here' with actual service role key
3. Navigate to http://localhost:3000/admin/setup
4. Complete the super admin setup
5. Save the recovery key generated during setup
6. Delete this file after setup is complete
`;

fs.writeFileSync(configPath, configContent);
console.log(`📝 Configuration saved to: ${configPath}`);
console.log('   (Delete this file after copying the keys to .env)\n');
