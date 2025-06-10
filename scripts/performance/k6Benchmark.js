import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // normal usage
    { duration: '1m', target: 50 },  // peak load
    { duration: '3m', target: 20 },  // sustained high load
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
  },
};

const loginTrend = new Trend('auth_login');
const profileTrend = new Trend('profile_ops');
const teamTrend = new Trend('team_mgmt');
const companyTrend = new Trend('company_mgmt');

export default function () {
  group('Authentication', () => {
    const payload = JSON.stringify({ email: 'test@example.com', password: 'password' });
    const res = http.post(`${BASE_URL}/api/auth/login`, payload, { headers: { 'Content-Type': 'application/json' } });
    loginTrend.add(res.timings.duration);
    check(res, { 'login ok': (r) => r.status === 200 });
  });

  group('User Profile', () => {
    const res = http.get(`${BASE_URL}/api/profile`);
    profileTrend.add(res.timings.duration);
    check(res, { 'profile ok': (r) => r.status === 200 });
  });

  group('Team Management', () => {
    const res = http.get(`${BASE_URL}/api/team`);
    teamTrend.add(res.timings.duration);
    check(res, { 'team ok': (r) => r.status === 200 });
  });

  group('Company Management', () => {
    const res = http.get(`${BASE_URL}/api/company/profile`);
    companyTrend.add(res.timings.duration);
    check(res, { 'company ok': (r) => r.status === 200 });
  });

  sleep(1);
}
