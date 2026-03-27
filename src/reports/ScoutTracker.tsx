import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";

/* ── palette ── */
const C = {
  dark: "#0f172a", text: "#1e293b", muted: "#64748b", light: "#94a3b8",
  bg: "#f8fafc", white: "#ffffff", border: "#e2e8f0", accent: "#2563eb",
  accentLight: "#eff6ff", green: "#16a34a", greenBg: "#f0fdf4",
  amber: "#d97706", amberBg: "#fffbeb", red: "#dc2626", redBg: "#fef2f2",
};

/* ── types ── */
interface Signal {
  date: string; state: string; headline: string; source_url: string;
  signal_type: string; district_name: string; schools_mentioned: string[];
}

interface EnrichedSchool {
  name: string; address: string; closure_flag: string;
  sale_status: string | null; sale_price: string | null;
  bid_deadline: string | null; site_id: string | null; grade_level: string | null;
}

interface Enrichment {
  matched: boolean; school_count: number; schools: EnrichedSchool[];
  flags: string[]; for_sale: EnrichedSchool[];
}

type Stage = "available" | "confirmed" | "pipeline";

interface District {
  key: string; name: string; state: string; stage: Stage;
  signals: Signal[]; allSchools: string[];
  latestDate: string; enrichment: Enrichment | null;
}

/* ── helpers ── */
function classifyStage(type: string): Stage {
  if (type === "building_sale") return "available";
  if (type === "closure_announced" || type === "closure_vote") return "confirmed";
  return "pipeline";
}

function stageRank(s: Stage): number {
  return s === "available" ? 0 : s === "confirmed" ? 1 : 2;
}

const STAGE_META: Record<Stage, { label: string; color: string; bg: string; action: string }> = {
  available: { label: "Available", color: C.green, bg: C.greenBg, action: "Building for sale — contact district or broker" },
  confirmed: { label: "Confirmed", color: C.red, bg: C.redBg, action: "Closure confirmed — building likely available in 3-12 months" },
  pipeline: { label: "Pipeline", color: C.amber, bg: C.amberBg, action: "Closure under consideration — monitor for board vote" },
};

/* ── API ── */
async function fetchAllUpdates(days: number) {
  const end = new Date().toISOString();
  const start = new Date(Date.now() - days * 86400000).toISOString();
  const all: any[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < 20; i++) {
    const p = new URLSearchParams({ start_time: start, end_time: end, page_size: "50" });
    if (cursor) p.set("cursor", cursor);
    const res = await fetch(`/api/scouting/updates?${p}`);
    const data = await res.json();
    all.push(...(data.updates || []));
    cursor = data.next_cursor;
    if (!cursor) break;
  }
  return all;
}

async function fetchEnrichments(districtKeys: string[]): Promise<Record<string, Enrichment>> {
  if (districtKeys.length === 0) return {};
  // Batch in groups of 20
  const results: Record<string, Enrichment> = {};
  for (let i = 0; i < districtKeys.length; i += 20) {
    const batch = districtKeys.slice(i, i + 20);
    try {
      const res = await fetch(`/api/scouting/enrichment?districts=${encodeURIComponent(batch.join(","))}`);
      if (res.ok) {
        const data = await res.json();
        Object.assign(results, data.enrichments || {});
      }
    } catch (_) { /* skip */ }
  }
  return results;
}

function buildDistricts(updates: any[]): District[] {
  // Extract and dedup signals
  const seen = new Set<string>();
  const signals: Signal[] = [];
  for (const u of updates) {
    if (!u.structured_result?.signals) continue;
    for (const s of u.structured_result.signals) {
      const key = `${s.state}|${s.district_name}|${s.signal_type}|${(s.schools_mentioned || []).sort().join(",")}`;
      if (seen.has(key)) continue;
      seen.add(key);
      signals.push(s);
    }
  }

  // Group by district
  const map = new Map<string, District>();
  for (const s of signals) {
    // Filter out noise — skip signals with no district or generic types we don't care about
    if (!s.district_name || s.signal_type === "enrollment_decline" || s.signal_type === "budget_crisis" || s.signal_type === "state_takeover") continue;

    const key = `${s.state}|${s.district_name}`;
    let d = map.get(key);
    if (!d) {
      d = { key, name: s.district_name, state: s.state, stage: "pipeline", signals: [], allSchools: [], latestDate: "", enrichment: null };
      map.set(key, d);
    }
    d.signals.push(s);
    for (const sch of s.schools_mentioned || []) {
      if (!d.allSchools.includes(sch)) d.allSchools.push(sch);
    }
    // Stage = most advanced signal
    const sStage = classifyStage(s.signal_type);
    if (stageRank(sStage) < stageRank(d.stage)) d.stage = sStage;
    if (!d.latestDate || s.date > d.latestDate) d.latestDate = s.date;
  }

  // Sort: available first, then confirmed, then pipeline. Within stage, most recent first.
  const districts = Array.from(map.values());
  districts.sort((a, b) => {
    const sr = stageRank(a.stage) - stageRank(b.stage);
    if (sr !== 0) return sr;
    return (b.latestDate || "").localeCompare(a.latestDate || "");
  });

  return districts;
}

