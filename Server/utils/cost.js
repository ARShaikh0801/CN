// =====================
// BASE COST DATA
// =====================
const BASE_COST = {
  // Serious conditions
  "Angina": 40000,
  "Myocardial infarction": 150000,
  "Appendicitis": 50000,
  "Hip Replacement": 180000,
  "Dengue": 8000,

  // Common problems - realistic costs
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
};

// =====================
// SEVERITY LOGIC
// =====================
const SEVERITY_BASE = {
  mild: 300,
  moderate: 5000,
  severe: 50000,
  critical: 150000
};

const DISEASE_SEVERITY = {
  Fever: "mild",
  Cold: "mild",
  Cough: "mild",
  Headache: "mild",
  "Sore Throat": "mild",
  "Skin Allergy": "mild",
  "General Checkup": "mild",

  Dengue: "moderate",
  "Food Poisoning": "moderate",
  UTI: "moderate",
  "Viral Infection": "moderate",

  Appendicitis: "severe",
  "Hip Replacement": "severe",

  "Myocardial infarction": "critical"
};

// =====================
// SYMPTOM → DISEASE MAP
// =====================
const SYMPTOM_TO_DISEASE = {
  cold: "Cold",
  fever: "Fever",
  cough: "Cough",
  headache: "Headache",
  throat: "Sore Throat",
  sorethroat: "Sore Throat",
  vomiting: "Food Poisoning",
  stomach: "Stomach Pain",
  stomachpain: "Stomach Pain",
  bodypain: "Body Pain",
  weakness: "Viral Infection",
  allergy: "Skin Allergy",
  urine: "UTI",
  injury: "Minor Injury"
};

const getDiseaseFromSymptoms = (symptomsArray) => {
  for (let symptom of symptomsArray) {
    const key = symptom.toLowerCase().replace(/\s/g, "");
    if (SYMPTOM_TO_DISEASE[key]) {
      return SYMPTOM_TO_DISEASE[key];
    }
  }
  return "General Checkup";
};

// =====================
// MULTIPLIERS
// =====================
const HOSPITAL_MULT = {
  government: 0.5,
  private: 1.3,
  premium: 1.6,
  trust: 0.8,
  unknown: 1.2
};

const CITY_FACTOR = {
  Ahmedabad: 1.05,
  Mumbai: 1.3,
  Gandhinagar: 1.2,
  Delhi: 1.25,
  rural: 0.85
};

// =====================
// MAIN FUNCTION
// =====================
const computeCostRange = (input, city, hospital) => {
  let disease = input;

  // If input is symptoms array
  if (Array.isArray(input)) {
    disease = getDiseaseFromSymptoms(input);
  }

  const severity = DISEASE_SEVERITY[disease];

  const base = BASE_COST[disease]
    || SEVERITY_BASE[severity]
    || 500;

  // Only apply city factor for moderate/severe/critical conditions
  const cityFactor = (severity === "moderate" || severity === "severe" || severity === "critical")
    ? (CITY_FACTOR[city] || 1.0)
    : 1.0;
  
  const hospitalTypeMult =
    HOSPITAL_MULT[hospital?.hospital_type || "unknown"] || 1.2;
  const hospitalBaseFactor = hospital?.base_cost_factor || 1.0;

  const total = base * cityFactor * hospitalTypeMult * hospitalBaseFactor;

  const low = Math.round(total * 0.85);
  const high = Math.round(total * 1.15);

  return {
    predictedDisease: disease,
    low,
    high
  };
};

// =====================
// FORMATTER
// =====================
const formatCostText = (low, high) => {
  const format = (num) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  return `${format(low)} – ${format(high)} (approx.)`;
};

// =====================
module.exports = {
  BASE_COST,
  computeCostRange,
  formatCostText
};