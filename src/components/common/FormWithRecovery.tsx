import React, { useState } from 'react';

/**
 * FormWithRecovery Component
 * Placeholder for a form that handles potential submission errors and recovery.
 */
export const FormWithRecovery: React.FC<{ onSubmit: (data: any) => Promise<void> }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Handle success (e.g., clear form, show message)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Form With Error Recovery</h2>
      {error && <div style={{ color: 'red' }}>Error: {error} <button type="submit">Retry</button></div>}
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default FormWithRecovery; 