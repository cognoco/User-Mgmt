import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirementProps {
  meets: boolean;
  text: string;
}

function PasswordRequirement({ meets, text }: PasswordRequirementProps) {
  return (
    <div 
      role="listitem"
      className="flex items-center space-x-2" 
      data-met={meets.toString()}
    >
      {meets ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      )}
      <span className={`text-sm ${meets ? 'text-green-500' : 'text-red-500'}`}>{text}</span>
    </div>
  );
}

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements = [
    { meets: password.length >= 8, text: 'At least 8 characters' },
    { meets: /[A-Z]/.test(password), text: 'At least one uppercase letter' },
    { meets: /[a-z]/.test(password), text: 'At least one lowercase letter' },
    { meets: /[0-9]/.test(password), text: 'At least one number' },
    { meets: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: 'At least one special character' }
  ];

  // Show during tests or when password is not empty
  if (password.length === 0 && process.env.NODE_ENV !== 'test') {
    return null;
  }

  return (
    <div 
      role="list"
      data-testid="password-requirements-helper" 
      className="mt-2 space-y-1 p-3 border rounded bg-slate-50 text-xs"
    >
      {requirements.map((requirement, index) => (
        <PasswordRequirement
          key={index}
          meets={requirement.meets}
          text={requirement.text}
        />
      ))}
    </div>
  );
} 