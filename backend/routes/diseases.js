/**
 * Diseases Routes
 * Endpoints for disease information and management
 */

const express = require('express');
const router = express.Router();
const { predictDiseases, normalizeClinicalData, validateClinicalData } = require('../services/predictionEngine');
const { getDiseaseByName } = require('../data/diseaseDataset');

// Disease database with detailed information
const DISEASES_DB = {
  'Type 2 Diabetes': {
    category: 'Metabolic',
    symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision'],
    riskFactors: ['Obesity', 'Age > 45', 'Family history', 'Sedentary lifestyle'],
    prevention: ['Maintain healthy weight', 'Regular exercise', 'Healthy diet', 'Monitor blood glucose']
  },
  'Hypertension': {
    category: 'Cardiovascular',
    symptoms: ['Often asymptomatic', 'Headaches', 'Shortness of breath', 'Chest pain'],
    riskFactors: ['Age > 60', 'Obesity', 'High salt diet', 'Stress', 'Smoking'],
    prevention: ['Reduce salt intake', 'Regular exercise', 'Weight management', 'Stress reduction']
  },
  'Heart Disease': {
    category: 'Cardiovascular',
    symptoms: ['Chest pain', 'Shortness of breath', 'Fatigue', 'Palpitations'],
    riskFactors: ['High cholesterol', 'Hypertension', 'Family history', 'Smoking'],
    prevention: ['Healthy diet', 'Regular exercise', 'Quit smoking', 'Stress management']
  },
  'COVID-19': {
    category: 'Respiratory/Infectious',
    symptoms: ['Fever', 'Cough', 'Difficulty breathing', 'Fatigue', 'Loss of taste/smell'],
    riskFactors: ['Age > 60', 'Underlying conditions', 'Immunocompromised'],
    prevention: ['Vaccination', 'Proper hygiene', 'Social distancing', 'Masks when sick']
  },
  'Pneumonia': {
    category: 'Respiratory',
    symptoms: ['Cough with phlegm', 'Fever', 'Chills', 'Shortness of breath'],
    riskFactors: ['Smoking', 'Chronic lung disease', 'Weak immunity', 'Recent cold/flu'],
    prevention: ['Vaccination', 'Avoid smoking', 'Good hygiene', 'Treat infections promptly']
  },
  'Asthma': {
    category: 'Respiratory',
    symptoms: ['Wheezing', 'Difficulty breathing', 'Chest tightness', 'Persistent cough'],
    riskFactors: ['Family history', 'Allergies', 'Smoking exposure', 'Pollution'],
    prevention: ['Avoid triggers', 'Regular medication', 'Monitor symptoms', 'Reduce allergen exposure']
  },
  'Obesity': {
    category: 'Lifestyle',
    symptoms: ['Excess weight', 'Fatigue', 'Joint pain', 'Shortness of breath with activity'],
    riskFactors: ['Sedentary lifestyle', 'Poor diet', 'Genetics', 'Medical conditions'],
    prevention: ['Healthy diet', 'Regular exercise', 'Behavioral therapy', 'Medical supervision']
  },
  'Stroke': {
    category: 'Cardiovascular',
    symptoms: ['Sudden numbness', 'Weakness', 'Speech difficulty', 'Vision problems'],
    riskFactors: ['High blood pressure', 'High cholesterol', 'Age > 55', 'Smoking'],
    prevention: ['Monitor blood pressure', 'Healthy diet', 'Regular exercise', 'Manage stress']
  }
};

