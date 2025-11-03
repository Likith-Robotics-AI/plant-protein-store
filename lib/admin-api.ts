import { supabase } from './supabase';

/**
 * Make an authenticated admin API request
 * Automatically includes the auth token from the current session
 */
export async function adminApiRequest(url: string, options: RequestInit = {}) {
  // Get current session token
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  // Add auth header to request
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${session.access_token}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}
