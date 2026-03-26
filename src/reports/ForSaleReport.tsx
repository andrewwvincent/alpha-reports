import { Link } from "react-router-dom";

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

function Badge({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700, color, background: bg, letterSpacing: 0.6, textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { c: string; bg: string }> = {
    actively_listed: { c: C.accent, bg: C.accentLight },
    bid_open: { c: C.green, bg: C.greenBg },
    rfp_issued: { c: C.amber, bg: C.amberBg },
    sold: { c: C.red, bg: C.redBg },
    not_available: { c: C.muted, bg: "#f1f5f9" },
  };
  const s = colors[status] || colors.not_available;
  return <Badge color={s.c} bg={s.bg}>{status.replace(/_/g, " ")}</Badge>;
}

function Verdict({ v }: { v: "GO" | "MAYBE" | "NO" }) {
  const m = { GO: { c: C.green, bg: C.greenBg }, MAYBE: { c: C.amber, bg: C.amberBg }, NO: { c: C.red, bg: C.redBg } };
  return <Badge color={m[v].c} bg={m[v].bg}>{v}</Badge>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 20 }}>{title}</h2>
      {children}
    </section>
  );
}

interface Property {
  name: string;
  district: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  price: string;
  deadline: string;
  building: string;
  bidProcess: string;
  contacts: { name: string; email?: string; phone?: string }[];
  links: { label: string; url: string }[];
  tsa: { verdict: "GO" | "MAYBE" | "NO"; reason: string };
  alpha: { verdict: "GO" | "MAYBE" | "NO"; reason: string };
  recommendation: string;
  recColor: string;
  issue?: string;
}

const REMOVE: Property[] = [
  {
    name: "Bristol Tennessee Middle School",
    district: "Bristol City Schools",
    address: "840 Alabama St", city: "Bristol", state: "TN", zip: "37620",
    status: "sold", price: "$750,000 (sold Apr 2025)", deadline: "",
    building: "46,475 sqft on 15.28 acres. Actual address was 1717 Bristol Caverns Hwy.",
    bidProcess: "", contacts: [], links: [],
    tsa: { verdict: "NO", reason: "Sold" }, alpha: { verdict: "NO", reason: "Sold" },
    recommendation: "REMOVE", recColor: C.redBg,
    issue: "WRONG ADDRESS + SOLD — 840 Alabama St is the new operating school. The actual for-sale property (1717 Bristol Caverns Hwy) sold April 2025 for $750K.",
  },
  {
    name: "Kings Trail Elementary",
    district: "Duval County Schools",
    address: "7401 Old Kings Rd S", city: "Jacksonville", state: "FL", zip: "32217",
    status: "sold", price: "$3,700,000", deadline: "",
    building: "Large campus with fields. Sold to Dream Finders Homes for residential development (~100 homes).",
    bidProcess: "", contacts: [], links: [],
    tsa: { verdict: "NO", reason: "Sold" }, alpha: { verdict: "NO", reason: "Sold" },
    recommendation: "REMOVE", recColor: C.redBg,
    issue: "SOLD — Board approved sale to Dream Finders Homes on March 13, 2026.",
  },
  {
    name: "Bryant Elementary (Independence)",
    district: "Independence School District 30",
    address: "827 W College St", city: "Independence", state: "MO", zip: "64050",
    status: "not_available", price: "", deadline: "",
    building: "School is still operating (193 students). Not for sale.",
    bidProcess: "", contacts: [], links: [],
    tsa: { verdict: "NO", reason: "Wrong school" }, alpha: { verdict: "NO", reason: "Wrong school" },
    recommendation: "REMOVE", recColor: C.redBg,
    issue: "WRONG SCHOOL — 827 W College is still operating. The April 9 deadline is for KCPS Bryant School at 319 Westover Rd, Kansas City (Brookside). See corrected entry below.",
  },
  {
    name: "Taylor Canyon School",
    district: "Ogden City District",
    address: "2130 Taylor Ave", city: "Ogden", state: "UT", zip: "84401",
    status: "not_available", price: "~$4M estimated", deadline: "",
    building: "Building demolished in 2022. Vacant 4.23-acre lot. Ogden City pursuing purchase for park.",
    bidProcess: "", contacts: [], links: [],
    tsa: { verdict: "NO", reason: "No building" }, alpha: { verdict: "NO", reason: "No building" },
    recommendation: "REMOVE", recColor: C.redBg,
    issue: "DEMOLISHED — Building torn down in 2022. Vacant land only. City is buying it for a park.",
  },
  {
    name: "Turner Middle School",
    district: "Thompson School District R-2J",
    address: "950 Massachusetts Ave", city: "Berthoud", state: "CO", zip: "80513",
    status: "not_available", price: "", deadline: "",
    building: "School is still operating. Only a 6.7-acre adjacent parcel of surplus land is being sold.",
    bidProcess: "", contacts: [], links: [],
    tsa: { verdict: "NO", reason: "School still open" }, alpha: { verdict: "NO", reason: "School still open" },
    recommendation: "REMOVE", recColor: C.redBg,
    issue: "SCHOOL STILL OPEN — Only adjacent surplus land is being sold to the Town of Berthoud for an arboretum.",
  },
  {
    name: "Roland Green School",
    district: "Mansfield Public Schools",
    address: "29 Dean St", city: "Mansfield", state: "MA", zip: "02048",
    status: "not_available", price: "~$1M (land value after demo)", deadline: "",
    building: "Century-old building. Town voted to demolish ($600K for asbestos remediation + demo) and sell as 3 house lots.",
    bidProcess: "", contacts: [], links: [],
    tsa: { verdict: "NO", reason: "Being demolished" }, alpha: { verdict: "NO", reason: "Being demolished" },
    recommendation: "REMOVE", recColor: C.redBg,
    issue: "BEING DEMOLISHED — Town plan is to raze the building and sell the land as residential lots.",
  },
];