/* ── components ── */
function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ flex: "1 1 130px", padding: "14px 18px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function DistrictCard({ d }: { d: District }) {
  const meta = STAGE_META[d.stage];
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(`${d.name}, ${d.state}`)}`;
  const enr = d.enrichment;
  const forSale = enr?.for_sale || [];
  const signalTypes = [...new Set(d.signals.map((s) => s.signal_type))];

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, borderLeft: `4px solid ${meta.color}`, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {meta.label}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, background: C.accentLight, padding: "2px 8px", borderRadius: 4 }}>{d.state}</span>
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.dark }}>{d.name}</h3>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: C.light, whiteSpace: "nowrap" }}>
            {d.latestDate}
            <br />
            <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ color: C.accent, textDecoration: "none" }}>Map ↗</a>
          </div>
        </div>

        {/* Signal type pills */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
          {signalTypes.map((t) => {
            const sc = classifyStage(t);
            const m = STAGE_META[sc];
            return <span key={t} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: m.bg, color: m.color, fontWeight: 600 }}>{t.replace(/_/g, " ")}</span>;
          })}
        </div>

        {/* Schools mentioned */}
        {d.allSchools.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>
            <span style={{ fontWeight: 600 }}>{d.allSchools.length} school{d.allSchools.length !== 1 ? "s" : ""}:</span>{" "}
            {d.allSchools.join(" · ")}
          </div>
        )}

        {/* Latest headline */}
        {d.signals[0]?.headline && (
          <div style={{ marginTop: 6, fontSize: 13, color: C.muted }}>
            {d.signals[0].source_url ? (
              <a href={d.signals[0].source_url} target="_blank" rel="noreferrer" style={{ color: C.muted, textDecoration: "none", borderBottom: `1px dotted ${C.light}` }}>
                {d.signals[0].headline}
              </a>
            ) : d.signals[0].headline}
          </div>
        )}
      </div>

      {/* Enrichment: DB match */}
      {enr && enr.matched && (
        <div style={{ padding: "8px 18px 10px", background: C.bg, borderTop: `1px solid ${C.border}`, fontSize: 12 }}>
          <span style={{ fontWeight: 600, color: C.accent }}>In our database:</span>{" "}
          <span style={{ color: C.muted }}>{enr.school_count} schools tracked · Flags: {enr.flags.join(", ")}</span>
          {forSale.length > 0 && (
            <div style={{ marginTop: 6 }}>
              {forSale.map((fs, i) => (
                <div key={i} style={{ padding: "6px 10px", background: C.greenBg, borderRadius: 4, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 700, color: C.green, fontSize: 11, textTransform: "uppercase" }}>For Sale</span>{" "}
                    <span style={{ fontWeight: 600 }}>{fs.name}</span>
                    <span style={{ color: C.muted }}> · {fs.address}</span>
                  </div>
                  <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {fs.sale_price && <div style={{ fontWeight: 600, fontSize: 12 }}>{fs.sale_price}</div>}
                    {fs.bid_deadline && <div style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>Deadline: {fs.bid_deadline}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action line */}
      <div style={{ padding: "8px 18px", background: d.stage === "available" ? C.greenBg : C.bg, borderTop: `1px solid ${C.border}`, fontSize: 12, color: meta.color, fontWeight: 500 }}>
        {meta.action}
      </div>
    </div>
  );
}

/* ── main ── */
export default function ScoutTracker() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [days, setDays] = useState(30);
  const [filterState, setFilterState] = useState("all");
  const [filterStage, setFilterStage] = useState<"all" | Stage>("all");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAllUpdates(days)
      .then(async (updates) => {
        const dists = buildDistricts(updates);
        setDistricts(dists);
        setLastUpdated(new Date().toLocaleString());
        setLoading(false);

        // Enrich from DB (non-blocking)
        setEnriching(true);
        const keys = dists.map((d) => d.key);
        const enrichments = await fetchEnrichments(keys);
        setDistricts((prev) =>
          prev.map((d) => ({ ...d, enrichment: enrichments[d.key] || null }))
        );
        setEnriching(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [days]);

  const filtered = useMemo(() => {
    return districts.filter((d) => {
      if (filterState !== "all" && d.state !== filterState) return false;
      if (filterStage !== "all" && d.stage !== filterStage) return false;
      return true;
    });
  }, [districts, filterState, filterStage]);

  const states = useMemo(() => Array.from(new Set(districts.map((d) => d.state))).sort(), [districts]);
  const counts = useMemo(() => {
    const c = { available: 0, confirmed: 0, pipeline: 0 };
    for (const d of districts) c[d.stage]++;
    return c;
  }, [districts]);

  const withForSale = useMemo(() => districts.filter((d) => d.enrichment?.for_sale?.length), [districts]);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: C.text, lineHeight: 1.6 }}>
      <Link to="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>← All Reports</Link>

      <div style={{ marginTop: 16, marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 2, color: C.dark }}>School Closure Opportunities</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
          Live from 11 Yutori scouts · Enriched from closure database ({">"}107K schools)
          {enriching && <span style={{ color: C.amber }}> · Enriching...</span>}
        </p>
      </div>

      {error && (
        <div style={{ background: C.redBg, borderLeft: `4px solid ${C.red}`, padding: "12px 16px", borderRadius: 4, fontSize: 13, color: C.red, marginBottom: 16 }}>Error: {error}</div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Buildings Available" value={counts.available} color={C.green} />
        <StatCard label="Closures Confirmed" value={counts.confirmed} color={C.red} />
        <StatCard label="In Pipeline" value={counts.pipeline} color={C.amber} />
        <StatCard label="Districts Total" value={districts.length} color={C.accent} />
      </div>

      {/* Active listings callout */}
      {withForSale.length > 0 && (
        <div style={{ padding: "12px 16px", background: C.greenBg, border: `1px solid ${C.green}30`, borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
          <strong style={{ color: C.green }}>{withForSale.length} district{withForSale.length !== 1 ? "s" : ""} with active for-sale listings in our database</strong>
          <span style={{ color: C.muted }}> — {withForSale.map((d) => `${d.name} (${d.state})`).join(", ")}</span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: C.white }}>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
        </select>
        <select value={filterStage} onChange={(e) => setFilterStage(e.target.value as any)} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: C.white }}>
          <option value="all">All Stages ({districts.length})</option>
          <option value="available">Available ({counts.available})</option>
          <option value="confirmed">Confirmed ({counts.confirmed})</option>
          <option value="pipeline">Pipeline ({counts.pipeline})</option>
        </select>
        <select value={filterState} onChange={(e) => setFilterState(e.target.value)} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: C.white }}>
          <option value="all">All States</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filterState !== "all" || filterStage !== "all") && (
          <button onClick={() => { setFilterState("all"); setFilterStage("all"); }}
            style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.accent}`, background: C.accentLight, color: C.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Clear filters
          </button>
        )}
        <span style={{ fontSize: 11, color: C.light, marginLeft: "auto" }}>
          {loading ? "Loading..." : `${filtered.length} districts · Updated ${lastUpdated}`}
        </span>
      </div>

      {/* District cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((d) => <DistrictCard key={d.key} d={d} />)}
      </div>

      {!loading && filtered.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: C.muted }}>No opportunities found for the selected filters.</div>
      )}

      {/* Legend */}
      <div style={{ marginTop: 36, padding: "12px 16px", background: C.bg, borderRadius: 6, fontSize: 12, color: C.light }}>
        <strong style={{ color: C.muted }}>Stages:</strong>{" "}
        <span style={{ color: C.green }}>Available</span> = building for sale now ·{" "}
        <span style={{ color: C.red }}>Confirmed</span> = closure voted/announced, building available 3-12 months ·{" "}
        <span style={{ color: C.amber }}>Pipeline</span> = consolidation plan or proposal, 6-18 months out
        <br />Signals for budget crises, enrollment declines, and state takeovers are filtered out — those feed our automated pipeline separately.
      </div>

      <p style={{ fontSize: 11, color: C.light, marginTop: 16 }}>
        Yutori Scouts API · Enriched from Supabase closure_schools · {districts.length} districts tracked
      </p>
    </div>
  );
}