// All 25 supported diseases, sorted for Indian screening UX.
const DISEASE_CATALOG = [
  { name: 'Dengue', label: 'Dengue Fever', category: 'Infectious', priority: 1, group: 'Common in India' },
  { name: 'Malaria', label: 'Malaria', category: 'Infectious', priority: 1, group: 'Common in India' },
  { name: 'Typhoid', label: 'Typhoid Fever', category: 'Infectious', priority: 1, group: 'Common in India' },
  { name: 'Influenza', label: 'Influenza', category: 'Respiratory', priority: 1, group: 'Common in India' },
  { name: 'Tuberculosis', label: 'Tuberculosis', category: 'Infectious', priority: 1, group: 'Common in India' },
  { name: 'COVID-19', label: 'COVID-19', category: 'Infectious', priority: 1, group: 'Common in India' },
  { name: 'Hepatitis B', label: 'Hepatitis B', category: 'Infectious', priority: 1, group: 'Common in India' },

  { name: 'Type 2 Diabetes', label: 'Diabetes', category: 'Chronic', priority: 2, group: 'Chronic & Lifestyle' },
  { name: 'Hypertension', label: 'Hypertension', category: 'Chronic', priority: 2, group: 'Chronic & Lifestyle' },
  { name: 'Thyroid Disorder', label: 'Thyroid Disorder', category: 'Hormonal', priority: 2, group: 'Chronic & Lifestyle' },
  { name: 'Asthma', label: 'Asthma', category: 'Respiratory', priority: 2, group: 'Chronic & Lifestyle' },
  { name: 'Obesity', label: 'Obesity', category: 'Lifestyle', priority: 2, group: 'Chronic & Lifestyle' },
  { name: 'PCOS', label: 'PCOS', category: 'Hormonal', priority: 2, group: 'Chronic & Lifestyle' },
  { name: 'High Cholesterol', label: 'High Cholesterol', category: 'Metabolic', priority: 2, group: 'Chronic & Lifestyle' },
  { name: 'Heart Disease', label: 'Heart Disease', category: 'Cardiovascular', priority: 2, group: 'Chronic & Lifestyle' },
  { name: 'Coronary Artery Disease', label: 'Coronary Artery Disease', category: 'Cardiovascular', priority: 2, group: 'Chronic & Lifestyle' },
  { name: 'Pneumonia', label: 'Pneumonia', category: 'Respiratory', priority: 2, group: 'Chronic & Lifestyle' },
  { name: 'COPD', label: 'COPD', category: 'Respiratory', priority: 2, group: 'Chronic & Lifestyle' },

  { name: 'Stroke', label: 'Stroke', category: 'Cardiovascular', priority: 3, group: 'Advanced Conditions' },
  { name: 'Arrhythmia', label: 'Arrhythmia', category: 'Cardiovascular', priority: 3, group: 'Advanced Conditions' },
  { name: "Alzheimer's Disease", label: "Alzheimer's Disease", category: 'Neurological', priority: 3, group: 'Advanced Conditions' },
  { name: "Parkinson's Disease", label: "Parkinson's Disease", category: 'Neurological', priority: 3, group: 'Advanced Conditions' },
  { name: 'Osteoporosis', label: 'Osteoporosis', category: 'Bone', priority: 3, group: 'Advanced Conditions' },
  { name: 'Epilepsy', label: 'Epilepsy', category: 'Neurological', priority: 3, group: 'Advanced Conditions' },
  { name: 'Arthritis', label: 'Arthritis', category: 'Musculoskeletal', priority: 3, group: 'Advanced Conditions' },
];
const ALL_DISEASES = DISEASE_CATALOG.map(disease => disease.name);
const DISEASE_METADATA = DISEASE_CATALOG.reduce((metadata, disease) => {
  metadata[disease.name] = disease;
  return metadata;
}, {});

