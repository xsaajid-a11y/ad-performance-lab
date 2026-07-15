import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://padpxqjycrrfhmeujoyg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZHB4cWp5Y3JyZmhtZXVqb3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTI4NTYsImV4cCI6MjA5OTU4ODg1Nn0.vnYlOScZWe0fV58-_NJKm-ewaEoikt3zbJ-XqwYEhhc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
