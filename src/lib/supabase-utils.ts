// Supabase + Prisma Integration
// For Prisma to connect to Supabase, you need the database connection string
// Get it from: Supabase Dashboard > Settings > Database > Connection string

/* 
   SUPABASE DATABASE CONNECTION:
   
   The publishable key (sb_publishable_...) is for frontend Supabase client.
   For Prisma database access, you need the connection string:
   
   Format: postgresql://postgres:PASSWORD@db.PROJECTREF.supabase.co:5432/postgres
   
   Get from: Supabase Dashboard > Settings > Database > Connection string
   Or use the Supabase CLI: supabase status
*/

// For Next.js API routes, you can use Supabase directly
import { supabase } from './supabase';

export { supabase };

// Example: Check Supabase connection
export async function checkSupabaseConnection() {
  const { data, error } = await supabase.from('users').select('count');
  return { connected: !error, error };
}

// Note: Prisma uses DATABASE_URL env variable for database connection
// Supabase provides connection string in Dashboard > Settings > Database