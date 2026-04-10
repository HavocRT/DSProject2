import { useState } from "react";

const API_URL = "http://localhost:5000/predict";

const SECTIONS = {
  core: {
    label: "Core Info",
    icon: "👤",
    fields: [
      { key: "age", label: "Age", type: "number", placeholder: "e.g. 45", unit: "yrs" },
      { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
      { key: "bmi", label: "BMI", type: "number", placeholder: "e.g. 24.5", unit: "kg/m²" },
    ],
  },
  diabetes: {
    label: "Diabetes Risk",
    icon: "🩸",
    fields: [
      { key: "hba1c_level", label: "HbA1c Level", type: "number", placeholder: "e.g. 5.7", unit: "%" },
      { key: "blood_glucose_level", label: "Blood Glucose", type: "number", placeholder: "e.g. 100", unit: "mg/dL" },
      { key: "smoking_history", label: "Smoking History", type: "select", options: ["No Info", "never", "former", "current", "ever", "not current"] },
      { key: "hypertension_history", label: "Prior Hypertension", type: "select", options: ["No", "Yes"], valueMap: { No: 0, Yes: 1 } },
      { key: "heart_disease_history", label: "Prior Heart Disease", type: "select", options: ["No", "Yes"], valueMap: { No: 0, Yes: 1 } },
    ],
  },
  hypertension: {
    label: "Hypertension Risk",
    icon: "💊",
    fields: [
      { key: "blood_pressure", label: "Blood Pressure (systolic)", type: "number", placeholder: "e.g. 120", unit: "mmHg" },
      { key: "salt_intake", label: "Salt Intake", type: "number", placeholder: "1–10 scale", unit: "/10" },
      { key: "stress_score", label: "Stress Score", type: "number", placeholder: "1–10 scale", unit: "/10" },
      { key: "bp_history", label: "BP History", type: "select", options: ["No", "Yes"] },
      { key: "sleep_duration", label: "Sleep Duration", type: "number", placeholder: "e.g. 7", unit: "hrs" },
      { key: "medication", label: "On Medication", type: "select", options: ["No", "Yes"] },
      { key: "family_history", label: "Family History (HTN)", type: "select", options: ["No", "Yes"] },
      { key: "exercise_level", label: "Exercise Level", type: "select", options: ["Low", "Moderate", "High"] },
      { key: "smoking_status", label: "Smoking Status", type: "select", options: ["Never", "Former", "Current"] },
    ],
  },
  heart: {
    label: "Heart Disease Risk",
    icon: "❤️",
    fields: [
      { key: "cholesterol_level", label: "Cholesterol Level", type: "select", options: ["Normal", "Borderline", "High"] },
      { key: "exercise_habits", label: "Exercise Habits", type: "select", options: ["Low", "Moderate", "High"] },
      { key: "family_heart_disease", label: "Family Heart Disease", type: "select", options: ["No", "Yes"] },
      { key: "low_hdl_cholesterol", label: "Low HDL Cholesterol", type: "select", options: ["No", "Yes"] },
      { key: "high_ldl_cholesterol", label: "High LDL Cholesterol", type: "select", options: ["No", "Yes"] },
      { key: "alcohol_consumption", label: "Alcohol Consumption", type: "select", options: ["None", "Low", "Moderate", "High"] },
      { key: "stress_level", label: "Stress Level", type: "number", placeholder: "1–10 scale", unit: "/10" },
      { key: "sugar_consumption", label: "Sugar Consumption", type: "select", options: ["Low", "Moderate", "High"] },
      { key: "triglyceride_level", label: "Triglyceride Level", type: "number", placeholder: "e.g. 150", unit: "mg/dL" },
      { key: "fasting_blood_sugar", label: "Fasting Blood Sugar", type: "number", placeholder: "e.g. 90", unit: "mg/dL" },
      { key: "crp_level", label: "CRP Level", type: "number", placeholder: "e.g. 1.0", unit: "mg/L" },
      { key: "homocysteine_level", label: "Homocysteine Level", type: "number", placeholder: "e.g. 10", unit: "µmol/L" },
    ],
  },
};

const RISK_COLORS = {
  Low: { bg: "#e8f5e9", text: "#2e7d32", bar: "#4caf50" },
  Moderate: { bg: "#fff8e1", text: "#f57f17", bar: "#ffc107" },
  High: { bg: "#fce4ec", text: "#c62828", bar: "#f44336" },
};

const RISK_ICONS = { Low: "✓", Moderate: "⚠", High: "!" };

function RiskCard({ label, probability, risk, icon }) {
  const colors = RISK_COLORS[risk] || RISK_COLORS.Low;
  const pct = Math.round(probability * 100);
  return (
    <div style={{
      background: colors.bg,
      borderRadius: 16,
      padding: "20px 24px",
      flex: "1 1 180px",
      minWidth: 170,
      border: `1.5px solid ${colors.bar}33`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>{label}</span>
      </div>
      <div style={{ fontSize: 38, fontWeight: 800, color: colors.text, lineHeight: 1.1 }}>
        {pct}<span style={{ fontSize: 18, fontWeight: 500 }}>%</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <div style={{
          flex: 1, height: 6, borderRadius: 3,
          background: "#00000015",
          overflow: "hidden",
        }}>
          <div style={{ width: `${pct}%`, height: "100%", background: colors.bar, borderRadius: 3, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
          color: colors.text, background: colors.bar + "22",
          padding: "2px 8px", borderRadius: 20,
        }}>
          {RISK_ICONS[risk]} {risk}
        </span>
      </div>
    </div>
  );
}

function Field({ field, value, onChange }) {
  const base = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: "1.5px solid #e0e0e0",
    fontSize: 14,
    outline: "none",
    background: "#fff",
    color: "#1a1a1a",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#555", letterSpacing: "0.03em" }}>
        {field.label}
        {field.unit && <span style={{ fontWeight: 400, color: "#999", marginLeft: 4 }}>({field.unit})</span>}
      </label>
      {field.type === "select" ? (
        <select style={base} value={value || ""} onChange={e => onChange(field.key, e.target.value)}>
          <option value="">— optional —</option>
          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          style={base}
          type="number"
          step="any"
          placeholder={field.placeholder}
          value={value || ""}
          onChange={e => onChange(field.key, e.target.value)}
        />
      )}
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("core");

  const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message || "Failed to connect to prediction server.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setForm({}); setResult(null); setError(null); };

  const sectionKeys = Object.keys(SECTIONS);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: "32px 16px",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "#fff", borderRadius: 50, padding: "8px 20px",
            boxShadow: "0 2px 12px #0001", marginBottom: 16,
          }}>
            <span style={{ fontSize: 22 }}>🏥</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1565c0", letterSpacing: "0.04em" }}>HealthRisk AI</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a237e", margin: "0 0 8px" }}>
            Multi-Disease Risk Predictor
          </h1>
          <p style={{ color: "#666", fontSize: 15, margin: 0 }}>
            Enter patient details below · Diabetes and hypertension probabilities feed into the heart disease model
          </p>
        </div>

        {/* Pipeline visual */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, marginBottom: 28, flexWrap: "wrap",
        }}>
          {[
            { label: "Diabetes", color: "#e53935", icon: "🩸" },
            { label: "Hypertension", color: "#1e88e5", icon: "💊" },
            { label: "Heart Disease", color: "#8e24aa", icon: "❤️" },
          ].map((step, i) => (
            <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                background: step.color + "18",
                border: `1.5px solid ${step.color}44`,
                borderRadius: 10, padding: "6px 14px",
                fontSize: 13, fontWeight: 600, color: step.color,
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <span>{step.icon}</span> {step.label}
              </div>
              {i < 2 && <span style={{ color: "#aaa", fontSize: 18 }}>→</span>}
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div style={{
          display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap",
        }}>
          {sectionKeys.map(key => {
            const sec = SECTIONS[key];
            const isActive = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                style={{
                  padding: "8px 18px", borderRadius: 30, border: "none",
                  background: isActive ? "#1565c0" : "#fff",
                  color: isActive ? "#fff" : "#555",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13, cursor: "pointer",
                  boxShadow: isActive ? "0 2px 8px #1565c040" : "0 1px 4px #0001",
                  transition: "all 0.2s",
                }}
              >
                {sec.icon} {sec.label}
              </button>
            );
          })}
        </div>

        {/* Input panel */}
        <div style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 4px 24px #0000000d",
          padding: "28px 28px 24px",
          marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 22 }}>{SECTIONS[activeSection].icon}</span>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1a237e" }}>
              {SECTIONS[activeSection].label}
            </h2>
            <span style={{
              marginLeft: "auto", fontSize: 11, color: "#999",
              background: "#f5f5f5", padding: "3px 10px", borderRadius: 20,
            }}>All fields optional</span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "14px 18px",
          }}>
            {SECTIONS[activeSection].fields.map(field => (
              <Field key={field.key} field={field} value={form[field.key] || ""} onChange={handleChange} />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, justifyContent: "center" }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? "#90caf9" : "linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "14px 40px",
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px #1565c040",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Analyzing...
              </>
            ) : (
              <> 🔬 Predict Health Risks </>
            )}
          </button>
          <button
            onClick={handleReset}
            style={{
              background: "#fff", color: "#555",
              border: "1.5px solid #e0e0e0",
              borderRadius: 14, padding: "14px 24px",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            ↺ Reset
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#ffebee", border: "1.5px solid #ef9a9a",
            borderRadius: 14, padding: "14px 20px", marginBottom: 20,
            color: "#c62828", fontSize: 14,
          }}>
            ⚠️ {error}
            <div style={{ fontSize: 12, color: "#e57373", marginTop: 4 }}>
              Make sure the Flask server is running at <code>localhost:5000</code>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 4px 24px #0000000d",
            padding: "28px",
            animation: "fadeIn 0.5s ease",
          }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#1a237e" }}>
              📊 Prediction Results
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#888" }}>
              Diabetes → Hypertension probabilities used as features in Heart Disease model
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <RiskCard
                label="Diabetes"
                probability={result.diabetes_probability}
                risk={result.risk_levels.diabetes}
                icon="🩸"
              />
              <RiskCard
                label="Hypertension"
                probability={result.hypertension_probability}
                risk={result.risk_levels.hypertension}
                icon="💊"
              />
              <RiskCard
                label="Heart Disease"
                probability={result.heart_disease_probability}
                risk={result.risk_levels.heart_disease}
                icon="❤️"
              />
            </div>

            {/* Detail table */}
            <div style={{ marginTop: 22, borderTop: "1px solid #f0f0f0", paddingTop: 18 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#555" }}>
                Model Pipeline Details
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8f9ff" }}>
                    {["Condition", "Probability", "Risk Level", "Used as input for"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#555", fontWeight: 600, border: "1px solid #eee" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Diabetes", prob: result.diabetes_probability, risk: result.risk_levels.diabetes, usedFor: "Heart Disease model" },
                    { name: "Hypertension", prob: result.hypertension_probability, risk: result.risk_levels.hypertension, usedFor: "Heart Disease model" },
                    { name: "Heart Disease", prob: result.heart_disease_probability, risk: result.risk_levels.heart_disease, usedFor: "Final output" },
                  ].map(row => {
                    const c = RISK_COLORS[row.risk];
                    return (
                      <tr key={row.name} style={{ border: "1px solid #eee" }}>
                        <td style={{ padding: "9px 12px", fontWeight: 600 }}>{row.name}</td>
                        <td style={{ padding: "9px 12px" }}>{(row.prob * 100).toFixed(1)}%</td>
                        <td style={{ padding: "9px 12px" }}>
                          <span style={{
                            background: c.bg, color: c.text,
                            padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                          }}>{row.risk}</span>
                        </td>
                        <td style={{ padding: "9px 12px", color: "#888" }}>{row.usedFor}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Disclaimer */}
            <div style={{
              marginTop: 18, background: "#fffde7", borderRadius: 10,
              padding: "10px 16px", fontSize: 12, color: "#827717",
              border: "1px solid #fff176",
            }}>
              ⚠️ <strong>Disclaimer:</strong> This tool is for research/educational purposes only. Always consult a qualified medical professional for health decisions.
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        select:focus, input:focus { border-color: #1565c0 !important; box-shadow: 0 0 0 3px #1565c020; }
        button:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
      `}</style>
    </div>
  );
}