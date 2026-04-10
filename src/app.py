from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import os

from pathlib import Path
root = Path().resolve().parent

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_model(filename):
    path = os.path.join(BASE_DIR, filename)
    if os.path.exists(path):
        return joblib.load(path)
    print(f"[WARNING] Model file not found: {path}. Using mock model.")
    return None

diabetes_model     = load_model(root / "DSProject2" / "models" / "trained" / "diabetes_model.pkl")
hypertension_model = load_model(root / "DSProject2" / "models" / "trained" / "diabetes_model.pkl")
heart_disease_model = load_model(root / "DSProject2" / "models" / "trained" / "diabetes_model.pkl")


def safe_float(value, default=0.0):
    try:
        return float(value) if value not in (None, "", "null") else default
    except (ValueError, TypeError):
        return default

def safe_int(value, default=0):
    try:
        return int(value) if value not in (None, "", "null") else default
    except (ValueError, TypeError):
        return default


def mock_predict(features):
    """Returns a random-ish probability based on feature sum for demo purposes."""
    s = sum(abs(float(x)) for x in features if x not in (None, ""))
    return round(min(0.95, max(0.05, (s % 10) / 10)), 3)


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    gender_map      = {"Male": 1, "Female": 0, "Other": 2}
    smoking_map     = {"never": 0, "former": 1, "current": 2, "ever": 3, "not current": 4, "No Info": 5}

    d_features = [
        gender_map.get(data.get("gender", ""), 0),
        safe_float(data.get("age"), 45),
        safe_int(data.get("hypertension_history"), 0),        # prior hypertension flag
        safe_int(data.get("heart_disease_history"), 0),       # prior heart disease flag
        smoking_map.get(data.get("smoking_history", "No Info"), 5),
        safe_float(data.get("bmi"), 25),
        safe_float(data.get("hba1c_level"), 5.5),
        safe_float(data.get("blood_glucose_level"), 100),
    ]

    if diabetes_model:
        try:
            d_prob = float(diabetes_model.predict_proba([d_features])[0][1])
        except Exception as e:
            print(f"Diabetes model error: {e}")
            d_prob = mock_predict(d_features)
    else:
        d_prob = mock_predict(d_features)

    diabetes_probability = round(d_prob, 4)

    bp_history_map   = {"Yes": 1, "No": 0}
    medication_map   = {"Yes": 1, "No": 0}
    family_hist_map  = {"Yes": 1, "No": 0}
    exercise_map     = {"Low": 0, "Moderate": 1, "High": 2}
    smoking_stat_map = {"Never": 0, "Former": 1, "Current": 2}

    h_features = [
        safe_float(data.get("age"), 45),
        safe_float(data.get("salt_intake"), 5),
        safe_float(data.get("stress_score"), 5),
        bp_history_map.get(data.get("bp_history", "No"), 0),
        safe_float(data.get("sleep_duration"), 7),
        safe_float(data.get("bmi"), 25),
        medication_map.get(data.get("medication", "No"), 0),
        family_hist_map.get(data.get("family_history"), 0),
        exercise_map.get(data.get("exercise_level", "Moderate"), 1),
        smoking_stat_map.get(data.get("smoking_status", "Never"), 0),
    ]

    if hypertension_model:
        try:
            h_prob = float(hypertension_model.predict_proba([h_features])[0][1])
        except Exception as e:
            print(f"Hypertension model error: {e}")
            h_prob = mock_predict(h_features)
    else:
        h_prob = mock_predict(h_features)

    hypertension_probability = round(h_prob, 4)

    gender_hd_map    = {"Male": 1, "Female": 0, "Other": 2}
    chol_map         = {"Normal": 0, "Borderline": 1, "High": 2}
    ex_habits_map    = {"Low": 0, "Moderate": 1, "High": 2}
    smoking_hd_map   = {"Never": 0, "Former": 1, "Current": 2}
    bool_map         = {"Yes": 1, "No": 0}
    alcohol_map      = {"None": 0, "Low": 1, "Moderate": 2, "High": 3}
    sugar_map        = {"Low": 0, "Moderate": 1, "High": 2}

    hd_features = [
        safe_float(data.get("age"), 45),
        gender_hd_map.get(data.get("gender", ""), 0),
        safe_float(data.get("blood_pressure"), 120),
        chol_map.get(data.get("cholesterol_level", "Normal"), 0),
        ex_habits_map.get(data.get("exercise_habits", "Moderate"), 1),
        smoking_hd_map.get(data.get("smoking_status", "Never"), 0),
        bool_map.get(data.get("family_heart_disease", "No"), 0),
        diabetes_probability,                                   # from step 1
        safe_float(data.get("bmi"), 25),
        hypertension_probability,                               # from step 2
        bool_map.get(data.get("low_hdl_cholesterol", "No"), 0),
        bool_map.get(data.get("high_ldl_cholesterol", "No"), 0),
        alcohol_map.get(data.get("alcohol_consumption", "None"), 0),
        safe_float(data.get("stress_level"), 5),
        safe_float(data.get("sleep_duration"), 7),              # reused
        sugar_map.get(data.get("sugar_consumption", "Moderate"), 1),
        safe_float(data.get("triglyceride_level"), 150),
        safe_float(data.get("fasting_blood_sugar"), 90),
        safe_float(data.get("crp_level"), 1.0),
        safe_float(data.get("homocysteine_level"), 10),
    ]

    if heart_disease_model:
        try:
            hd_prob = float(heart_disease_model.predict_proba([hd_features])[0][1])
        except Exception as e:
            print(f"Heart disease model error: {e}")
            hd_prob = mock_predict(hd_features)
    else:
        hd_prob = mock_predict(hd_features)

    heart_disease_probability = round(hd_prob, 4)

    # ── Response ──────────────────────────────────────────────────────────────
    return jsonify({
        "diabetes_probability":       diabetes_probability,
        "hypertension_probability":   hypertension_probability,
        "heart_disease_probability":  heart_disease_probability,
        "risk_levels": {
            "diabetes":      risk_level(diabetes_probability),
            "hypertension":  risk_level(hypertension_probability),
            "heart_disease": risk_level(heart_disease_probability),
        }
    })


def risk_level(prob):
    if prob < 0.3:
        return "Low"
    elif prob < 0.6:
        return "Moderate"
    else:
        return "High"


if __name__ == "__main__":
    app.run(debug=True, port=5000)