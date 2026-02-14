# utils/risk_engine.py

class SafetyEngine:

    def safety_check(self, reasoning):
        alerts = []

        if reasoning["urgency"] == "HIGH":
            alerts.append("Immediate dermatologist consultation recommended")

        if reasoning["probable_condition"] == "suspicious lesion":
            alerts.append("Possible malignancy — do not delay biopsy")

        return {
            "alerts": alerts,
            "triage": "doctor_visit" if alerts else "self_care_possible"
        }
