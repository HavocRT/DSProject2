import { useEffect, useRef } from "react"
import "./Results.css"

function ProbabilityRing({ value, label, color, size = 140 }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const ringColor = value >= 30 ? "#dc2626" : "#16a34a"

  return (
    <div className="prob-ring-wrap">
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={ringColor} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="60" y="55" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1f2937" fontFamily="DM Sans">
          {value.toFixed(1)}%
        </text>
        <text x="60" y="72" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="DM Sans">
          probability
        </text>
      </svg>
      <div className="prob-ring-label">{label}</div>
    </div>
  )
}

function RiskBar({ label, value, risk }) {
  const isHigh = risk === "High"
  return (
    <div className="risk-bar-row">
      <div className="risk-bar-label">{label}</div>
      <div className="risk-bar-track">
        <div
          className="risk-bar-fill"
          style={{
            width: `${value}%`,
            background: isHigh ? "var(--red-primary)" : "var(--green)"
          }}
        />
      </div>
      <div className="risk-bar-value">{value.toFixed(1)}%</div>
      <span className={`risk-badge ${isHigh ? "high" : "low"}`}>
        {isHigh ? "⚠ High" : "✓ Low"}
      </span>
    </div>
  )
}

export default function Results({ results, formData, onBack }) {
  if (!results) return null

  const { diabetes_probability, hypertension_probability, heart_disease_probability,
    diabetes_risk, hypertension_risk, heart_disease_risk } = results

  const heartHigh = heart_disease_risk === "High"

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Prediction Results</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Based on the patient's clinical profile</p>
        </div>
      </div>

      <div className="results-hero card" style={{
        borderColor: heartHigh ? "var(--red-light)" : "#bbf7d0",
        background: heartHigh ? "var(--red-ghost)" : "#f0fdf4",
        marginBottom: "1.5rem"
      }}>
        <div className="hero-label" style={{ color: heartHigh ? "var(--red-deep)" : "var(--green)" }}>
          {heartHigh ? "⚠  Elevated Heart Disease Risk Detected" : "✓  Low Heart Disease Risk"}
        </div>
        <div className="hero-prob" style={{ color: heartHigh ? "var(--red-primary)" : "var(--green)" }}>
          {heart_disease_probability.toFixed(1)}%
        </div>
        <div className="hero-sub">Heart Disease Probability</div>

        <div className="hero-rings">
          <ProbabilityRing value={diabetes_probability} label="Diabetes" size={130} />
          <div className="hero-divider" />
          <div className="hero-main-ring">
            <ProbabilityRing value={heart_disease_probability} label="Heart Disease" size={180} />
          </div>
          <div className="hero-divider" />
          <ProbabilityRing value={hypertension_probability} label="Hypertension" size={130} />
        </div>
      </div>

      <div className="results-grid">
        <div className="card">
          <div className="section-label">Risk Summary</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
            <RiskBar label="Diabetes" value={diabetes_probability} risk={diabetes_risk} />
            <RiskBar label="Hypertension" value={hypertension_probability} risk={hypertension_risk} />
            <RiskBar label="Heart Disease" value={heart_disease_probability} risk={heart_disease_risk} />
          </div>

          <div className="threshold-note">
            Risk thresholds are set at 30% (adjusted from default 50% to prioritise recall in a clinical setting).
          </div>
        </div>

        <div className="card">
          <div className="section-label">Pipeline Trace</div>
          <div className="pipeline">
            <div className="pipeline-step">
              <div className="pipeline-dot" style={{ background: "var(--red-light)" }} />
              <div>
                <div className="pipeline-step-title">Step 1 — Diabetes Model</div>
                <div className="pipeline-step-detail">
                  HbA1c, blood glucose, BMI, age, gender, smoking → metabolic index → <strong>{diabetes_probability.toFixed(1)}% probability</strong>
                </div>
              </div>
            </div>
            <div className="pipeline-connector" />
            <div className="pipeline-step">
              <div className="pipeline-dot" style={{ background: "var(--red-mid)" }} />
              <div>
                <div className="pipeline-step-title">Step 2 — Hypertension Model</div>
                <div className="pipeline-step-detail">
                  BP history, salt intake, stress, sleep, BMI, family history → lifestyle risk score → <strong>{hypertension_probability.toFixed(1)}% probability</strong>
                </div>
              </div>
            </div>
            <div className="pipeline-connector" />
            <div className="pipeline-step">
              <div className="pipeline-dot" style={{ background: "var(--red-primary)" }} />
              <div>
                <div className="pipeline-step-title">Step 3 — Heart Disease Model</div>
                <div className="pipeline-step-detail">
                  All cardiac features + diabetes prob ({diabetes_probability.toFixed(1)}%) + hypertension prob ({hypertension_probability.toFixed(1)}%) → inflammation score + metabolic syndrome score → <strong>{heart_disease_probability.toFixed(1)}% probability</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}