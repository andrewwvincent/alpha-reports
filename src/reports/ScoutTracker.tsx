import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

/* ── palette ── */
const C = {
  dark: "#0f172a", text: "#1e293b", muted: "#64748b", light: "#94a3b8",
  bg: "#f8fafc", white: "#ffffff", border: "#e2e8f0", accent: "#2563eb",
  accentLight: "#eff6ff", green: "#16a34a", greenBg: "#f0fdf4",
  amber: "#d97706", amberBg: "#fffbeb", red: "#dc2626", redBg: "#fef2f2",
};

/* ── types ── */
interface Signal {
  date: string;
  state: string;
  headline: string;
  source_url: string;
  signal_type: string;
  district_name: string;
  schools_mentioned: string[];
}

interface ScoutUpdate {
  id: string;
  scout_id: string;
  scout_display_name: string;
  timestamp: number;
  structured_result: { signals?: Signal[] } | null;
}

/* ── opportunity stages ── */
type Stage = "available" | "confirmed" | "pipeline" | "watch";

const STAGE_CONFIG: Record<Stage, { label: string; desc: string; color: string; bg: string; icon: string }> = {
  available: { label: "Buildings Available", desc: "Properties listed for sale or RFP issued", color: C.green, bg: C.greenBg, icon: "🏫" },
  confirmed: { label: "Closures Confirmed", desc: "Board voted or closure officially announced", color: C.red, bg: C.redBg, icon: "✓" },
  pipeline: { label: "Likely Closures", desc: "Consolidation plans, proposals, or closure votes pending", color: C.amber, bg: C.amberBg, icon: "→" },
  watch: { label: "Early Signals", desc: "Budget crises, enrollment declines, state takeovers", color: C.muted, bg: "#f1f5f9", icon: "○" },
};

function classifyStage(type: string): Stage {
  switch (type) {
    case "building_sale": return "available";
    case "closure_announced": case "closure_vote": return "confirmed";
    case "consolidation_plan": case "closure_proposed": return "pipeline";
    default: return "watch";
  }
}

/* ── API ── */
async function fetchAllUpdates(days: number): Promise<ScoutUpdate[]> {
  const end = new Date().toISOString();
  const start = new Date(Date.now() - days * 86400000).toISOString();
  const all: ScoutUpdate[] = [];
  let cursor: string | null = null;
  let pages = 0;
  while (pages < 20) {
    const p = new URLSearchParams({ start_time: start, end_time: end, page_size: "50" });
    if (cursor) p.set("cursor", cursor);
    const res = await fetch(`/api/scouting/updates?${p}`);
    const data = await res.json();
    all.push(...(data.updates || []));
    cursor = data.next_cursor;
    pages++;
    if (!cursor) break;
  }
  return all;
}

function extractSignals(updates: ScoutUpdate[]): Signal[] {
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
  signals.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return signals;
}

