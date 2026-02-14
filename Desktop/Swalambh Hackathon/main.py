from fastapi import FastAPI, UploadFile, Form
import shutil
import os

from models.vision_model import VisionModel
from models.multimodal_model import MultimodalReasoner
from utils.risk_engine import SafetyEngine
from utils.explainability import generate_explanation

app = FastAPI()

vision = VisionModel()
reasoner = MultimodalReasoner()
safety = SafetyEngine()

@app.post("/triage")
async def triage(image: UploadFile, description: str = Form(...)):

    # Save uploaded image
    file_path = "uploaded_" + image.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # AI Pipeline
    visual = vision.predict(file_path)
    reasoning = reasoner.analyze(visual, description)
    safety_out = safety.safety_check(reasoning)
    explanation = generate_explanation(visual, reasoning)

    return {
        "visual_analysis": visual,
        "clinical_reasoning": reasoning,
        "safety": safety_out,
        "explanation": explanation
    }
