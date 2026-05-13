import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';

export const options = {
  stages: [
    { duration: '2m', target: 10000 },  // Ramp up to 10k users
    { duration: '5m', target: 10000 },  // Stay at 10k
    { duration: '2m', target: 50000 }, // Ramp up to 50k
    { duration: '5m', target: 50000 }, // Stay at 50k
    { duration: '2m', target: 100000 }, // Ramp up to 100k
    { duration: '5m', target: 100000 }, // Stay at 100k
    { duration: '5m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% requests under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

const errorRate = new Rate('errors');
const authLatency = new Trend('auth_latency');
const apiLatency = new Trend('api_latency');

export default function () {
  const headers = { 'Content-Type': 'application/json' };

  // Test 1: Public health check
  const healthStart = Date.now();
  const healthRes = http.get(`${API_BASE}/health`);
  apiLatency.add(Date.now() - healthStart);
  check(healthRes, { 'health check status is 200': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(0.1);

  // Test 2: Public hospitals list
  const hospitalStart = Date.now();
  const hospitalsRes = http.get(`${API_BASE}/hospitals`);
  apiLatency.add(Date.now() - hospitalStart);
  check(hospitalsRes, { 'hospitals status is 200': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(0.1);

  // Test 3: Public emergency numbers
  const emergencyStart = Date.now();
  const emergencyRes = http.get(`${API_BASE}/emergency`);
  apiLatency.add(Date.now() - emergencyStart);
  check(emergencyRes, { 'emergency status is 200': (r) => r.status === 200 }) || errorRate.add(1);
  sleep(0.1);

  // Test 4: OTP sending (rate limited)
  const otpPayload = JSON.stringify({ phone: `9876543${Math.floor(Math.random() * 9000 + 1000)}`, action: 'send' });
  const otpStart = Date.now();
  const otpRes = http.post(`${API_BASE}/send-otp`, otpPayload, { headers });
  authLatency.add(Date.now() - otpStart);
  check(otpRes, { 'OTP rate limited or success': (r) => r.status === 200 || r.status === 429 }, { endpoint: 'otp' }) || errorRate.add(1);
  sleep(0.1);
}

function getRandomElement(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}