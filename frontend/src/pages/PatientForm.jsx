import { useState } from "react"
import { predictPatient } from "../utils/api"

const DEFAULTS = {
  age: "", gender: "Male", bmi: "", hba1c_level: "", blood_glucose_level: "",
  smoking_history: "Never",
  salt_intake: "", stress_score: "", sleep_duration: "",
  bp_history: "Normal", medication: "None", family_history: "No",
  exercise_level: "Moderate", smoking_status: "Never",
  blood_pressure: "", cholesterol_level: "", sleep_hours: "",
  triglyceride_level: "", fasting_blood_sugar: "", crp_level: "",
  homocysteine_level: "",
  exercise_habits: "Moderate", smoking: "No", family_heart_disease: "No",
  low_hdl_cholesterol: "No", high_ldl_cholesterol: "No",
  alcohol_consumption: "None", stress_level: "Medium", sugar_consumption: "Medium",
}

export default function PatientForm({ onResult }) {
  const [form, setForm] = useState(DEFAULTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    setError("")
    const nums = [
      "age","bmi","hba1c_level","blood_glucose_level","salt_intake",
      "stress_score","sleep_duration","blood_pressure","cholesterol_level",
      "sleep_hours","triglyceride_level","fasting_blood_sugar","crp_level","homocysteine_level"
    ]
    for (const k of nums) {
      if (form[k] === "" || isNaN(Number(form[k]))) {
        setError(`Please enter a valid value for: ${k.replace(/_/g," ")}`)
        return
      }
    }
    setLoading(true)
    try {
      const payload = { ...form }
      nums.forEach(k => { payload[k] = parseFloat(payload[k]) })
      const res = await predictPatient(payload)
      onResult(payload, res)
    } catch (e) {
      setError(e.message || "Prediction failed. Check that the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="page-title">Patient Assessment</h1>
      <p className="page-subtitle">Enter all patient details across the three clinical domains below.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        <div className="card">
          <div className="section-label">Diabetes Risk Factors</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Age</label>
              <input type="number" placeholder="e.g. 45" value={form.age} onChange={set("age")} />
            </div>
            <div className="form-field">
              <label>Gender</label>
              <select value={form.gender} onChange={set("gender")}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-field">
              <label>BMI</label>
              <input type="number" step="0.1" placeholder="e.g. 27.5" value={form.bmi} onChange={set("bmi")} />
            </div>
            <div className="form-field">
              <label>HbA1c Level (%)</label>
              <input type="number" step="0.1" placeholder="e.g. 5.5" value={form.hba1c_level} onChange={set("hba1c_level")} />
            </div>
            <div className="form-field">
              <label>Blood Glucose Level (mg/dL)</label>
              <input type="number" placeholder="e.g. 120" value={form.blood_glucose_level} onChange={set("blood_glucose_level")} />
            </div>
            <div className="form-field">
              <label>Smoking History</label>
              <select value={form.smoking_history} onChange={set("smoking_history")}>
                <option>Never</option>
                <option>Current</option>
                <option>Former</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-label">Hypertension Risk Factors</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Salt Intake (g/day)</label>
              <input type="number" step="0.1" placeholder="e.g. 5.0" value={form.salt_intake} onChange={set("salt_intake")} />
            </div>
            <div className="form-field">
              <label>Stress Score (0–10)</label>
              <input type="number" step="0.1" min="0" max="10" placeholder="e.g. 6" value={form.stress_score} onChange={set("stress_score")} />
            </div>
            <div className="form-field">
              <label>Sleep Duration (hrs)</label>
              <input type="number" step="0.5" placeholder="e.g. 7" value={form.sleep_duration} onChange={set("sleep_duration")} />
            </div>
            <div className="form-field">
              <label>BP History</label>
              <select value={form.bp_history} onChange={set("bp_history")}>
                <option>Normal</option>
                <option>Prehypertension</option>
                <option>Hypertension</option>
              </select>
            </div>
            <div className="form-field">
              <label>Medication</label>
              <select value={form.medication} onChange={set("medication")}>
                <option>None</option>
                <option>ACE Inhibitors</option>
                <option>Beta Blockers</option>
                <option>Calcium Channel Blockers</option>
                <option>Diuretics</option>
              </select>
            </div>
            <div className="form-field">
              <label>Family History of Hypertension</label>
              <select value={form.family_history} onChange={set("family_history")}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
            <div className="form-field">
              <label>Exercise Level</label>
              <select value={form.exercise_level} onChange={set("exercise_level")}>
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
              </select>
            </div>
            <div className="form-field">
              <label>Smoking Status</label>
              <select value={form.smoking_status} onChange={set("smoking_status")}>
                <option>Never</option>
                <option>Former</option>
                <option>Current</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-label">Heart Disease Risk Factors</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Blood Pressure (mmHg)</label>
              <input type="number" placeholder="e.g. 120" value={form.blood_pressure} onChange={set("blood_pressure")} />
            </div>
            <div className="form-field">
              <label>Cholesterol Level (mg/dL)</label>
              <input type="number" placeholder="e.g. 200" value={form.cholesterol_level} onChange={set("cholesterol_level")} />
            </div>
            <div className="form-field">
              <label>Sleep Hours (hrs)</label>
              <input type="number" step="0.5" placeholder="e.g. 7" value={form.sleep_hours} onChange={set("sleep_hours")} />
            </div>
            <div className="form-field">
              <label>Triglyceride Level (mg/dL)</label>
              <input type="number" placeholder="e.g. 150" value={form.triglyceride_level} onChange={set("triglyceride_level")} />
            </div>
            <div className="form-field">
              <label>Fasting Blood Sugar (mg/dL)</label>
              <input type="number" placeholder="e.g. 95" value={form.fasting_blood_sugar} onChange={set("fasting_blood_sugar")} />
            </div>
            <div className="form-field">
              <label>CRP Level (mg/L)</label>
              <input type="number" step="0.1" placeholder="e.g. 1.5" value={form.crp_level} onChange={set("crp_level")} />
            </div>
            <div className="form-field">
              <label>Homocysteine Level (µmol/L)</label>
              <input type="number" step="0.1" placeholder="e.g. 10" value={form.homocysteine_level} onChange={set("homocysteine_level")} />
            </div>
            <div className="form-field">
              <label>Exercise Habits</label>
              <select value={form.exercise_habits} onChange={set("exercise_habits")}>
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
              </select>
            </div>
            <div className="form-field">
              <label>Smoker</label>
              <select value={form.smoking} onChange={set("smoking")}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
            <div className="form-field">
              <label>Family History of Heart Disease</label>
              <select value={form.family_heart_disease} onChange={set("family_heart_disease")}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
            <div className="form-field">
              <label>Low HDL Cholesterol</label>
              <select value={form.low_hdl_cholesterol} onChange={set("low_hdl_cholesterol")}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
            <div className="form-field">
              <label>High LDL Cholesterol</label>
              <select value={form.high_ldl_cholesterol} onChange={set("high_ldl_cholesterol")}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
            <div className="form-field">
              <label>Alcohol Consumption</label>
              <select value={form.alcohol_consumption} onChange={set("alcohol_consumption")}>
                <option>None</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="form-field">
              <label>Stress Level</label>
              <select value={form.stress_level} onChange={set("stress_level")}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="form-field">
              <label>Sugar Consumption</label>
              <select value={form.sugar_consumption} onChange={set("sugar_consumption")}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <><span className="spinner" />&nbsp;&nbsp;Analysing...</> : "Run Prediction →"}
          </button>
        </div>
      </div>
    </div>
  )
}