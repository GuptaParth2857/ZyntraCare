/**
 * ZyntraCare Load Test Script
 * Tests if the app can handle high traffic
 * 
 * Run: node LOAD_TEST.js
 */

const http = require('http');

const CONFIG = {
  host: 'localhost',
  port: 3000,
  concurrentUsers: 100,
  requestsPerUser: 10,
  delay: 100,
};

const pages = [
  '/',
  '/hospitals',
  '/doctors',
  '/pharmacies',
  '/emergency',
  '/dashboard',
  '/health-tracker',
];

const results = {
  total: 0,
  success: 0,
  failed: 0,
  errors: [],
  responseTimes: [],
};

function makeRequest(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.request(
      { hostname: CONFIG.host, port: CONFIG.port, path, method: 'GET' },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const duration = Date.now() - start;
          results.total++;
          if (res.statusCode >= 200 && res.statusCode < 400) {
            results.success++;
          } else {
            results.failed++;
            results.errors.push(`${path}: ${res.statusCode}`);
          }
          results.responseTimes.push(duration);
          resolve();
        });
      }
    );
    req.on('error', (e) => {
      results.total++;
      results.failed++;
      results.errors.push(`${path}: ${e.message}`);
      resolve();
    });
    req.setTimeout(5000, () => {
      req.destroy();
      results.total++;
      results.failed++;
      results.errors.push(`${path}: TIMEOUT`);
      resolve();
    });
    req.end();
  });
}

async function runLoadTest() {
  console.log('🚀 Starting ZyntraCare Load Test...\n');
  console.log(`Config: ${CONFIG.concurrentUsers} concurrent users, ${CONFIG.requestsPerUser} requests each\n`);

  const promises = [];
  for (let i = 0; i < CONFIG.concurrentUsers; i++) {
    for (let j = 0; j < CONFIG.requestsPerUser; j++) {
      const path = pages[Math.floor(Math.random() * pages.length)];
      promises.push(makeRequest(path));
      if (CONFIG.delay > 0) {
        await new Promise((r) => setTimeout(r, CONFIG.delay));
      }
    }
  }

  console.log('📊 Running load test...\n');
  const startTime = Date.now();
  
  await Promise.all(promises);
  
  const totalTime = Date.now() - startTime;

  console.log('='.repeat(50));
  console.log('📈 LOAD TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`Total Requests: ${results.total}`);
  console.log(`Successful: ${results.success}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.success / results.total) * 100).toFixed(2)}%`);
  console.log(`Total Time: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`Requests/sec: ${(results.total / (totalTime / 1000)).toFixed(2)}`);

  if (results.responseTimes.length > 0) {
    const avg = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
    const min = Math.min(...results.responseTimes);
    const max = Math.max(...results.responseTimes);
    console.log(`\nResponse Times:`);
    console.log(`  Average: ${avg.toFixed(2)}ms`);
    console.log(`  Min: ${min}ms`);
    console.log(`  Max: ${max}ms`);
  }

  if (results.errors.length > 0) {
    console.log('\n⚠️ Errors:');
    results.errors.slice(0, 5).forEach((e) => console.log(`  - ${e}`));
  }

  console.log('\n' + '='.repeat(50));

  // Analysis
  const successRate = (results.success / results.total) * 100;
  if (successRate >= 95) {
    console.log('✅ EXCELLENT: Can handle high traffic!');
  } else if (successRate >= 80) {
    console.log('⚠️ GOOD: Some issues, needs optimization');
  } else {
    console.log('❌ NEEDS WORK: Significant issues to fix');
  }
  console.log('='.repeat(50));
}

// Run test
runLoadTest().catch(console.error);