# User Management Module Integration Guide

This guide shows how to integrate the User Management Module into a Next.js application. It follows the architecture guidelines by separating backend service code from frontend components. All examples are written in TypeScript.

## 1. Authentication Integration

### Login/Logout Flow

#### Backend: `/app/api/auth/login/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/services/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const authService = getAuthService();
  const result = await authService.login({ email, password });

  return NextResponse.json(result);
}
```

#### Frontend: `LoginForm.tsx`
```tsx
'use client';
import { useAuth } from '@/hooks/auth/useAuth';
import { LoginForm } from '@/ui/styled/auth/LoginForm';

export default function LoginPage() {
  const { login, error } = useAuth();

  return (
    <LoginForm
      onSubmit={async (data) => {
        await login(data.email, data.password);
      }}
      error={error}
    />
  );
}
```

### Session Management

#### Backend Helper
```typescript
// src/services/server.ts
import { cookies } from 'next/headers';
import { SupabaseAuthProvider } from '@/adapters/supabase/SupabaseAuthProvider';

export function getAuthService() {
  const cookieStore = cookies();
  return new SupabaseAuthProvider({ cookieStore });
}
```

#### Frontend Hook Usage
```tsx
import { useAuth } from '@/hooks/auth/useAuth';

export function SessionWatcher() {
  const { refreshToken, onSessionTimeout } = useAuth();

  useEffect(() => {
    const unsubscribe = onSessionTimeout(async () => {
      const refreshed = await refreshToken();
      if (!refreshed) {
        window.location.href = '/auth/login?reason=session_expired';
      }
    });
    return unsubscribe;
  }, [refreshToken, onSessionTimeout]);

  return null;
}
```

### MFA Integration

#### Backend Route
```typescript
// app/api/auth/mfa/setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from '@/services/server';

export async function POST(_: NextRequest) {
  const result = await getAuthService().setupMFA();
  return NextResponse.json(result);
}
```

#### Frontend Component
```tsx
'use client';
import { useAuth } from '@/hooks/auth/useAuth';
import { MFAVerificationForm } from '@/ui/styled/auth/MFAVerificationForm';

export function MFASetup() {
  const { setupMFA, verifyMFA, mfaQrCode, mfaSecret } = useAuth();

  const startSetup = async () => {
    await setupMFA();
  };

  return (
    <div>
      <button onClick={startSetup}>Enable MFA</button>
      {mfaQrCode && (
        <MFAVerificationForm
          qrCode={mfaQrCode}
          secret={mfaSecret}
          onVerify={verifyMFA}
        />
      )}
    </div>
  );
}
```

### OAuth Provider Configuration

#### Backend Configuration
```typescript
// src/adapters/supabase/SupabaseAuthProvider.ts
export class SupabaseAuthProvider implements AuthService {
  constructor(private options: { cookieStore: ReturnType<typeof cookies> }) {}
  // ...implementation
}
```

#### Frontend Usage
```tsx
import { SsoLogin } from '@/ui/styled/sso/SsoLogin';

export default function OAuthButtons() {
  return <SsoLogin />;
}
```

## 2. User Management

### Profile Management

#### Backend Route
```typescript
// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserService } from '@/services/server';

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const result = await getUserService().updateProfile(data);
  return NextResponse.json(result);
}
```

#### Frontend Component
```tsx
'use client';
import { useUserProfile } from '@/hooks/user/useUserProfile';
import { ProfileEditor } from '@/ui/styled/profile/ProfileEditor';

export default function ProfilePage() {
  const { profile, updateProfile } = useUserProfile();

  return (
    <ProfileEditor
      initialProfile={profile}
      onSubmit={updateProfile}
    />
  );
}
```

### Settings and Preferences

```tsx
'use client';
import { useUserSettings } from '@/hooks/user/useUserSettings';
import { SettingsForm } from '@/ui/styled/profile/SettingsForm';

export function SettingsPage() {
  const { settings, saveSettings } = useUserSettings();

  return <SettingsForm values={settings} onSubmit={saveSettings} />;
}
```

### Avatar Handling

```tsx
'use client';
import { AvatarUpload } from '@/ui/styled/profile/AvatarUpload';
import { useUserProfile } from '@/hooks/user/useUserProfile';

export function AvatarSection() {
  const { uploadAvatar } = useUserProfile();
  return <AvatarUpload onUpload={uploadAvatar} />;
}
```

### Address Management

```tsx
'use client';
import { AddressForm } from '@/ui/styled/profile/AddressForm';
import { useUserProfile } from '@/hooks/user/useUserProfile';

export function AddressSection() {
  const { profile, updateProfile } = useUserProfile();
  return (
    <AddressForm
      address={profile?.address}
      onSubmit={(addr) => updateProfile({ address: addr })}
    />
  );
}
```

## 3. Team Features

### Team Creation and Management

```typescript
// app/api/team/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTeamService } from '@/services/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const service = getTeamService();
  const result = await service.createTeam(data.ownerId, data);
  return NextResponse.json(result);
}
```

```tsx
'use client';
import { useTeams } from '@/hooks/team/useTeams';
import { TeamForm } from '@/ui/styled/team/TeamForm';

export function CreateTeam() {
  const { createTeam } = useTeams();
  return <TeamForm onSubmit={(data) => createTeam(data.ownerId, data)} />;
}
```

### Invitations and Member Management

```tsx
'use client';
import { useTeamMembers } from '@/hooks/team/useTeamMembers';
import { MemberList } from '@/ui/styled/team/MemberList';

export function TeamMembers({ teamId }: { teamId: string }) {
  const { members, inviteMember, removeMember } = useTeamMembers(teamId);

  return (
    <MemberList
      members={members}
      onInvite={inviteMember}
      onRemove={removeMember}
    />
  );
}
```

### Role and Permission Assignment

```tsx
'use client';
import { useTeamRoles } from '@/hooks/team/useTeamRoles';
import { RoleManager } from '@/ui/styled/team/RoleManager';

export function RolesSection({ teamId }: { teamId: string }) {
  const { roles, assignRole } = useTeamRoles(teamId);
  return <RoleManager roles={roles} onAssign={assignRole} />;
}
```

## 4. UI Customization

### Theming

```tsx
// app/providers/theme-provider.tsx
'use client';
import { ThemeProvider } from '@/ui/styled/theme/ThemeProvider';

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider defaultTheme="light">{children}</ThemeProvider>;
}
```

### Layout Customization

```tsx
// app/dashboard/layout.tsx
import { Sidebar } from '@/ui/styled/layout/Sidebar';
import { Header } from '@/ui/styled/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

### Custom Form Fields

```tsx
'use client';
import { TextField } from '@/ui/styled/common/TextField';
import { Controller, useForm } from 'react-hook-form';

export function CustomInputExample() {
  const { control, handleSubmit } = useForm<{ note: string }>();

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <Controller
        name="note"
        control={control}
        render={({ field }) => <TextField label="Note" {...field} />}
      />
      <button type="submit">Save</button>
    </form>
  );
}
```

### Localization

```tsx
// app/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { welcome: 'Welcome' } },
    de: { translation: { welcome: 'Willkommen' } },
  },
  lng: 'en',
  fallbackLng: 'en',
});

export default i18n;
```

```tsx
'use client';
import { useTranslation } from 'react-i18next';

export function WelcomeMessage() {
  const { t } = useTranslation();
  return <p>{t('welcome')}</p>;
}
```

---

These examples demonstrate how each feature of the User Management Module can be integrated while respecting the architecture guidelines. Backend API routes delegate work to services, and frontend components use hooks and headless components to keep logic and UI separate.
