# Architecture Rules References

This document provides the recommended updates for the `.windsurfrules` and `.cursorrules` files to include references to the Architecture Guidelines and Rules documents.

## Updates for .windsurfrules

Add the following section near the top of the file, right after the "General Principles" heading:

```markdown
## CRITICAL: Architecture Guidelines and Rules

> **❗ MUST READ DOCUMENTATION ❗**  
> All development MUST strictly adhere to the Architecture Guidelines and Rules:
>
> - [Architecture Guidelines](./docs/Product%20documentation/Architecture%20Guidelines.md) - Comprehensive architecture principles
> - [Architecture Rules](./docs/Product%20documentation/Architecture%20Rules.md) - Core architecture requirements
>
> These documents define the modular, pluggable nature of the User Management Module and are NON-NEGOTIABLE for all development work.

- **Architecture First Development:**
  - Before writing any code, review the Architecture Guidelines and Rules
  - All components MUST follow the separation between UI and business logic
  - All UI components MUST use the headless pattern with render props
  - All business logic MUST be interface-based and replaceable
  - All database code MUST be isolated in adapter interfaces
  - All features MUST be toggleable through configuration

- **Architecture Compliance Checks:**
  - Before submitting code for review, verify it meets ALL architecture requirements
  - UI components must not contain business logic
  - Business logic must not render UI elements
  - Services must be interface-based and replaceable
  - Database code must be isolated in adapter implementations
  - Host applications must be able to replace ANY part of the implementation
```

## Updates for .cursorrules

Add the following section near the top of the file, right after the "General Principles" heading:

```markdown
- **CRITICAL - Architecture Guidelines & Rules:**  
  - **❗ MUST READ:** [Architecture Guidelines](./docs/Product%20documentation/Architecture%20Guidelines.md) and [Architecture Rules](./docs/Product%20documentation/Architecture%20Rules.md)
  - These documents define the modular, pluggable architecture of the User Management Module
  - All development MUST strictly adhere to these guidelines without exception
  - The module MUST allow host applications to replace ANY part of the implementation
  - UI components MUST be separated from business logic
  - Business logic MUST be interface-based and replaceable
  - Database code MUST be isolated in adapter interfaces
  - Features MUST be toggleable through configuration
```

## Implementation Instructions

Since `.windsurfrules` and `.cursorrules` are special files that cannot be directly edited with standard tools, the updates should be manually applied by adding the above sections to the respective files.

These updates will ensure that all developers working on the project are aware of the critical importance of following the architecture guidelines and rules to maintain the modular, pluggable nature of the User Management Module.
