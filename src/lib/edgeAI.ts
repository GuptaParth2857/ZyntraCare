import { pipeline, env } from '@xenova/transformers';

export type PipelineType = 'feature-extraction' | 'text-classification' | 'question-answering' | 'token-classification';

const PIPELINE_MODELS: Record<PipelineType, string> = {
  'feature-extraction': 'Xenova/all-MiniLM-L6-v2',
  'text-classification': 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
  'question-answering': 'Xenova/distilbert-base-uncased-distilled-squad',
  'token-classification': 'Xenova/bert-base-NER',
};

env.allowLocalModels = false;

class PipelineManager {
  private static instance: PipelineManager;
  private pipelines = new Map<PipelineType, any>();
  private loading = new Map<PipelineType, Promise<any>>();

  private constructor() {
    try {
      if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
        env.backends.onnx.wasm.numThreads = Math.min(navigator.hardwareConcurrency, 4);
      }
    } catch {
      // Browser environment check not available
    }
  }

  static getInstance(): PipelineManager {
    if (!PipelineManager.instance) {
      PipelineManager.instance = new PipelineManager();
    }
    return PipelineManager.instance;
  }

  async getPipeline(type: PipelineType, onProgress?: (progress: number) => void): Promise<any> {
    const cached = this.pipelines.get(type);
    if (cached) return cached;

    const inFlight = this.loading.get(type);
    if (inFlight) return inFlight;

    const model = PIPELINE_MODELS[type];
    const promise = pipeline(type, model, {
      progress_callback: (p: any) => {
        if (onProgress && p && typeof p.progress === 'number') {
          onProgress(Math.min(Math.round(p.progress * 100), 99));
        }
      },
    });

    this.loading.set(type, promise);

    try {
      const pipe = await promise;
      this.pipelines.set(type, pipe);
      this.loading.delete(type);
      if (onProgress) onProgress(100);
      return pipe;
    } catch (err) {
      this.loading.delete(type);
      throw err;
    }
  }

  getLoadedModels(): string[] {
    const models: string[] = [];
    for (const [type] of this.pipelines) {
      models.push(PIPELINE_MODELS[type]);
    }
    return models;
  }

  clearCache(): void {
    this.pipelines.clear();
    this.loading.clear();
  }
}

const manager = PipelineManager.getInstance();

const EMERGENCY_KEYWORDS = [
  'severe', 'critical', 'life-threatening', 'chest pain', 'difficulty breathing',
  'shortness of breath', 'unconscious', 'unresponsive', 'bleeding heavily',
  'stroke', 'heart attack', 'seizure', 'overdose', 'poisoning',
  'allergic reaction', 'anaphylaxis', 'suicide', 'major trauma',
  'head injury', 'spinal injury', 'heavy bleeding', 'choking',
  'not breathing', 'cardiac arrest', 'massive bleeding',
];

const URGENT_KEYWORDS = [
  'moderate pain', 'high fever', 'broken bone', 'fracture', 'burn',
  'infection', 'dehydration', 'vomiting', 'diarrhea', 'persistent cough',
  'rash', 'sprain', 'strain', 'laceration', 'wound', 'fever',
  'difficulty swallowing', 'swelling', 'numbness', 'weakness',
  'vision changes', 'confusion', 'dizziness',
];

function keywordClassify(text: string): { label: string; score: number } {
  const lower = text.toLowerCase();
  for (const keyword of EMERGENCY_KEYWORDS) {
    if (lower.includes(keyword)) return { label: 'emergency', score: 0.85 };
  }
  for (const keyword of URGENT_KEYWORDS) {
    if (lower.includes(keyword)) return { label: 'urgent', score: 0.7 };
  }
  return { label: 'routine', score: 0.6 };
}

