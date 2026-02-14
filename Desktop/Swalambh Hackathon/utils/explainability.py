# utils/explainability.py

def generate_explanation(vision, reasoning):

    return f"""
The system identified a visual pattern consistent with {vision['visual_condition']}
with confidence {vision['confidence']:.2f}.

Based on your symptoms and medical risk rules,
the case is categorized as {reasoning['urgency']} urgency.

This is not a diagnosis but an early triage guidance.
"""
