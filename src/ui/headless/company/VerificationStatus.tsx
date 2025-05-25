'use client';

import { useState } from 'react';

export type VerificationStepStatus = 'pending' | 'completed' | 'failed' | 'action_required';
export interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: VerificationStepStatus;
  details?: string;
}

export interface VerificationStatusProps {
  initialSteps: VerificationStep[];
  render: (props: { steps: VerificationStep[]; progress: number; overallStatus: string }) => React.ReactNode;
}

export function VerificationStatus({ initialSteps, render }: VerificationStatusProps) {
  const [steps, setSteps] = useState<VerificationStep[]>(initialSteps);
  void setSteps;
  const completed = steps.filter(s => s.status === 'completed').length;
  const progress = Math.round((completed / steps.length) * 100);
  const overallStatus = steps.every(s => s.status === 'completed') ? 'verified' : 'pending';
  return <>{render({ steps, progress, overallStatus })}</>;
}
