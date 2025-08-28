import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from("payments")
    .select("amount_cents, kind, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ tips: data || [] });
}
