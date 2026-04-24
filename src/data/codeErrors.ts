// Comprehensive Code Error Database - All Types Covered
// This AI knows ALL types of errors and how to fix them

export interface CodeError {
  id: string;
  errorType: 'runtime' | 'compile' | 'syntax' | 'logic' | 'api' | 'database' | 'network' | 'security' | 'performance';
  errorCode?: string;
  title: string;
  causes: string[];
  solutions: string[];
  examples?: { before?: string; after?: string; explanation?: string; language?: string }[];
  quickFix?: string;
  relatedErrors?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const codeErrors: CodeError[] = [
  // REACT ERRORS
  {
    id: 'react_001', errorType: 'runtime', errorCode: 'undefined is not a function',
    title: 'TypeError: undefined is not a function',
    causes: ['Calling undefined function', 'Incorrect import', 'Async returning undefined', 'Component not exported'],
    solutions: ['Check imports', 'Add null checks', 'Use optional chaining (?.)', 'Verify exports'],
    quickFix: `// Use optional chaining
const result = object?.method?.();

// Or provide fallback
const result = object?.method?.() ?? defaultValue;`,
    relatedErrors: ['react_003', 'react_010'], severity: 'high'
  },
  {
    id: 'react_002', errorType: 'runtime', errorCode: 'Objects are not valid as a React child',
    title: 'Objects are not valid as a React child',
    causes: ['Rendering object instead of primitive', 'Array without key', 'Undefined passed to component'],
    solutions: ['Convert to string', 'Use .map() with keys', 'Provide default values'],
    quickFix: `// Instead of rendering object, extract property
<Component>{data.name}</Component>
// or
<Component>{JSON.stringify(data)}</Component>`,
    relatedErrors: ['react_001'], severity: 'high'
  },
  {
    id: 'react_003', errorType: 'runtime', errorCode: 'Cannot read property',
    title: 'Cannot read property of undefined',
    causes: ['Accessing nested property of undefined', 'Array index out of bounds', 'Object not initialized'],
    solutions: ['Use optional chaining', 'Add default values', 'Check existence before access'],
    quickFix: `// Safe nested access
const name = user?.profile?.name ?? 'Guest';
const items = data?.items ?? [];`,
    relatedErrors: ['react_001'], severity: 'medium'
  },
  {
    id: 'react_004', errorType: 'runtime', errorCode: 'Too many re-renders',
    title: 'Too many re-renders',
    causes: ['setState in render', 'useEffect dependency loop', 'Event causing re-render cycle'],
    solutions: ['Move setState outside render', 'Fix useEffect deps', 'Use functional updates'],
    quickFix: `// Use functional update and fix deps
useEffect(() => {
  setCount(prev => prev + 1);
}, []); // Empty deps if only runs once`,
    relatedErrors: ['react_005', 'js_003'], severity: 'critical'
  },
  {
    id: 'react_005', errorType: 'runtime', errorCode: 'missing dependency',
    title: 'React Hook missing dependency',
    causes: ['Variables in useEffect not in deps array', 'Stale closure', 'Missing useCallback'],
    solutions: ['Add all deps', 'Use useCallback', 'Use useMemo', 'Disable lint warning if intentional'],
    quickFix: `// Add all dependencies
useEffect(() => {
  fetchData(id, filter);
}, [id, filter]);

// Or use useCallback for functions
const fetchData = useCallback(async (id, filter) => {
  await api.get(id, filter);
}, []);`,
    relatedErrors: ['react_004'], severity: 'medium'
  },
  {
    id: 'react_006', errorType: 'runtime', errorCode: 'context is undefined',
    title: 'Context is undefined',
    causes: ['Using context outside provider', 'Import order issue', 'Context not created properly'],
    solutions: ['Wrap in provider', 'Check import path', 'Verify context creation'],
    quickFix: `// Wrap component in context provider
<ContextProvider>
  <YourComponent />
</ContextProvider>

// Or use optional context
const value = useContext(Context) ?? defaultValue;`,
    severity: 'high'
  },
  {
    id: 'react_007', errorType: 'runtime', errorCode: 'forwardRef',
    title: 'forwardRef type error',
    causes: ['Missing generic type', 'Incorrect ref forwarding', 'TypeScript type mismatch'],
    solutions: ['Add generic type', 'Define proper ref type', 'Use correct forwardRef syntax'],
    quickFix: `// Proper forwardRef with types
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <button ref={ref} {...props}>{children}</button>
  )
);`,
    severity: 'medium'
  },
  {
    id: 'react_008', errorType: 'runtime', errorCode: 'children is not defined',
    title: 'Children is not defined',
    causes: ['Not destructuring props', 'Using children incorrectly', 'Missing prop drilling'],
    solutions: ['Destructure { children }', 'Use props.children', 'Check component structure'],
    quickFix: `// Destructure children from props
function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}`,
    severity: 'low'
  },
  {
    id: 'react_009', errorType: 'runtime', errorCode: 'defaultProps',
    title: 'defaultProps is deprecated',
    causes: ['Using old defaultProps API', 'TypeScript migration needed'],
    solutions: ['Use default parameter values', 'Use optional chaining'],
    quickFix: `// Instead of defaultProps
function Button({ label = 'Click', onClick }) {
  return <button onClick={onClick}>{label}</button>;
}`,
    severity: 'low'
  },
  {
    id: 'react_010', errorType: 'runtime', errorCode: 'useState initial value',
    title: 'useState initial value issue',
    causes: ['Computed value as initial state', 'Function passed instead of value', 'Async initial value'],
    solutions: ['Use lazy initialization', 'Pass function to useState', 'Move computation to useEffect'],
    quickFix: `// Lazy initialization - pass function
const [data, setData] = useState(() => {
  return expensiveComputation();
});

// NOT: useState(someFunction()) - this runs every render
// YES: useState(someFunction) - this runs once`,
    severity: 'medium'
  },
  {
    id: 'react_011', errorType: 'runtime', errorCode: 'cannot update state on unmounted',
    title: 'Cannot update state on unmounted component',
    causes: ['Setting state after component unmounts', 'Memory leak from subscriptions', 'Abandoned async operations'],
    solutions: ['Use cleanup in useEffect', 'Track mounted state', 'Cancel subscriptions'],
    quickFix: `// Track mounted state
useEffect(() => {
  let isMounted = true;
  
  fetchData().then(data => {
    if (isMounted) setData(data);
  });
  
  return () => { isMounted = false; };
}, []);`,
    severity: 'high'
  },
  {
    id: 'react_012', errorType: 'runtime', errorCode: 'hooks can only be called',
    title: 'Hooks can only be called inside function components',
    causes: ['Hooks in regular function', 'Hooks after conditional', 'Wrong component type'],
    solutions: ['Move to function component', 'Unwrap conditional', 'Use custom hook wrapper'],
    quickFix: `// Make sure hooks are in function component
function MyComponent() {
  const [state, setState] = useState();
  // hooks here
}

// NOT in class methods or regular functions`,
    severity: 'critical'
  },

  // NEXT.JS ERRORS
  {
    id: 'next_001', errorType: 'runtime', errorCode: 'Hydration failed',
    title: 'Hydration failed - UI mismatch',
    causes: ['Server/client different content', 'Browser-only APIs in SSR', 'Date/time rendering differently', 'Conditional rendering based on window'],
    solutions: ['Use useEffect for browser-only content', 'Check typeof window', 'Use suppressHydrationWarning', 'Use dynamic import'],
    quickFix: `// Browser-only content
const [isClient, setIsClient] = useState(false);
useEffect(() => setIsClient(true), []);

return isClient ? <ClientOnlyContent /> : null;

// Or dynamic import
const Component = dynamic(() => import('./Component'), { ssr: false });`,
    relatedErrors: ['next_002', 'react_011'], severity: 'high'
  },
  {
    id: 'next_002', errorType: 'runtime', errorCode: 'window is not defined',
    title: 'window is not defined',
    causes: ['Using window in SSR', 'Accessing browser APIs during build', 'Leaflet/react-leaflet at build time'],
    solutions: ['Check typeof window', 'Use dynamic import ssr:false', 'Move to useEffect', 'Wrap in ClientOnly'],
    quickFix: `// Check before using
if (typeof window !== 'undefined') {
  // Browser-only code
  const map = L.map('container');
}

// Or use dynamic import
const MapComponent = dynamic(() => import('./Map'), { ssr: false });`,
    relatedErrors: ['next_001'], severity: 'high'
  },
  {
    id: 'next_003', errorType: 'runtime', errorCode: 'ChunkLoadError',
    title: 'ChunkLoadError - Loading chunk failed',
    causes: ['Browser cache cleared during deploy', 'Network issues', 'Invalid build files', 'Module not found'],
    solutions: ['Refresh page', 'Clear browser cache', 'Rebuild application', 'Check network'],
    quickFix: `// Add error boundary for graceful handling
<ErrorBoundary fallback={<ReloadButton />}>
  <YourComponent />
</ErrorBoundary>`,
    severity: 'medium'
  },
  {
    id: 'next_004', errorType: 'runtime', errorCode: 'getServerSideProps crashed',
    title: 'getServerSideProps crashed',
    causes: ['Unhandled exception in SSR', 'Database connection failed', 'External API timeout', 'Missing env variables'],
    solutions: ['Add try-catch', 'Check environment variables', 'Add error logging', 'Verify connections'],
    quickFix: `// Wrap getServerSideProps
export async function getServerSideProps() {
  try {
    const data = await fetchData();
    return { props: { data } };
  } catch (error) {
    console.error('SSR Error:', error);
    return { props: { data: null, error: true } };
  }
}`,
    severity: 'high'
  },
  {
    id: 'next_005', errorType: 'runtime', errorCode: 'Image failed to load',
    title: 'Next.js Image failed to load',
    causes: ['Invalid src', 'External URL not allowed', 'Image optimization failed', 'Path not found'],
    solutions: ['Add domain to next.config.js', 'Check src path', 'Use correct format', 'Add fallback'],
    quickFix: `// next.config.js
module.exports = {
  images: {
    domains: ['example.com', 'images.unsplash.com'],
  },
};

// Or use fallback
<Image src={src} fallback="/placeholder.png" />`,
    severity: 'low'
  },
  {
    id: 'next_006', errorType: 'runtime', errorCode: 'Dynamic require',
    title: 'Dynamic require of module failed',
    causes: ['Module not found', 'Wrong import path', 'Conditional import', 'Build configuration'],
    solutions: ['Check import path', 'Use dynamic import', 'Verify module exists', 'Check next.config'],
    quickFix: `// Use dynamic import
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
  ssr: false,
});`,
    severity: 'medium'
  },
  {
    id: 'next_007', errorType: 'runtime', errorCode: 'router.push called',
    title: 'router.push called without href',
    causes: ['Missing href parameter', 'Dynamic route not defined', 'Invalid pathname'],
    solutions: ['Provide valid href', 'Define dynamic route params', 'Use router.replace if needed'],
    quickFix: `// Proper navigation
router.push('/page');
router.push('/page/[id]', { id: 123 });
router.push({ pathname: '/page', query: { id: 123 } });`,
    severity: 'medium'
  },

  // JAVASCRIPT ERRORS
  {
    id: 'js_001', errorType: 'syntax', errorCode: 'Unexpected token',
    title: 'SyntaxError: Unexpected token',
    causes: ['Missing bracket/parenthesis', 'Typo in code', 'Import/export error', 'Template string not closed'],
    solutions: ['Check matching brackets', 'Verify import syntax', 'Look for typos', 'Close template strings'],
    quickFix: `// Check for matching pairs
const result = (a + b) * (c + d); // All brackets matched

// Template strings need backticks
const msg = \`Hello \${name}\`;`,
    severity: 'high'
  },
  {
    id: 'js_002', errorType: 'runtime', errorCode: 'Promise rejected',
    title: 'Unhandled Promise Rejection',
    causes: ['Promise rejected without catch', 'Async function throwing', 'Failed fetch'],
    solutions: ['Always add .catch()', 'Use try-catch in async', 'Add error boundary'],
    quickFix: `// Always handle promise rejections
fetch(url)
  .then(res => res.json())
  .catch(err => {
    console.error('Error:', err);
    setError(err.message);
  });

// Or try-catch
try {
  const data = await fetchData();
} catch (err) {
  console.error(err);
}`,
    relatedErrors: ['api_003'], severity: 'high'
  },
  {
    id: 'js_003', errorType: 'runtime', errorCode: 'Maximum update depth',
    title: 'Maximum update depth exceeded',
    causes: ['setState in render', 'useEffect without deps', 'Event causing loop'],
    solutions: ['Remove setState from render', 'Fix useEffect deps', 'Check event handlers'],
    quickFix: `// Prevent infinite loops
useEffect(() => {
  if (condition && !initialized) {
    setInitialized(true);
    doSomething();
  }
}, [condition]);

// Use functional updates
setCount(prev => prev + 1); // Not count + 1`,
    relatedErrors: ['react_004'], severity: 'critical'
  },
  {
    id: 'js_004', errorType: 'runtime', errorCode: 'is not a function',
    title: 'Something is not a function',
    causes: ['Calling non-function', 'Wrong object type', 'Variable reassignment', 'Import issue'],
    solutions: ['Verify type before calling', 'Check imports', 'Debug value type'],
    quickFix: `// Check type before call
if (typeof myFunction === 'function') {
  myFunction();
}

// Or use optional chaining
myFunction?.();`,
    severity: 'medium'
  },
  {
    id: 'js_005', errorType: 'runtime', errorCode: 'Cannot assign to read only',
    title: 'Cannot assign to read only property',
    causes: ['Trying to modify const variable', 'Frozen object', 'Imported module property'],
    solutions: ['Use let instead of const', 'Deep clone before modify', 'Create new object'],
    quickFix: `// Use let for mutable variables
let config = { theme: 'dark' };
config.theme = 'light'; // Now works

// Or create new object
const newConfig = { ...oldConfig, theme: 'light' };`,
    severity: 'medium'
  },
  {
    id: 'js_006', errorType: 'runtime', errorCode: 'Invalid date',
    title: 'Invalid Date',
    causes: ['Parsing invalid date string', 'Date object manipulation error', 'Timezone issue'],
    solutions: ['Validate date input', 'Use date-fns or moment', 'Check format'],
    quickFix: `// Validate and parse date
const date = new Date(input);
if (isNaN(date.getTime())) {
  console.error('Invalid date');
}

// Use proper date parsing
import { parseISO, parse } from 'date-fns';
const validDate = parseISO('2024-01-15');`,
    severity: 'low'
  },
  {
    id: 'js_007', errorType: 'runtime', errorCode: 'Circular reference',
    title: 'Circular reference in JSON',
    causes: ['Object referencing itself', 'Parent-child circular ref', 'JSON.stringify loop'],
    solutions: ['Use replacer function', 'Remove circular refs', 'Use Map for tracking'],
    quickFix: `// Handle circular references
const seen = new WeakSet();
const json = JSON.stringify(obj, (key, value) => {
  if (typeof value === 'object' && value !== null) {
    if (seen.has(value)) return undefined;
    seen.add(value);
  }
  return value;
});`,
    severity: 'medium'
  },

  // TYPESCRIPT ERRORS
  {
    id: 'ts_001', errorType: 'compile', errorCode: 'TS2322',
    title: 'Type "X" is not assignable to type "Y"',
    causes: ['Type mismatch', 'Undefined value', 'Wrong type annotation', 'Incompatible types'],
    solutions: ['Add type assertion', 'Use proper type', 'Add null check', 'Fix type annotation'],
    quickFix: `// Fix type mismatch
const name: string = user?.name ?? '';
const age: number = Number(input) || 0;

// Or use type assertion
const el = document.getElementById('id') as HTMLElement;`,
    severity: 'medium'
  },
  {
    id: 'ts_002', errorType: 'compile', errorCode: 'TS7006',
    title: 'Parameter implicitly has any type',
    causes: ['Missing type annotation', 'Inferred any type', 'Callback without types'],
    solutions: ['Add explicit types', 'Enable strict mode properly', 'Use interface for objects'],
    quickFix: `// Add proper types
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  console.log(event.target);
}

// Or with interface
interface User {
  name: string;
  age: number;
}`,
    severity: 'medium'
  },
  {
    id: 'ts_003', errorType: 'compile', errorCode: 'TS2532',
    title: 'Object is possibly undefined',
    causes: ['Optional property access', 'Array element might not exist', 'Null check missing'],
    solutions: ['Use optional chaining', 'Add default value', 'Add type guard', 'Use non-null assertion'],
    quickFix: `// Safe access
const name = user?.profile?.name ?? 'Anonymous';
const first = arr[0] ?? 'default';

// Or non-null assertion (use carefully)
const value = data!.property;`,
    severity: 'medium'
  },
  {
    id: 'ts_004', errorType: 'compile', errorCode: 'TS2345',
    title: 'Argument type not assignable',
    causes: ['Wrong argument type', 'Function expecting different type', 'Type widening'],
    solutions: ['Cast argument type', 'Use correct type', 'Adjust function signature'],
    quickFix: `// Cast argument
onClick(event as React.MouseEvent);

// Or adjust function signature
const handle = (e: MouseEvent | TouchEvent) => { };`,
    severity: 'medium'
  },
  {
    id: 'ts_005', errorType: 'compile', errorCode: 'TS2741',
    title: 'Property missing in type',
    causes: ['Object missing required property', 'Partial type used incorrectly', 'Incomplete object'],
    solutions: ['Add missing property', 'Use Partial<T> or Omit', 'Make property optional'],
    quickFix: `// Make property optional
interface User {
  name: string;
  age?: number; // Optional
}

// Or use Partial for updates
function updateUser(updates: Partial<User>) { }`,
    severity: 'medium'
  },

  // API ERRORS
  {
    id: 'api_001', errorType: 'api', errorCode: 'CORS',
    title: 'CORS Error - Access denied',
    causes: ['Cross-origin request blocked', 'Missing CORS headers', 'Wrong origin allowed', 'Credentials not allowed'],
    solutions: ['Add CORS headers', 'Configure allowed origins', 'Use credentials properly'],
    quickFix: `// Server-side CORS setup
import Cors from 'cors';

const cors = Cors({
  origin: process.env.NEXT_PUBLIC_APP_URL,
  credentials: true,
});

export default async function handler(req, res) {
  await cors(req, res);
  // Your code
}`,
    severity: 'high'
  },
  {
    id: 'api_002', errorType: 'api', errorCode: '404',
    title: 'API Route Not Found',
    causes: ['Wrong endpoint path', 'File naming issue', 'Missing export', 'Dynamic route not handled'],
    solutions: ['Check file location', 'Verify export', 'Match route naming', 'Handle all HTTP methods'],
    quickFix: `// Check route file structure
// app/api/users/route.ts
// GET /api/users

// app/api/users/[id]/route.ts  
// GET /api/users/123

export async function GET() { }`,
    severity: 'medium'
  },
  {
    id: 'api_003', errorType: 'api', errorCode: '500',
    title: 'Internal Server Error',
    causes: ['Unhandled exception', 'Database error', 'External API failed', 'Code crash'],
    solutions: ['Add try-catch', 'Check logs', 'Validate inputs', 'Handle all errors'],
    quickFix: `// Wrap API route
export async function GET() {
  try {
    const data = await fetchData();
    return Response.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}`,
    severity: 'high'
  },
  {
    id: 'api_004', errorType: 'api', errorCode: '401 or 403',
    title: 'Authentication/Authorization Error',
    causes: ['Missing token', 'Expired token', 'Wrong permissions', 'Token not sent'],
    solutions: ['Check token presence', 'Refresh token', 'Verify permissions', 'Add auth header'],
    quickFix: `// Check auth
export async function GET(req) {
  const token = req.headers.get('authorization');
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Verify and proceed
}`,
    severity: 'high'
  },
  {
    id: 'api_005', errorType: 'api', errorCode: '429',
    title: 'Too Many Requests',
    causes: ['Rate limiting triggered', 'Too many API calls', 'Server overload'],
    solutions: ['Add delay between requests', 'Implement caching', 'Use rate limiter', 'Batch requests'],
    quickFix: `// Client-side debounce
const debouncedSearch = useMemo(
  () => debounce(search, 500),
  []
);

// Server-side rate limit
const rateLimit = new Map();
if (rateLimit.get(ip) > 100) {
  return Response.json({ error: 'Rate limited' }, { status: 429 });
}`,
    severity: 'medium'
  },
  {
    id: 'api_006', errorType: 'api', errorCode: 'Network Error',
    title: 'Network request failed',
    causes: ['No internet connection', 'CORS blocking', 'Server down', 'Timeout'],
    solutions: ['Check network', 'Add timeout', 'Implement retry', 'Show offline message'],
    quickFix: `// Add timeout and retry
const fetchWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { 
        signal: AbortSignal.timeout(10000) 
      });
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
    }
  }
};`,
    severity: 'medium'
  },

  // DATABASE ERRORS
  {
    id: 'db_001', errorType: 'database', errorCode: 'Prisma not initialized',
    title: 'Prisma Client not initialized',
    causes: ['Not running prisma generate', 'Wrong import path', 'Schema not synced'],
    solutions: ['Run prisma generate', 'Run prisma db push', 'Check import path', 'Verify DATABASE_URL'],
    quickFix: `// Terminal commands
npx prisma generate
npx prisma db push

// Check import in your code
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();`,
    severity: 'high'
  },
  {
    id: 'db_002', errorType: 'database', errorCode: 'Connection refused',
    title: 'Database connection refused',
    causes: ['Database server not running', 'Wrong connection string', 'Firewall blocking', 'Wrong port'],
    solutions: ['Start database', 'Check DATABASE_URL', 'Verify port', 'Check firewall'],
    quickFix: `// Check DATABASE_URL format
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

// For local PostgreSQL
sudo service postgresql start

// Or use Docker
docker run -d -p 5432:5432 postgres`,
    severity: 'critical'
  },
  {
    id: 'db_003', errorType: 'database', errorCode: 'Unique constraint',
    title: 'Unique constraint violation',
    causes: ['Duplicate entry', 'Trying to insert existing key', 'Missing unique index'],
    solutions: ['Check before insert', 'Handle duplicate errors', 'Use upsert', 'Check existing data'],
    quickFix: `// Use upsert
await prisma.user.upsert({
  where: { email: 'test@example.com' },
  create: { email: 'test@example.com', name: 'Test' },
  update: { name: 'Test' },
});`,
    severity: 'medium'
  },
  {
    id: 'db_004', errorType: 'database', errorCode: 'Foreign key constraint',
    title: 'Foreign key constraint failed',
    causes: ['Referenced record not found', 'Cascade delete issue', 'Invalid relation'],
    solutions: ['Create parent record first', 'Check foreign key values', 'Fix cascade settings'],
    quickFix: `// Create parent record first
const user = await prisma.user.create({
  data: { email: 'test@example.com' }
});

const post = await prisma.post.create({
  data: { 
    title: 'Test',
    authorId: user.id // Use valid user ID
  }
});`,
    severity: 'medium'
  },

  // MAP/LEAFLET ERRORS
  {
    id: 'map_001', errorType: 'runtime', errorCode: 'Map container is already initialized',
    title: 'Map container is already initialized',
    causes: ['Map re-mounted without cleanup', 'Multiple MapContainers', 'Leaflet instance not removed', 'React StrictMode double render'],
    solutions: ['Remove map before re-init', 'Use unique key for MapContainer', 'Clean up on unmount', 'Check for existing instance'],
    quickFix: `// Always cleanup before creating
useEffect(() => {
  if (map) {
    map.remove(); // Clean up existing
    setMap(undefined);
  }
  
  if (container && !map) {
    const newMap = L.map(container).setView([lat, lng], 13);
    setMap(newMap);
  }
  
  return () => map?.remove();
}, []);

// Or use unique key
<MapContainer key={uniqueKey} ... />`,
    relatedErrors: ['map_002'], severity: 'high'
  },
  {
    id: 'map_002', errorType: 'runtime', errorCode: 'Map container is null',
    title: 'Map container is null',
    causes: ['Container element not found', 'Container not rendered yet', 'Element removed from DOM'],
    solutions: ['Use useEffect with dependency', 'Add ref check', 'Ensure container exists', 'Use dynamic import'],
    quickFix: `// Wait for container to be ready
const containerRef = useRef(null);

useEffect(() => {
  if (containerRef.current && !map) {
    const map = L.map(containerRef.current).setView([lat, lng], 13);
    setMap(map);
  }
}, [lat, lng]);

return <div ref={containerRef} />;`,
    severity: 'medium'
  },
  {
    id: 'map_003', errorType: 'runtime', errorCode: 'Tile layer not defined',
    title: 'Tile layer not loading',
    causes: ['Invalid tile URL', 'Network error', 'Attribution missing', 'Layer not added'],
    solutions: ['Check tile URL', 'Add proper attribution', 'Add layer explicitly', 'Check CORS'],
    quickFix: `// Proper tile layer setup
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);`,
    severity: 'low'
  },

  // PERFORMANCE ERRORS
  {
    id: 'perf_001', errorType: 'performance', errorCode: 'Memory leak',
    title: 'Memory leak detected',
    causes: ['Event listeners not removed', 'Timers not cleared', 'Subscriptions not unsubscribed', 'Closures keeping references'],
    solutions: ['Cleanup in useEffect return', 'Clear intervals', 'Unsubscribe from events', 'Remove listeners'],
    quickFix: `// Always cleanup
useEffect(() => {
  const handleScroll = () => {};
  window.addEventListener('scroll', handleScroll);
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);

// Clear timers
useEffect(() => {
  const timer = setInterval(action, 1000);
  return () => clearInterval(timer);
}, []);`,
    severity: 'high'
  },
  {
    id: 'perf_002', errorType: 'performance', errorCode: 'Slow render',
    title: 'Component renders too slowly',
    causes: ['Large data sets', 'Unnecessary re-renders', 'Heavy computations', 'Large component trees'],
    solutions: ['Use React.memo', 'Implement virtualization', 'Use useMemo/useCallback', 'Code splitting'],
    quickFix: `// Memoize expensive components
const ExpensiveList = React.memo(({ items }) => (
  items.map(item => <Item key={item.id} {...item} />)
));

// Memoize computations
const sorted = useMemo(() => 
  items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);`,
    severity: 'medium'
  },
  {
    id: 'perf_003', errorType: 'performance', errorCode: 'Bundle size',
    title: 'Bundle size too large',
    causes: ['Large dependencies', 'No code splitting', 'Unused imports', 'No tree shaking'],
    solutions: ['Dynamic imports', 'Remove unused code', 'Use lighter alternatives', 'Enable tree shaking'],
    quickFix: `// Dynamic imports
const Chart = dynamic(() => import('./Chart'), {
  loading: () => <LoadingSkeleton />
});

// Or for libraries
import('lodash').then(_ => {
  // Use lodash here
});`,
    severity: 'medium'
  },

  // SECURITY ERRORS
  {
    id: 'sec_001', errorType: 'security', errorCode: 'XSS',
    title: 'Cross-Site Scripting (XSS) vulnerability',
    causes: ['Unsanitized user input', 'innerHTML usage', 'DangerouslySetInnerHTML'],
    solutions: ['Sanitize input', 'Use textContent', 'Escape output', 'Use CSP'],
    quickFix: `// Safe text rendering
<div>{userInput}</div>

// NOT: <div dangerouslySetInnerHTML={{ __html: userInput }} />

// If you must use innerHTML, sanitize first
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty);`,
    severity: 'critical'
  },
  {
    id: 'sec_002', errorType: 'security', errorCode: 'API key exposed',
    title: 'API key exposed in frontend',
    causes: ['Keys in source code', 'Keys in git', 'Client-side secrets'],
    solutions: ['Use environment variables', 'Move to server-side', 'Use secrets manager', 'Never commit keys'],
    quickFix: `// .env (add to .gitignore)
NEXT_PUBLIC_API_KEY=xxx
// Use only for client-safe keys

// For sensitive keys - server-side only
// In API route
const apiKey = process.env.SECRET_API_KEY;`,
    severity: 'critical'
  },

  // COMMON NETWORK ERRORS
  {
    id: 'net_001', errorType: 'network', errorCode: 'Failed to fetch',
    title: 'Failed to fetch',
    causes: ['Network disconnected', 'CORS blocked', 'Wrong URL', 'Server unreachable'],
    solutions: ['Check network', 'Verify CORS', 'Check URL', 'Add retry logic'],
    quickFix: `// Retry logic
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP error');
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}`,
    severity: 'medium'
  },
  {
    id: 'net_002', errorType: 'network', errorCode: 'Timeout',
    title: 'Request timeout',
    causes: ['Server slow to respond', 'Large payload', 'Network latency', 'Server overloaded'],
    solutions: ['Increase timeout', 'Reduce payload', 'Implement pagination', 'Add loading state'],
    quickFix: `// Add timeout to fetch
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000);

const res = await fetch(url, { signal: controller.signal });
clearTimeout(timeout);

// Or with AbortSignal.timeout (modern browsers)
const res = await fetch(url, {
  signal: AbortSignal.timeout(30000)
});`,
    severity: 'low'
  },

  // AUTH ERRORS
  {
    id: 'auth_001', errorType: 'api', errorCode: 'Token expired',
    title: 'JWT/Token expired',
    causes: ['Token TTL too short', 'Not refreshing token', 'Server time mismatch'],
    solutions: ['Implement refresh token', 'Increase TTL', 'Sync server time', 'Handle 401 gracefully'],
    quickFix: `// Token refresh flow
const refreshToken = async () => {
  const refresh = getRefreshToken();
  const res = await fetch('/api/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh })
  });
  const { accessToken } = await res.json();
  setAccessToken(accessToken);
  return accessToken;
};

// Use interceptor
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      await refreshToken();
      return api(err.config);
    }
  }
);`,
    severity: 'high'
  },
  {
    id: 'auth_002', errorType: 'api', errorCode: 'Invalid token',
    title: 'Invalid or malformed token',
    causes: ['Malformed JWT', 'Signature mismatch', 'Token tampered', 'Wrong secret'],
    solutions: ['Regenerate token', 'Check signing secret', 'Verify token format', 'Check expiration'],
    quickFix: `// Verify JWT
import jwt from 'jsonwebtoken';

function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error('Invalid token:', err.message);
    return null;
  }
}`,
    severity: 'high'
  },
];

// Search functions
export function searchByErrorCode(code: string): CodeError | undefined {
  return codeErrors.find(e => e.errorCode?.toLowerCase().includes(code.toLowerCase()) || 
    e.title.toLowerCase().includes(code.toLowerCase()));
}

export function searchByType(type: CodeError['errorType']): CodeError[] {
  return codeErrors.filter(e => e.errorType === type);
}

export function searchByKeyword(keyword: string): CodeError[] {
  const lower = keyword.toLowerCase();
  return codeErrors.filter(e => 
    e.title.toLowerCase().includes(lower) ||
    e.errorCode?.toLowerCase().includes(lower) ||
    e.causes.some(c => c.toLowerCase().includes(lower)) ||
    e.solutions.some(s => s.toLowerCase().includes(lower))
  );
}

export function getSimilarErrors(errorMessage: string): CodeError[] {
  const words = errorMessage.toLowerCase().split(/[\s\-_.,:;()\[\]{}]+/).filter(w => w.length > 3);
  return codeErrors.map(e => {
    let score = 0;
    const searchable = `${e.title} ${e.errorCode || ''} ${e.causes.join(' ')}`.toLowerCase();
    for (const word of words) {
      if (searchable.includes(word)) score += word.length;
    }
    return { error: e, score };
  }).filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 5).map(s => s.error);
}

export function getRelatedErrors(errorId: string): CodeError[] {
  const error = codeErrors.find(e => e.id === errorId);
  if (!error || !error.relatedErrors) return [];
  return codeErrors.filter(e => error.relatedErrors?.includes(e.id));
}

export function getQuickFix(errorId: string): string | undefined {
  const error = codeErrors.find(e => e.id === errorId);
  return error?.quickFix || error?.solutions[0];
}

export const totalErrors = codeErrors.length;
export const errorTypes = [...new Set(codeErrors.map(e => e.errorType))];
export const criticalErrors = codeErrors.filter(e => e.severity === 'critical').length;