# Error Review Process

This document outlines the regular process for analysing errors and planning improvements.

## Weekly Review Cycle

1. **Collect Metrics** – Use `ErrorDashboardData` and `ErrorMetrics` to gather counts, affected users and feedback for the last week.
2. **Score Impact** – Calculate an impact score for each error using `getImpactScore`. Higher scores indicate larger user impact.
3. **Prioritise Fixes** – Feed the scores into `ErrorPrioritizer` to produce a ranked list of issues.
4. **Review Meeting** – The team reviews the ranked list every week and decides which errors to address.
5. **Track Progress** – Create tasks for selected errors and monitor feedback to verify improvements.

Following this process ensures the error handling system continuously evolves based on real‑world data.
