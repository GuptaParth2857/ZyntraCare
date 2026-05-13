// Supabase Middleware - Basic version
// For full SSR support, install @supabase/ssr package

import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export function createSupabaseMiddlewareClient(request: NextRequest) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const supabaseResponse = NextResponse.next({ request: { headers: request.headers } });
  return { supabase, supabaseResponse };
}