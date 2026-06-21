// ZyntraCare Load Testing Configuration
// Run with: k6 run load-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up to 20 users
    { duration: '1m', target: 20 },     // Stay at 20 users for 1 minute
    { duration: '30s', target: 50 },    // Ramp up to 50 users
    { duration: '2m', target: 50 },     // Stay at 50 users for 2 minutes
    { duration: '30s', target: 100 },   // Ramp up to 100 users
    { duration: '1m', target: 100 },    // Stay at 100 users for 1 minute
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% of requests under 3s
    errors: ['rate<0.1'],               // Error rate under 10%
  },
};

function getRandomHospital() {
  const hospitals = [
    'Delhi Hospital', 'Mumbai Medical Center', 'Bangalore Health Care',
    'Chennai Hospital', 'Kolkata Medical', 'Hyderabad Health Center',
  ];
  return hospitals[Math.floor(Math.random() * hospitals.length)];
}

function getRandomDoctor() {
  const doctors = ['Dr. Priya Sharma', 'Dr. Rahul Verma', 'Dr. Anjali Mehta', 'Dr. Vikram Patel'];
  return doctors[Math.floor(Math.random() * doctors.length)];
}

export default function () {
  const responses = {};

  // Test 1: Homepage
  responses.homepage = http.get(`${BASE_URL}/`);
  check(responses.homepage, {
    'homepage status 200': (r) => r.status === 200,
    'homepage has content': (r) => r.body.length > 0,
  }) || errorRate.add(1);
  apiDuration.add(responses.homepage.timings.duration);
  sleep(1);

  // Test 2: Hospital listing API
  responses.hospitals = http.get(`${BASE_URL}/api/hospitals`);
  check(responses.hospitals, {
    'hospitals API status 200': (r) => r.status === 200,
    'hospitals API returns array': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
    },
  }) || errorRate.add(1);
  apiDuration.add(responses.hospitals.timings.duration);
  sleep(1);

  // Test 3: Doctor listing API
  responses.doctors = http.get(`${BASE_URL}/api/doctors`);
  check(responses.doctors, {
    'doctors API status 200': (r) => r.status === 200,
    'doctors API has data': (r) => r.body.length > 10,
  }) || errorRate.add(1);
  apiDuration.add(responses.doctors.timings.duration);
  sleep(1);

  // Test 4: Bed availability API
  responses.beds = http.get(`${BASE_URL}/api/beds`);
  check(responses.beds, {
    'beds API status 200': (r) => r.status === 200,
    'beds API returns data': (r) => r.status === 200,
  }) || errorRate.add(1);
  apiDuration.add(responses.beds.timings.duration);
  sleep(1);

  // Test 5: Bed realtime API
  responses.bedsRealtime = http.get(`${BASE_URL}/api/beds/realtime`);
  check(responses.bedsRealtime, {
    'beds realtime API status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  apiDuration.add(responses.bedsRealtime.timings.duration);
  sleep(1);

  // Test 6: Symptom check API
  const symptomPayload = JSON.stringify({
    symptoms: ['fever', 'headache'],
    patientAge: 30,
    patientGender: 'male',
  });
  responses.symptoms = http.post(`${BASE_URL}/api/symptoms`, symptomPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(responses.symptoms, {
    'symptom API status 200': (r) => r.status === 200,
    'symptom API returns analysis': (r) => {
      try { const data = JSON.parse(r.body); return data.analysis || data.ruleBasedAnalysis; } catch { return false; }
    },
  }) || errorRate.add(1);
  apiDuration.add(responses.symptoms.timings.duration);
  sleep(2);

  // Test 7: Chat API
  const chatPayload = JSON.stringify({
    message: 'What are symptoms of diabetes?',
    history: [],
  });
  responses.chat = http.post(`${BASE_URL}/api/chat`, chatPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(responses.chat, {
    'chat API status 200': (r) => r.status === 200,
    'chat API returns response': (r) => r.body.length > 10,
  }) || errorRate.add(1);
  apiDuration.add(responses.chat.timings.duration);
  sleep(2);

  // Test 8: Subscription page
  responses.subscription = http.get(`${BASE_URL}/subscription`);
  check(responses.subscription, {
    'subscription page status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  apiDuration.add(responses.subscription.timings.duration);
  sleep(1);

  // Test 9: Hospital search page
  responses.hospitalsPage = http.get(`${BASE_URL}/hospitals`);
  check(responses.hospitalsPage, {
    'hospitals page status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  apiDuration.add(responses.hospitalsPage.timings.duration);
  sleep(1);

  // Test 10: Doctor search page
  responses.doctorsPage = http.get(`${BASE_URL}/doctors`);
  check(responses.doctorsPage, {
    'doctors page status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  apiDuration.add(responses.doctorsPage.timings.duration);
  sleep(1);

  sleep(Math.random() * 3 + 1); // Random think time between 1-4 seconds
}

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    metrics: {
      http_req_duration: data.metrics.http_req_duration?.values,
      http_reqs: data.metrics.http_reqs?.values,
      errors: data.metrics.errors?.values,
      api_duration: data.metrics.api_duration?.values,
    },
    passed: data.metrics.errors?.values?.rate < 0.1,
  };

  console.log('\n=== ZyntraCare Load Test Summary ===');
  console.log(`Total Requests: ${data.metrics.http_reqs?.values?.count || 0}`);
  console.log(`Avg Response Time: ${data.metrics.http_req_duration?.values?.avg?.toFixed(2) || 0}ms`);
  console.log(`95th Percentile: ${data.metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 0}ms`);
  console.log(`Error Rate: ${((data.metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%`);
  console.log(`Test ${summary.passed ? 'PASSED' : 'FAILED'}`);

  return {
    'load-test-results.json': JSON.stringify(summary, null, 2),
    stdout: JSON.stringify(summary, null, 2),
  };
}
