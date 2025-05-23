interface WebhookEventsProps {
  events: string[];
}

export function WebhookEvents({ events }: WebhookEventsProps) {
  return (
    <ul className="list-disc pl-4 space-y-1">
      {events.map(e => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
}
