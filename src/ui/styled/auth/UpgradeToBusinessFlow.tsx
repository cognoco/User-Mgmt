import React from 'react';

interface UpgradeToBusinessFlowProps {
  onCompleted: () => void;
}

export function UpgradeToBusinessFlow({ onCompleted }: UpgradeToBusinessFlowProps) {
  return (
    <div>
      <h2>Upgrade to Business Flow</h2>
      <button onClick={onCompleted}>Complete Upgrade</button>
    </div>
  );
}