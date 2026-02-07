
# =====================
# BASE COST DATA
# =====================
BASE_COST = {
  # Serious conditions
  "Angina": 40000,
  "Myocardial infarction": 150000,
  "Appendicitis": 50000,
  "Hip Replacement": 180000,
  "Dengue": 8000,

  # Common problems - realistic costs
  "Fever": 100,
  "Cold": 100,
  "Cough": 100,
  "Viral Infection": 300,
  "Stomach Pain": 400,
  "Headache": 200,
  "Body Pain": 300,
  "Food Poisoning": 800,
  "Minor Injury": 600,
  "Skin Allergy": 400,
  "UTI": 1000,
  "Sore Throat": 250,
  "General Checkup": 300
}

# =====================
# SEVERITY LOGIC
# =====================
SEVERITY_BASE = {
  "mild": 300,
  "moderate": 5000,
  "severe": 50000,
  "critical": 150000
}

DISEASE_SEVERITY = {
  "Fever": "mild",
  "Cold": "mild",
  "Cough": "mild",
  "Headache": "mild",
  "Sore Throat": "mild",
  "Skin Allergy": "mild",
  "General Checkup": "mild",

  "Dengue": "moderate",
  "Food Poisoning": "moderate",
  "UTI": "moderate",
  "Viral Infection": "moderate",

  "Appendicitis": "severe",
  "Hip Replacement": "severe",

  "Myocardial infarction": "critical"
}

# =====================
# SYMPTOM -> DISEASE MAP
# =====================
SYMPTOM_TO_DISEASE = {
  "cold": "Cold",
  "fever": "Fever",
  "cough": "Cough",
  "headache": "Headache",
  "throat": "Sore Throat",
  "sorethroat": "Sore Throat",
  "vomiting": "Food Poisoning",
  "stomach": "Stomach Pain",
  "stomachpain": "Stomach Pain",
  "bodypain": "Body Pain",
  "weakness": "Viral Infection",
  "allergy": "Skin Allergy",
  "urine": "UTI",
  "injury": "Minor Injury"
}

def get_disease_from_symptoms(symptoms_array):
    # If string is passed instead of list, wrap it
    if isinstance(symptoms_array, str):
        symptoms_array = [symptoms_array]
        
    for symptom in symptoms_array:
        key = symptom.lower().replace(" ", "")
        if key in SYMPTOM_TO_DISEASE:
            return SYMPTOM_TO_DISEASE[key]
    return "General Checkup"

# =====================
# MULTIPLIERS
# =====================
HOSPITAL_MULT = {
  "government": 0.5,
  "private": 1.3,
  "premium": 1.6,
  "trust": 0.8,
  "unknown": 1.2
}

CITY_FACTOR = {
  "Ahmedabad": 1.05,
  "Mumbai": 1.3,
  "Gandhinagar": 1.2,
  "Delhi": 1.25,
  "rural": 0.85
}

# =====================
# MAIN FUNCTION
# =====================
def compute_cost_range(disease_input, city, hospital):
    disease = disease_input
    
    # Check if input is likely a symptom list (list of strings)
    if isinstance(disease_input, list):
        disease = get_disease_from_symptoms(disease_input)
    
    # Get severity
    severity = DISEASE_SEVERITY.get(disease)
    
    # Determine base cost
    base = BASE_COST.get(disease)
    if not base:
        base = SEVERITY_BASE.get(severity, 500)
    
    # Only apply city factor for moderate/severe/critical conditions
    city_factor = 1.0
    if severity in ["moderate", "severe", "critical"]:
        city_factor = CITY_FACTOR.get(city, 1.0)
        
    # Hospital type multiplier
    h_type = hospital.hospital_type if hasattr(hospital, 'hospital_type') else "unknown"
    hospital_type_mult = HOSPITAL_MULT.get(h_type, 1.2)
    
    # Hospital base factor
    hospital_base_factor = hospital.base_cost_factor if hasattr(hospital, 'base_cost_factor') else 1.0
    
    total = base * city_factor * hospital_type_mult * hospital_base_factor
    
    low = int(round(total * 0.85))
    high = int(round(total * 1.15))
    
    return {
        "predictedDisease": disease,
        "low": low,
        "high": high
    }

def format_cost_text(low, high):
    def format_currency(num):
        # formatted currency similar to en-IN
        s = "{:,.0f}".format(num)
        return "₹" + s

    return f"{format_currency(low)} – {format_currency(high)} (approx.)"