const AVAILABLE: Property[] = [
  {
    name: "KCPS Bryant School (Brookside)",
    district: "Kansas City Public Schools",
    address: "319 Westover Rd", city: "Kansas City", state: "MO", zip: "64113",
    status: "rfp_issued", price: "Not stated (proposal-based). KC comps: $7-33/sqft, median ~$19/sqft. At $19/sqft ≈ $870K.",
    deadline: "April 9, 2026",
    building: "45,760 sqft on 4.15 acres. Built 1915/1920/1938 (additions). Vacant since 2009, mothballed 2016. Needs significant renovation. Deed restriction: school purposes or single-family residential.",
    bidProcess: "Proposal-based (not highest-bid-wins). Evaluated on project feasibility, qualifications, and community goals. Community preferred single-family homes over apartments — but deed allows school use.",
    contacts: [
      { name: "Aaron Mesmer (Block Real Estate)", email: "amesmer@blockllc.com" },
      { name: "Cristel Highland (Block Real Estate)", email: "chighland@blockllc.com", phone: "(816) 756-1400" },
      { name: "KCPS Repurposing Office", email: "repurposing@kcpublicschools.org", phone: "(816) 418-7725" },
    ],
    links: [
      { label: "Surplus KC Schools Portal", url: "https://www.surpluskcschools.com/" },
      { label: "Block Real Estate Listing", url: "https://www.blockllc.com/kc-surplus-schools" },
      { label: "KCPS Info Page", url: "https://www.kcpublicschools.org/about/repurposing/school-site-info-details/~board/school-sites-repurposing/post/bryant-school" },
      { label: "Offering Guidelines PDF", url: "https://resources.finalsite.net/images/v1764871486/kcpublicschoolsorg/s5jhxbqofuqqurlogtcx/OfferingGuidelines_BryantSupplemental_DRAFTREADY.pdf" },
    ],
    tsa: { verdict: "MAYBE", reason: "Brookside is one of KC's most affluent neighborhoods. Pipeline scored the WRONG address (Independence MO). Need to run demographics at 319 Westover — results could be materially different. Limited field space (4.15 acres) but neighborhood parks nearby." },
    alpha: { verdict: "MAYBE", reason: "Brookside is exactly the type of prestige neighborhood Alpha targets. Historic building could have curb appeal after renovation. Deed restriction explicitly allows school use." },
    recommendation: "PRIORITY INVESTIGATE — Brookside is affluent KC. Deed allows school use. Demographics need re-scoring at correct address. April 9 deadline.",
    recColor: C.greenBg,
    issue: "CORRECTED: Pipeline had wrong address (827 W College, Independence). Actual property is in Brookside, KC.",
  },
  {
    name: "Stocking Elementary",
    district: "Grand Rapids Public Schools",
    address: "863 7th St NW", city: "Grand Rapids", state: "MI", zip: "49504",
    status: "rfp_issued", price: "Not stated (RFP). GRPS comps: $250K-$800K. Community benefit weighted in scoring.",
    deadline: "April 1, 2026 at 4:00 PM",
    building: "36,949 sqft on 3.59 acres. Built 1924 (100 years old). No AC. Significant deferred maintenance. Closed June 2024.",
    bidProcess: "Submit electronically to JLL by April 1 at 4:00 PM. Community input factored into scoring matrix. Community strongly favors community hub/center use — a nonprofit is already proposing one.",
    contacts: [
      { name: "Chip Hurley (JLL)", email: "Chip.Hurley@JLL.com" },
      { name: "Jeff Karger (JLL)", email: "Jeff.Karger@JLL.com" },
      { name: "GRPS", phone: "(616) 819-2000" },
    ],
    links: [
      { label: "GRPS RFP Portal", url: "https://grps.org/reimagine/reimagine-former-school-sites/" },
      { label: "RFP Announcement", url: "https://grps.org/pub/stories/view/requests-for-proposals-now-open-for-future-of-alexander-stocking" },
      { label: "Demographics Dashboard", url: "https://school-maps.s3.amazonaws.com/dashboards/863-7th-st-nw/dashboard_20260323T204211Z.html" },
    ],
    tsa: { verdict: "NO", reason: "1,818 families (below 2,500 floor). Limited field space. 100-year-old building needs major renovation." },
    alpha: { verdict: "NO", reason: "233 families at Alpha level. West Side GR is not a prestige neighborhood." },
    recommendation: "LIKELY PASS — RFP favors community benefit, competing nonprofit proposal in play, building needs significant investment. Only 6 days to respond.",
    recColor: C.amberBg,
  },
  {
    name: "Del Norte Heights Elementary",
    district: "Ysleta ISD",
    address: "1800 Winslow Rd", city: "El Paso", state: "TX", zip: "79915",
    status: "rfp_issued", price: "$1-5M estimated. $10K earnest money required. Sold as-is.",
    deadline: "Open (no stated deadline)",
    building: "69,876 sqft (one-story) on 13.889 acres. Gym with stage, cafeteria, commercial kitchen, library, basketball courts, parking, fencing.",
    bidProcess: "Submit letter of intent to Ysleta ISD. Board of Trustees reviews. Feasibility period for inspections.",
    contacts: [{ name: "Ysleta ISD Purchasing/Facilities" }],
    links: [
      { label: "RFP on Bid Banana", url: "https://bidbanana.thebidlab.com/bid/GcL23APs2dvu6eUAd13f" },
      { label: "Demographics Dashboard", url: "https://school-maps.s3.amazonaws.com/dashboards/1800-winslow-rd/dashboard_20260323T205204Z.html" },
    ],
    tsa: { verdict: "NO", reason: "559 families at TSA level. El Paso demographics don't support premium tuition." },
    alpha: { verdict: "NO", reason: "0 families at Alpha level." },
    recommendation: "PASS — Large campus (14 acres, 70K sqft) but El Paso demographics non-viable for any model.",
    recColor: C.redBg,
  },
  {
    name: "KIPP Destiny Elementary",
    district: "KIPP Texas Public Schools",
    address: "3663 W Camp Wisdom Rd", city: "Dallas", state: "TX", zip: "75237",
    status: "actively_listed", price: "Not publicly listed. Contact CBRE.",
    deadline: "Open",
    building: "77,699 sqft (one-story, former Mervyn's store, fully renovated by KIPP 2014) on 9.89 acres + 3.65 adjacent acres = ~13.54 total.",
    bidProcess: "Listed through CBRE Education Advisory Practice Group.",
    contacts: [{ name: "CBRE Education Advisory Practice Group" }],
    links: [
      { label: "CBRE Listing", url: "https://www.cbre.com/properties/properties-for-lease/specialty/details/US-SMPL-160399/3663-west-camp-wisdom-road-dallas-tx-75237" },
      { label: "LoopNet", url: "https://www.loopnet.com/property/3663-w-camp-wisdom-rd-dallas-tx-75237/48113-0060450G000060000/" },
      { label: "Demographics Dashboard", url: "https://school-maps.s3.amazonaws.com/dashboards/3663-w-camp-wisdom-rd/dashboard_20260223T195701Z.html" },
    ],
    tsa: { verdict: "NO", reason: "693 families at TSA level. South Dallas/DeSoto area." },
    alpha: { verdict: "NO", reason: "274 families at Alpha level. Not a premium neighborhood." },
    recommendation: "PASS — Impressive facility (78K sqft, 13+ acres, purpose-renovated) but South Dallas demographics don't work.",
    recColor: C.redBg,
  },
  {
    name: "Conneaut Valley MS",
    district: "Conneaut SD",
    address: "22154 State Highway 18", city: "Conneautville", state: "PA", zip: "16406",
    status: "actively_listed", price: "$2,175,000 (reduced from $4.1M → $3.4M → $2.5M → $2.175M). District spending $120K/yr on maintenance.",
    deadline: "Open",
    building: "~102,000 sqft (three-level, built 1954) on 27.4 acres. Two gyms, athletic fields, 159 parking spaces, Wi-Fi.",
    bidProcess: "Traditional listing through broker. Board has final approval.",
    contacts: [{ name: "Jim Schons, REAL of Pennsylvania" }],
    links: [
      { label: "Meadville Tribune - Price Break", url: "https://www.meadvilletribune.com/news/price-break-expected-on-former-conneaut-valley-middle-school/article_7aab407d-43fa-4d40-aff6-f5daee2b3914.html" },
      { label: "Demographics Dashboard", url: "https://school-maps.s3.amazonaws.com/dashboards/22154-pa-18/dashboard_20260323T211429Z.html" },
    ],
    tsa: { verdict: "NO", reason: "Only 4 families at TSA level. Rural northwestern PA." },
    alpha: { verdict: "NO", reason: "0.28 families at Alpha level." },
    recommendation: "PASS — Huge campus (102K sqft, 27 acres) at desperate pricing, but demographics are a hard no. Price cuts from $4.1M → $2.175M tell you the market agrees.",
    recColor: C.redBg,
  },
  {
    name: "Waukesha East Alternative School",
    district: "Waukesha School District",
    address: "1150 Whiterock Ave", city: "Waukesha", state: "WI", zip: "53186",
    status: "bid_open", price: "Not yet listed. Pre-sale phase.",
    deadline: "TBD (sale planned 2026-27)",
    building: "Sqft TBD. Part of 'Optimizing Our Future' plan — 6 schools closing. Near river.",
    bidProcess: "Board approved consolidation Nov 2025. Not yet formally listed for sale.",
    contacts: [{ name: "School District of Waukesha" }],
    links: [
      { label: "District Property Sale Info", url: "https://sdw.waukesha.k12.wi.us/article/851373" },
    ],
    tsa: { verdict: "MAYBE", reason: "1,197 families (below 2,500) but 4,697 wealthy (near ceiling). Best wealth score of all properties. Waukesha is affluent Milwaukee suburb. Limited field space though." },
    alpha: { verdict: "NO", reason: "405 families at Alpha level. Enrollment too low at $40K despite wealthy area." },
    recommendation: "WATCH — Best wealth demographics in the pipeline. Monitor for formal listing. Waukesha is a strong market.",
    recColor: C.amberBg,
  },
  {
    name: "Hawthorne School",
    district: "Helena Elementary",
    address: "430 Madison Ave", city: "Helena", state: "MT", zip: "59601",
    status: "rfp_issued", price: "Not stated. $4.6M deferred maintenance backlog.",
    deadline: "TBD",
    building: "Built 1921, ~180 students. Closed June 2025. A nonprofit proposed long-term lease for community center.",
    bidProcess: "District exploring lease vs. sale. Working with realtor.",
    contacts: [{ name: "Helena Public Schools / Superintendent Rex Weltz" }],
    links: [
      { label: "MT Free Press - Community Center Proposal", url: "https://montanafreepress.org/2026/01/19/proposal-would-turn-hawthorne-into-community-center/" },
      { label: "Demographics Dashboard", url: "https://school-maps.s3.amazonaws.com/dashboards/430-madison-ave/dashboard_20260323T204552Z.html" },
    ],
    tsa: { verdict: "NO", reason: "17 families at TSA level. Helena is too small." },
    alpha: { verdict: "NO", reason: "0 families at Alpha level." },
    recommendation: "PASS — Helena too small for any model. $4.6M deferred maintenance.",
    recColor: C.redBg,
  },
  {
    name: "Grant Elementary",
    district: "Wausau School District",
    address: "500 N 4th Ave", city: "Wausau", state: "WI", zip: "54401",
    status: "actively_listed", price: "$550,000",
    deadline: "Open",
    building: "52,496 sqft (three-story, built 1910) on 5 acres. Historic landmark. Previous sale fell through; relisted Oct 2025.",
    bidProcess: "Traditional broker listing.",
    contacts: [{ name: "Tim Wimmer, Wimmer Realty" }],
    links: [
      { label: "Coldwell Banker", url: "https://www.coldwellbankerhomes.com/chicago-milwaukee/500-n-4th-ave/pid_65938897/" },
      { label: "LoopNet", url: "https://www.loopnet.com/Listing/500-N-4th-Ave-Wausau-WI/37959397/" },
    ],
    tsa: { verdict: "NO", reason: "50 families at TSA level. Wausau is too small." },
    alpha: { verdict: "NO", reason: "5 families at Alpha level." },
    recommendation: "PASS — Cheap ($550K for 52K sqft on 5 acres) but demographics non-viable. Previous sale already fell through.",
    recColor: C.redBg,
  },
  {
    name: "Memorial Intermediate",
    district: "Alice ISD",
    address: "900 W Third St", city: "Alice", state: "TX", zip: "78332",
    status: "rfp_issued", price: "Appraisals pending.",
    deadline: "TBD",
    building: "Sqft TBD. Vacant since June 2025. Part of 2019 bond consolidation (9 → 6 schools).",
    bidProcess: "Alice ISD will conduct appraisals, then open bid process. Board has final say.",
    contacts: [{ name: "Alice ISD", phone: "(361) 664-0981" }],
    links: [
      { label: "KIII TV - Campuses for Sale", url: "https://www.kiiitv.com/article/news/education/elementary-campuses-for-sale-in-alice/503-49f7b89e-189d-4bf3-be56-f41607446b66" },
      { label: "Demographics Dashboard", url: "https://school-maps.s3.amazonaws.com/dashboards/900-w-3rd-st/dashboard_20260323T205423Z.html" },
    ],
    tsa: { verdict: "NO", reason: "Near-zero enrollment families. Small South TX town." },
    alpha: { verdict: "NO", reason: "0 families at Alpha level." },
    recommendation: "PASS — Near-zero demand for any model.",
    recColor: C.redBg,
  },
];

