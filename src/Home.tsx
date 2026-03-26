import { Link } from "react-router-dom";

const reports = [
  {
    slug: "hudson-bend-single-sport",
    title: "Hudson Bend — Single-Sport Micro Schools",
    subtitle: "Grades 6–8 | $35K Tuition | 4–5 Sport Tracks",
    date: "March 26, 2026",
    address: "4402 Hudson Bend Rd, Austin, TX 78734",
  },
];

export default function Home() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Alpha Reports</h1>
        <p style={{ fontSize: 15, color: "#64748b" }}>Market analysis and site evaluation reports</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {reports.map((r) => (
          <Link
            key={r.slug}
            to={`/${r.slug}`}
            style={{
              display: "block",
              padding: "20px 24px",
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              textDecoration: "none",
              color: "inherit",
              transition: "box-shadow 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              e.currentTarget.style.borderColor = "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 700 }}>{r.title}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              {r.subtitle} &nbsp;·&nbsp; {r.address}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>{r.date}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
