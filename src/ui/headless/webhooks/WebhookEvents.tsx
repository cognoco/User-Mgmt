import React from 'react';

export interface WebhookEventsProps {
  events: string[];
  available: string[];
  onChange: (events: string[]) => void;
  children: (props: { selected: string[]; toggle: (e: string) => void }) => React.ReactNode;
}

export function WebhookEvents({ events, available, onChange, children }: WebhookEventsProps) {
  const toggle = (e: string) => {
    if (events.includes(e)) onChange(events.filter(ev => ev !== e));
    else onChange([...events, e]);
  };
  return <>{children({ selected: events, toggle })}</>;
}
