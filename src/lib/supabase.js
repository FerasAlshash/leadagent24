import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyjwsajislxccphdyxms.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5andzYWppc2x4Y2NwaGR5eG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4ODk0NzAsImV4cCI6MjEwNDQ2NTQ3MH0.S3Or-27E1WHynTY587ABhvoT4QF6MidCUxHc5n6Ekp8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
