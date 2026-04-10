import { useState } from "react"
import PatientForm from "./pages/PatientForm"
import Results from "./pages/Results"
import BatchUpload from "./pages/BatchUpload"
import BatchResults from "./pages/BatchResults"
import "./App.css"

export default function App() {
  const [view, setView] = useState("home")
  const [results, setResults] = useState(null)
  const [batchResults, setBatchResults] = useState(null)
  const [formData, setFormData] = useState(null)

  const handlePrediction = (data, res) => {
    setFormData(data)
    setResults(res)
    setView("results")
  }

  const handleBatchResults = (res) => {
    setBatchResults(res)
    setView("batchResults")
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">♥</span>
            <div>
              <span className="logo-title">CardioSense</span>
              <span className="logo-sub">Advanced Heart Disease Predictor</span>
            </div>
          </div>
          <nav className="nav">
            <button
              className={`nav-btn ${view === "home" || view === "results" ? "active" : ""}`}
              onClick={() => { setView("home"); setResults(null) }}
            >
              Single Patient
            </button>
            <button
              className={`nav-btn ${view === "batch" || view === "batchResults" ? "active" : ""}`}
              onClick={() => { setView("batch"); setBatchResults(null) }}
            >
              Batch Upload
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {view === "home" && <PatientForm onResult={handlePrediction} />}
        {view === "results" && <Results results={results} formData={formData} onBack={() => setView("home")} />}
        {view === "batch" && <BatchUpload onResult={handleBatchResults} />}
        {view === "batchResults" && <BatchResults results={batchResults} onBack={() => setView("batch")} />}
      </main>
    </div>
  )
}