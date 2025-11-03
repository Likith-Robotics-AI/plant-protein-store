import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Server-side Supabase client for authentication
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Get current user from session
export async function getCurrentUser() {
  try {
    const supabase = createServerSupabaseClient();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Check if user is admin
export async function isAdmin() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return false;
    }

    // Check if user has admin role in metadata
    const isAdminUser = user.user_metadata?.is_admin === true ||
                       user.app_metadata?.is_admin === true ||
                       user.email === process.env.ADMIN_EMAIL;

    return isAdminUser;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Verify admin access or throw error
export async function requireAdmin() {
  const adminStatus = await isAdmin();

  if (!adminStatus) {
    throw new Error('Unauthorized: Admin access required');
  }

  return true;
}
