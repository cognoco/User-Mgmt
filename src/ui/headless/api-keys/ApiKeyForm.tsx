import { FormEvent, useState } from 'react';
import { useApiKeys } from '@/hooks/api-keys/use-api-keys';
import type { ApiKey } from '@/core/api-keys/types';

export interface ApiKeyFormRenderProps {
  name: string;
  setName: (v: string) => void;
  permissions: string[];
  togglePermission: (p: string) => void;
  expiresInDays?: number;
  setExpiresInDays: (d?: number) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  createdKey?: ({ key: string } & ApiKey) | null;
}

export interface ApiKeyFormProps {
  defaultPermissions?: string[];
  children: (props: ApiKeyFormRenderProps) => React.ReactNode;
}

export function ApiKeyForm({ children, defaultPermissions = [] }: ApiKeyFormProps) {
  const { createApiKey } = useApiKeys();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>(defaultPermissions);
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<({ key: string } & ApiKey) | null>(null);

  const togglePermission = (p: string) => {
    setPermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const key = await createApiKey(name, permissions, expiresInDays);
      setCreatedKey(key);
      setName('');
      setPermissions(defaultPermissions);
      setExpiresInDays(undefined);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>{children({ name, setName, permissions, togglePermission, expiresInDays, setExpiresInDays, handleSubmit, isSubmitting, error, createdKey })}</>
  );
}
