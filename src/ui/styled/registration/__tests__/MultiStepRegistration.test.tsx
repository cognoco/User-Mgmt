import { render, screen, fireEvent } from '@/tests/utils/test-utils';
import { MultiStepRegistration } from '../MultiStepRegistration';

describe('MultiStepRegistration', () => {
  it('moves focus to first input on step change', () => {
    render(<MultiStepRegistration />);
    const email = screen.getByLabelText(/email/i);
    expect(document.activeElement).toBe(email);
    fireEvent.change(email, { target: { value: 'a@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    const name = screen.getByLabelText(/full name/i);
    expect(document.activeElement).toBe(name);
  });
});
