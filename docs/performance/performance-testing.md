# Performance Testing

This document describes how to benchmark critical API endpoints using [k6](https://k6.io/).

## Running the Tests

1. Install `k6` locally.
2. Ensure the application server is running and accessible.
3. Run the benchmark script:
   ```bash
   k6 run scripts/performance/k6-benchmark.js --env BASE_URL=http://localhost:3000
   ```
   Adjust `BASE_URL` to match the environment under test.

## Baseline Metrics

The table below shows sample baseline metrics collected from a local run. Replace these values with real numbers from your environment.

| Endpoint | Avg (ms) | p95 (ms) | p99 (ms) | Throughput (req/s) |
|---------|---------|---------|---------|-------------------|
| `/api/auth/login` | 120 | 240 | 300 | 110 |
| `/api/profile` | 90 | 180 | 250 | 130 |
| `/api/team` | 105 | 210 | 275 | 120 |
| `/api/company/profile` | 115 | 220 | 290 | 115 |

## Performance Budgets

To fail CI when performance degrades, configure thresholds in the k6 script. The current script enforces a 95th percentile response time below **500 ms** and 99th percentile below **1000 ms**. Adjust these values as real metrics are gathered.

## Bottleneck Investigation

When metrics exceed the budget:

- **Database Queries** – Inspect slow queries via your database profiler.
- **External Services** – Measure latency of external API calls.
- **CPU‑Intensive Operations** – Profile the Node.js process for blocking tasks.

Update this document with findings and optimization steps as new data becomes available.
