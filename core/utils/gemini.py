import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def analyze_symptoms(symptoms_text, city):
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("Missing GEMINI_API_KEY in environment variables")
        return get_default_response(symptoms_text)
        
    genai.configure(api_key=api_key)
    
    # Use Flash model as requested
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    input_json = json.dumps({
        "symptoms_text": symptoms_text,
        "location": city or ""
    })
    
    prompt = f"""You are a concise, safety-first medical triage assistant. Output JSON only.

Task: Convert symptoms_text into up to 3 possible diseases, a single medical speciality, urgency (low|medium|high), and confidence.

Input:
{input_json}

Return EXACT JSON:
{{
  "possible_diseases":[
    {{"name":"<string>","probability":<0.0-1.0>,"notes":"<<=12 words justification>"}}
  ],
  "speciality":"<single string>",
  "urgency":"low|medium|high",
  "confidence":<0.0-1.0>
}}

Rules:
- Use cautious phrasing; this is not a diagnosis.
- If emergency signs (severe chest pain + sweating + fainting / severe breathlessness / heavy bleeding) then urgency="high".
- Output valid JSON only."""

    try:
        response = model.generate_content(prompt)
        text_content = response.text
        
        # Clean markdown code blocks if present
        if "```json" in text_content:
            text_content = text_content.replace("```json", "").replace("```", "")
        elif "```" in text_content:
            text_content = text_content.replace("```", "")
            
        return json.loads(text_content.strip())
        
    except Exception as e:
        print(f"Gemini analysis error: {e}")
        return get_default_response(symptoms_text)

def get_default_response(symptoms_text=''):
    symptoms = symptoms_text.lower()
    
    diseases = []
    speciality = "General Physician"
    urgency = "low"
    
    # Fever-related
    if 'fever' in symptoms:
        if any(x in symptoms for x in ['joint', 'muscle', 'pain']):
            diseases.append({"name": "Dengue Fever", "probability": 0.6, "notes": "Fever with joint/muscle pain"})
            diseases.append({"name": "Viral Infection", "probability": 0.3, "notes": "Common viral symptoms"})
            urgency = "medium"
        else:
            diseases.append({"name": "Viral Fever", "probability": 0.7, "notes": "Common fever symptoms"})
            diseases.append({"name": "Flu", "probability": 0.2, "notes": "Influenza-like illness"})
        speciality = "General Medicine"
        
    # Chest pain
    elif 'chest' in symptoms and 'pain' in symptoms:
        diseases.append({"name": "Angina", "probability": 0.5, "notes": "Chest pain, needs evaluation"})
        diseases.append({"name": "Gastritis", "probability": 0.3, "notes": "Acid reflux related"})
        speciality = "Cardiology"
        urgency = "high"
        
    # Headache
    elif 'headache' in symptoms or 'head' in symptoms:
        diseases.append({"name": "Tension Headache", "probability": 0.6, "notes": "Common headache"})
        diseases.append({"name": "Migraine", "probability": 0.3, "notes": "Severe headache"})
        speciality = "Neurology"
        
    # Stomach
    elif any(x in symptoms for x in ['stomach', 'abdominal', 'vomit']):
        diseases.append({"name": "Gastroenteritis", "probability": 0.6, "notes": "Stomach infection"})
        diseases.append({"name": "Food Poisoning", "probability": 0.3, "notes": "Food-related illness"})
        speciality = "Gastroenterology"
        
    # Cough/cold
    elif 'cough' in symptoms or 'cold' in symptoms:
        diseases.append({"name": "Upper Respiratory Infection", "probability": 0.7, "notes": "Common cold"})
        diseases.append({"name": "Bronchitis", "probability": 0.2, "notes": "Chest infection"})
        speciality = "General Medicine"
        
    else:
        diseases.append({"name": "General Checkup Recommended", "probability": 0.5, "notes": "Consult a doctor"})
        
    return {
        "possible_diseases": diseases,
        "speciality": speciality,
        "urgency": urgency,
        "confidence": 0.5
    }
