import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const C = {
  dark: "#0f172a", text: "#1e293b", muted: "#64748b", light: "#94a3b8",
  bg: "#f8fafc", white: "#ffffff", border: "#e2e8f0", accent: "#2563eb",
  accentLight: "#eff6ff", green: "#16a34a", greenBg: "#f0fdf4",
  amber: "#d97706", amberBg: "#fffbeb", red: "#dc2626", redBg: "#fef2f2",
};

// API calls go through our Vercel serverless proxy at /api/scouting/updates

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
  citations: { url: string; id: string }[];
}

const SIGNAL_COLORS: Record<string, { c: string; bg: string }> = {
  closure_announced: { c: C.red, bg: C.redBg },
  closure_vote: { c: C.red, bg: C.redBg },
  building_sale: { c: C.green, bg: C.greenBg },
  consolidation_plan: { c: C.amber, bg: C.amberBg },
  closure_proposed: { c: C.amber, bg: C.amberBg },
  budget_crisis: { c: C.amber, bg: C.amberBg },
  enrollment_decline: { c: C.muted, bg: "#f1f5f9" },
  state_takeover: { c: C.red, bg: C.redBg },
};

function Badge({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, color, background: bg, letterSpacing: 0.4, textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

function SignalTypeBadge({ type }: { type: string }) {
  const s = SIGNAL_COLORS[type] || { c: C.muted, bg: "#f1f5f9" };
  return <Badge color={s.c} bg={s.bg}>{type.replace(/_/g, " ")}</Badge>;
}

function StateBadge({ state }: { state: string }) {
  return <Badge color={C.accent} bg={C.accentLight}>{state}</Badge>;
}

async function fetchAllUpdates(days: number): Promise<ScoutUpdate[]> {
  const end = new Date().toISOString();
  const start = new Date(Date.now() - days * 86400000).toISOString();
  const allUpdates: ScoutUpdate[] = [];
  let cursor: string | null = null;
  let pages = 0;

  while (pages < 20) {
    const params = new URLSearchParams({
      start_time: start,
      end_time: end,
      page_size: "50",
    });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`/api/scouting/updates?${params}`);
    const data = await res.json();
    allUpdates.push(...(data.updates || []));
    cursor = data.next_cursor;
    pages++;
    if (!cursor) break;
  }

  return allUpdates;
}

function extractSignals(updates: ScoutUpdate[]): Signal[] {
  const seen = new Set<string>();
  const signals: Signal[] = [];

  for (const u of updates) {
    const sr = u.structured_result;
    if (!sr?.signals) continue;
    for (const s of sr.signals) {
      const key = `${s.state}|${s.district_name}|${s.signal_type}|${(s.schools_mentioned || []).sort().join(",")}`;
      if (seen.has(key)) continue;
      seen.add(key);
      signals.push(s);
    }
  }

  signals.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    return 0;
  });

  return signals;
}

export default function ScoutTracker() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [days, setDays] = useState(30);
  const [filterState, setFilterState] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [totalUpdates, setTotalUpdates] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAllUpdates(days)
      .then((updates) => {
        setTotalUpdates(updates.length);
        const sigs = extractSignals(updates);
        setSignals(sigs);
        setLastUpdated(new Date().toLocaleString());
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [days]);

  const states = Array.from(new Set(signals.map((s) => s.state))).sort();
  const types = Array.from(new Set(signals.map((s) => s.signal_type))).sort();

  const filtered = signals.filter((s) => {
    if (filterState !== "all" && s.state !== filterState) return false;
    if (filterType !== "all" && s.signal_type !== filterType) return false;
    return true;
  });

  const stateCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  for (const s of signals) {
    stateCounts[s.state] = (stateCounts[s.state] || 0) + 1;
    typeCounts[s.signal_type] = (typeCounts[s.signal_type] || 0) + 1;
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: C.text, lineHeight: 1.6 }}>
      <Link to="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>← All Reports</Link>

      <div style={{ marginTop: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, color: C.dark }}>School Closure Scout Tracker</h1>
        <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
          Live feed from {states.length} state scouts + national scout · Auto-updates on every page load
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Signals", value: signals.length, color: C.accent },
          { label: "States", value: states.length, color: C.green },
          { label: "Scout Updates", value: totalUpdates, color: C.muted },
          { label: "Building Sales", value: typeCounts["building_sale"] || 0, color: C.green },
          { label: "Closure Votes", value: typeCounts["closure_vote"] || 0, color: C.red },
        ].map((s) => (
          <div key={s.label} style={{ padding: "12px 20px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, minWidth: 100 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>FILTERS:</span>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 13 }}>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
        </select>
        <select value={filterState} onChange={(e) => setFilterState(e.target.value)} style={{ padding: "4px 8px", borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 13 }}>
          <option value="all">All States ({states.length})</option>
          {states.map((s) => <option key={s} value={s}>{s} ({stateCounts[s]})</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: "4px 8px", borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 13 }}>
          <option value="all">All Types ({types.length})</option>
          {types.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")} ({typeCounts[t]})</option>)}
        </select>
        <span style={{ fontSize: 11, color: C.light, marginLeft: "auto" }}>
          {loading ? "Loading..." : `${filtered.length} of ${signals.length} signals · Updated ${lastUpdated}`}
        </span>
      </div>

      {error && (
        <div style={{ background: C.redBg, borderLeft: `4px solid ${C.red}`, padding: "12px 16px", borderRadius: 4, fontSize: 13, color: C.red, marginBottom: 16 }}>
          Error loading scout data: {error}
        </div>
      )}

      {/* Signals list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((s, i) => (
          <div key={i} style={{ padding: "14px 18px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, transition: "box-shadow 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
              <StateBadge state={s.state} />
              <SignalTypeBadge type={s.signal_type} />
              <span style={{ fontSize: 12, color: C.light }}>{s.date}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
              {s.source_url ? (
                <a href={s.source_url} target="_blank" rel="noreferrer" style={{ color: C.text, textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = C.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = C.text; }}>
                  {s.headline}
                </a>
              ) : s.headline}
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              {s.district_name}
              {s.schools_mentioned && s.schools_mentioned.length > 0 && (
                <span style={{ color: C.light }}> · {s.schools_mentioned.join(", ")}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: C.muted }}>
          No signals found for the selected filters.
        </div>
      )}

      <p style={{ fontSize: 11, color: C.light, marginTop: 48 }}>
        Data from Yutori Scouts API · {totalUpdates} scout updates processed · Deduped to {signals.length} unique signals
      </p>
    </div>
  );
}
