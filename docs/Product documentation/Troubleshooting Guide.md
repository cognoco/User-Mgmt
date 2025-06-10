# Troubleshooting Guide

This guide helps both users and developers diagnose common problems.

## Common User-Facing Errors

| Message | Explanation | Resolution |
|---------|-------------|-----------|
| **"Invalid credentials"** | The email or password was not accepted. | Verify the credentials, reset the password if necessary. |
| **"Email not verified"** | The account has not completed email verification. | Check the inbox or request a new verification link. |
| **"Access denied"** | The current user lacks permission to perform the action. | Contact an administrator to obtain the required role. |
| **"Network error"** | The browser could not reach the server. | Check the internet connection and retry. |

Screenshots of the most frequent issues can be found in the `/public` folder.

## Developer Troubleshooting

### Debugging

1. **Check Logs** – use `errorLogger` outputs in the server console or log file.
2. **Reproduce with Tests** – create a unit or integration test that triggers the failing condition.
3. **Check Error Codes** – search `Error Code Reference.md` for the code returned.
4. **Cross System Correlation** – include the `requestId` value in logs across services to correlate events.

### Monitoring Tips

- Set up the `ExternalTransport` in `ErrorLogger` to forward errors to your monitoring provider.
- Alert on `critical` log entries to catch infrastructure issues quickly.

### Example Scenario

When an API call returns `team/not_found` the client should show a friendly message while the server logs include the team id for investigation.

## Operations Guide

1. **Analyse Error Logs** – run `node scripts/filter-error-codes.js error.log` to get a summary of the most common issues.
2. **Alert Response** – follow on-call procedures when `critical` errors are logged.
3. **Incident Management** – record the `requestId` and timeline of events in the incident tracker.
4. **Performance Impact** – review error rates in monitoring dashboards to determine if failures correlate with performance regressions.