// Clinical field requirements per disease
const DISEASE_FIELDS = {
  'Type 2 Diabetes':  { required: ['age','gender','blood_glucose','bmi'],            recommended: ['fasting_glucose','hemoglobin_a1c','family_history_diabetes','exercise_frequency','smoking_status'] },
  'Hypertension':     { required: ['age','gender','systolic_bp','diastolic_bp'],      recommended: ['bmi','smoking_status','alcohol_units_per_week','stress_level','family_history_heart_disease'] },
  'Heart Disease':    { required: ['age','gender','systolic_bp','total_cholesterol'], recommended: ['hdl_cholesterol','ldl_cholesterol','smoking_status','family_history_heart_disease','exercise_frequency'] },
  'Obesity':          { required: ['age','gender','height_cm','weight_kg','bmi'],     recommended: ['exercise_frequency','sleep_hours_per_night','stress_level'] },
  'Stroke':           { required: ['age','gender','systolic_bp'],                     recommended: ['total_cholesterol','smoking_status','family_history_heart_disease'] },
  'Asthma':           { required: ['age','gender','dyspnea','chronic_cough'],         recommended: ['smoking_status','asthma_history','occupational_exposure','oxygen_saturation'] },
  'COPD':             { required: ['age','gender','smoking_status','dyspnea'],        recommended: ['smoking_years','oxygen_saturation','copd_history','exercise_frequency'] },
  'High Cholesterol': { required: ['age','gender','total_cholesterol'],               recommended: ['ldl_cholesterol','hdl_cholesterol','triglycerides','smoking_status'] },
  'Arthritis':        { required: ['age','gender','bmi'],                             recommended: ['exercise_frequency','arthritis_history','smoking_status'] },
  'Osteoporosis':     { required: ['age','gender','bone_density_tscore'],             recommended: ['exercise_frequency','osteoporosis_history'] },
  'Tuberculosis':     { required: ['age','gender','chronic_cough','weight_kg'],       recommended: ['fever','night_sweats','smoking_status','oxygen_saturation'] },
  'Dengue':           { required: ['age','gender','wbc_count','platelet_count'],      recommended: ['fever','systolic_bp','hematocrit'] },
  'Malaria':          { required: ['age','gender','fever','wbc_count'],               recommended: ['heart_rate','hematocrit','systolic_bp'] },
  'Typhoid':          { required: ['age','gender','fever','alt_level'],               recommended: ['heart_rate','ast_level','wbc_count'] },
  'Pneumonia':        { required: ['age','gender','fever','oxygen_saturation'],       recommended: ['chronic_cough','wbc_count','smoking_status'] },
  'Influenza':        { required: ['age','gender','fever','body_aches'],               recommended: ['chronic_cough','oxygen_saturation'] },
  'Thyroid Disorder': { required: ['age','gender','tsh_level'],                       recommended: ['weight_kg','heart_rate','bmi','stress_level'] },
  'PCOS':             { required: ['age','gender','bmi','weight_kg'],                 recommended: ['family_history_diabetes','exercise_frequency','stress_level'] },
  'Hepatitis B':      { required: ['age','gender','alt_level','ast_level'],           recommended: ['alcohol_units_per_week','liver_disease_history','fever'] },
  "Alzheimer's Disease": { required: ['age', 'gender', 'mmse_score', 'memory_issues'], recommended: ['depression_history','family_history_diabetes'] },
  "Parkinson's Disease": { required: ['age', 'gender', 'tremor', 'bradykinesia'],     recommended: ['sleep_hours_per_night','stress_level'] },
  'Epilepsy':         { required: ['age', 'gender', 'memory_issues'],                 recommended: ['sleep_hours_per_night','stress_level'] },
  'Coronary Artery Disease': { required: ['age','gender','systolic_bp','total_cholesterol'], recommended: ['ldl_cholesterol','hdl_cholesterol','smoking_status','family_history_heart_disease'] },
  'Arrhythmia':       { required: ['age','gender','heart_rate','systolic_bp'],        recommended: ['alcohol_units_per_week','stress_level','smoking_status'] },
};
const DEFAULT_FIELDS = { required: ['age','gender'], recommended: ['bmi','smoking_status','exercise_frequency'] };

/**
 * GET /api/v2/diseases/list
 * Get list of all supported diseases (detailed DB only — 8 diseases)
 */
router.get('/list', (req, res) => {
  const diseases = Object.keys(DISEASES_DB).map(name => ({
    name,
    category: DISEASES_DB[name].category,
    symptomCount: DISEASES_DB[name].symptoms.length,
    riskFactors: DISEASES_DB[name].riskFactors.length
  }));

  res.json({
    success: true,
    totalDiseases: diseases.length,
    diseases
  });
});

/**
 * GET /api/v2/diseases/supported-diseases
 * Returns the list of all 25 supported diseases (used by MultiDiseaseDetector)
 * MUST be before /:name wildcard!
 */
router.get('/supported-diseases', (req, res) => {
  res.json({ diseases: ALL_DISEASES, diseaseMetadata: DISEASE_CATALOG });
});

/**
 * GET /api/v2/diseases/fields/:disease
 * Returns required + recommended clinical fields for a specific disease
 * MUST be before /:name wildcard!
 */
router.get('/fields/:disease', (req, res) => {
  const disease = decodeURIComponent(req.params.disease);
  const fields  = DISEASE_FIELDS[disease] || DEFAULT_FIELDS;
  res.json({ disease, requiredFields: fields.required, recommendedFields: fields.recommended });
});

/**
 * GET /api/v2/diseases/categories
 * Get list of all disease categories
 * MUST be before /:name wildcard!
 */
router.get('/categories', (req, res) => {
  const categories = [...new Set(
    Object.values(DISEASES_DB).map(disease => disease.category)
  )];
  res.json({ success: true, totalCategories: categories.length, categories });
});

/**
 * GET /api/v2/diseases/category/:categoryName
 * Get all diseases in a specific category
 * MUST be before /:name wildcard!
 */
