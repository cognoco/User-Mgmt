# Simple Pluggable Structure

This structure provides a straightforward, easy-to-understand organization that still allows the User Management Module to be pluggable and reusable.

## Core Principles

1. **Simplicity First**: Easy to understand and navigate
2. **Clear Exports**: Well-defined public API
3. **Minimal Nesting**: Avoid excessive directory depth
4. **Separation of Concerns**: UI separate from business logic
5. **Pluggability**: Easy to integrate into host applications

## Proposed Structure

```
/
├── src/                      # Source code
│   ├── components/           # UI components
│   │   ├── auth/             # Auth components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegistrationForm.tsx
│   │   │   ├── PasswordResetForm.tsx
│   │   │   └── ...
│   │   │
│   │   ├── user/             # User components
│   │   │   ├── ProfileForm.tsx
│   │   │   └── ...
│   │   │
│   │   └── common/           # Shared components
│   │       ├── Button.tsx
│   │       └── ...
│   │
│   ├── hooks/                # React hooks
│   │   ├── auth/             # Auth hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useLogin.ts
│   │   │   └── ...
│   │   │
│   │   ├── user/             # User hooks
│   │   │   ├── useProfile.ts
│   │   │   └── ...
│   │   │
│   │   └── common/           # Shared hooks
│   │       ├── useForm.ts
│   │       └── ...
│   │
│   ├── services/             # Business logic
│   │   ├── auth/             # Auth services
│   │   │   ├── authService.ts
│   │   │   └── ...
│   │   │
│   │   ├── user/             # User services
│   │   │   ├── userService.ts
│   │   │   └── ...
│   │   │
│   │   └── common/           # Shared services
│   │       ├── apiService.ts
│   │       └── ...
│   │
│   ├── adapters/             # Database adapters
│   │   ├── supabase/         # Supabase adapter
│   │   │   ├── authAdapter.ts
│   │   │   └── ...
│   │   │
│   │   └── interfaces/       # Adapter interfaces
│   │       ├── authProvider.ts
│   │       └── ...
│   │
│   ├── config/               # Configuration
│   │   ├── features.ts       # Feature flags
│   │   └── options.ts        # Configuration options
│   │
│   ├── types/                # TypeScript types
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   └── ...
│   │
│   ├── utils/                # Utilities
│   │   ├── validation.ts
│   │   └── ...
│   │
│   ├── context/              # React context
│   │   ├── AuthContext.tsx   # Auth context provider
│   │   └── ...
│   │
│   └── index.ts              # Public exports
│
├── app/                      # Next.js app (demo/reference implementation)
│   ├── api/                  # API routes
│   │   ├── auth/
│   │   └── ...
│   │
│   ├── auth/                 # Auth pages
│   │   ├── login/
│   │   ├── register/
│   │   └── ...
│   │
│   └── ...
│
├── tests/                    # Tests
│   ├── e2e/
│   ├── unit/
│   └── ...
│
└── examples/                 # Integration examples
    ├── nextjs-integration/
    └── react-integration/
```

## Public API (index.ts)

The key to pluggability is a well-defined public API. Here's what the main export file would look like:

```typescript
// src/index.ts

// Export components
export { LoginForm, RegistrationForm, PasswordResetForm } from './components/auth';
export { ProfileForm } from './components/user';

// Export hooks
export { useAuth, useLogin, useRegistration } from './hooks/auth';
export { useProfile } from './hooks/user';

// Export context providers
export { AuthProvider, UserProvider } from './context';

// Export configuration
export { configureUserManagement } from './config/options';

// Export types
export type { User, AuthOptions, LoginCredentials } from './types/auth';
```

## Integration Example

Here's how a host application would use the module:

```tsx
// In your Next.js or React app

// 1. Import what you need
import { 
  AuthProvider, 
  LoginForm, 
  RegistrationForm,
  configureUserManagement 
} from 'user-management-module';

// 2. Configure the module (optional)
configureUserManagement({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  features: {
    sso: true,
    businessAccounts: true
  }
});

// 3. Wrap your app with the provider
function App() {
  return (
    <AuthProvider>
      {/* Your app content */}
    </AuthProvider>
  );
}

// 4. Use the components in your pages
function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <LoginForm 
        onSuccess={(user) => {
          // Custom redirect or logic
        }}
        // Optional customization
        className="my-custom-form"
      />
    </div>
  );
}
```

## Customization Options

The module provides several ways to customize:

### 1. Props-based customization

```tsx
<LoginForm
  className="my-custom-form"
  buttonText="Sign In"
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

### 2. Theme customization

```tsx
<AuthProvider theme={myCustomTheme}>
  {children}
</AuthProvider>
```

### 3. Feature configuration

```tsx
configureUserManagement({
  features: {
    sso: true,
    businessAccounts: false,
    mfa: true
  }
});
```

### 4. Custom adapter

```tsx
configureUserManagement({
  adapter: myCustomAdapter
});
```

## Benefits of This Structure

1. **Simplicity**: Easy to understand and navigate
2. **Pluggability**: Clear public API makes integration easy
3. **Customization**: Multiple ways to customize behavior and appearance
4. **Maintainability**: Logical organization with minimal nesting
5. **Separation of Concerns**: UI separate from business logic
6. **Database Agnostic**: Adapters allow switching between different data providers

This structure provides a good balance between simplicity and pluggability, making it easy to understand while still being flexible enough to use in different applications.
