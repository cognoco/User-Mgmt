import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/ui/primitives/textarea';

describe('Minimal React Hook Form + Textarea', () => {
  it('should update textarea value when form is reset', async () => {
    function TestForm() {
      const form = useForm({ defaultValues: { note: '' } });
      React.useEffect(() => {
        form.reset({ note: 'Hello world!' });
      }, [form]);
      return (
        <form>
          <Textarea {...form.register('note')} aria-label="note" />
        </form>
      );
    }
    render(<TestForm />);
    const textarea = await screen.findByLabelText('note');
    await waitFor(() => {
      expect((textarea as HTMLTextAreaElement).value).toBe('Hello world!');
    });
  });
}); 