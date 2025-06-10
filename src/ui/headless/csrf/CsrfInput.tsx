import React from 'react';
import { useCsrf } from '@/hooks/csrf/useCsrf';

export interface CsrfInputProps {
  fieldName?: string;
}

export function CsrfInput({ fieldName = 'csrfToken' }: CsrfInputProps) {
  const { token } = useCsrf();
  return <input type="hidden" name={fieldName} value={token ?? ''} />;
}

export default CsrfInput;
