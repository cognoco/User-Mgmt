// __tests__/integration/feedback-submission-flow.test.js

vi.mock('@/lib/database/supabase', () => import('@/tests/mocks/supabase'));
import { supabase } from '@/lib/database/supabase';

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedbackForm from '@/components/common/FeedbackForm';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

describe('Feedback Submission Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication
    (supabase.auth.getUser as Mock).mockResolvedValueOnce({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // Mock navigator.userAgent and window properties safely for JSDOM
    Object.defineProperty(global.navigator, 'userAgent', { value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', configurable: true });
    global.window.innerWidth = 1024;
    global.window.innerHeight = 768;
  });

  test('User can submit feedback with category and description', async () => {
    // Render feedback form
    await act(async () => {
      render(<FeedbackForm />);
    });
    
    // Select feedback category
    await act(async () => {
      await user.click(screen.getByLabelText(/feedback type/i));
    });
    await act(async () => {
      await user.click(screen.getByText(/feature/i));
    });
    
    // Enter feedback description
    await act(async () => {
      await user.type(
        screen.getByLabelText(/message/i), 
        'I would like to see a dark mode option in the application.'
      );
    });
    
    // Mock successful submission
    const feedbackBuilder = supabase.from('feedback') as any;
    feedbackBuilder.insert.mockResolvedValueOnce({
      data: { id: 'feedback-123' },
      error: null
    });
    
    // Submit form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    });
    
    // Verify insert was called with correct data
    expect(feedbackBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-123',
      category: 'feature',
      description: 'I would like to see a dark mode option in the application.',
      environment_info: expect.objectContaining({
        user_agent: expect.any(String),
        screen_size: expect.any(String)
      })
    }));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });
  });
  
  test('User can attach screenshot to feedback', async () => {
    // Render feedback form
    await act(async () => {
      render(<FeedbackForm />);
    });
    
    // Select feedback category
    await act(async () => {
      await user.click(screen.getByLabelText(/feedback type/i));
    });
    await act(async () => {
      await user.click(screen.getByText(/bug/i));
    });
    
    // Enter feedback description
    await act(async () => {
      await user.type(
        screen.getByLabelText(/message/i), 
        'The save button is not working properly.'
      );
    });
    
    // Attach screenshot
    const file = new File(['screenshot data'], 'screenshot.png', { type: 'image/png' });
    await act(async () => {
      await user.upload(screen.getByLabelText(/attach screenshot/i), file);
    });
    
    // Mock successful file upload
    const storageBuilder = supabase.storage.from('screenshots') as any;
    storageBuilder.upload.mockResolvedValueOnce({
      data: { path: 'screenshots/feedback-123/screenshot.png' },
      error: null
    });
    // Mock public URL
    storageBuilder.getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.com/screenshots/feedback-123/screenshot.png' }
    });
    
    // Mock successful feedback submission
    const feedbackBuilder = supabase.from('feedback') as any;
    feedbackBuilder.insert.mockResolvedValueOnce({
      data: { id: 'feedback-123' },
      error: null
    });
    
    // Submit form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    });
    
    // Verify screenshot was uploaded and included in feedback
    expect(storageBuilder.upload).toHaveBeenCalled();
    expect(feedbackBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({
      category: 'bug',
      description: 'The save button is not working properly.',
      screenshot_url: 'https://example.com/screenshots/feedback-123/screenshot.png'
    }));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });
  });
  
  test('Form validation prevents empty submissions', async () => {
    // Render feedback form
    await act(async () => {
      render(<FeedbackForm />);
    });
    
    // Try to submit without filling required fields
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    });
    
    // Verify validation errors
    expect(screen.getByText(/please select a feedback type/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter your feedback/i)).toBeInTheDocument();
    
    // Verify no submission attempt was made
    const feedbackBuilder = supabase.from('feedback') as any;
    expect(feedbackBuilder.insert).not.toHaveBeenCalled();
  });
  
  test('User can include contact information for follow-up', async () => {
    // Render feedback form
    await act(async () => {
      render(<FeedbackForm />);
    });
    
    // Select feedback category
    await act(async () => {
      await user.click(screen.getByLabelText(/feedback type/i));
    });
    await act(async () => {
      await user.click(screen.getByText(/general/i));
    });
    
    // Enter feedback description
    await act(async () => {
      await user.type(
        screen.getByLabelText(/message/i), 
        'How do I export my data?'
      );
    });
    
    // Mock successful submission
    const feedbackBuilder = supabase.from('feedback') as any;
    feedbackBuilder.insert.mockResolvedValueOnce({
      data: { id: 'feedback-123' },
      error: null
    });
    
    // Submit form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    });
    
    // Verify insert was called with contact information
    expect(feedbackBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({
      category: 'general',
      description: 'How do I export my data?',
      allow_contact: true,
      contact_method: 'Email',
      contact_email: 'user@example.com'
    }));
  });
  
  test('Anonymous users can submit feedback', async () => {
    // Mock unauthenticated state
    (supabase.auth.getUser as Mock).mockResolvedValueOnce({
      data: { user: null },
      error: null
    });
    
    // Render feedback form
    await act(async () => {
      render(<FeedbackForm />);
    });
    
    // Select feedback category
    await act(async () => {
      await user.click(screen.getByLabelText(/feedback type/i));
    });
    await act(async () => {
      await user.click(screen.getByText(/general/i));
    });
    
    // Enter feedback description
    await act(async () => {
      await user.type(
        screen.getByLabelText(/message/i), 
        'The UI could be more intuitive.'
      );
    });
    
    // Mock successful submission
    const feedbackBuilder = supabase.from('feedback') as any;
    feedbackBuilder.insert.mockResolvedValueOnce({
      data: { id: 'feedback-123' },
      error: null
    });
    
    // Submit form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    });
    
    // Verify insert was called with appropriate data
    expect(feedbackBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({
      category: 'general',
      description: 'The UI could be more intuitive.',
      is_anonymous: true,
      contact_email: 'anonymous@example.com'
    }));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });
  });
  
  test('Handles submission errors gracefully', async () => {
    // Render feedback form
    await act(async () => {
      render(<FeedbackForm />);
    });
    
    // Fill out form
    await act(async () => {
      await user.click(screen.getByLabelText(/feedback type/i));
    });
    await act(async () => {
      await user.click(screen.getByText(/general/i));
    });
    await act(async () => {
      await user.type(
        screen.getByLabelText(/message/i), 
        'General comment about the application.'
      );
    });
    
    // Mock submission error
    const feedbackBuilder = supabase.from('feedback') as any;
    feedbackBuilder.insert.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error submitting feedback' }
    });
    
    // Submit form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    });
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/error submitting feedback/i)).toBeInTheDocument();
    });
    
    // Verify retry option is available
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    
    // Fix the error
    feedbackBuilder.insert.mockResolvedValueOnce({
      data: { id: 'feedback-123' },
      error: null
    });
    
    // Click retry
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /try again/i }));
    });
    
    // Verify success after retry
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });
  });
});
