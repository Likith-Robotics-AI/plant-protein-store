import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Middleware to verify admin access on API routes
 * Usage:
 *
 * export async function GET(request: NextRequest) {
 *   const authCheck = await verifyAdminAccess(request);
 *   if (authCheck.error) return authCheck.error;
 *
 *   // ... rest of your code
 * }
 */
export async function verifyAdminAccess(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized: No valid authorization token provided' },
          { status: 401 }
        ),
        user: null,
      };
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized: Invalid or expired token' },
          { status: 401 }
        ),
        user: null,
      };
    }

    // Check if user is admin
    const isAdminUser =
      user.user_metadata?.is_admin === true ||
      user.app_metadata?.is_admin === true ||
      user.email === process.env.ADMIN_EMAIL;

    if (!isAdminUser) {
      return {
        error: NextResponse.json(
          { error: 'Forbidden: Admin access required' },
          { status: 403 }
        ),
        user: null,
      };
    }

    // User is authenticated and is admin
    return {
      error: null,
      user,
    };
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return {
      error: NextResponse.json(
        { error: 'Internal server error during authentication' },
        { status: 500 }
      ),
      user: null,
    };
  }
}

/**
 * Alternative: Simple API key check for lightweight protection
 */
export function verifyAdminApiKey(request: NextRequest) {
  const apiKey = request.headers.get('x-admin-api-key');
  const validApiKey = process.env.ADMIN_API_KEY;

  if (!validApiKey) {
    console.warn('ADMIN_API_KEY not set in environment variables');
    return {
      error: NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      ),
      authorized: false,
    };
  }

  if (!apiKey || apiKey !== validApiKey) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized: Invalid API key' },
        { status: 401 }
      ),
      authorized: false,
    };
  }

  return {
    error: null,
    authorized: true,
  };
}
