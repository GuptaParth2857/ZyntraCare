// ZyntraCare Code Debug Assistant AI
// This AI automatically diagnoses and fixes code errors

import { 
  codeErrors, 
  CodeError, 
  searchByErrorCode, 
  searchByKeyword, 
  getRelatedErrors,
  getSimilarErrors
} from '@/data/codeErrors';

export interface DebugRequest {
  errorMessage: string;
  language?: 'javascript' | 'typescript' | 'react' | 'nextjs' | 'python' | 'node';
  context?: {
    fileName?: string;
    codeSnippet?: string;
    stackTrace?: string;
  };
}

export interface DebugResponse {
  success: boolean;
  diagnosis: string;
  error?: CodeError;
  causes: string[];
  solutions: string[];
  examples?: { before?: string; after?: string; explanation?: string }[];
  relatedErrors?: CodeError[];
  isCritical?: boolean;
  quickFix?: string;
}

interface ErrorPatterns {
  pattern: RegExp;
  errorId: string;
  extractContext?: (match: RegExpMatchArray) => string[];
}

const errorPatternMap: ErrorPatterns[] = [
  {
    pattern: /TypeError[:\s]+(.+)/i,
    errorId: 'react_001',
    extractContext: (m) => [m[1]]
  },
  {
    pattern: /Objects are not valid as a React child/i,
    errorId: 'react_002'
  },
  {
    pattern: /Cannot read (property '|_property) ['"]?(\w+)['"]? of (undefined|null)/i,
    errorId: 'react_003',
    extractContext: (m) => [m[2], m[3]]
  },
  {
    pattern: /Too many re-renders/i,
    errorId: 'react_004'
  },
  {
    pattern: /Hydration failed/i,
    errorId: 'next_001'
  },
  {
    pattern: /(window|document|navigator) is not defined/i,
    errorId: 'next_002'
  },
  {
    pattern: /ChunkLoadError/i,
    errorId: 'next_003'
  },
  {
    pattern: /Promise rejected with/i,
    errorId: 'js_002'
  },
  {
    pattern: /Maximum update depth exceeded/i,
    errorId: 'js_003'
  },
  {
    pattern: /TS(\d{4})[:\s]*(.+)/i,
    errorId: 'ts_001'
  },
  {
    pattern: /CORS[_\s]error/i,
    errorId: 'api_001'
  },
  {
    pattern: /(\d{3})\s+(Not Found|Unauthorized|Forbidden|Internal Server Error)/i,
    errorId: 'api_002'
  },
  {
    pattern: /PrismaClientNotInitialized|not initialized/i,
    errorId: 'db_001'
  },
  {
    pattern: /ECONNREFUSED|Connection refused/i,
    errorId: 'db_002'
  },
  {
    pattern: /Unexpected token/i,
    errorId: 'js_001'
  },
  {
    pattern: /undefined is not a function/i,
    errorId: 'react_001'
  },
  {
    pattern: /is not a valid JSON/i,
    errorId: 'api_003'
  },
  {
    pattern: /Map container is already initialized/i,
    errorId: 'leaflet_001'
  },
  {
    pattern: /useEffect missing dependency/i,
    errorId: 'react_005'
  }
];

// Detect error from message
function detectError(errorMessage: string): CodeError | undefined {
  const cleanedMessage = errorMessage.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  for (const { pattern, errorId } of errorPatternMap) {
    const match = cleanedMessage.match(pattern);
    if (match) {
      return codeErrors.find(e => e.id === errorId);
    }
  }
  
  const similarErrors = getSimilarErrors(cleanedMessage);
  return similarErrors[0];
}

