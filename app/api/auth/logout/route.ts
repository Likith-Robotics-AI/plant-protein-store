// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = verifyToken(token);

    if (!decoded) {
      // Even if token is invalid, we'll consider logout successful
      return NextResponse.json({ success: true });
    }

    const supabase = createClient();

    // Delete session
    await supabase
      .from('customer_sessions')
      .delete()
      .eq('customer_id', decoded.id)
      .eq('token_hash', token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    // Even on error, return success for logout
    return NextResponse.json({ success: true });
  }
}
