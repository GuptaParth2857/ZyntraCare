// ZyntraCare Healthcare AI Knowledge Base
// This is the foundation for our custom AI model

export interface HealthKnowledge {
  id: string;
  category: 'symptom' | 'disease' | 'medicine' | 'first_aid' | 'nutrition' | 'emergency';
  title: string;
  description: string;
  symptoms?: string[];
  causes?: string[];
  treatments?: string[];
  precautions?: string[];
  when_to_doctor?: string[];
  severity?: 'low' | 'medium' | 'high' | 'emergency';
  related_symptoms?: string[];
  medicine_names?: string[];
}

export const healthcareKnowledge: HealthKnowledge[] = [
  // FEVER related
  {
    id: 'fever_001',
    category: 'symptom',
    title: 'Fever (High Temperature)',
    description: 'Body temperature above 100.4°F (38°C) is considered fever. It is a natural response to infection.',
    symptoms: ['Temperature above 100.4°F', 'Chills', 'Sweating', 'Headache', 'Muscle aches', 'Fatigue', 'Loss of appetite'],
    causes: ['Viral infection', 'Bacterial infection', 'Heat exhaustion', 'Inflammatory conditions', 'COVID-19', 'Malaria'],
    treatments: ['Rest', 'Stay hydrated', 'Take fever reducers (Paracetamol/Ibuprofen)', 'Cool compress', 'Light clothing'],
    precautions: ['Monitor temperature regularly', 'Stay isolated if contagious', 'Avoid cold baths'],
    when_to_doctor: ['Fever above 103°F', 'Fever lasting more than 3 days', 'Severe headache', 'Rash', 'Confusion'],
    severity: 'high',
    related_symptoms: ['headache', 'body_pain', 'cough', 'fatigue'],
  },
  {
    id: 'fever_002',
    category: 'disease',
    title: 'Dengue Fever',
    description: 'Mosquito-borne viral disease causing high fever and severe muscle pain.',
    symptoms: ['High fever up to 106°F', 'Severe headache', 'Eye pain', 'Joint pain (breakbone fever)', 'Muscle pain', 'Nausea', 'Rash'],
    causes: ['Dengue virus transmitted by Aedes mosquito', 'Stagnant water breeding sites'],
    treatments: ['No specific antiviral treatment', 'Symptom management', 'Plenty of fluids', 'Paracetamol for pain', 'Rest'],
    precautions: ['Avoid aspirin and ibuprofen', 'Use mosquito nets', 'Eliminate standing water', 'Wear protective clothing'],
    when_to_doctor: ['Severe abdominal pain', 'Persistent vomiting', 'Bleeding gums', 'Blood in stool', 'Difficulty breathing'],
    severity: 'emergency',
    medicine_names: ['Paracetamol', 'ORS solution', 'Electrolytes'],
  },
  
  // COMMON COLD related
  {
    id: 'cold_001',
    category: 'symptom',
    title: 'Common Cold',
    description: 'Viral infection of the nose and throat. Most common illness worldwide.',
    symptoms: ['Runny nose', 'Sneezing', 'Sore throat', 'Cough', 'Mild fever', 'Fatigue', 'Body aches'],
    causes: ['Rhinovirus', 'Coronavirus', 'Respiratory syncytial virus', 'Cold weather', 'Weakened immunity'],
    treatments: ['Rest', 'Hot fluids', 'Honey for cough', 'Steam inhalation', 'Vitamin C', 'Decongestants'],
    precautions: ['Wash hands frequently', 'Avoid close contact', 'Stay warm', 'Get adequate sleep'],
    when_to_doctor: ['Symptoms lasting more than 10 days', 'High fever', 'Severe headache', 'Shortness of breath'],
    severity: 'low',
    related_symptoms: ['cough', 'sore_throat', 'runny_nose'],
  },
  
  // HEADACHE related
  {
    id: 'headache_001',
    category: 'symptom',
    title: 'Headache',
    description: 'Pain in any region of the head. Can be primary (migraine, tension) or secondary (due to other conditions).',
    symptoms: ['Pain in head region', 'Pressure on both sides', 'Sensitivity to light/sound', 'Nausea', 'Blurred vision'],
    causes: ['Stress', 'Lack of sleep', 'Dehydration', 'Eye strain', 'High blood pressure', 'Sinus infection'],
    treatments: ['Rest in dark room', 'Stay hydrated', 'Over-the-counter pain relievers', 'Cold compress', 'Massage'],
    precautions: ['Maintain regular sleep schedule', 'Stay hydrated', 'Manage stress', 'Take breaks from screens'],
    when_to_doctor: ['Sudden severe headache', 'Headache with fever', 'Confusion', 'Vision changes', 'Stiff neck'],
    severity: 'medium',
    related_symptoms: ['fever', 'nausea', 'blurred_vision'],
  },
  {
    id: 'headache_002',
    category: 'disease',
    title: 'Migraine',
    description: 'Severe, recurring headache often accompanied by nausea, vomiting, and sensitivity to light and sound.',
    symptoms: ['Throbbing pain on one side', 'Nausea', 'Vomiting', 'Sensitivity to light', 'Sensitivity to sound', 'Visual disturbances (aura)'],
    causes: ['Genetic factors', 'Stress', 'Hormonal changes', 'Certain foods', 'Lack of sleep', 'Weather changes'],
    treatments: ['Rest in quiet dark room', 'Pain relievers (Ibuprofen, Sumatriptan)', 'Anti-nausea medication', 'Preventive medications'],
    precautions: ['Identify and avoid triggers', 'Maintain regular sleep', 'Stay hydrated', 'Exercise regularly', 'Manage stress'],
    when_to_doctor: ['New type of migraine', 'Increasing frequency', 'No response to treatment', 'Aura lasting more than an hour'],
    severity: 'high',
    medicine_names: ['Sumatriptan', 'Ibuprofen', 'Paracetamol', 'Topiramate', 'Propranolol'],
  },
  
  // STOMACH related
  {
    id: 'stomach_001',
    category: 'symptom',
    title: 'Stomach Ache / Abdominal Pain',
    description: 'Pain occurring between chest and groin. Can range from mild to severe.',
    symptoms: ['Pain in abdomen', 'Bloating', 'Nausea', 'Vomiting', 'Loss of appetite', 'Diarrhea'],
    causes: ['Indigestion', 'Gas', 'Food poisoning', 'Stomach flu', 'Ulcer', 'Appendicitis', 'Gallstones'],
    treatments: ['Rest', 'Clear fluids', 'BRAT diet (Bananas, Rice, Apple, Toast)', 'Avoid fatty foods', 'Heat compress'],
    precautions: ['Eat slowly', 'Avoid overeating', 'Maintain food hygiene', 'Manage stress'],
    when_to_doctor: ['Severe pain', 'Pain lasting more than 2 days', 'Blood in stool', 'High fever', 'Inability to pass gas'],
    severity: 'medium',
    related_symptoms: ['nausea', 'vomiting', 'diarrhea', 'fever'],
  },
  {
    id: 'stomach_002',
    category: 'disease',
    title: 'Food Poisoning',
    description: 'Illness caused by eating contaminated food. Usually resolves within 24-48 hours.',
    symptoms: ['Nausea', 'Vomiting', 'Diarrhea', 'Abdominal cramps', 'Fever', 'Weakness'],
    causes: ['Salmonella', 'E. coli', 'Norovirus', 'Contaminated water', 'Undercooked meat', 'Expired food'],
    treatments: ['Stay hydrated', 'ORS solution', 'BRAT diet', 'Rest', 'Anti-nausea medication if severe'],
    precautions: ['Cook food thoroughly', 'Wash hands before cooking', 'Store food at correct temperature', 'Avoid raw seafood'],
    when_to_doctor: ['Severe dehydration', 'Blood in stool', 'High fever', 'Symptoms lasting more than 3 days', 'Confusion'],
    severity: 'high',
    medicine_names: ['ORS powder', 'Oral rehydration salts', 'Activated charcoal', 'Loperamide (for diarrhea)'],
  },
  
  // HEART related
  {
    id: 'heart_001',
    category: 'symptom',
    title: 'Chest Pain',
    description: 'Pain or discomfort in chest area. Can be heart-related or due to other causes.',
    symptoms: ['Pressure in chest', 'Squeezing sensation', 'Pain radiating to arm/jaw', 'Shortness of breath', 'Sweating', 'Nausea'],
    causes: ['Heart attack', 'Angina', 'Heartburn (GERD)', 'Muscle strain', 'Anxiety', 'Lung problems'],
    treatments: ['Call emergency immediately if heart attack suspected', 'Aspirin (if not allergic)', 'Rest', 'Deep breathing'],
    precautions: ['Maintain healthy weight', 'Exercise regularly', 'Avoid smoking', 'Manage stress', 'Control cholesterol'],
    when_to_doctor: ['Severe chest pain', 'Pain radiating to arm/jaw', 'Shortness of breath', 'Sweating', 'Call emergency (108)'],
    severity: 'emergency',
    related_symptoms: ['shortness_of_breath', 'fatigue', 'dizziness'],
  },
  {
    id: 'heart_002',
    category: 'disease',
    title: 'Hypertension (High Blood Pressure)',
    description: 'Blood pressure consistently above 130/80 mmHg. Often called silent killer as it has no symptoms.',
    symptoms: ['Usually no symptoms', 'Headache (rare)', 'Dizziness', 'Shortness of breath', 'Visual changes'],
    causes: ['Genetics', 'Obesity', 'High salt intake', 'Sedentary lifestyle', 'Stress', 'Age', 'Smoking'],
    treatments: ['Low sodium diet', 'Regular exercise', 'Weight loss', 'Medications (Amlodipine, Losartan)', 'Reduce stress'],
    precautions: ['Limit salt intake (<5g/day)', 'Regular exercise (30 min)', 'Maintain healthy weight', 'Limit alcohol', 'Quit smoking'],
    when_to_doctor: ['BP consistently above 140/90', 'Severe headache', 'Vision changes', 'Chest pain', 'Difficulty breathing'],
    severity: 'high',
    medicine_names: ['Amlodipine', 'Losartan', 'Enalapril', 'Hydrochlorothiazide', 'Metoprolol'],
  },
  
  // DIABETES related
  {
    id: 'diabetes_001',
    category: 'disease',
    title: 'Diabetes Mellitus',
    description: 'Chronic condition where body cannot properly use glucose due to insufficient insulin.',
    symptoms: ['Increased thirst', 'Frequent urination', 'Extreme hunger', 'Unexplained weight loss', 'Fatigue', 'Blurred vision', 'Slow healing wounds'],
    causes: ['Genetic factors', 'Obesity', 'Sedentary lifestyle', 'Poor diet', 'Age', 'Pancreatic issues'],
    treatments: ['Insulin therapy', 'Oral medications (Metformin)', 'Blood sugar monitoring', 'Diet control', 'Regular exercise'],
    precautions: ['Monitor blood sugar regularly', 'Follow diabetic diet', 'Exercise regularly', 'Foot care', 'Regular checkups'],
    when_to_doctor: ['Blood sugar too high/low', 'Frequent hypoglycemia', 'Foot wounds not healing', 'Vision changes'],
    severity: 'high',
    medicine_names: ['Metformin', 'Insulin', 'Gliclazide', 'Sitagliptin', 'Empagliflozin'],
  },
  {
    id: 'diabetes_002',
    category: 'symptom',
    title: 'Low Blood Sugar (Hypoglycemia)',
    description: 'Blood sugar below 70 mg/dL. Can be dangerous if not treated quickly.',
    symptoms: ['Shakiness', 'Dizziness', 'Sweating', 'Hunger', 'Irritability', 'Confusion', 'Rapid heartbeat', 'Blurred vision'],
    causes: ['Too much insulin', 'Skipped meals', 'Excessive exercise', 'Alcohol consumption', 'Certain medications'],
    treatments: ['15-20g fast-acting carbs (glucose tablets, juice, candy)', 'Wait 15 min, recheck sugar', 'If severe, glucagon injection'],
    precautions: ['Eat regular meals', 'Carry glucose tablets', 'Check sugar before driving', 'Inform family about symptoms'],
    when_to_doctor: ['Frequent hypoglycemic episodes', 'Severe reactions', 'Unexplained low sugar', 'Loss of consciousness'],
    severity: 'high',
    related_symptoms: ['dizziness', 'confusion', 'fainting'],
  },
  
  // RESPIRATORY related
  {
    id: 'resp_001',
    category: 'symptom',
    title: 'Cough',
    description: 'Reflex action to clear airways. Can be acute (short-term) or chronic (lasting more than 8 weeks).',
    symptoms: ['Throat clearing', 'Chest discomfort', 'Shortness of breath', 'Mucus production', 'Wheezing'],
    causes: ['Cold/Flu', 'Allergies', 'Asthma', 'GERD', 'Smoking', 'COVID-19', 'Pneumonia', 'Air pollution'],
    treatments: ['Honey (for dry cough)', 'Steam inhalation', 'Cough suppressants', 'Expectorants', 'Stay hydrated'],
    precautions: ['Cover mouth while coughing', 'Wash hands frequently', 'Avoid smoking', 'Use air purifier'],
    when_to_doctor: ['Cough lasting more than 3 weeks', 'Coughing blood', 'Fever with cough', 'Shortness of breath', 'Night sweats'],
    severity: 'medium',
    related_symptoms: ['fever', 'shortness_of_breath', 'fatigue'],
  },
  {
    id: 'resp_002',
    category: 'disease',
    title: 'Asthma',
    description: 'Chronic condition causing airway inflammation and narrowing, leading to breathing difficulty.',
    symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness', 'Coughing', 'Difficulty breathing especially at night'],
    causes: ['Allergens (dust, pollen)', 'Exercise', 'Cold air', 'Air pollution', 'Respiratory infections', 'Stress'],
    treatments: ['Inhalers (Bronchodilators, Corticosteroids)', 'Avoid triggers', 'Action plan for attacks', 'Regular checkups'],
    precautions: ['Identify and avoid triggers', 'Use preventer inhaler regularly', 'Keep rescue inhaler handy', 'Regular lung function tests'],
    when_to_doctor: ['Increased use of rescue inhaler', 'Difficulty speaking', 'Lips turning blue', 'Severe wheezing'],
    severity: 'high',
    medicine_names: ['Salbutamol inhaler', 'Budensonide inhaler', 'Montelukast', 'Theophylline'],
  },
  {
    id: 'resp_003',
    category: 'disease',
    title: 'Pneumonia',
    description: 'Lung infection causing inflammation in air sacs. Can be bacterial, viral, or fungal.',
    symptoms: ['Cough with phlegm', 'High fever', 'Chills', 'Shortness of breath', 'Chest pain', 'Fatigue', 'Confusion (in elderly)'],
    causes: ['Bacteria (Streptococcus pneumoniae)', 'Viruses (Influenza, COVID-19)', 'Fungi', 'Aspiration'],
    treatments: ['Antibiotics (for bacterial)', 'Rest', 'Fluids', 'Antivirals (if viral)', 'Hospitalization if severe'],
    precautions: ['Vaccination (pneumococcal, flu)', 'Hand hygiene', 'Avoid smoking', 'Protect from respiratory infections'],
    when_to_doctor: ['Difficulty breathing', 'Persistent fever', 'Chest pain', 'Confusion', 'Coughing blood', 'Blue lips'],
    severity: 'high',
    medicine_names: ['Amoxicillin', 'Azithromycin', 'Levofloxacin', 'Paracetamol', 'ORS'],
  },
  
  // FIRST AID emergencies
  {
    id: 'firstaid_001',
    category: 'first_aid',
    title: 'Bleeding - How to Stop',
    description: 'Steps to control bleeding from cuts or wounds.',
    symptoms: ['Blood flowing from wound', 'Blood soaking through bandage'],
    causes: ['Cuts', 'Injuries', 'Nosebleeds', 'Wounds'],
    treatments: [
      'Apply firm pressure with clean cloth',
      'Elevate the injured area above heart level',
      'If bleeding soaks through, add more cloth without removing',
      'Clean wound once bleeding stops',
      'Apply antibiotic ointment and bandage',
      'For severe bleeding, call emergency immediately'
    ],
    precautions: ['Use clean materials', 'Do not remove impaled objects', 'Seek medical help for deep wounds'],
    when_to_doctor: ['Bleeding does not stop after 10 minutes', 'Deep wounds', 'Animal bites', 'Signs of infection'],
    severity: 'high',
  },
  {
    id: 'firstaid_002',
    category: 'first_aid',
    title: 'Burns - Treatment',
    description: 'How to treat minor to moderate burns at home.',
    symptoms: ['Red skin', 'Blisters', 'Pain', 'Swelling'],
    causes: ['Hot liquids', 'Fire', 'Hot objects', 'Sunburn', 'Chemicals'],
    treatments: [
      'Cool the burn under running water for 10-20 minutes',
      'Remove rings or tight items near burned area',
      'Do not apply ice directly',
      'Cover with clean, non-stick bandage',
      'Take pain reliever if needed',
      'Do not pop blisters'
    ],
    precautions: ['Keep away from flame', 'Use sunscreen', 'Keep chemicals away from children', 'Test bath water temperature'],
    when_to_doctor: ['Burns larger than 3 inches', 'Burns on face, hands, feet, joints', 'Electrical or chemical burns', 'Signs of infection'],
    severity: 'medium',
  },
  {
    id: 'firstaid_003',
    category: 'first_aid',
    title: 'Choking - Heimlich Maneuver',
    description: 'Emergency action when someone cannot breathe due to throat blockage.',
    symptoms: ['Cannot speak or breathe', 'Clutching throat', 'Turning blue', 'Panic'],
    causes: ['Food stuck in throat', 'Small objects', 'Swelling from allergic reaction'],
    treatments: [
      'Stand behind person',
      'Make a fist above navel',
      'Place other hand over fist',
      'Give quick upward thrusts',
      'Repeat until object dislodges',
      'If unconscious, start CPR'
    ],
    precautions: ['Cut food into small pieces', 'Chew properly', 'Do not talk while eating', 'Keep small objects away from children'],
    when_to_doctor: ['Person becomes unconscious', 'Object cannot be removed', 'After successful removal, check for injuries'],
    severity: 'emergency',
  },
  {
    id: 'firstaid_004',
    category: 'first_aid',
    title: 'Fractures (Broken Bones)',
    description: 'How to handle suspected bone fractures until medical help arrives.',
    symptoms: ['Severe pain', 'Swelling', 'Deformed limb', 'Cannot move affected area', 'Bruising'],
    causes: ['Falls', 'Accidents', 'Sports injuries', 'Direct blow'],
    treatments: [
      'Do not move the injured area',
      'Immobilize the limb',
      'Apply ice pack wrapped in cloth',
      'Treat for shock if needed',
      'Call emergency services',
      'Keep person calm and still'
    ],
    precautions: ['Use protective gear during sports', 'Fall-proof home', 'Safe driving', 'Build bone strength with calcium/vitamin D'],
    when_to_doctor: ['Any suspected fracture', 'Open fracture (bone through skin)', 'Spine or skull injury', 'Severe deformity'],
    severity: 'high',
  },
  {
    id: 'firstaid_005',
    category: 'first_aid',
    title: 'CPR (Cardiopulmonary Resuscitation)',
    description: 'Emergency procedure when someone\'s heart stops beating.',
    symptoms: ['Unconscious', 'Not breathing', 'No pulse', 'Blue lips/fingertips'],
    causes: ['Cardiac arrest', 'Drowning', 'Electric shock', 'Severe injury'],
    treatments: [
      'Call emergency (108 in India)',
      'Place person on flat surface',
      'Place heel of hand on center of chest',
      'Push hard and fast (100-120 compressions/min)',
      'Give 2 rescue breaths after every 30 compressions',
      'Continue until help arrives or person responds'
    ],
    precautions: ['Learn CPR certification', 'Check for dangers before approaching', 'Ensure scene is safe'],
    when_to_doctor: ['Always call emergency first', 'Continue CPR until professional help arrives'],
    severity: 'emergency',
  },
  
  // NUTRITION
  {
    id: 'nutrition_001',
    category: 'nutrition',
    title: 'Balanced Diet Guidelines',
    description: 'Essential components of a healthy, balanced diet.',
    symptoms: [],
    causes: [],
    treatments: [
      'Carbohydrates: 45-65% of daily calories (whole grains, fruits, vegetables)',
      'Proteins: 10-35% of daily calories (pulses, eggs, meat, dairy)',
      'Fats: 20-35% of daily calories (nuts, oils, fish)',
      'Vitamins: Fruits and vegetables (5 servings/day)',
      'Minerals: Dairy, leafy greens, nuts',
      'Water: 8-10 glasses daily',
      'Limit: Sugar, salt, processed foods, saturated fats'
    ],
    precautions: ['Avoid junk food', 'Limit oil and butter', 'Reduce salt intake', 'Avoid sugary drinks', 'Read food labels'],
    when_to_doctor: ['Unexplained weight loss', 'Nutrient deficiencies', 'Chronic fatigue'],
    severity: 'low',
  },
  {
    id: 'nutrition_002',
    category: 'nutrition',
    title: 'Iron-Rich Foods for Anemia',
    description: 'Foods and tips to prevent and treat iron deficiency anemia.',
    symptoms: ['Fatigue', 'Weakness', 'Pale skin', 'Shortness of breath', 'Dizziness', 'Cold hands/feet'],
    causes: ['Iron deficiency', 'Blood loss', 'Pregnancy', 'Poor diet', 'Inability to absorb iron'],
    treatments: [
      'Heme iron sources: Red meat, chicken, fish',
      'Non-heme iron: Lentils, beans, spinach, tofu',
      'Vitamin C helps iron absorption (citrus fruits, tomatoes)',
      'Avoid tea/coffee with meals (reduces absorption)',
      'Cook in iron utensils',
      'Iron supplements if prescribed'
    ],
    precautions: ['Do not take iron supplements without doctor advice', 'Get blood tests regularly if prone to anemia'],
    when_to_doctor: ['Symptoms of anemia', 'Heavy menstrual bleeding', 'Suspected blood loss'],
    severity: 'medium',
    medicine_names: ['Iron supplements (Ferrous sulfate)', 'Vitamin C supplements'],
  },
  
  // EMERGENCY
  {
    id: 'emergency_001',
    category: 'emergency',
    title: 'Heart Attack - Warning Signs',
    description: 'Know the signs and act fast. Every minute counts!',
    symptoms: ['Chest pain/pressure (lasting more than 2 minutes)', 'Pain in arm, jaw, neck, or back', 'Shortness of breath', 'Cold sweat', 'Nausea', 'Lightheadedness', 'Extreme fatigue'],
    causes: ['Blocked coronary arteries', 'Blood clot', 'Coronary artery disease'],
    treatments: [
      'Call emergency immediately (108 in India)',
      'Chew aspirin if not allergic',
      'Loosen tight clothing',
      'Make person comfortable (sitting or semi-reclining)',
      'Stay with them until help arrives',
      'If trained, give CPR if needed'
    ],
    precautions: ['Control blood pressure and cholesterol', 'Quit smoking', 'Exercise regularly', 'Maintain healthy weight', 'Manage stress'],
    when_to_doctor: ['IMMEDIATELY call emergency if heart attack suspected - every minute matters!'],
    severity: 'emergency',
  },
  {
    id: 'emergency_002',
    category: 'emergency',
    title: 'Stroke - F.A.S.T. Signs',
    description: 'Stroke is a medical emergency. Remember F.A.S.T.',
    symptoms: ['F - Face: Drooping on one side', 'A - Arms: Weakness/numbness in one arm', 'S - Speech: Slurred or strange speech', 'T - Time: Time to call emergency'],
    causes: ['Blocked artery (ischemic stroke)', 'Bleeding in brain (hemorrhagic stroke)', 'High blood pressure', 'Atrial fibrillation'],
    treatments: [
      'Call emergency immediately (108)',
      'Note time symptoms started',
      'Do not give food or water',
      'Make person comfortable',
      'Remove dentures if present',
      'Stay calm and reassuring'
    ],
    precautions: ['Control blood pressure', 'Manage diabetes', 'Treat atrial fibrillation', 'Stop smoking', 'Limit alcohol'],
    when_to_doctor: ['IMMEDIATELY call emergency - time is brain! Treatment must begin within 4.5 hours'],
    severity: 'emergency',
  },
  {
    id: 'emergency_003',
    category: 'emergency',
    title: 'Allergic Reaction / Anaphylaxis',
    description: 'Severe, life-threatening allergic reaction requiring immediate action.',
    symptoms: ['Hives', 'Swelling of face/throat', 'Difficulty breathing', 'Wheezing', 'Rapid pulse', 'Dizziness', 'Drop in blood pressure'],
    causes: ['Food (nuts, shellfish, eggs)', 'Insect stings', 'Medications', 'Latex', 'Unknown triggers'],
    treatments: [
      'Call emergency immediately (108)',
      'Use epinephrine auto-injector (EpiPen) if available',
      'Lie person flat with legs elevated',
      'If breathing stops, start CPR',
      'Antihistamines after initial treatment'
    ],
    precautions: ['Know your allergies', 'Carry EpiPen if prescribed', 'Wear medical alert bracelet', 'Read food labels carefully'],
    when_to_doctor: ['Any severe allergic reaction - this is an emergency!'],
    severity: 'emergency',
    medicine_names: ['Epinephrine (EpiPen)', 'Diphenhydramine (Benadryl)', 'Prednisone'],
  },
  
  // MENTAL HEALTH
  {
    id: 'mental_001',
    category: 'symptom',
    title: 'Anxiety & Stress',
    description: 'Feeling of worry, fear, or nervousness that interferes with daily life.',
    symptoms: ['Excessive worry', 'Restlessness', 'Rapid heartbeat', 'Sweating', 'Trouble sleeping', 'Difficulty concentrating', 'Muscle tension'],
    causes: ['Work stress', 'Financial problems', 'Health concerns', 'Relationship issues', 'Trauma', 'Genetics'],
    treatments: ['Deep breathing exercises', 'Regular exercise', 'Meditation and yoga', 'Adequate sleep', 'Talk to someone', 'Therapy (CBT)', 'Medications if severe'],
    precautions: ['Practice mindfulness', 'Set boundaries', 'Take breaks', 'Maintain social connections', 'Limit news consumption', 'Get adequate sleep'],
    when_to_doctor: ['Symptoms interfering with daily life', 'Panic attacks', 'Thoughts of self-harm', 'Using alcohol/drugs to cope'],
    severity: 'medium',
    medicine_names: ['Sertraline', 'Escitalopram', 'Alprazolam (short-term)', 'Buspirone'],
  },
  {
    id: 'mental_002',
    category: 'symptom',
    title: 'Depression',
    description: 'Persistent feeling of sadness and loss of interest affecting how you feel, think, and handle daily activities.',
    symptoms: ['Persistent sadness', 'Loss of interest in activities', 'Changes in appetite/weight', 'Sleep problems', 'Fatigue', 'Feelings of worthlessness', 'Difficulty concentrating', 'Thoughts of death/suicide'],
    causes: ['Genetics', 'Brain chemistry', 'Life events', 'Medical conditions', 'Substance abuse'],
    treatments: ['Talk therapy (CBT, psychotherapy)', 'Antidepressant medications', 'Exercise', 'Support groups', 'Self-care routines', 'Hospitalization if severe'],
    precautions: ['Stay connected with people', 'Regular exercise', 'Healthy sleep schedule', 'Avoid alcohol', 'Set small achievable goals', 'Seek help early'],
    when_to_doctor: ['Symptoms lasting more than 2 weeks', 'Thoughts of self-harm', 'Cannot perform daily activities', 'Drug/alcohol use'],
    severity: 'high',
    medicine_names: ['Fluoxetine', 'Sertraline', 'Escitalopram', 'Venlafaxine', 'Bupropion'],
  },
];

