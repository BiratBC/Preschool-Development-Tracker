import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  // console.log("url",supabaseUrl);
  // console.log(supabaseAnonKey);
  
  const { data, error } = await supabase.from("milestone_categories").select("name");
  if (error) {
    console.error("Supabase connection failed:", error);
  } else {
    console.log("Supabase is connected. Sample data:", data);
  }
}
testConnection();