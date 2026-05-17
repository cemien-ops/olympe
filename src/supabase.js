import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://oveslvxufcrahycytkmg.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZXNsdnh1ZmNyYWh5Y3l0a21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NjU4NzQsImV4cCI6MjA5NDU0MTg3NH0.M7PD5jULpMKCpcOWctsrp5mSTsvKMHl8fiL2c-y2h8s";

export const supabase = createClient(supabaseUrl, supabaseKey);
