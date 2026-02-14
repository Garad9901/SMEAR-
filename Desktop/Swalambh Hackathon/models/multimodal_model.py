class MultimodalReasoner:

    def analyze(self, visual_result, patient_text):
        condition = visual_result["visual_condition"]

        text = patient_text.lower()

        red_flags = [
            "bleeding", "rapidly growing", "changing color",
            "fever", "severe pain", "spreading fast"
        ]

        risk_score = 0.2

        if condition == "suspicious lesion":
            risk_score += 0.5

        for flag in red_flags:
            if flag in text:
                risk_score += 0.1

        if risk_score >= 0.7:
            urgency = "HIGH"
        elif risk_score >= 0.4:
            urgency = "MEDIUM"
        else:
            urgency = "LOW"

        return {
            "risk_score": min(risk_score,1.0),
            "urgency": urgency,
            "probable_condition": condition
        }
