# Attribute Based Access Control

This document describes the dynamic permission system built on top of the existing role based model. Rules can be defined using user, resource and environment attributes. Each rule targets a permission action and is evaluated dynamically at runtime.

## Rule Syntax

Rules consist of attribute conditions grouped by `user`, `resource` and `environment`.

```json
{
  "id": "rule-id",
  "action": "EDIT_PROJECT",
  "user": [{ "field": "department", "operator": "eq", "value": "engineering" }],
  "resource": [{ "field": "ownerId", "operator": "eq", "value": "{user.id}" }]
}
```

Supported operators are `eq`, `neq`, `in`, `gt` and `lt`.

## Evaluation Engine

`AccessEvaluator` compiles rules into efficient functions and caches them. On each permission check the evaluator runs the compiled rules and records an audit entry with the decision reason. The audit trail can be retrieved for debugging or compliance purposes.

## Developer Tools

Use the `AccessEvaluator` class from `src/core/access-control` for custom checks:

```ts
import { AccessEvaluator } from '@/core/access-control';

const evaluator = new AccessEvaluator(rules);
const allowed = evaluator.check('EDIT_PROJECT', { user, resource, environment });
```

To add new rule types extend `AttributeCondition` and update the evaluator accordingly.

Testing utilities live in `src/core/access-control/__tests__`.

## Common Policy Types

The access control system supports implementing several common policy strategies
by defining appropriate rules:

- **Separation of duties policies** – ensure users cannot be granted conflicting
  permissions by creating mutually exclusive rules. For example, deny
  `APPROVE_EXPENSES` if the user already has `SUBMIT_EXPENSES`.
- **Minimum/maximum permission policies** – verify users have required baseline
  permissions while restricting overly broad access. Rules can enforce that a
  user must possess `VIEW_REPORTS` and must not exceed a certain role level.
- **Resource-specific policies** – tie permissions to particular resources using
  the `resource` attributes in a rule. This allows scenarios like granting
  `EDIT_PROJECT` only when `resource.ownerId` matches the current user.
- **Time-based policies** – automatically expire permissions by including
  conditions on timestamps or dates in the rule evaluation. Example: allow
  access only while `user.permissionExpiresAt` is in the future.
