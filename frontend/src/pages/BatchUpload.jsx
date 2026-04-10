import { useState, useRef } from "react"
import { predictBatch } from "../utils/api"
import "./BatchUpload.css"

const CSV_HEADERS = [
  "name","age","gender","bmi","hba1c_level","blood_glucose_level","smoking_history",
  "salt_intake","stress_score","sleep_duration","bp_history","medication","family_history",
  "exercise_level","smoking_status","blood_pressure","cholesterol_level","sleep_hours",
  "triglyceride_level","fasting_blood_sugar","crp_level","homocysteine_level",
  "exercise_habits","smoking","family_heart_disease","low_hdl_cholesterol",
  "high_ldl_cholesterol","alcohol_consumption","stress_level","sugar_consumption"
]

const SAMPLE_ROW = [
  "John Doe","52","Male","28.4","6.1","145","Never",
  "6.2","7","6.5","Prehypertension","None","Yes",
  "Moderate","Never","130","215","7","155","102","1.8","12.4",
  "Moderate","No","Yes","No",
  "No","Low","Medium","Medium"
]

function downloadTemplate() {
  const csv = [CSV_HEADERS.join(","), SAMPLE_ROW.join(",")].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "cardiosense_template.csv"
  a.click()
  URL.revokeObjectURL(url)
}

export default function BatchUpload({ onResult }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.endsWith(".csv")) {
      setError("Only CSV files are accepted.")
      return
    }
    setError("")
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async () => {
    if (!file) { setError("Please select a CSV file first."); return }
    setLoading(true)
    setError("")
    try {
      const res = await predictBatch(file)
      onResult(res.results)
    } catch (e) {
      setError(e.message || "Batch prediction failed. Check that the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="page-title">Batch Patient Upload</h1>
      <p className="page-subtitle">Upload a CSV file to run predictions on multiple patients at once.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="card">
          <div className="section-label">CSV Format</div>
          <p style={{ fontSize: "0.875rem", color: "var(--grey-600)", marginBottom: "1rem" }}>
            Your CSV must include all of the columns below. Download the template for a pre-filled example row.
          </p>
          <div className="csv-headers-grid">
            {CSV_HEADERS.map(h => (
              <span key={h} className="csv-col-chip">{h}</span>
            ))}
          </div>
          <div style={{ marginTop: "1.2rem" }}>
            <button className="btn-secondary" onClick={downloadTemplate}>
              ↓ Download Template CSV
            </button>
          </div>
        </div>

        <div className="card">
          <div className="section-label">Upload File</div>
          <div
            className={`drop-zone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {file ? (
              <div className="drop-file-info">
                <span className="drop-file-icon">📄</span>
                <div>
                  <div className="drop-file-name">{file.name}</div>
                  <div className="drop-file-size">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button
                  className="btn-secondary"
                  style={{ marginLeft: "auto", fontSize: "0.8rem", padding: "6px 14px" }}
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="drop-placeholder">
                <span className="drop-icon">⬆</span>
                <div className="drop-text">Drop your CSV here or <span className="drop-link">browse</span></div>
                <div className="drop-sub">CSV files only</div>
              </div>
            )}
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.2rem" }}>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading || !file}>
              {loading ? <><span className="spinner" />&nbsp;&nbsp;Processing...</> : "Run Batch Prediction →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}