import { useState } from "react"
import "./BatchResults.css"

function RiskPill({ risk, value }) {
  const isHigh = risk === "High"
  return (
    <span className={`risk-badge ${isHigh ? "high" : "low"}`}>
      {isHigh ? "⚠" : "✓"} {value.toFixed(1)}%
    </span>
  )
}

export default function BatchResults({ results, onBack }) {
  const [sortKey, setSortKey] = useState("heart_disease_probability")
  const [sortDir, setSortDir] = useState("desc")
  const [filter, setFilter] = useState("all")

  if (!results) return null

  const valid = results.filter(r => !r.error)
  const errors = results.filter(r => r.error)

  const sorted = [...valid].sort((a, b) => {
    const v = a[sortKey] - b[sortKey]
    return sortDir === "desc" ? -v : v
  })

  const filtered = filter === "all" ? sorted : sorted.filter(r => r.heart_disease_risk === filter)

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === "desc" ? "asc" : "desc")
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const sortIcon = (key) => sortKey === key ? (sortDir === "desc" ? " ↓" : " ↑") : ""

  const highCount = valid.filter(r => r.heart_disease_risk === "High").length

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Batch Results</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            {valid.length} patient{valid.length !== 1 ? "s" : ""} processed
            {errors.length > 0 && ` · ${errors.length} error${errors.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="batch-stats">
        <div className="stat-card">
          <div className="stat-value">{valid.length}</div>
          <div className="stat-label">Total Patients</div>
        </div>
        <div className="stat-card high">
          <div className="stat-value" style={{ color: "var(--red-primary)" }}>{highCount}</div>
          <div className="stat-label">High Heart Disease Risk</div>
        </div>
        <div className="stat-card low">
          <div className="stat-value" style={{ color: "var(--green)" }}>{valid.length - highCount}</div>
          <div className="stat-label">Low Heart Disease Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {valid.length > 0
              ? (valid.reduce((s, r) => s + r.heart_disease_probability, 0) / valid.length).toFixed(1)
              : "—"}%
          </div>
          <div className="stat-label">Avg. Heart Disease Prob.</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div className="section-label" style={{ marginBottom: 0 }}>Patient Results</div>
          <div className="filter-group">
            {["all", "High", "Low"].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : `${f} Risk`}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th className="sortable" onClick={() => toggleSort("diabetes_probability")}>
                  Diabetes{sortIcon("diabetes_probability")}
                </th>
                <th className="sortable" onClick={() => toggleSort("hypertension_probability")}>
                  Hypertension{sortIcon("hypertension_probability")}
                </th>
                <th className="sortable" onClick={() => toggleSort("heart_disease_probability")}>
                  Heart Disease{sortIcon("heart_disease_probability")}
                </th>
                <th>Overall Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className={r.heart_disease_risk === "High" ? "row-high" : ""}>
                  <td className="patient-name">{r.name || `Patient ${i + 1}`}</td>
                  <td><RiskPill risk={r.diabetes_risk} value={r.diabetes_probability} /></td>
                  <td><RiskPill risk={r.hypertension_risk} value={r.hypertension_probability} /></td>
                  <td><RiskPill risk={r.heart_disease_risk} value={r.heart_disease_probability} /></td>
                  <td>
                    <div className="overall-bar">
                      <div
                        className="overall-fill"
                        style={{
                          width: `${r.heart_disease_probability}%`,
                          background: r.heart_disease_risk === "High" ? "var(--red-primary)" : "var(--green)"
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--grey-400)", padding: "2rem" }}>
                    No patients match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {errors.length > 0 && (
          <div style={{ marginTop: "1.2rem" }}>
            <div className="section-label">Processing Errors</div>
            {errors.map((e, i) => (
              <div key={i} className="error-msg" style={{ marginTop: "6px" }}>
                Patient {e.patient_id}: {e.error}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}