from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import io
from pathlib import Path

app = FastAPI(title="CardioSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT / "models" / "trained"
SCALERS_DIR = ROOT / "models" / "preprocessors" / "scalers"
ENCODERS_DIR = ROOT / "models" / "preprocessors" / "encoders"

diabetes_model = joblib.load(MODELS_DIR / "diabetes_model.pkl")
hypertension_model = joblib.load(MODELS_DIR / "hypertension_model.pkl")
heart_model = joblib.load(MODELS_DIR / "heart_model.pkl")

diabetes_scaler = joblib.load(SCALERS_DIR / "diabetes_scaler.pkl")
hypertension_scaler = joblib.load(SCALERS_DIR / "hypertension_scaler.pkl")
heart_scaler = joblib.load(SCALERS_DIR / "heart_scaler.pkl")
metabolic_index_scaler = joblib.load(SCALERS_DIR / "metabolic_index_scaler.pkl")
metabolic_syndrome_scaler = joblib.load(SCALERS_DIR / "metabolic_syndrome_scaler.pkl")

diabetes_gender_encoder = joblib.load(ENCODERS_DIR / "diabetes_gender_encoder.pkl")
diabetes_smoking_encoder = joblib.load(ENCODERS_DIR / "diabetes_smoking_encoder.pkl")
hypertension_encoders = joblib.load(ENCODERS_DIR / "hypertension_encoders.pkl")
heart_gender_encoder = joblib.load(ENCODERS_DIR / "heart_gender_encoder.pkl")

DIABETES_THRESHOLD = 0.3
HYPERTENSION_THRESHOLD = 0.3
HEART_THRESHOLD = 0.3

SMOKING_MAP = {
    "never": "Never", "no info": "Never", "current": "Current",
    "former": "Former", "ever": "Former", "not current": "Former",
    "Never": "Never", "Current": "Current", "Former": "Former"
}
ORDINAL_MAP = {"None": 0, "Low": 1, "Medium": 2, "High": 3}
BINARY_MAP = {"Yes": 1, "No": 0}
SMOKER_SCORE_MAP = {"Current": 1, "Former": 0.5, "Never": 0}
EXERCISE_SCORE_MAP = {"Low": 1, "Moderate": 0.5, "High": 0}


class PatientData(BaseModel):
    age: float
    gender: str
    bmi: float
    hba1c_level: float
    blood_glucose_level: float
    smoking_history: str
    salt_intake: float
    stress_score: float
    sleep_duration: float
    bp_history: str
    medication: str
    family_history: str
    exercise_level: str
    smoking_status: str
    blood_pressure: float
    cholesterol_level: float
    sleep_hours: float
    triglyceride_level: float
    fasting_blood_sugar: float
    crp_level: float
    homocysteine_level: float
    exercise_habits: str
    smoking: str
    family_heart_disease: str
    low_hdl_cholesterol: str
    high_ldl_cholesterol: str
    alcohol_consumption: str
    stress_level: str
    sugar_consumption: str


def safe_encode(encoder, value):
    if value not in encoder.classes_:
        return int(encoder.transform([encoder.classes_[0]])[0])
    return int(encoder.transform([value])[0])


def run_pipeline(row: dict) -> dict:
    row["smoking_history"] = SMOKING_MAP.get(str(row["smoking_history"]), "Never")

    mi_scaled = metabolic_index_scaler.transform(
        [[row["bmi"], row["hba1c_level"], row["blood_glucose_level"]]]
    )[0]
    metabolic_index = float((mi_scaled[0] + mi_scaled[1] + mi_scaled[2]) / 3)

    d_scaled = diabetes_scaler.transform(
        [[row["age"], row["bmi"], row["hba1c_level"], row["blood_glucose_level"]]]
    )[0]
    d_gender = safe_encode(diabetes_gender_encoder, row["gender"])
    d_smoking = safe_encode(diabetes_smoking_encoder, row["smoking_history"])

    X_diabetes = np.array([[
        d_scaled[0], d_scaled[1], d_scaled[2], d_scaled[3],
        metabolic_index,
        d_gender, d_smoking
    ]])
    diabetes_prob = float(diabetes_model.predict_proba(X_diabetes)[0][1])

    abnormal_sleep = min(abs(row["sleep_duration"] - 8) / 8, 1.0)
    smoker_score = SMOKER_SCORE_MAP.get(row["smoking_history"], 0)
    exercise_score = EXERCISE_SCORE_MAP.get(str(row["exercise_level"]), 0.5)
    lifestyle_risk_score = abnormal_sleep + smoker_score + exercise_score

    h_scaled = hypertension_scaler.transform(
        [[row["age"], row["salt_intake"], row["stress_score"], row["sleep_duration"], row["bmi"]]]
    )[0]
    h_bp = safe_encode(hypertension_encoders["bp_history"], row["bp_history"])
    h_med = safe_encode(hypertension_encoders["medication"], row["medication"])
    h_fam = safe_encode(hypertension_encoders["family_history"], row["family_history"])
    h_ex = safe_encode(hypertension_encoders["exercise_level"], row["exercise_level"])
    h_smk = safe_encode(hypertension_encoders["smoking_status"], row["smoking_status"])

    X_hypertension = np.array([[
        h_scaled[0], h_scaled[1], h_scaled[2], h_scaled[3], h_scaled[4],
        lifestyle_risk_score,
        h_bp, h_med, h_fam, h_ex, h_smk
    ]])
    hypertension_prob = float(hypertension_model.predict_proba(X_hypertension)[0][1])

    ms_scaled = metabolic_syndrome_scaler.transform(
        [[row["bmi"], row["triglyceride_level"], row["fasting_blood_sugar"]]]
    )[0]
    metabolic_syndrome_score = float(0.30 * ms_scaled[0] + 0.30 * ms_scaled[1] + 0.40 * ms_scaled[2])

    inflammation_score_raw = float(row["crp_level"]) + float(row["homocysteine_level"])

    hd_scaled = heart_scaler.transform([[
        row["age"], row["blood_pressure"], row["cholesterol_level"], row["bmi"],
        row["sleep_hours"], row["triglyceride_level"], row["fasting_blood_sugar"],
        row["crp_level"], row["homocysteine_level"], inflammation_score_raw
    ]])[0]

    hd_gender = safe_encode(heart_gender_encoder, row["gender"])
    hd_exercise = ORDINAL_MAP.get(str(row["exercise_habits"]), 1)
    hd_smoking = BINARY_MAP.get(str(row["smoking"]), 0)
    hd_family_hd = BINARY_MAP.get(str(row["family_heart_disease"]), 0)
    hd_low_hdl = BINARY_MAP.get(str(row["low_hdl_cholesterol"]), 0)
    hd_high_ldl = BINARY_MAP.get(str(row["high_ldl_cholesterol"]), 0)
    hd_alcohol = ORDINAL_MAP.get(str(row["alcohol_consumption"]), 0)
    hd_stress = ORDINAL_MAP.get(str(row["stress_level"]), 1)
    hd_sugar = ORDINAL_MAP.get(str(row["sugar_consumption"]), 1)

    X_heart = np.array([[
        hd_scaled[0], hd_scaled[1], hd_scaled[2], hd_scaled[3], hd_scaled[4],
        hd_scaled[5], hd_scaled[6], hd_scaled[7], hd_scaled[8],
        diabetes_prob,
        hypertension_prob,
        hd_scaled[9],
        metabolic_syndrome_score,
        hd_gender,
        hd_exercise, hd_smoking, hd_family_hd, hd_low_hdl, hd_high_ldl,
        hd_alcohol, hd_stress, hd_sugar
    ]])
    heart_prob = float(heart_model.predict_proba(X_heart)[0][1])

    return {
        "diabetes_probability": round(diabetes_prob * 100, 2),
        "hypertension_probability": round(hypertension_prob * 100, 2),
        "heart_disease_probability": round(heart_prob * 100, 2),
        "diabetes_risk": "High" if diabetes_prob >= DIABETES_THRESHOLD else "Low",
        "hypertension_risk": "High" if hypertension_prob >= HYPERTENSION_THRESHOLD else "Low",
        "heart_disease_risk": "High" if heart_prob >= HEART_THRESHOLD else "Low",
    }


@app.post("/predict")
def predict(patient: PatientData):
    try:
        return run_pipeline(patient.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-csv")
async def predict_csv(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        results = []
        for idx, row in df.iterrows():
            try:
                result = run_pipeline(row.to_dict())
                result["patient_id"] = str(row.get("patient_id", idx))
                result["name"] = str(row.get("name", f"Patient {idx + 1}"))
                results.append(result)
            except Exception as e:
                results.append({
                    "error": str(e),
                    "patient_id": str(idx),
                    "name": str(row.get("name", f"Patient {idx + 1}"))
                })
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}