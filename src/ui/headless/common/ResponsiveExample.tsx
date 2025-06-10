import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const mockUsers: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'Editor', status: 'Inactive' },
  { id: 4, name: 'Dave Brown', email: 'dave@example.com', role: 'User', status: 'Active' },
];

/**
 * Headless Responsive Example
 */
export default function ResponsiveExample({
  render
}: {
  render: (props: { formData: any; setFormData: (v: any) => void; users: User[]; handleSubmit: (e: React.FormEvent) => void }) => React.ReactNode;
}) {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', role: '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Form submitted: ' + JSON.stringify(formData));
  };
  return <>{render({ formData, setFormData, users: mockUsers, handleSubmit })}</>;
}
