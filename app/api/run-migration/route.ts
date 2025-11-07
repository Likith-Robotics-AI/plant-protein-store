// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    console.log('Reading migration file...');

    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', 'customer-auth-system-fixed.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL by semicolons to execute statement by statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    const results = [];
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty statements
      if (statement.startsWith('DO $$') || statement.includes('RAISE NOTICE')) {
        continue;
      }

      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);

        // Execute each statement using rpc if available, otherwise direct query
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

        if (error) {
          // Some errors are expected (like "already exists")
          if (error.message?.includes('already exists') ||
              error.message?.includes('IF NOT EXISTS') ||
              error.message?.includes('IF EXISTS')) {
            console.log(`Skipping (already exists): ${statement.substring(0, 50)}...`);
            results.push({ statement: i + 1, status: 'skipped', message: error.message });
          } else {
            console.error(`Error in statement ${i + 1}:`, error);
            errors.push({ statement: i + 1, error: error.message, sql: statement.substring(0, 100) });
          }
        } else {
          console.log(`Success: ${statement.substring(0, 50)}...`);
          results.push({ statement: i + 1, status: 'success' });
        }
      } catch (err: any) {
        console.error(`Exception in statement ${i + 1}:`, err);
        errors.push({ statement: i + 1, error: err.message, sql: statement.substring(0, 100) });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Migration completed with errors',
        results,
        errors,
        note: 'Please run the migration manually in Supabase SQL Editor',
        dashboardUrl: 'https://supabase.com/dashboard/project/twuhmpldymazfszqmuvx/sql'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      results
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      note: 'The Supabase client cannot execute raw SQL migrations. Please run manually in the Supabase Dashboard.',
      instructions: [
        '1. Go to: https://supabase.com/dashboard/project/twuhmpldymazfszqmuvx/sql',
        '2. Click "New Query"',
        '3. Copy the entire contents of: supabase/migrations/customer-auth-system-fixed.sql',
        '4. Paste into the SQL editor',
        '5. Click "Run" or press Ctrl+Enter'
      ]
    }, { status: 500 });
  }
}
