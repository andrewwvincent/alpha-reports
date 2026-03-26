import { Link } from "react-router-dom";

/* ── palette ── */
const C = {
  dark: "#0f172a",
  text: "#1e293b",
  muted: "#64748b",
  light: "#94a3b8",
  bg: "#f8fafc",
  white: "#ffffff",
  border: "#e2e8f0",
  accent: "#2563eb",
  accentLight: "#eff6ff",
  green: "#16a34a",
  greenBg: "#f0fdf4",
  amber: "#d97706",
  amberBg: "#fffbeb",
  red: "#dc2626",
  redBg: "#fef2f2",
};

/* ── small helpers ── */

function Badge({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 12px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        color,
        background: bg,
        letterSpacing: 0.6,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "48px 0" }} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: C.accent,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          marginBottom: 20,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Table({
  headers,
  rows,
  caption,
  highlightRow,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  caption?: string;
  highlightRow?: number;
}) {
  return (
    <figure style={{ margin: "20px 0", overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: 14,
          lineHeight: 1.5,
          borderRadius: 8,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
        }}
      >
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: i === 0 ? "left" : "right",
                  padding: "12px 16px",
                  background: C.dark,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: 0.4,
                  whiteSpace: "nowrap",
                  borderBottom: `1px solid ${C.dark}`,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              style={{
                background:
                  highlightRow === ri ? C.accentLight : ri % 2 === 0 ? C.white : C.bg,
              }}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    textAlign: ci === 0 ? "left" : "right",
                    padding: "11px 16px",
                    borderBottom: ri < rows.length - 1 ? `1px solid ${C.border}` : "none",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {caption && (
        <figcaption style={{ fontSize: 12, color: C.light, marginTop: 6 }}>{caption}</figcaption>
      )}
    </figure>
  );
}