router.get('/category/:categoryName', (req, res) => {
  try {
    const category = req.params.categoryName;
    const diseasesByCategory = Object.entries(DISEASES_DB)
      .filter(([, disease]) => disease.category === category)
      .map(([name, disease]) => ({ name, ...disease }));

    if (diseasesByCategory.length === 0) {
      return res.status(404).json({ error: 'No diseases found for this category', searched: category });
    }
    res.json({ success: true, category, total: diseasesByCategory.length, diseases: diseasesByCategory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve diseases by category', message: error.message });
  }
});

// Disease-specific health tips used by the frontend results page
const HEALTH_TIPS = {
  'Tuberculosis': [
    'Complete the full TB treatment course — stopping early causes drug resistance.',
    'Cover your mouth when coughing; use a mask in crowded places.',
    'Eat a high-protein diet (eggs, dal, meat) to support lung recovery.',
    'Get a chest X-ray follow-up after 2 months of treatment.',
    'Inform close contacts so they can get tested.'
  ],
  'Dengue': [
    'Rest completely and drink plenty of fluids (ORS, coconut water, juices).',
    'Monitor platelet count daily if fever persists beyond 3 days.',
    'Avoid NSAIDs (ibuprofen, aspirin) — use paracetamol only for fever.',
    'Use mosquito nets and repellents; eliminate standing water around home.',
    'Seek emergency care if you notice bleeding gums, black stools, or severe abdominal pain.'
  ],
  'Malaria': [
    'Complete the full anti-malarial course even after feeling better.',
    'Sleep under insecticide-treated nets, especially during peak mosquito hours (dusk-dawn).',
    'Stay hydrated and monitor for signs of severe malaria (confusion, yellow eyes).',
    'Get a repeat blood smear after 48 hours if fever persists.',
    'Avoid travel to high-malaria areas without prophylaxis.'
  ],
  'Type 2 Diabetes': [
    'Check fasting blood glucose at least twice a week; target < 126 mg/dL.',
    'Follow a low-glycemic diet: avoid white rice, sugary drinks, and refined flour.',
    'Walk 30 minutes daily — exercise lowers blood sugar without medication.',
    'Never skip meals; consistent meal timing prevents sugar spikes.',
    'Inspect your feet daily for cuts or sores that do not heal.'
  ],
  'Hypertension': [
    'Reduce salt intake to less than 5 g/day (avoid pickles, processed food, papad).',
    'Monitor BP daily at the same time each morning before meals.',
    'Practice deep breathing or meditation for 10 minutes daily to reduce stress.',
    'Limit alcohol to fewer than 2 units per day.',
    'Take medications at the same time every day — never stop without consulting your doctor.'
  ],
  'Heart Disease': [
    'Follow a heart-healthy diet: more vegetables, fish, whole grains; less saturated fat.',
    'Stop smoking immediately — it doubles the risk of heart attack.',
    'Monitor cholesterol and BP at least every 3 months.',
    'Report chest tightness, jaw pain, or left arm pain to a doctor immediately.',
    'Do light aerobic exercise (walking, cycling) as cleared by your cardiologist.'
  ],
  'Coronary Artery Disease': [
    'Take prescribed antiplatelet therapy (aspirin/clopidogrel) as directed.',
    'Avoid sudden strenuous activity; warm up before any exercise.',
    'Keep a nitroglycerin spray accessible if prescribed.',
    'Attend cardiac rehab sessions for structured recovery.',
    'Manage stress — anger and anxiety directly raise coronary risk.'
  ],
  'Asthma': [
    'Always carry your reliever inhaler (salbutamol) and use the spacer correctly.',
    'Identify and avoid triggers: dust, smoke, cold air, pollen, pets.',
    'Use a peak flow meter daily to monitor lung function.',
    'Rinse your mouth after using a steroid inhaler to prevent thrush.',
    'Get a flu vaccine every year — respiratory infections worsen asthma.'
  ],
  'COPD': [
    'Quitting smoking is the single most effective treatment for COPD.',
    'Practice pursed-lip breathing to manage breathlessness.',
    'Use your inhalers in the correct sequence (SABA before ICS).',
    'Pulmonary rehabilitation exercises significantly improve quality of life.',
    'Get the pneumococcal and flu vaccines annually.'
  ],
  'Pneumonia': [
    'Complete the full antibiotic course even if you feel better after 2–3 days.',
    'Rest and drink warm fluids; deep breathing exercises help clear mucus.',
    'Monitor oxygen saturation — seek emergency care if it drops below 92%.',
    'Avoid smoking and second-hand smoke during recovery.',
    'Follow up with a chest X-ray at 4–6 weeks to confirm clearance.'
  ],
  'COVID-19': [
    'Isolate for at least 5 days from symptom onset; wear a mask around others.',
    'Monitor oxygen saturation with a pulse oximeter; go to hospital if < 94%.',
    'Stay well-hydrated and rest; take paracetamol for fever.',
    'Seek emergency care for persistent chest pain, confusion, or bluish lips.',
    'Long COVID symptoms (fatigue, brain fog) can persist — follow up with a doctor at 4 weeks.'
  ],
  'Hepatitis B': [
    'Avoid alcohol completely — it accelerates liver damage in Hepatitis B.',
    'Get regular liver function tests (LFT) every 6 months.',
    'Ensure all household members are vaccinated against Hepatitis B.',
    'Inform your dentist and surgeon of your status before any procedures.',
    'Do not share razors, toothbrushes, or needles.'
  ],
  'Thyroid Disorder': [
    'Take thyroid medication (levothyroxine) on an empty stomach, 30 min before food.',
    'Do not take thyroid pills with calcium, iron, or antacids — they block absorption.',
    'Check TSH levels every 6 months or after any dose change.',
    'Avoid excessive iodine (large amounts of seaweed/kelp) without medical advice.',
    'Fatigue and mood changes often improve within 6–8 weeks of correct treatment.'
  ],
  'Influenza': [
    'Rest at home and avoid contact with others for at least 5 days.',
    'Drink warm fluids and use steam inhalation for congestion relief.',
    'Paracetamol is safe; avoid aspirin (especially in children).',
    'Oseltamivir (Tamiflu) is most effective if started within 48 hours of onset.',
    'Get the flu vaccine every year — the virus mutates seasonally.'
  ],
  'Typhoid': [
    'Take the full antibiotic course (usually 10–14 days) without interruption.',
    'Drink only boiled or bottled water; avoid raw vegetables and street food.',
    'Wash hands thoroughly before eating and after using the toilet.',
    'Rest and eat soft, easily digestible foods during recovery.',
    'Notify public health if you are a food handler — typhoid is notifiable.'
  ],
  'Stroke': [
    'Remember FAST: Face drooping, Arm weakness, Speech difficulty → Time to call emergency.',
    'Control blood pressure daily — the #1 modifiable stroke risk factor.',
    'Begin rehabilitation (physiotherapy, speech therapy) as early as possible.',
    'Take anticoagulants or antiplatelets exactly as prescribed — never skip.',
    'Stop smoking and reduce alcohol consumption immediately.'
  ],
  'Obesity': [
    'Set a realistic goal: losing 5–10% of body weight improves most health markers.',
    'Follow a calorie-deficit diet with high protein and fiber to preserve muscle.',
    'Aim for 150 minutes of moderate aerobic activity per week.',
    'Avoid crash diets — sustainable changes prevent weight regain.',
    'Track meals with a food diary or app to maintain awareness of intake.'
  ],
  'PCOS': [
    'A low-glycemic diet and weight loss of 5% can restore regular periods.',
    'Exercise at least 150 minutes per week — it improves insulin sensitivity.',
    'Manage stress; elevated cortisol worsens hormonal imbalance.',
    'Follow up with a gynecologist for cycle regulation and fertility guidance.',
    'Monitor blood glucose annually — PCOS significantly raises diabetes risk.'
  ],
  'High Cholesterol': [
    'Cut saturated fats (red meat, full-fat dairy, fried food) from your diet.',
    'Eat soluble fibre: oats, barley, apples, beans — it binds cholesterol in the gut.',
    'Exercise 30 minutes most days — aerobic activity raises HDL ("good") cholesterol.',
    'If on statins, take them at night with water; report any muscle pain immediately.',
    'Recheck lipid profile in 3 months after dietary changes or medication adjustment.'
  ],
  'Arrhythmia': [
    'Limit caffeine and alcohol — both can trigger irregular heartbeats.',
    'Record episodes with a pulse oximeter or smartwatch to share with your cardiologist.',
    'Take anti-arrhythmic medications at the same time daily without skipping.',
    'Learn to take your pulse manually to detect irregular rhythms.',
    'Seek emergency care for sustained palpitations, dizziness, or fainting.'
  ],
  "Alzheimer's Disease": [
    'Engage in mentally stimulating activities: reading, puzzles, social interaction.',
    'Physical exercise improves brain blood flow — aim for daily walks.',
    'Establish consistent daily routines to reduce confusion.',
    'Discuss cholinesterase inhibitor therapy with a neurologist.',
    'Caregivers: join a support group and plan for future care needs early.'
  ],
  "Parkinson's Disease": [
    'Physical therapy and exercise (especially balance training) slow progression.',
    'Take levodopa medications at consistent times relative to meals.',
    'Avoid high-protein meals close to levodopa doses — protein competes for absorption.',
    'Use assistive devices and home modifications to prevent falls.',
    'Join a Parkinson\'s support group for peer guidance and motivation.'
  ],
  'Osteoporosis': [
    'Ensure adequate calcium (1000–1200 mg/day) and Vitamin D (600–800 IU/day).',
    'Weight-bearing exercise (walking, dancing) strengthens bone density.',
    'Avoid smoking and excessive alcohol — both accelerate bone loss.',
    'Take bisphosphonates on an empty stomach with a full glass of water; stay upright for 30 min.',
    'Fall-proof your home: remove loose rugs, improve lighting, add grab bars.'
  ],
  'Epilepsy': [
    'Never miss anti-epileptic medication doses — even one missed dose can trigger a seizure.',
    'Get 7–9 hours of sleep; sleep deprivation is a leading seizure trigger.',
    'Avoid alcohol and recreational drugs entirely.',
    'Wear a medical alert bracelet and educate close contacts on seizure first aid.',
    'Do not drive or swim alone until confirmed seizure-free for the required period.'
  ],
  'Arthritis': [
    'Maintain a healthy weight to reduce joint stress — each kg lost saves 4 kg of joint load.',
    'Warm up before activity and use ice packs after to manage inflammation.',
    'Physiotherapy strengthens muscles around affected joints.',
    'Take DMARDs (for rheumatoid arthritis) consistently — they slow joint destruction.',
    'Discuss joint-protective aids (splints, orthotic insoles) with your rheumatologist.'
  ]
};

const DEFAULT_HEALTH_TIPS = [
  'Consult a qualified healthcare professional for accurate diagnosis and treatment.',
  'Monitor your symptoms and seek care if they worsen or new symptoms appear.',
  'Stay hydrated, rest adequately, and maintain a balanced diet.',
  'Keep a symptom diary to track changes over time.',
  'Do not self-medicate — always follow medical advice.'
];

/**
 * GET /api/v2/diseases/health-tips/:disease
 * Returns actionable health tips for a specific disease.
 * MUST be before /:name wildcard!
 */
router.get('/health-tips/:disease', (req, res) => {
  const disease = decodeURIComponent(req.params.disease);
  const tips = HEALTH_TIPS[disease] || DEFAULT_HEALTH_TIPS;
  res.json({
    disease,
    tips,
    count: tips.length,
    isDefault: !HEALTH_TIPS[disease]
  });
});

/**
 * GET /api/v2/diseases/:name
 * Get detailed information about a specific disease
 * Wildcard — must come AFTER all specific GET routes
 */
router.get('/:name', (req, res) => {
  try {
    const diseaseName = req.params.name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    if (!DISEASES_DB[diseaseName]) {
      return res.status(404).json({ error: 'Disease not found', searched: diseaseName });
    }
    res.json({ success: true, disease: { name: diseaseName, ...DISEASES_DB[diseaseName] } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve disease information', message: error.message });
  }
});

/**
 * POST /api/v2/diseases/search
 * Search diseases by symptoms or keywords
 */
router.post('/search', (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter is required'
      });
    }

    const searchTerm = query.toLowerCase();
    const matches = Object.entries(DISEASES_DB).filter(([name, disease]) => {
      return name.toLowerCase().includes(searchTerm) ||
        disease.symptoms.some(s => s.toLowerCase().includes(searchTerm)) ||
        disease.category.toLowerCase().includes(searchTerm);
    });

    const results = matches.map(([name, disease]) => ({
      name,
      ...disease
    }));

    res.json({
      success: true,
      query,
      results: results,
      found: results.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

// ── MultiDiseaseDetector endpoints ──────────────────────────────────────────
// Symptom-first detailed screening endpoint. It intentionally ignores
// disease_of_interest as a scoring signal so users cannot bias the engine.
router.post('/detect', (req, res) => {
  try {
    const body = req.body || {};
    const symptoms = Array.isArray(body.symptoms)
      ? body.symptoms
      : [body.symptoms].filter(Boolean);
    const clinicalData = normalizeClinicalData({
      ...body,
      ...(body.clinicalData || {}),
      ...(body.clinical || {}),
      ...(body.vitals || {}),
      ...(body.labs || {})
    });
    const clinicalErrors = validateClinicalData(clinicalData);

    if (clinicalErrors.length > 0) {
      return res.status(400).json({
        error: 'Clinical data validation failed',
        message: clinicalErrors.join('; '),
        details: clinicalErrors
      });
    }

    if (symptoms.length === 0 && Object.keys(clinicalData).length === 0) {
      return res.status(400).json({
        error: 'Symptoms or clinical data are required',
        message: 'Start with symptoms so the engine can suggest diseases without manual bias.'
      });
    }

    const prediction = predictDiseases(symptoms, clinicalData);
    const allDiseaseRisks = (prediction.predictions || []).slice(0, 5).map(item => {
      const datasetDisease = getDiseaseByName(item.disease);
      const confidence = Number.parseInt(String(item.confidence || item.probability || '0').replace('%', ''), 10) || 0;
      return {
        diseaseName: item.disease,
        displayLabel: DISEASE_METADATA[item.disease]?.label || item.disease,
        riskScore: confidence / 100,
        riskLevel: confidence >= 70 ? 'High Risk' : confidence >= 40 ? 'Moderate Risk' : 'Low Risk',
        category: datasetDisease?.category || DISEASE_METADATA[item.disease]?.category || 'General',
        priority: DISEASE_METADATA[item.disease]?.priority || 3,
        group: DISEASE_METADATA[item.disease]?.group || 'Advanced Conditions',
        contributingFactors: item.reason || []
      };
    });

    const primary = allDiseaseRisks[0] || null;
    const prevention = primary
      ? ((DISEASES_DB[primary.diseaseName] || {}).prevention || ['Consult a qualified clinician', 'Confirm with recommended tests'])
      : ['Provide more disease-specific symptoms', 'Consult a qualified clinician if symptoms persist'];

    res.json({
      diseaseOfInterest: primary?.diseaseName || 'No strong match',
      primaryRiskScore: primary?.riskScore || 0,
      primaryRiskCategory: primary?.riskLevel || 'Need More Symptoms',
      primaryFactors: primary?.contributingFactors || [],
      allDiseaseRisks,
      preventionRecommendations: prevention,
      immediateActions: primary && primary.riskScore >= 0.6
        ? ['Consult a doctor within 1 week', 'Monitor vitals daily']
        : ['Add more specific symptoms if available', 'Schedule a routine check-up if symptoms persist'],
      requiredFollowUps: [`Re-screen in ${primary && primary.riskScore >= 0.6 ? '3' : '6'} months`],
      interpretation: prediction.interpretation,
      urgency: prediction.urgency,
      selectedDiseaseContext: body.disease_of_interest || null,
      engineMetadata: prediction.metadata,
      categoryBreakdown: allDiseaseRisks.reduce((acc, d) => {
        (acc[d.category] = acc[d.category] || []).push(`${d.diseaseName} (${(d.riskScore * 100).toFixed(0)}%)`);
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Detect error:', error);
    res.status(500).json({ error: 'Detection failed', message: error.message });
  }
});

// Note: Duplicate /supported-diseases and /fields/:disease removed - they are defined above
router.post('/detect', (req, res) => {
  try {
    const body = req.body;
    const { disease_of_interest } = body;

    if (!disease_of_interest) {
      return res.status(400).json({ error: 'disease_of_interest is required' });
    }

    const isYes = (value) => {
      const normalized = String(value ?? '').toLowerCase().trim();
      return value === true || value === 1 || normalized === '1' || normalized === 'yes' || normalized === 'true';
    };
    const smokingStatus = String(body.smoking_status || '').toLowerCase().trim();
    const isSmoker = smokingStatus === 'smoker' || smokingStatus === 'current' || smokingStatus === 'current smoker' || isYes(body.smoking_status);
    const toValidNumber = (value) => {
      if (value === '' || value === null || value === undefined) return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };
    const oxygen = toValidNumber(body.oxygen_saturation);
    if (oxygen !== null && oxygen !== 0 && (oxygen < 70 || oxygen > 100)) {
      return res.status(400).json({
        error: 'Invalid oxygen value',
        message: 'Oxygen saturation must be between 70 and 100%'
      });
    }

    const a    = parseInt(body.age) || 0;
    const b    = parseFloat(body.bmi) || 0;
    const g    = parseFloat(body.blood_glucose) || 0;
    const sbp  = parseInt(body.systolic_bp) || 0;
    const chol = parseFloat(body.total_cholesterol) || 0;
    const smokes = isSmoker;
    const exFreq = parseInt(body.exercise_frequency) || 3;
    const famDiab = body.family_history_diabetes == 1;
    const famHeart = body.family_history_heart_disease == 1;

    const computeRisk = (name) => {
      let score = 15;
      const factors = [];
      switch (name) {
        case 'Type 2 Diabetes':
          if (g > 126) { score += 35; factors.push('High blood glucose'); }
          else if (g > 100) { score += 18; factors.push('Elevated glucose'); }
          if (b > 30)  { score += 15; factors.push('Obesity (BMI>30)'); }
          if (a > 45)  { score += 10; factors.push('Age > 45'); }
          if (famDiab) { score += 12; factors.push('Family history'); }
          break;
        case 'Hypertension':
          if (sbp > 140) { score += 30; factors.push('High systolic BP'); }
          if (smokes)    { score += 12; factors.push('Smoking'); }
          if (a > 50)    { score += 10; factors.push('Age > 50'); }
          if (b > 30)    { score +=  8; factors.push('Obesity'); }
          break;
        case 'Heart Disease':
        case 'Coronary Artery Disease':
          if (chol > 200) { score += 18; factors.push('High cholesterol'); }
          if (sbp > 140)  { score += 15; factors.push('High BP'); }
          if (smokes)     { score += 15; factors.push('Smoking'); }
          if (famHeart)   { score += 18; factors.push('Family history'); }
          if (a > 50)     { score += 12; factors.push('Age > 50'); }
          break;
        case 'Obesity':
          if (b > 30)      { score += 45; factors.push('BMI > 30'); }
          else if (b > 25) { score += 20; factors.push('BMI 25–30'); }
          if (exFreq < 2)  { score += 10; factors.push('Sedentary lifestyle'); }
          break;
        case 'Stroke':
          if (sbp > 160)  { score += 30; factors.push('Very high BP'); }
          if (chol > 240) { score += 15; factors.push('High cholesterol'); }
          if (a > 55)     { score += 15; factors.push('Age > 55'); }
          if (smokes)     { score += 12; factors.push('Smoking'); }
          break;
        case 'Tuberculosis':
          if (isYes(body.chronic_cough)) { score += 25; factors.push('Chronic cough'); }
          if (isYes(body.night_sweats))  { score += 20; factors.push('Night sweats'); }
          if (isYes(body.fever))         { score += 15; factors.push('Fever'); }
          if (smokes)                  { score += 10; factors.push('Smoking factor'); }
          break;
        case 'Dengue':
        case 'Malaria':
          if (isYes(body.fever))       { score += 30; factors.push('Fever'); }
          if (parseFloat(body.platelet_count) < 150000) { score += 25; factors.push('Low platelet count'); }
          if (parseFloat(body.wbc_count) < 4)           { score += 15; factors.push('Low WBC count'); }
          break;
        case 'Thyroid Disorder':
          const tsh = parseFloat(body.tsh_level) || 0;
          if (tsh > 4.5 || tsh < 0.4) { score += 40; factors.push('Abnormal TSH level'); }
          if (a > 50)                  { score += 10; factors.push('Age factor'); }
          break;
        case 'Pneumonia':
          if (isYes(body.fever))            { score += 25; factors.push('Fever'); }
          if (oxygen !== null && oxygen > 0 && oxygen < 92) { score += 30; factors.push('Low oxygen saturation'); }
          if (isYes(body.chronic_cough))    { score += 15; factors.push('Persistent cough'); }
          break;
        case "Alzheimer's Disease":
          const mmse = parseInt(body.mmse_score) || 30;
          if (mmse < 24)               { score += 45; factors.push('Low MMSE score'); }
          if (isYes(body.memory_issues)) { score += 20; factors.push('Memory issues reported'); }
          if (a > 65)                  { score += 15; factors.push('Age > 65'); }
          break;
        default:
          if (smokes) { score += 8;  factors.push('Smoking'); }
          if (a > 50) { score += 6;  factors.push('Age factor'); }
          if (b > 30) { score += 4;  factors.push('Obesity'); }
      }
      const riskScore = Math.min(Math.max(score, 5), 95) / 100;
      const riskLevel = score >= 60 ? 'High Risk' : score >= 35 ? 'Moderate Risk' : 'Low Risk';
      const cat = DISEASE_METADATA[name]?.category || DISEASES_DB[name]?.category || 'General';
      return {
        diseaseName: name,
        displayLabel: DISEASE_METADATA[name]?.label || name,
        riskScore,
        riskLevel,
        category: cat,
        priority: DISEASE_METADATA[name]?.priority || 3,
        group: DISEASE_METADATA[name]?.group || 'Advanced Conditions',
        contributingFactors: factors
      };
    };

    const primary         = computeRisk(disease_of_interest);
    const allDiseaseRisks = ALL_DISEASES.map(computeRisk).sort((a, b) => b.riskScore - a.riskScore);
    const prevention      = (DISEASES_DB[disease_of_interest] || {}).prevention || ['Maintain healthy lifestyle', 'Regular check-ups'];

    res.json({
      diseaseOfInterest:         disease_of_interest,
      primaryRiskScore:          primary.riskScore,
      primaryRiskCategory:       primary.riskLevel,
      primaryFactors:            primary.contributingFactors,
      allDiseaseRisks,
      preventionRecommendations: prevention,
      immediateActions: primary.riskScore >= 0.6
        ? ['Consult a doctor within 1 week', 'Monitor vitals daily']
        : ['Schedule a routine check-up', 'Improve diet and exercise'],
      requiredFollowUps: [`Re-screen in ${primary.riskScore >= 0.6 ? '3' : '6'} months`],
      categoryBreakdown: allDiseaseRisks.reduce((acc, d) => {
        (acc[d.category] = acc[d.category] || []).push(`${d.diseaseName} (${(d.riskScore * 100).toFixed(0)}%)`);
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Detect error:', error);
    res.status(500).json({ error: 'Detection failed', message: error.message });
  }
});

module.exports = router;
