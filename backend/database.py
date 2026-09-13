from supabase import create_client, Client
from backend.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

# Use service role key on backend to bypass RLS when performing verified server-side operations
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY)

# Standard client
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
