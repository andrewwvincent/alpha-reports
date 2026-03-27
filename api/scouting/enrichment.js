// Enriches scout signals by matching school/district names against closure_schools in Supabase
export default async function handler(req, res) {
  const { districts } = req.query; // comma-separated "STATE|district_name" pairs
  if (!districts) {
    res.status(400).json({ error: "districts param required" });
    return;
  }

  const pairs = districts.split(",").slice(0, 50); // limit to 50
  const results = {};

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Return empty enrichment if no Supabase configured
    res.setHeader("Cache-Control", "s-maxage=3600");
    res.status(200).json({ enrichments: {} });
    return;
  }

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  };

  for (const pair of pairs) {
    const [state, districtName] = pair.split("|", 2);
    if (!state || !districtName) continue;

    try {
      // Search for schools in this district+state with closure signals
      const select = "nces_id,school_name,street_address,city,state,zip_code,closure_flag,sale_status,sale_price,bid_deadline,site_id,grade_level,school_type";
      const filters = `&state=eq.${encodeURIComponent(state)}&district_name=ilike.*${encodeURIComponent(districtName.replace(/ /g, "*"))}*&closure_flag=neq.none`;
      const url = `${supabaseUrl}/rest/v1/closure_schools?select=${select}${filters}&limit=20&order=closure_flag`;

      const resp = await fetch(url, { headers });
      if (resp.ok) {
        const schools = await resp.json();
        if (schools.length > 0) {
          results[pair] = {
            matched: true,
            school_count: schools.length,
            schools: schools.map((s) => ({
              name: s.school_name,
              address: [s.street_address, s.city, s.state, s.zip_code].filter(Boolean).join(", "),
              closure_flag: s.closure_flag,
              sale_status: s.sale_status,
              sale_price: s.sale_price,
              bid_deadline: s.bid_deadline,
              site_id: s.site_id,
              grade_level: s.grade_level,
            })),
            flags: [...new Set(schools.map((s) => s.closure_flag))],
            for_sale: schools.filter((s) => s.sale_status && s.sale_status !== "sold" && s.sale_status !== "not_available"),
          };
        }
      }
    } catch (_) {
      // skip enrichment errors silently
    }
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=300");
  res.status(200).json({ enrichments: results });
}