function Callout({
  variant,
  children,
}: {
  variant: "info" | "warning" | "success" | "error";
  children: React.ReactNode;
}) {
  const styles = {
    info: { bg: C.accentLight, border: C.accent, color: "#1e40af" },
    warning: { bg: C.amberBg, border: C.amber, color: "#92400e" },
    success: { bg: C.greenBg, border: C.green, color: "#166534" },
    error: { bg: C.redBg, border: C.red, color: "#991b1b" },
  };
  const s = styles[variant];
  return (
    <div
      style={{
        padding: "16px 20px",
        background: s.bg,
        borderLeft: `4px solid ${s.border}`,
        borderRadius: 6,
        margin: "20px 0",
        color: s.color,
        fontSize: 14,
        lineHeight: 1.7,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      style={{
        flex: "1 1 200px",
        padding: "24px",
        background: C.white,
        borderRadius: 10,
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: C.muted,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: "PASS" | "AGGRESSIVE" | "STRETCH" | "FAIL" }) {
  const map = {
    PASS: { color: C.green, bg: C.greenBg },
    AGGRESSIVE: { color: C.amber, bg: C.amberBg },
    STRETCH: { color: C.red, bg: C.redBg },
    FAIL: { color: C.red, bg: C.redBg },
  };
  const s = map[verdict];
  return <Badge color={s.color} bg={s.bg}>{verdict}</Badge>;
}

/* ── report ── */

export default function HudsonBendSingleSport() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Nav */}
        <div style={{ padding: "16px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 40 }}>
          <Link to="/" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>
            &larr; All Reports
          </Link>
        </div>

        {/* Header */}
        <header style={{ marginBottom: 40 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              color: C.accent,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              background: C.accentLight,
              padding: "4px 12px",
              borderRadius: 4,
              marginBottom: 16,
            }}
          >
            Stratos Market Analysis
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: C.dark,
              lineHeight: 1.2,
              margin: "0 0 8px",
            }}
          >
            Hudson Bend — Single-Sport Middle School Micro Schools
          </h1>
          <p style={{ fontSize: 15, color: C.muted, margin: "0 0 4px" }}>
            4402 Hudson Bend Rd, Austin, TX 78734
          </p>
          <p style={{ fontSize: 13, color: C.light }}>
            March 26, 2026 &nbsp;&middot;&nbsp; Grades 6–8 &nbsp;&middot;&nbsp; $35K Tuition
            &nbsp;&middot;&nbsp; 4–5 Sport Tracks (Beach Volleyball, Indoor Volleyball, Basketball, etc.)
          </p>
        </header>

        {/* ── Question ── */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "28px 32px",
            marginBottom: 32,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
            Question
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: C.text }}>
            Can a cluster of 4–5 single-sport micro schools (grades 6–8) at{" "}
            <strong>$35K tuition</strong> support <strong>150–200 total students</strong> at the
            Hudson Bend TSA campus?
          </p>
        </div>

        {/* ── Short Answer ── */}
        <Callout variant="warning">
          <strong style={{ fontSize: 15 }}>Short Answer</strong>
          <br />
          Not at 20 minutes. Borderline at 30 minutes. Achievable at 40 minutes — but 40-minute daily
          commutes are a real commitment for middle school families.
          <br /><br />
          The model supports <strong>~110–130 students</strong> as the defensible launch range at $35K tuition.
          150 is achievable with sport-specific pull factors. 200 is a maturity target, not a planning number.
        </Callout>

        {/* ── Key Metrics ── */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "32px 0" }}>
          <StatCard
            label="20-min WTP Pool (Gr 6–8)"
            value="800"
            sub="kids who can pay $35K"
            color={C.red}
          />
          <StatCard
            label="30-min WTP Pool (Gr 6–8)"
            value="2,586"
            sub="kids who can pay $35K"
            color={C.amber}
          />
          <StatCard
            label="40-min WTP Pool (Gr 6–8)"
            value="9,786"
            sub="kids who can pay $35K"
            color={C.green}
          />
        </div>

        <Divider />

        {/* ── WTP Model ── */}
        <Section title="Willingness-to-Pay Model at $35K">
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: 1.7 }}>
            The Stratos WTP model weights each income bucket by the probability a household at that
            income would pay $35K annual tuition — replacing a simple income threshold with a
            continuous probability curve across the full income distribution.
          </p>
          <Table
            headers={["Income Bucket", "WTP Probability", "Tuition Load", "Market Role"]}
            rows={[
              [
                "$125–150K",
                "5.0%",
                "23–28%",
                <Badge color={C.light} bg={C.bg}>Priced Out</Badge>,
              ],
              [
                "$150–200K",
                "21.1%",
                "18–23%",
                <Badge color={C.amber} bg={C.amberBg}>Stretch</Badge>,
              ],
              [
                "$200–250K",
                "40.0%",
                "14–18%",
                <Badge color={C.amber} bg={C.amberBg}>Possible</Badge>,
              ],
              [
                <strong>$250–500K</strong>,
                <strong style={{ color: C.accent }}>73.9%</strong>,
                "7–14%",
                <Badge color={C.accent} bg={C.accentLight}>Core Market</Badge>,
              ],
              [
                <strong>$500K+</strong>,
                <strong style={{ color: C.green }}>90.6%</strong>,
                "&lt;7%",
                <Badge color={C.green} bg={C.greenBg}>Strong</Badge>,
              ],
            ]}
            caption="Piecewise WTP curve. Probability represents expected share of households at each income level willing to pay $35K."
          />
        </Section>

        <Divider />

        {/* ── Catchment ── */}
        <Section title="Catchment Data by Drive Time">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 12px" }}>
            All Grades (Ages 5–17)
          </h3>
          <Table
            headers={["", "20-min", "30-min", "40-min"]}
            rows={[
              ["Census block groups", "22", "99", "553"],
              ["Total kids 5–17", "8,260", "31,260", "152,856"],
              ["WTP-adjusted pool (can pay $35K)", "3,466", "11,206", "42,405"],
              ["Travis Co. private school share", "12.87%", "12.87%", "12.87%"],
              ["Market-adjusted pool", "446", "1,443", "5,459"],
            ]}
          />

          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: C.text,
              margin: "32px 0 4px",
            }}
          >
            Grade-Adjusted: Grades 6–8 Only
          </h3>
          <p style={{ fontSize: 13, color: C.light, marginBottom: 12 }}>
            3 of 13 grade years in the 5–17 age band. Assumes uniform distribution.
          </p>
          <Table
            headers={["", "20-min", "30-min", "40-min"]}
            rows={[
              ["Grade 6–8 kids (total)", "1,906", "7,214", "35,274"],
              [
                <strong>Grade 6–8 WTP pool</strong>,
                <strong style={{ color: C.red }}>800</strong>,
                <strong style={{ color: C.amber }}>2,586</strong>,
                <strong style={{ color: C.green }}>9,786</strong>,
              ],
              ["Grade 6–8 market pool (private school prospects)", "103", "333", "1,260"],
            ]}
            highlightRow={1}
          />
        </Section>

        <Divider />

        {/* ── Capture Rates ── */}
        <Section title="Capture Rate Analysis">
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.7 }}>
            Capture rate = target enrollment &divide; grade-adjusted WTP pool. Measures what share of
            families who <em>can afford</em> $35K you need to actually enroll.
          </p>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 12px" }}>
            At 150 Students
          </h3>
          <Table
            headers={["Drive Time", "WTP Pool (6–8)", "Capture Rate", "Verdict"]}
            rows={[
              [
                "20 minutes",
                "800",
                <strong style={{ color: C.red }}>18.8%</strong>,
                <VerdictBadge verdict="FAIL" />,
              ],
              [
                "30 minutes",
                "2,586",
                <strong style={{ color: C.amber }}>5.8%</strong>,
                <VerdictBadge verdict="AGGRESSIVE" />,
              ],
              [
                "40 minutes",
                "9,786",
                <strong style={{ color: C.green }}>1.5%</strong>,
                <VerdictBadge verdict="PASS" />,
              ],
            ]}
          />

          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "28px 0 12px" }}>
            At 200 Students
          </h3>
          <Table
            headers={["Drive Time", "WTP Pool (6–8)", "Capture Rate", "Verdict"]}
            rows={[
              [
                "20 minutes",
                "800",
                <strong style={{ color: C.red }}>25.0%</strong>,
                <VerdictBadge verdict="FAIL" />,
              ],
              [
                "30 minutes",
                "2,586",
                <strong style={{ color: C.red }}>7.7%</strong>,
                <VerdictBadge verdict="STRETCH" />,
              ],
              [
                "40 minutes",
                "9,786",
                <strong style={{ color: C.green }}>2.0%</strong>,
                <VerdictBadge verdict="PASS" />,
              ],
            ]}
          />

          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "28px 0 12px" }}>
            Capture Rate Benchmarks
          </h3>
          <p style={{ fontSize: 13, color: C.light, marginBottom: 12 }}>
            March 17 Hudson Bend scenarios showed 3–8% capture against raw income-threshold pools. Industry norms for niche private schools:
          </p>
          <Table
            headers={["Capture Rate", "Interpretation"]}
            rows={[
              ["< 3%", "Conservative — achievable with moderate brand/marketing"],
              ["3–5%", "Moderate — requires strong differentiation"],
              ["5–8%", "Aggressive — requires exceptional brand or underserved niche"],
              ["8–12%", "Very aggressive — realistic only for category-defining schools"],
              ["> 12%", "Unrealistic for a new entrant"],
            ]}
          />
        </Section>

        <Divider />

        {/* ── Max Enrollment ── */}
        <Section title="Model-Supported Enrollment at $35K">
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: 1.7 }}>
            Maximum defensible enrollment at each drive time, by capture rate assumption.
          </p>
          <Table
            headers={["Capture Rate", "20-min", "30-min", "40-min"]}
            rows={[
              ["3% — Conservative", "24", "78", "294"],
              [
                <span>
                  5% — Moderate{" "}
                  <span style={{ color: C.light, fontSize: 12 }}>(recommended planning basis)</span>
                </span>,
                "40",
                <strong style={{ color: C.accent }}>129</strong>,
                "489",
              ],
              ["8% — Aggressive", "64", "207", "783"],
            ]}
            highlightRow={1}
            caption="At 5% capture of the 30-min WTP pool, the model supports 129 students."
          />

          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "28px 0 12px" }}>
            Realistic Range by Radius
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            <Callout variant="error">
              <strong>20-minute radius: Max ~40 students.</strong> The catchment is geographically
              constrained by Lake Travis. Only 800 grade 6–8 kids whose families can afford $35K.
              This radius alone cannot support the concept.
            </Callout>
            <Callout variant="warning">
              <strong>30-minute radius: Max ~80–130 students.</strong> Opens up significantly (3.8x
              the pool). At 5% capture, the model supports 129 students. Getting to 150 requires
              ~5.8% capture — achievable but aggressive for a new, unproven concept. 200 requires
              7.7%, which pushes into "category-defining" territory before the brand exists.
            </Callout>
            <Callout variant="success">
              <strong>40-minute radius: 150–200 is comfortable on paper.</strong> At 1.5–2.0%
              capture, well within conservative benchmarks. The question is whether families will
              actually drive 40 minutes each way for a middle school program.
            </Callout>
          </div>
        </Section>

        <Divider />

        {/* ── Drive-Time Realism ── */}
        <Section title="Drive-Time Realism">
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: 1.7 }}>
            The model counts every family inside the isochrone equally. In practice, enrollment
            probability drops with distance.
          </p>
          <Table
            headers={["Drive Time", "Typical Behavior", "Implication"]}
            rows={[
              ["0–15 min", "Default consideration set", "Families will try it"],
              [
                "15–25 min",
                "Acceptable for differentiated product",
                "Most private school families here",
              ],
              [
                "25–35 min",
                "Requires strong pull factor",
                "Sport-specific families tolerate this",
              ],
              [
                "35–40 min",
                "Lifestyle decision",
                <span>Only deeply committed sport families — <strong>but they exist</strong></span>,
              ],
            ]}
          />
          <Callout variant="success">
            <strong>Sport-specific advantage:</strong> Single-sport micro schools have a structural
            pull-factor advantage. Families with competitive middle school athletes are already
            driving 30–40 minutes for travel practice, tournaments, and showcases. A school that
            wraps academics around the sport <em>eliminates</em> a commute rather than adding one —
            the effective 30-minute pool may behave more like a 40-minute pool for the right families.
          </Callout>
        </Section>

        <Divider />

        {/* ── Bottom Line ── */}
        <Section title="Bottom Line">
          <Table
            headers={["Target", "Model Verdict", "What Has to Be True"]}
            rows={[
              [
                <strong>150 at $35K</strong>,
                <Badge color={C.amber} bg={C.amberBg}>Achievable but Tight</Badge>,
                <span style={{ whiteSpace: "normal" }}>
                  Families from the 30-min ring are your bread and butter (~130 of 150). You need
                  ~20 families from the 30–40 min ring. The sport specialization must be the pull
                  factor that extends effective drive time.
                </span>,
              ],
              [
                <strong>200 at $35K</strong>,
                <Badge color={C.red} bg={C.redBg}>Stretch</Badge>,
                <span style={{ whiteSpace: "normal" }}>
                  Requires either 7.7% capture at 30-min (aggressive for launch) or meaningful draw
                  from the 30–40 min ring. Not impossible at maturity — hard at launch.
                </span>,
              ],
            ]}
          />

          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "28px 0 12px" }}>
            If 150–200 Doesn't Clear the Bar, What Does?
          </h3>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: 1.7 }}>
            The model's sweet spot at $35K tuition across a blended 30–40 minute effective catchment:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {[
              { students: 80, rate: "3.1%", label: "Conservative. Very achievable." },
              { students: 110, rate: "4.3%", label: "Moderate. Consistent with March 17 scenarios." },
              { students: 130, rate: "5.0%", label: "Solid but requires the brand to land." },
              { students: 150, rate: "5.8%", label: "Aggressive. Possible with sport-specific pull." },
            ].map(({ students, rate, label }) => (
              <div
                key={students}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 16px",
                  background: students <= 130 ? C.white : C.bg,
                  borderRadius: 6,
                  border: `1px solid ${students <= 130 ? C.border : "transparent"}`,
                  boxShadow: students <= 130 ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: students <= 110 ? C.green : students <= 130 ? C.accent : C.amber,
                    minWidth: 50,
                  }}
                >
                  {students}
                </span>
                <span style={{ fontSize: 13, color: C.muted, minWidth: 50 }}>{rate} capture</span>
                <span style={{ fontSize: 14, color: C.text }}>{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Recommendation ── */}
        <div
          style={{
            background: C.white,
            border: `2px solid ${C.dark}`,
            borderRadius: 12,
            padding: "32px",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.accent,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 20,
            }}
          >
            Recommendation
          </div>

          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Launch Target (Yr 1–2)
              </div>
              <div style={{ fontSize: 40, fontWeight: 800, color: C.accent, letterSpacing: -1 }}>
                110–130
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                students across 4–5 sport tracks
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Growth Target (Yr 3+)
              </div>
              <div style={{ fontSize: 40, fontWeight: 800, color: C.green, letterSpacing: -1 }}>
                150–175
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                as sport tracks mature and reputation compounds
              </div>
            </div>
          </div>

          <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>
            <strong>150 at $35K is achievable but not a launch-day number.</strong> The 30-minute
            catchment supports ~130 students at 5% capture. Getting to 150 requires drawing ~20
            families from the 30–40 minute ring — plausible for sport-committed families — or
            achieving 5.8% capture at 30 minutes (aggressive but not unprecedented).
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>
            <strong>200 is a stretch.</strong> It requires 7.7% capture at 30 minutes or significant
            draw from the outer ring. Model it as upside, not as a planning basis.
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.8,
              margin: 0,
              padding: "12px 16px",
              background: C.bg,
              borderRadius: 6,
              color: C.muted,
            }}
          >
            <strong style={{ color: C.text }}>Consistency check:</strong> The narrower grade band
            (6–8 vs. K–8) and higher tuition ($35K vs. $20–30K) roughly offset each other — the
            March 17 analysis also landed at 110–130 as the defensible range. The consistency across
            models and assumptions strengthens confidence in this range.
          </p>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 20,
            borderTop: `1px solid ${C.border}`,
            fontSize: 11,
            color: C.light,
            lineHeight: 1.7,
          }}
        >
          Stratos Affordability Model v2. Piecewise WTP curve across 12 income buckets. Travis County
          private school market share: 12.87%. Grade-range adjustment: 3/13 (uniform distribution
          across K–12 within 5–17 age band). ACS block group data via 20/30/40-minute drive-time
          isochrones. Prepared for internal use only.
        </div>
      </div>
    </div>
  );
}