// Extract file and line info from stack trace
function extractStackInfo(stackTrace: string): { file?: string; line?: number; function?: string } {
  const lines = stackTrace.split('\n');
  const info: { file?: string; line?: number; function?: string } = {};
  
  for (const line of lines) {
    const atMatch = line.match(/at\s+(.+?)\s+\((.+?):(\d+)/);
    if (atMatch) {
      info.function = atMatch[1];
      info.file = atMatch[2];
      info.line = parseInt(atMatch[3]);
      break;
    }
  }
  
  if (!info.file) {
    const simpleMatch = lines[1]?.match(/\((.+?):(\d+)/);
    if (simpleMatch) {
      info.file = simpleMatch[1];
      info.line = parseInt(simpleMatch[2]);
    }
  }
  
  return info;
}

// Analyze context and suggest fixes
function analyzeContext(context: DebugRequest['context'], error: CodeError): string {
  if (!context) return '';
  
  const { fileName, codeSnippet, stackTrace } = context;
  let analysis = '';
  
  if (fileName) {
    if (fileName.includes('page.tsx') || fileName.includes('page.js')) {
      analysis += `\n📁 **File:** Next.js Page Component (${fileName})\n`;
    } else if (fileName.includes('api/')) {
      analysis += `\n📁 **File:** API Route (${fileName})\n`;
    } else if (fileName.includes('component')) {
      analysis += `\n📁 **File:** React Component (${fileName})\n`;
    }
  }
  
  if (stackTrace) {
    const stackInfo = extractStackInfo(stackTrace);
    if (stackInfo.file) {
      analysis += `\n📍 **Location:** ${stackInfo.file}`;
      if (stackInfo.line) analysis += `:${stackInfo.line}`;
      if (stackInfo.function) analysis += ` (in ${stackInfo.function})`;
      analysis += '\n';
    }
  }
  
  if (codeSnippet) {
    analysis += `\n💻 **Code snippet:**\n\`\`\`\n${codeSnippet.slice(0, 200)}\n\`\`\`\n`;
  }
  
  return analysis;
}

// Generate quick fix code
function generateQuickFix(error: CodeError, context?: DebugRequest['context']): string {
  const fixes: Record<string, string> = {
    'react_001': `
// Fix: Add optional chaining
const result = object?.method?.();

// Or use nullish coalescing
const result = object?.method?.() ?? fallback;
`,
    'react_002': `
// Fix: Convert object to string or primitive
<Component data={data.name} />
// Instead of
<Component data={data} />
`,
    'react_003': `
// Fix: Use optional chaining for nested access
const name = user?.profile?.name ?? 'Guest';
// Or
const name = user && user.profile && user.profile.name;
`,
    'react_004': `
// Fix: Remove setState from useEffect that causes re-render
useEffect(() => {
  setCount(count => count + 1); // Use functional update
}, []); // Empty dependency array
`,
    'next_001': `
// Fix: Use dynamic import with ssr: false
import dynamic from 'next/dynamic';

const MyComponent = dynamic(() => import('./MyComponent'), {
  ssr: false,
});
`,
    'next_002': `
// Fix: Check typeof window before using
if (typeof window !== 'undefined') {
  // Your browser-only code here
  const map = L.map('container');
}
`,
    'js_002': `
// Fix: Always handle promise rejections
fetch(url)
  .then(res => res.json())
  .catch(err => {
    console.error('Fetch error:', err);
    // Handle error appropriately
  });
`,
    'api_001': `
// Fix: Add CORS middleware
import Cors from 'cors';

const cors = Cors({
  origin: process.env.NEXT_PUBLIC_APP_URL,
  credentials: true,
});

// Apply to API route
await cors(req, res);
`,
    'db_001': `
// Fix: Run prisma generate and check import
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Run in terminal:
// npx prisma generate
// npx prisma db push
`
  };

  const fix = fixes[error.id];
  if (!fix) {
    return `// Suggested fix for: ${error.title}\n// ${error.solutions[0]}`;
  }
  
  return fix;
}

// Main debug function
export function diagnoseError(request: DebugRequest): DebugResponse {
  const { errorMessage, language, context } = request;
  
  try {
    // Detect the error
    const error = detectError(errorMessage);
    
    if (!error) {
      return {
        success: false,
        diagnosis: "I couldn't identify this error. Please provide more details or search online for this specific error message.",
        causes: [],
        solutions: [
          'Check the error message carefully',
          'Search for the error online',
          'Check file and line number from stack trace',
          'Try to isolate the problematic code'
        ]
      };
    }
    
    // Generate diagnosis
    let diagnosis = `## 🔍 **Error Diagnosis**\n\n`;
    diagnosis += `**Error:** ${error.title}\n`;
    diagnosis += `**Type:** ${error.errorType.toUpperCase()}`;
    if (error.errorCode) diagnosis += ` (${error.errorCode})`;
    diagnosis += `\n**Severity:** ${getSeverityEmoji(error.severity)} ${error.severity.toUpperCase()}\n\n`;
    
    // Add context analysis
    diagnosis += analyzeContext(context, error);
    
    // Get related errors
    const relatedErrors = getRelatedErrors(error.id);
    
    return {
      success: true,
      diagnosis,
      error,
      causes: error.causes,
      solutions: error.solutions,
      examples: error.examples,
      relatedErrors,
      isCritical: error.severity === 'critical',
      quickFix: generateQuickFix(error, context)
    };
    
  } catch (err) {
    console.error('Debug Assistant Error:', err);
    return {
      success: false,
      diagnosis: "I'm having trouble analyzing this error. Please provide the complete error message and stack trace.",
      causes: ['Technical issue in diagnosis engine'],
      solutions: ['Provide more context', 'Share full error message']
    };
  }
}

function getSeverityEmoji(severity: CodeError['severity']): string {
  switch (severity) {
    case 'critical': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}

// Format response as readable text
export function formatDebugResponse(response: DebugResponse): string {
  if (!response.success) {
    return `❌ **Unable to Diagnose**\n\n${response.diagnosis}`;
  }
  
  let output = response.diagnosis;
  
  output += `\n\n## ⚠️ **Possible Causes:**\n`;
  response.causes.forEach((cause, i) => {
    output += `${i + 1}. ${cause}\n`;
  });
  
  output += `\n\n## ✅ **Solutions:**\n`;
  response.solutions.forEach((solution, i) => {
    output += `${i + 1}. ${solution}\n`;
  });
  
  if (response.examples && response.examples.length > 0) {
    output += `\n## 💻 **Code Examples:**\n`;
    response.examples?.forEach((ex: { before?: string; after?: string; explanation?: string }, i: number) => {
      output += `\n**Example ${i + 1}:**\n`;
      if (ex.before) output += `❌ Before:\n\`\`\`javascript\n${ex.before}\n\`\`\`\n`;
      if (ex.after) output += `✅ After:\n\`\`\`javascript\n${ex.after}\n\`\`\`\n`;
      if (ex.explanation) output += `📝 ${ex.explanation}\n`;
    });
  }
  
  if (response.quickFix) {
    output += `\n## ⚡ **Quick Fix:**\n`;
    output += `\`\`\`javascript\n${response.quickFix}\n\`\`\`\n`;
  }
  
  if (response.relatedErrors && response.relatedErrors.length > 0) {
    output += `\n## 🔗 **Related Errors:**\n`;
    response.relatedErrors.forEach(err => {
      output += `- ${err.title} (${err.severity})\n`;
    });
  }
  
  output += `\n---\n*Generated by ZyntraCare Debug Assistant*`;
  
  return output;
}

// Auto-debug from stack trace
export function autoDebugFromStack(stackTrace: string, fileName?: string): DebugResponse {
  const context = {
    fileName,
    stackTrace
  };
  
  return diagnoseError({ errorMessage: stackTrace, context });
}