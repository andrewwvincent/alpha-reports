import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

/* ── palette ── */
const C = {
  dark: "#0f172a", text: "#1e293b", muted: "#64748b", light: "#94a3b8",
  bg: "#f8fafc", white: "#fff", border: "#e2e8f0", accent: "#2563eb",
  accentLight: "#eff6ff", green: "#16a34a", greenBg: "#f0fdf4",
  amber: "#d97706", amberBg: "#fffbeb", red: "#dc2626", redBg: "#fef2f2",
};

/* ── types ── */
interface Signal {
  date: string; state: string; headline: string; source_url: string;
  signal_type: string; district_name: string; schools_mentioned: string[];
}

/* ── API fetch ── */
async function fetchAllUpdates(days: number) {
  const end = new Date().toISOString();
  const start = new Date(Date.now() - days * 86400000).toISOString();
  const all: any[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < 20; i++) {
    const p = new URLSearchParams({ start_time: start, end_time: end, page_size: "50" });
    if (cursor) p.set("cursor", cursor);
    try {
      const res = await fetch(`/api/scouting/updates?${p}`);
      const data = await res.json();
      all.push(...(data.updates || []));
      cursor = data.next_cursor;
      if (!cursor) break;
    } catch { break; }
  }
  return all;
}

function extractSignals(updates: any[]): Signal[] {
  const seen = new Set<string>();
  const signals: Signal[] = [];
  for (const u of updates) {
    if (!u.structured_result?.signals) continue;
    for (const s of u.structured_result.signals) {
      const key = `${s.state}|${s.district_name}|${s.signal_type}|${(s.schools_mentioned || []).sort().join(",")}`;
      if (!seen.has(key)) { seen.add(key); signals.push(s); }
    }
  }
  signals.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return signals;
}

/* ── small components ── */
function Badge({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, color, background: bg, letterSpacing: 0.4, textTransform: "uppercase" }}>{children}</span>;
}

function Placeholder({ label }: { label: string }) {
  return <span style={{ fontSize: 12, color: C.light, fontStyle: "italic", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, border: `1px dashed ${C.border}` }}>{label}</span>;
}

function Metric({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 80 }}>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: color || C.dark }}>
        {value}{unit && <span style={{ fontSize: 11, fontWeight: 400, color: C.light }}> {unit}</span>}
      </div>
    </div>
  );
}

/* ── Action Required card (fully enriched) ── */
function ActionCard({ title, address, mapsUrl, status, metrics, verdict, nextStep, contact, links, deadline, source }:
  { title: string; address: string; mapsUrl: string; status: string;
    metrics: { label: string; value: string; unit?: string; color?: string }[];
    verdict: { label: string; color: string; bg: string; detail: string };
    nextStep: string; contact?: { name: string; detail: string };
    links: { label: string; url: string }[]; deadline?: string; source?: string }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
      {deadline && (
        <div style={{ padding: "6px 18px", background: C.redBg, fontSize: 12, fontWeight: 700, color: C.red }}>
          Deadline: {deadline}
        </div>
      )}
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <Badge color={status === "For Sale" ? C.green : status === "RFP" ? C.amber : C.accent} bg={status === "For Sale" ? C.greenBg : status === "RFP" ? C.amberBg : C.accentLight}>{status}</Badge>
            <h3 style={{ margin: "6px 0 2px", fontSize: 17, fontWeight: 700 }}>{title}</h3>
            <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>{address} ↗</a>
          </div>
          <div style={{ padding: "8px 14px", background: verdict.bg, borderRadius: 8, textAlign: "center", minWidth: 70 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: verdict.color }}>{verdict.label}</div>
            <div style={{ fontSize: 10, color: verdict.color, fontWeight: 600 }}>VERDICT</div>
          </div>
        </div>

        {/* Metrics row */}
        <div style={{ display: "flex", gap: 16, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          {metrics.map((m, i) => <Metric key={i} {...m} />)}
        </div>

        {/* Verdict detail */}
        <div style={{ marginTop: 12, fontSize: 13, color: C.muted }}>{verdict.detail}</div>

        {/* Next step */}
        <div style={{ marginTop: 12, padding: "10px 14px", background: C.accentLight, borderRadius: 6, fontSize: 13 }}>
          <strong style={{ color: C.accent }}>Next step:</strong> <span style={{ color: C.text }}>{nextStep}</span>
          {contact && (
            <div style={{ marginTop: 4, fontSize: 12, color: C.muted }}>
              <strong>{contact.name}</strong> — {contact.detail}
            </div>
          )}
        </div>

        {/* Links */}
        {links.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12 }}>
            {links.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noreferrer" style={{ color: C.accent, textDecoration: "none" }}>{l.label} ↗</a>)}
          </div>
        )}
        {source && <div style={{ marginTop: 8, fontSize: 11, color: C.light }}>Source: {source}</div>}
      </div>
    </div>
  );
}