/* ── components ── */
function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div style={{ flex: "1 1 140px", padding: "16px 20px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.light, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function OpportunityCard({ signal }: { signal: Signal }) {
  const stage = classifyStage(signal.signal_type);
  const cfg = STAGE_CONFIG[stage];
  const schools = signal.schools_mentioned || [];
  const mapsQuery = encodeURIComponent(`${signal.district_name}, ${signal.state}`);

  return (
    <div style={{ padding: "14px 18px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, borderLeft: `4px solid ${cfg.color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>
              {signal.signal_type.replace(/_/g, " ")}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, background: C.accentLight, padding: "2px 8px", borderRadius: 4 }}>
              {signal.state}
            </span>
            <span style={{ fontSize: 11, color: C.light }}>{signal.date}</span>
          </div>

          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>
            {signal.district_name}
          </div>

          {signal.headline && (
            <div style={{ fontSize: 13, color: C.muted, marginBottom: schools.length ? 4 : 0 }}>
              {signal.source_url ? (
                <a href={signal.source_url} target="_blank" rel="noreferrer" style={{ color: C.muted, textDecoration: "none", borderBottom: `1px dotted ${C.light}` }}>
                  {signal.headline}
                </a>
              ) : signal.headline}
            </div>
          )}

          {schools.length > 0 && (
            <div style={{ fontSize: 12, color: C.light, marginTop: 4 }}>
              <span style={{ fontWeight: 600, color: C.muted }}>Schools:</span>{" "}
              {schools.join(" · ")}
            </div>
          )}
        </div>

        <a href={`https://www.google.com/maps/search/${mapsQuery}`} target="_blank" rel="noreferrer"
          style={{ fontSize: 11, color: C.accent, textDecoration: "none", whiteSpace: "nowrap", padding: "4px 8px", border: `1px solid ${C.border}`, borderRadius: 4 }}>
          Map ↗
        </a>
      </div>
    </div>
  );
}

function StageSection({ stage, signals }: { stage: Stage; signals: Signal[] }) {
  const cfg = STAGE_CONFIG[stage];
  if (signals.length === 0) return null;

  // Group by state for summary
  const byState: Record<string, Signal[]> = {};
  for (const s of signals) {
    (byState[s.state] ||= []).push(s);
  }
  const statesSorted = Object.entries(byState).sort((a, b) => b[1].length - a[1].length);

  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: cfg.color, margin: 0 }}>
          {cfg.label}
        </h2>
        <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{signals.length}</span>
      </div>
      <p style={{ fontSize: 12, color: C.muted, margin: "0 0 6px 0" }}>{cfg.desc}</p>

      {/* State summary pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {statesSorted.map(([state, sigs]) => (
          <span key={state} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: cfg.bg, color: cfg.color, fontWeight: 600 }}>
            {state} ({sigs.length})
          </span>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {signals.map((s, i) => <OpportunityCard key={i} signal={s} />)}
      </div>
    </section>
  );
}

/* ── main ── */
export default function ScoutTracker() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [days, setDays] = useState(30);
  const [filterState, setFilterState] = useState("all");
  const [totalUpdates, setTotalUpdates] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAllUpdates(days)
      .then((updates) => {
        setTotalUpdates(updates.length);
        setSignals(extractSignals(updates));
        setLastUpdated(new Date().toLocaleString());
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [days]);

  const states = Array.from(new Set(signals.map((s) => s.state))).sort();

  const filtered = filterState === "all" ? signals : signals.filter((s) => s.state === filterState);

  // Classify into stages
  const byStage: Record<Stage, Signal[]> = { available: [], confirmed: [], pipeline: [], watch: [] };
  for (const s of filtered) byStage[classifyStage(s.signal_type)].push(s);

  // Top states by total signal count
  const stateCounts: Record<string, number> = {};
  for (const s of signals) stateCounts[s.state] = (stateCounts[s.state] || 0) + 1;
  const topStates = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Count unique districts
  const districts = new Set(filtered.map((s) => `${s.state}|${s.district_name}`));

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: C.text, lineHeight: 1.6 }}>
      <Link to="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>← All Reports</Link>

      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 2, color: C.dark }}>School Closure Opportunities</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
          Live intelligence from 11 Yutori scouts · Auto-updates on page load
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: C.white }}>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
        </select>
        <select value={filterState} onChange={(e) => setFilterState(e.target.value)} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: C.white }}>
          <option value="all">All States</option>
          {states.map((s) => <option key={s} value={s}>{s} ({stateCounts[s] || 0})</option>)}
        </select>
        <span style={{ fontSize: 11, color: C.light, marginLeft: "auto" }}>
          {loading ? "Loading..." : `Updated ${lastUpdated}`}
        </span>
      </div>

      {error && (
        <div style={{ background: C.redBg, borderLeft: `4px solid ${C.red}`, padding: "12px 16px", borderRadius: 4, fontSize: 13, color: C.red, marginBottom: 16 }}>
          Error: {error}
        </div>
      )}

      {/* Summary stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="Available Now" value={byStage.available.length} sub="Buildings for sale or RFP" color={C.green} />
        <StatCard label="Closures Confirmed" value={byStage.confirmed.length} sub="Board voted or announced" color={C.red} />
        <StatCard label="In Pipeline" value={byStage.pipeline.length} sub="Plans, proposals, votes pending" color={C.amber} />
        <StatCard label="Districts" value={districts.size} sub={`across ${states.length} states`} color={C.accent} />
      </div>

      {/* Most active states */}
      {filterState === "all" && topStates.length > 0 && (
        <div style={{ marginBottom: 28, padding: "14px 18px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Most Active States</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {topStates.map(([state, count]) => {
              const avail = signals.filter((s) => s.state === state && classifyStage(s.signal_type) === "available").length;
              const confirmed = signals.filter((s) => s.state === state && classifyStage(s.signal_type) === "confirmed").length;
              return (
                <button key={state} onClick={() => setFilterState(state)}
                  style={{ flex: "1 1 120px", padding: "10px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>{state}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {count} signal{count !== 1 ? "s" : ""}
                    {avail > 0 && <span style={{ color: C.green, fontWeight: 700 }}> · {avail} available</span>}
                    {confirmed > 0 && <span style={{ color: C.red, fontWeight: 600 }}> · {confirmed} confirmed</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filterState !== "all" && (
        <button onClick={() => setFilterState("all")}
          style={{ marginBottom: 16, padding: "6px 14px", background: C.accentLight, border: `1px solid ${C.accent}`, borderRadius: 6, color: C.accent, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ← Show all states (filtering: {filterState})
        </button>
      )}

      {/* Opportunity stages */}
      <StageSection stage="available" signals={byStage.available} />
      <StageSection stage="confirmed" signals={byStage.confirmed} />
      <StageSection stage="pipeline" signals={byStage.pipeline} />
      <StageSection stage="watch" signals={byStage.watch} />

      {!loading && filtered.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: C.muted }}>No signals found for the selected filters.</div>
      )}

      <div style={{ marginTop: 40, padding: "12px 16px", background: C.bg, borderRadius: 6, fontSize: 12, color: C.light }}>
        <strong style={{ color: C.muted }}>How to read this:</strong> Signals flow left-to-right through the pipeline.
        <strong style={{ color: C.green }}> Buildings Available</strong> are actionable now — these districts are selling school properties.
        <strong style={{ color: C.red }}> Closures Confirmed</strong> will produce available buildings in 3-12 months.
        <strong style={{ color: C.amber }}> Pipeline</strong> signals are 6-18 months out.
        <strong style={{ color: C.muted }}> Early Signals</strong> are worth monitoring but not yet actionable.
      </div>

      <p style={{ fontSize: 11, color: C.light, marginTop: 20 }}>
        {totalUpdates} scout updates · {signals.length} unique signals · Yutori Scouts API
      </p>
    </div>
  );
}
