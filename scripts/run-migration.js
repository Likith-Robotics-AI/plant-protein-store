const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('📖 Reading migration file...');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'customer-auth-system-fixed.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Running migration...\n');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Migration failed:', error);
      console.error('\n⚠️  This is expected - the Supabase client cannot run raw SQL migrations.');
      console.log('\n📋 Please run this migration manually:');
      console.log('1. Go to: https://supabase.com/dashboard/project/twuhmpldymazfszqmuvx/sql');
      console.log('2. Click "New Query"');
      console.log('3. Copy the contents of: supabase/migrations/customer-auth-system-fixed.sql');
      console.log('4. Paste into the SQL editor');
      console.log('5. Click "Run" or press Ctrl+Enter\n');
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log(data);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Please run this migration manually in the Supabase Dashboard:');
    console.log('1. Go to: https://supabase.com/dashboard/project/twuhmpldymazfszqmuvx/sql');
    console.log('2. Click "New Query"');
    console.log('3. Copy the contents of: supabase/migrations/customer-auth-system-fixed.sql');
    console.log('4. Paste into the SQL editor');
    console.log('5. Click "Run" or press Ctrl+Enter\n');
    process.exit(1);
  }
}

runMigration();