function PropertyCard({ p, showIssue }: { p: Property; showIssue?: boolean }) {
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(`${p.address}, ${p.city}, ${p.state} ${p.zip}`)}`;
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 24px", marginBottom: 16, background: C.white }}>
      {showIssue && p.issue && (
        <div style={{ background: C.redBg, borderLeft: `4px solid ${C.red}`, padding: "8px 12px", marginBottom: 16, borderRadius: 4, fontSize: 13, color: C.red }}>
          {p.issue}
        </div>
      )}
      {!showIssue && p.issue && (
        <div style={{ background: C.amberBg, borderLeft: `4px solid ${C.amber}`, padding: "8px 12px", marginBottom: 16, borderRadius: 4, fontSize: 13, color: C.amber }}>
          {p.issue}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{p.name}</h3>
          <div style={{ fontSize: 13, color: C.muted }}>{p.district}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <StatusBadge status={p.status} />
          {p.deadline && <span style={{ fontSize: 12, fontWeight: 600, color: C.red }}>{p.deadline}</span>}
        </div>
      </div>

      <table style={{ width: "100%", marginTop: 12, fontSize: 13, borderCollapse: "collapse" }}>
        <tbody>
          <tr><td style={{ padding: "4px 0", color: C.muted, width: 120, verticalAlign: "top" }}>Address</td><td><a href={mapsUrl} style={{ color: C.accent }} target="_blank" rel="noreferrer">{p.address}, {p.city}, {p.state} {p.zip}</a></td></tr>
          {p.price && <tr><td style={{ padding: "4px 0", color: C.muted, verticalAlign: "top" }}>Price</td><td style={{ fontWeight: 600 }}>{p.price}</td></tr>}
          {p.building && <tr><td style={{ padding: "4px 0", color: C.muted, verticalAlign: "top" }}>Building</td><td>{p.building}</td></tr>}
          {p.bidProcess && <tr><td style={{ padding: "4px 0", color: C.muted, verticalAlign: "top" }}>How to Bid</td><td>{p.bidProcess}</td></tr>}
        </tbody>
      </table>

      {p.contacts.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 13 }}>
          <span style={{ color: C.muted, fontWeight: 600 }}>Contacts: </span>
          {p.contacts.map((c, i) => (
            <span key={i}>
              {i > 0 && " · "}
              {c.name}
              {c.email && <> (<a href={`mailto:${c.email}`} style={{ color: C.accent }}>{c.email}</a>)</>}
              {c.phone && <> {c.phone}</>}
            </span>
          ))}
        </div>
      )}

      {p.links.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {p.links.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noreferrer" style={{ color: C.accent }}>{l.label}</a>
          ))}
          <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ color: C.accent }}>Map</a>
        </div>
      )}

      {p.status !== "sold" && p.status !== "not_available" && (
        <table style={{ width: "100%", marginTop: 16, fontSize: 13, borderCollapse: "collapse", borderRadius: 6, overflow: "hidden", border: `1px solid ${C.border}` }}>
          <thead>
            <tr style={{ background: C.bg }}>
              <th style={{ padding: "6px 10px", textAlign: "left", fontSize: 11, color: C.muted, fontWeight: 600 }}>Model</th>
              <th style={{ padding: "6px 10px", textAlign: "center", fontSize: 11, color: C.muted, fontWeight: 600 }}>Verdict</th>
              <th style={{ padding: "6px 10px", textAlign: "left", fontSize: 11, color: C.muted, fontWeight: 600 }}>Reasoning</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderTop: `1px solid ${C.border}` }}>
              <td style={{ padding: "6px 10px", fontWeight: 600 }}>TSA ($25K)</td>
              <td style={{ padding: "6px 10px", textAlign: "center" }}><Verdict v={p.tsa.verdict} /></td>
              <td style={{ padding: "6px 10px" }}>{p.tsa.reason}</td>
            </tr>
            <tr style={{ borderTop: `1px solid ${C.border}` }}>
              <td style={{ padding: "6px 10px", fontWeight: 600 }}>Alpha ($40K)</td>
              <td style={{ padding: "6px 10px", textAlign: "center" }}><Verdict v={p.alpha.verdict} /></td>
              <td style={{ padding: "6px 10px" }}>{p.alpha.reason}</td>
            </tr>
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 12, padding: "8px 12px", background: p.recColor, borderRadius: 4, fontSize: 13, fontWeight: 500 }}>
        {p.recommendation}
      </div>
    </div>
  );
}

export default function ForSaleReport() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: C.text, lineHeight: 1.6 }}>
      <Link to="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>← All Reports</Link>

      <div style={{ marginTop: 16, marginBottom: 40 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, color: C.dark }}>School Buildings For Sale</h1>
        <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>March 26, 2026 · Research-verified bid decision report</p>
      </div>

      <div style={{ background: C.redBg, borderLeft: `4px solid ${C.red}`, padding: "12px 16px", marginBottom: 24, borderRadius: 4, fontSize: 13 }}>
        <strong>Data Quality Alert:</strong> Web research found that <strong>6 of 14 properties</strong> had incorrect data — wrong addresses, already sold, or not school buildings. These are flagged in the "Remove from Pipeline" section.
      </div>

      <div style={{ background: C.bg, padding: "10px 16px", borderRadius: 6, fontSize: 12, marginBottom: 32, color: C.muted }}>
        <strong style={{ color: C.text }}>Models:</strong> TSA = $25K tuition, needs 2,500+ families & fields · Alpha = $40K, needs 1,500+ families & prestige neighborhood
        <br /><strong style={{ color: C.text }}>Verdicts:</strong> <span style={{ color: C.green, fontWeight: 700 }}>GO</span> = proceed to bid · <span style={{ color: C.amber, fontWeight: 700 }}>MAYBE</span> = investigate further · <span style={{ color: C.red, fontWeight: 700 }}>NO</span> = pass
      </div>

      <Section title="Verified Available Properties (8)">
        {AVAILABLE.map((p) => <PropertyCard key={p.name} p={p} />)}
      </Section>

      <Section title="Remove from Pipeline (6)">
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>These properties have incorrect data and should be removed or updated in the database.</p>
        {REMOVE.map((p) => <PropertyCard key={p.name} p={p} showIssue />)}
      </Section>

      <Section title="Pipeline Health">
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "separate", borderSpacing: 0, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
          <tbody>
            {[
              ["Properties in pipeline", "14"],
              ["Verified available", "8 (57%)"],
              ["Bad data (wrong address/sold/demolished)", "6 (43%)"],
              ["Worth investigating", "2 (KCPS Bryant, Waukesha East)"],
              ["Clear passes", "6 (demographics non-viable)"],
            ].map(([k, v], i) => (
              <tr key={i} style={{ borderTop: i ? `1px solid ${C.border}` : "none" }}>
                <td style={{ padding: "8px 12px", color: C.muted }}>{k}</td>
                <td style={{ padding: "8px 12px", fontWeight: 600 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <p style={{ fontSize: 11, color: C.light, marginTop: 48 }}>
        Generated by school-closure-monitor · Demographics from Stratos (transitioning to Rebl3) · Property research via web search
      </p>
    </div>
  );
}
