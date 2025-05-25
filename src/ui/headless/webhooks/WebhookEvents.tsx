import React from 'react';

export interface WebhookEventsProps {
  events: string[];
  available?: string[];
  onChange?: (events: string[]) => void;
  children?: (props: { selected: string[]; toggle: (e: string) => void }) => React.ReactNode;
}

export function WebhookEvents({
  events = [],
  available = [],
  onChange,
  children
}: WebhookEventsProps) {
  void available;
  const toggle = (e: string) => {
    if (!onChange) return;
    if (events.includes(e)) {
      onChange(events.filter(ev => ev !== e));
    } else {
      onChange([...events, e]);
    }
  };

  if (children) {
    return <>{children({ selected: events, toggle })}</>;
  }

  // Fallback to simple list if no children provided
  return (
    <ul className="list-disc pl-4 space-y-1">
      {events.map(e => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
}
