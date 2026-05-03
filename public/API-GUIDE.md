# ZyntraCare API Use Guide (API कैसे Use करें)

## 🎯 Quick Summary

| API | काम | कौन Use करे |
|-----|------|------------|
| `/api/ai` | General health questions | कोई भी |
| `/api/chat` | Quick chat bot | कोई भी |
| `/api/triage` | Check emergency level | कोई भी |
| `/api/vision` | Medical image analysis | Doctors/Hospitals |
| `/api/scribe` | Doctor's notes from conversation | Doctors |
| `/api/predict-flow` | Hospital patient prediction | Hospital Admin |

---

## 📱 Example Usage

### 1. AI Health Assistant (/api/ai)
सवाल: "What are diabetes symptoms?"

```javascript
// JavaScript
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What are diabetes symptoms?",
    language: 'en'
  })
});
const data = await response.json();
console.log(data.response);
```

**Result:**
```json
{
  "success": true,
  "response": "Diabetes symptoms include:\n• Increased thirst\n• Frequent urination\n• Fatigue\n• Blurred vision\n\nPlease consult a doctor for diagnosis.",
  "sources": [...],
  "suggestions": ["Consult a doctor", "Get blood test"],
  "isEmergency": false
}
```

---

### 2. Quick Chat (/api/chat)
सवाल: "Find nearby hospital"

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Find nearby hospital in Delhi",
    language: 'en'
  })
});
```

**Result:**
```json
{
  "reply": "🏥 Find hospitals on the Hospitals page. Click Map view and allow location.",
  "source": "mock"
}
```

---

### 3. Emergency Triage (/api/triage)
सवाल: "Is it serious?"

```javascript
const response = await fetch('/api/triage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symptoms: "chest pain and breathing difficulty"
  })
});
```

**Result:**
```json
{
  "priority": "high"
}
```

Priority levels:
- **high** = Emergency! Call 102/108 Immediately
- **medium** = Should see doctor soon
- **low** = Routine checkup ok

---

### 4. Medical Image Analysis (/api/vision)
X-Ray, MRI, CT Scan analysis

```javascript
const response = await fetch('/api/vision', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image: "data:image/jpeg;base64,YOUR_IMAGE_BASE64",
    scanType: "xray"  // or "mri", "ct", "report"
  })
});
```

**Result:**
```json
{
  "results": [
    {
      "condition": "Normal Chest X-Ray",
      "confidence": 95,
      "severity": "normal",
      "description": "No abnormalities detected in lungs or heart"
    }
  ]
}
```

---

### 5. Clinical Scribe (/api/scribe)
Doctor's conversation → Medical notes

```javascript
const response = await fetch('/api/scribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcript: "Patient says - I have headache for 3 days. No fever. Sometimes dizziness.",
    "speaker": "doctor"
  })
});
```

**Result:**
```json
{
  "chiefComplaint": "Headache for 3 days",
  "historyOfPresentIllness": "Patient complains of headache for 3 days. No fever. Sometimes dizziness.",
  "physicalExamination": "Not documented",
  "diagnosis": ["Tension Headache", "Rule outMigraine"],
  "prescriptions": [
    {"medicine": "Paracetamol", "dosage": "500mg", "frequency": "twice a day", "duration": "5 days"}
  ],
  "advice": ["Rest", "Avoid screen time", "Follow up if worse"],
  "followUp": "1 week",
  "detectedEntities": {
    "symptoms": ["headache", "dizziness", "no fever"],
    "medications": [],
    "vitals": []
  }
}
```

---

### 6. Hospital Patient Prediction (/api/predict-flow)
Predict today's patient flow

```javascript
const response = await fetch('/api/predict-flow');
const hourlyData = await response.json();

// hourlyData = [5,3,2,2,3,5,10,18,30,45,48,44,38,32,30,28,27,35,42,40,32,22,14,7]
// Index 0 = 12AM, Index 12 = 12PM, Index 23 = 11PM

// Find peak hours
const peakHour = hourlyData.indexOf(Math.max(...hourlyData));
console.log(`Peak time: ${peakHour}:00`);
```

**Result:** Array of 24 numbers (hourly patient count)

---

## 🖥️ curl Examples

### AI Chat
```bash
curl -X POST https://your-domain.com/api/ai \
  -H "Content-Type: application/json" \
  -d '{"query": "What is fever?", "language": "en"}'
```

### Quick Chat
```bash
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I need ambulance", "language": "en"}'
```

### Check Emergency Level
```bash
curl -X POST https://your-domain.com/api/triage \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "severe chest pain"}'
```

### Analyze Medical Report
```bash
curl -X POST https://your-domain.com/api/vision \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,...", "scanType": "blood_report"}'
```

### Generate Clinical Notes
```bash
curl -X POST https://your-domain.com/api/scribe \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Patient has cough and cold for 2 days"}'
```

### Get Patient Prediction
```bash
curl -X GET https://your-domain.com/api/predict-flow
```

---

## 📋 API Parameters Summary

### /api/ai
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Your question |
| language | string | No | 'en' or 'hi' |

### /api/chat
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | Your message |
| language | string | No | 'en' or 'hi' |

### /api/triage
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symptoms | string | Yes | Describe symptoms |

### /api/vision
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| image | string | Yes | Base64 encoded image |
| scanType | string | No | 'xray', 'mri', 'ct', 'report', 'blood' |

### /api/scribe
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| transcript | string | Yes | Doctor-patient conversation |
| speaker | string | No | 'doctor' or 'patient' |

### /api/predict-flow
No parameters required (GET request)

---

## 🔧 Setup for Production

### With Ollama (Free AI)
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull lightweight model
ollama pull llama3.2

# Run with Docker
docker-compose up
```

### Environment Variables
```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
```

---

## ❓ FAQ

**Q: Do I need API key?**
A: No! Use Ollama for free unlimited AI.

**Q: Is it free?**
A: Yes, Ollama runs locally - no charges.

**Q: Can I use in Hindi?**
A: Yes, pass language: 'hi' in request.

**Q: Is it accurate?**
A: For medical advice, always consult a doctor. AI is for guidance only.

**Q: Emergency?**
A: For real emergencies, call 102/108 immediately!

---

## 📞 Support

Email: support@zyntracare.com
Website: https://zyntracare.com