/* ── Needs Assessment card ── */
function AssessmentCard({ district, state, schools, signalType, headline, sourceUrl, date }:
  { district: string; state: string; schools: string[]; signalType: string; headline: string; sourceUrl: string; date: string }) {
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(`${district}, ${state}`)}`;
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 18px", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
            <Badge color={C.amber} bg={C.amberBg}>{signalType.replace(/_/g, " ")}</Badge>
            <Badge color={C.accent} bg={C.accentLight}>{state}</Badge>
            <span style={{ fontSize: 11, color: C.light }}>{date}</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{district}</div>
          {schools.length > 0 && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{schools.join(" · ")}</div>}
          {headline && (
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer" style={{ color: C.muted, borderBottom: `1px dotted ${C.light}`, textDecoration: "none" }}>{headline}</a> : headline}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
          <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: C.accent, textDecoration: "none", padding: "3px 8px", border: `1px solid ${C.border}`, borderRadius: 4 }}>Map ↗</a>
          <Placeholder label="Needs rebl3 score" />
        </div>
      </div>
    </div>
  );
}

/* ── main ── */
export default function ScoutTracker() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetchAllUpdates(days)
      .then((updates) => { setSignals(extractSignals(updates)); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [days]);

  // Classify signals
  const available = signals.filter((s) => s.signal_type === "building_sale");
  const confirmed = signals.filter((s) => s.signal_type === "closure_announced" || s.signal_type === "closure_vote");
  const pipeline = signals.filter((s) => s.signal_type === "consolidation_plan" || s.signal_type === "closure_proposed");
  const watchCount = signals.length - available.length - confirmed.length - pipeline.length;

  // Group confirmed + pipeline by district
  const groupByDistrict = (sigs: Signal[]) => {
    const map = new Map<string, Signal[]>();
    for (const s of sigs) {
      const key = `${s.state}|${s.district_name}`;
      const arr = map.get(key) || [];
      arr.push(s);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([, sigs]) => ({
      district: sigs[0].district_name,
      state: sigs[0].state,
      schools: [...new Set(sigs.flatMap((s) => s.schools_mentioned || []))],
      signalType: sigs[0].signal_type,
      headline: sigs[0].headline,
      sourceUrl: sigs[0].source_url,
      date: sigs[0].date,
    }));
  };

  const confirmedDistricts = groupByDistrict(confirmed);
  const pipelineDistricts = groupByDistrict(pipeline);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: C.text, lineHeight: 1.6 }}>
      <Link to="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>← All Reports</Link>

      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 2, color: C.dark }}>School Facility Opportunities</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
          {loading ? "Loading..." : `${available.length} buildings available · ${confirmed.length} closures confirmed · ${pipeline.length} in pipeline`}
        </p>
      </div>

      {/* Time filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, alignItems: "center" }}>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13 }}>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
        </select>
        <span style={{ fontSize: 11, color: C.light }}>{watchCount} early signals filtered out (budget/enrollment/takeover)</span>
      </div>

      {error && <div style={{ background: C.redBg, padding: "12px 16px", borderRadius: 6, color: C.red, fontSize: 13, marginBottom: 16 }}>Error loading scout data: {error}</div>}

      {/* ═══════════ SECTION 1: ACTION REQUIRED ═══════════ */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Action Required</h2>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 0, marginBottom: 16 }}>Properties with enough information to make a go/no-go decision</p>

        {/* KCPS Bryant — real data from our research */}
        <ActionCard
          title="KCPS Bryant School — Brookside"
          address="319 Westover Rd, Kansas City, MO 64113"
          mapsUrl="https://www.google.com/maps/search/319+Westover+Rd+Kansas+City+MO+64113"
          status="RFP"
          deadline="April 9, 2026"
          metrics={[
            { label: "Building", value: "45,760", unit: "sqft" },
            { label: "Land", value: "4.15", unit: "acres" },
            { label: "Est. Price", value: "$870K", unit: "@ $19/sqft", color: C.green },
            { label: "Rebl3", value: "—", unit: "pending", color: C.light },
          ]}
          verdict={{ label: "INVESTIGATE", color: C.amber, bg: C.amberBg, detail: "Brookside is one of KC's wealthiest neighborhoods. Deed restriction explicitly allows school use. Building vacant since 2009 — needs renovation assessment. Demographics need scoring at corrected address (pipeline had wrong location)." }}
          nextStep="Request the offering guidelines package and schedule a site tour before April 9."
          contact={{ name: "Aaron Mesmer, Block Real Estate", detail: "amesmer@blockllc.com · (816) 756-1400" }}
          links={[
            { label: "Surplus KC Schools Portal", url: "https://www.surpluskcschools.com/" },
            { label: "Offering Guidelines PDF", url: "https://resources.finalsite.net/images/v1764871486/kcpublicschoolsorg/s5jhxbqofuqqurlogtcx/OfferingGuidelines_BryantSupplemental_DRAFTREADY.pdf" },
            { label: "KCPS Info", url: "https://www.kcpublicschools.org/about/repurposing/school-site-info-details/~board/school-sites-repurposing/post/bryant-school" },
          ]}
          source="Yutori scout (national) + manual research verification"
        />

        {/* Stocking Elementary — real data */}
        <ActionCard
          title="Stocking Elementary"
          address="863 7th St NW, Grand Rapids, MI 49504"
          mapsUrl="https://www.google.com/maps/search/863+7th+St+NW+Grand+Rapids+MI+49504"
          status="RFP"
          deadline="April 1, 2026"
          metrics={[
            { label: "Building", value: "36,949", unit: "sqft" },
            { label: "Land", value: "3.59", unit: "acres" },
            { label: "Est. Price", value: "$250-800K", unit: "based on comps", color: C.green },
            { label: "Rebl3", value: "—", unit: "pending", color: C.light },
          ]}
          verdict={{ label: "PASS", color: C.red, bg: C.redBg, detail: "100-year-old building, no AC, significant deferred maintenance. Community and RFP scoring strongly favor community hub use — a competing nonprofit proposal is already in play. Demographics weak for TSA/Alpha." }}
          nextStep="No action recommended. RFP evaluation weighted toward community benefit, not school reuse."
          contact={{ name: "Chip Hurley, JLL", detail: "Chip.Hurley@JLL.com" }}
          links={[
            { label: "GRPS RFP Portal", url: "https://grps.org/reimagine/reimagine-former-school-sites/" },
          ]}
          source="Yutori scout (national) + manual research verification"
        />

        {/* Example of what a fully-scored property would look like */}
        <div style={{ padding: "16px 18px", background: C.bg, border: `2px dashed ${C.border}`, borderRadius: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 8 }}>EXAMPLE: What a fully-scored card looks like when rebl3 is connected</div>
          <ActionCard
            title="Example School — Scored by Rebl3"
            address="123 Main St, Scottsdale, AZ 85251"
            mapsUrl="#"
            status="For Sale"
            metrics={[
              { label: "Building", value: "31,000", unit: "sqft" },
              { label: "Land", value: "5.2", unit: "acres" },
              { label: "Asking", value: "$2.4M" },
              { label: "Rebl3 Score", value: "27", unit: "/31", color: C.green },
            ]}
            verdict={{ label: "GO", color: C.green, bg: C.greenBg, detail: "Strong demographics (2,590 families in 20-min drive). K-12 permitted by right (O-1 zone). Dedicated outdoor play area. Well-maintained standalone building. No co-tenancy issues." }}
            nextStep="Submit offer at $2.1M (10% below ask). Building is turnkey — target August opening."
            contact={{ name: "Listing Agent", detail: "agent@example.com · (480) 555-0100" }}
            links={[]}
          />
        </div>
      </section>

      {/* ═══════════ SECTION 2: CLOSURES CONFIRMED ═══════════ */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
          Closures Confirmed <span style={{ fontWeight: 400, color: C.muted }}>— buildings available in 3-12 months</span>
        </h2>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 0, marginBottom: 12 }}>
          Board voted or closure announced. These need assessment so we're ready when buildings hit the market.
        </p>
        {confirmedDistricts.length === 0 && !loading && <div style={{ color: C.light, fontSize: 13 }}>No confirmed closures in this time range.</div>}
        {confirmedDistricts.map((d, i) => (
          <AssessmentCard key={i} {...d} />
        ))}
      </section>

      {/* ═══════════ SECTION 3: PIPELINE ═══════════ */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
          Pipeline <span style={{ fontWeight: 400, color: C.muted }}>— consolidation plans & proposals, 6-18 months out</span>
        </h2>
        {pipelineDistricts.length === 0 && !loading && <div style={{ color: C.light, fontSize: 13 }}>No pipeline signals in this time range.</div>}
        {pipelineDistricts.map((d, i) => (
          <AssessmentCard key={i} {...d} />
        ))}
      </section>

      {/* ═══════════ WHAT'S NEEDED ═══════════ */}
      <section style={{ marginBottom: 40, padding: "16px 20px", background: C.amberBg, borderRadius: 8, border: `1px solid ${C.amber}30` }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 8px 0" }}>What's needed to make this fully automated</h2>
        <div style={{ fontSize: 13, color: C.text }}>
          <p style={{ margin: "0 0 8px 0" }}>The "Action Required" cards above were built from manual research. To generate these automatically for every new scout signal, we need:</p>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 6 }}><strong>Rebl3 hydration</strong> — Once the 7,016 closure schools are scored, each card gets a rebl3 score and automatic GO/NO-GO verdict based on demographics, zoning, building quality, and cost.</li>
            <li style={{ marginBottom: 6 }}><strong>Listing data enrichment</strong> — When a scout finds a "building_sale" signal, automatically search for the listing (LoopNet, Crexi, district RFP portals) to pull price, sqft, contacts, and deadlines.</li>
            <li style={{ marginBottom: 6 }}><strong>Building data from rebl3</strong> — sqft, acreage, condition, and satellite assessment come from rebl3's enrichment agents once hydrated.</li>
          </ol>
          <p style={{ margin: "8px 0 0 0", fontStyle: "italic", color: C.muted }}>Until then, the "Confirmed" and "Pipeline" sections show raw scout signals that need manual research to become actionable.</p>
        </div>
      </section>

      <p style={{ fontSize: 11, color: C.light, marginTop: 20 }}>
        Scout data from Yutori API · Action Required cards from manual research · Pending: rebl3 integration for automated scoring
      </p>
    </div>
  );
}