// Utility functions
export function searchBySymptom(symptom: string): HealthKnowledge[] {
  const lowerSymptom = symptom.toLowerCase();
  return healthcareKnowledge.filter(kb => 
    kb.symptoms?.some(s => s.toLowerCase().includes(lowerSymptom)) ||
    kb.title.toLowerCase().includes(lowerSymptom) ||
    kb.related_symptoms?.some(s => s.toLowerCase().includes(lowerSymptom))
  );
}

export function searchByDisease(disease: string): HealthKnowledge[] {
  const lowerDisease = disease.toLowerCase();
  return healthcareKnowledge.filter(kb => 
    kb.category === 'disease' && 
    (kb.title.toLowerCase().includes(lowerDisease) ||
    kb.description.toLowerCase().includes(lowerDisease))
  );
}

export function searchByMedicine(medicine: string): HealthKnowledge[] {
  const lowerMedicine = medicine.toLowerCase();
  return healthcareKnowledge.filter(kb => 
    kb.medicine_names?.some(m => m.toLowerCase().includes(lowerMedicine))
  );
}

export function getFirstAid(emergency: string): HealthKnowledge | undefined {
  const lowerEmergency = emergency.toLowerCase();
  return healthcareKnowledge.find(kb => 
    kb.category === 'first_aid' && 
    (kb.title.toLowerCase().includes(lowerEmergency) ||
    kb.symptoms?.some(s => s.toLowerCase().includes(lowerEmergency)))
  );
}

export function getEmergencyInfo(): HealthKnowledge[] {
  return healthcareKnowledge.filter(kb => 
    kb.category === 'emergency' || 
    kb.severity === 'emergency'
  );
}

export function getByCategory(category: HealthKnowledge['category']): HealthKnowledge[] {
  return healthcareKnowledge.filter(kb => kb.category === category);
}

export function similarityScore(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const textWords = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  for (const queryWord of queryWords) {
    for (const textWord of textWords) {
      if (queryWord === textWord) score += 1;
      else if (textWord.includes(queryWord) || queryWord.includes(textWord)) score += 0.5;
    }
  }
  
  return score / queryWords.length;
}

export function semanticSearch(query: string, limit: number = 5): HealthKnowledge[] {
  const scored = healthcareKnowledge.map(kb => ({
    kb,
    score: Math.max(
      similarityScore(query, kb.title),
      similarityScore(query, kb.description),
      similarityScore(query, kb.symptoms?.join(' ') || ''),
      similarityScore(query, kb.medicine_names?.join(' ') || '')
    )
  })).filter(s => s.score > 0);
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.kb);
}