import { useState, FormEvent } from 'react';
import type { WebhookCreatePayload } from '@/core/webhooks/models';

export interface WebhookFormRenderProps {
  name: string;
  setName: (v: string) => void;
  url: string;
  setUrl: (v: string) => void;
  events: string[];
  toggleEvent: (e: string) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export interface WebhookFormProps {
  onSubmit: (payload: WebhookCreatePayload) => Promise<void>;
  availableEvents: string[];
  loading?: boolean;
  error?: string | null;
  children: (props: WebhookFormRenderProps) => React.ReactNode;
}

export function WebhookForm({ onSubmit, availableEvents, children, loading = false, error = null }: WebhookFormProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const toggleEvent = (e: string) => {
    setEvents(prev => (prev.includes(e) ? prev.filter(ev => ev !== e) : [...prev, e]));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      await onSubmit({ name, url, events });
      setName('');
      setUrl('');
      setEvents([]);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return <>{children({ name, setName, url, setUrl, events, toggleEvent, handleSubmit, isSubmitting: loading || isSubmitting, error: formError || error || null })}</>;
}
