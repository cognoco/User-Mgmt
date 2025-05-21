'use client';

import { useState } from 'react';

export interface RememberMeToggleProps {
  initialChecked?: boolean;
  render: (props: { checked: boolean; setChecked: (val: boolean) => void }) => React.ReactNode;
}

export function RememberMeToggle({ initialChecked = false, render }: RememberMeToggleProps) {
  const [checked, setChecked] = useState(initialChecked);
  return <>{render({ checked, setChecked })}</>;
}