function keywordExtractEntities(text: string): { entity: string; type: string }[] {
  const entities: { entity: string; type: string }[] = [];
  const seen = new Set<string>();

  const conditionRegex = /\b(?:cancer|diabetes|hypertension|asthma|arthritis|pneumonia|tuberculosis|hepatitis|hiv|aids|malaria|dengue|typhoid|infection|syndrome|disease|disorder|stroke|seizure|migraine|anxiety|depression|allergy|ulcer|fracture|burn|wound|fever|cough|cold|flu|chickenpox|measles|anemia|pneumonia|bronchitis|meningitis|anaphylaxis)\b/gi;
  const medicationRegex = /\b(?:aspirin|ibuprofen|paracetamol|acetaminophen|amoxicillin|metformin|insulin|atorvastatin|lisinopril|omeprazole|albuterol|prednisone|warfarin|clopidogrel|metoprolol|losartan|gabapentin|sertraline|fluoxetine|penicillin|morphine|codeine|omeprazole|rosuvastatin)\b/gi;
  const procedureRegex = /\b(?:surgery|biopsy|mri|ct|ct scan|x-ray|ultrasound|endoscopy|colonoscopy|dialysis|chemotherapy|radiation|transplant|vaccination|amputation|catheter|intubation|ventilator|angiogram|echocardiogram|stent)\b/gi;

  for (const { pattern, type } of [
    { pattern: conditionRegex, type: 'condition' },
    { pattern: medicationRegex, type: 'medication' },
    { pattern: procedureRegex, type: 'procedure' },
  ]) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text.toLowerCase())) !== null) {
      if (!seen.has(match[0])) {
        seen.add(match[0]);
        entities.push({ entity: match[0], type });
      }
    }
  }

  return entities;
}

function keywordAnswer(question: string, context: string): { answer: string; score: number } {
  const qWords = question.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const sentences = context.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);

  let bestSentence = sentences[0] || 'No relevant information found.';
  let bestScore = 0;

  for (const sentence of sentences) {
    const sLower = sentence.toLowerCase();
    let matches = 0;
    for (const word of qWords) {
      if (sLower.includes(word)) matches++;
    }
    const score = qWords.length > 0 ? matches / qWords.length : 0;
    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence;
    }
  }

  return { answer: bestSentence, score: bestScore };
}

function keywordEmbedding(text: string): number[] {
  const dim = 384;
  const embedding = new Array(dim).fill(0);
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);

  for (const word of words) {
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    embedding[idx] += 1.0;
  }

  const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0)) || 1;
  for (let i = 0; i < dim; i++) embedding[i] /= norm;

  return embedding;
}

export async function getPipeline(type: PipelineType, onProgress?: (progress: number) => void): Promise<any> {
  return manager.getPipeline(type, onProgress);
}

export async function classifySymptoms(text: string): Promise<{ label: string; score: number }> {
  try {
    const pipe = await manager.getPipeline('text-classification');
    const result = await pipe(text);
    return result[0];
  } catch {
    return keywordClassify(text);
  }
}

export async function extractMedicalEntities(text: string): Promise<{ entity: string; type: string }[]> {
  try {
    const pipe = await manager.getPipeline('token-classification');
    const result = await pipe(text, { aggregation_strategy: 'simple' });
    return result.map((r: any) => ({
      entity: r.word,
      type: r.entity_group,
    }));
  } catch {
    return keywordExtractEntities(text);
  }
}

export async function answerHealthQuery(question: string, context: string): Promise<{ answer: string; score: number }> {
  try {
    const pipe = await manager.getPipeline('question-answering');
    const result = await pipe(question, context);
    return { answer: result.answer, score: result.score };
  } catch {
    return keywordAnswer(question, context);
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const pipe = await manager.getPipeline('feature-extraction');
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch {
    return keywordEmbedding(text);
  }
}

export function computeSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

export function isAvailable(): boolean {
  return typeof WebAssembly !== 'undefined' && typeof WebAssembly.validate === 'function';
}

export function getLoadedModels(): string[] {
  return manager.getLoadedModels();
}

export function clearCache(): void {
  manager.clearCache();
}
