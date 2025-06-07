// __tests__/integration/social-sharing-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialSharingComponent } from '@/ui/styled/sharing/SocialSharingComponent'; 

// Import Vitest functions
import { vi, Mock } from 'vitest'; 

// --- Remove Supabase client mock --- 
// vi.mock('@/lib/database/supabase'); 
// import { supabase } from '@/lib/database/supabase';

import type { UserEvent } from '@testing-library/user-event'; 

// --- Mock Data Definitions --- 
const mockPostItem = {
  id: 'item-123',
  title: 'Shareable Content Title',
  description: 'Description of the content being shared',
  slug: 'shareable-content',
  content_type: 'post',
};

const mockImageItem = {
  id: 'image-123',
  title: 'Image Content',
  content_type: 'image',
  url: 'https://example.com/image.jpg',
  slug: 'image-content'
};

const mockDocItem = {
  id: 'doc-123',
  title: 'Document Content',
  content_type: 'document',
  slug: 'document-content'
};

describe('Social Sharing Flow', () => {
  let user: UserEvent;

  beforeEach(() => {
    vi.clearAllMocks(); 
    user = userEvent.setup();
    
    // Keep global mocks
    const mockClipboard = { writeText: vi.fn(() => Promise.resolve()), readText: vi.fn() };
    vi.stubGlobal('navigator', { ...window.navigator, clipboard: mockClipboard });
    vi.stubGlobal('open', vi.fn()); 
    vi.stubGlobal('trackEvent', vi.fn()); 
    
    // --- Remove Supabase mock setup --- 
    // const mockSingle = vi.fn();
    // const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    // const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    // const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    // if (typeof supabase.from === 'function') { (supabase.from as Mock) = mockFrom; }
    // if (supabase.auth && typeof supabase.auth.getUser === 'function') { /* auth mock */ }
    // mockSingle.mockResolvedValue({ data: mockPostItem, error: null }); // Use mockPostItem here
  });

  afterEach(() => {
    vi.unstubAllGlobals(); 
  });

  test('User can share content via social platforms', async () => {
    vi.stubGlobal('location', { ...window.location, origin: 'https://app.example.com' });
    // Render with itemData prop
    render(<SocialSharingComponent itemData={mockPostItem} />); 
    
    // Component renders synchronously, button should be enabled
    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeEnabled();

    // Open sharing menu (Click the PopoverTrigger)
    await user.click(shareButton);

    // Wait for the VISIBLE title inside the popover to appear
    await waitFor(() => {
        expect(screen.getByTestId('shared-item-title')).toHaveTextContent(mockPostItem.title);
        expect(screen.getByRole('button', { name: /twitter/i })).toBeInTheDocument(); // Check a button exists
    });
    
    const mockWindowOpen = window.open as Mock;
    const expectedShareUrl = `https://app.example.com/content/${mockPostItem.slug}`; // Use mock data for URL
    
    // Share on Twitter
    await user.click(screen.getByRole('button', { name: /twitter/i }));
    // ... twitter assertions using expectedShareUrl ...
    const twitterCall = mockWindowOpen.mock.calls.find(call => typeof call[0] === 'string' && call[0].includes('twitter.com'));
    expect(twitterCall).toBeDefined();
    if(twitterCall) expect(twitterCall[0]).toContain(encodeURIComponent(expectedShareUrl));
    
    // Share on LinkedIn
    await user.click(screen.getByRole('button', { name: /linkedin/i }));
    // ... linkedin assertions ...
    const linkedinCall = mockWindowOpen.mock.calls.find(call => typeof call[0] === 'string' && call[0].includes('linkedin.com'));
    expect(linkedinCall).toBeDefined();
    if(linkedinCall) expect(linkedinCall[0]).toContain(encodeURIComponent(expectedShareUrl));

    // Share on Facebook
    await user.click(screen.getByRole('button', { name: /facebook/i }));
    // ... facebook assertions ...
    const facebookCall = mockWindowOpen.mock.calls.find(call => typeof call[0] === 'string' && call[0].includes('facebook.com'));
    expect(facebookCall).toBeDefined();
    if(facebookCall) expect(facebookCall[0]).toContain(encodeURIComponent(expectedShareUrl));
  });

  test('User can copy sharing link to clipboard', async () => {
    vi.stubGlobal('location', { ...window.location, origin: 'https://app.example.com' });
    // Render with itemData prop
    render(<SocialSharingComponent itemData={mockPostItem} />); 
    
    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeEnabled();

    // Open sharing menu
    await user.click(shareButton);
    
    // Wait for popover content to be visible
    await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
    });

    const expectedShareUrl = `https://app.example.com/content/${mockPostItem.slug}`;
    await user.click(screen.getByRole('button', { name: /copy link/i }));
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedShareUrl);
    await waitFor(() => {
        expect(screen.getByText(/link copied/i)).toBeInTheDocument();
    });
  });

  test('User can email content link', async () => {
    vi.stubGlobal('location', { ...window.location, origin: 'https://app.example.com' });
    render(<SocialSharingComponent itemData={mockPostItem} />); 

    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeEnabled();
    
    await user.click(shareButton);

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /email/i })).toBeInTheDocument();
    });
    
    const mockWindowOpen = window.open as Mock; 
    const expectedShareUrl = `https://app.example.com/content/${mockPostItem.slug}`;
    const expectedSubject = `Check out: ${mockPostItem.title}`; 
    await user.click(screen.getByRole('button', { name: /email/i }));
    
    expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringMatching(/^mailto:/),
        '_blank',
        'noopener,noreferrer'
    );
    const mailtoCall = mockWindowOpen.mock.calls.find(call => typeof call[0] === 'string' && call[0].startsWith('mailto:'));
    expect(mailtoCall).toBeDefined();
    if(mailtoCall) {
        expect(mailtoCall[0]).toContain(`subject=${encodeURIComponent(expectedSubject)}`);
        expect(mailtoCall[0]).toContain(encodeURIComponent(expectedShareUrl)); 
    }
  });

  test('Records analytics when content is shared', async () => {
    vi.stubGlobal('location', { ...window.location, origin: 'https://app.example.com' });
    // Render with itemData prop
    render(<SocialSharingComponent itemData={mockPostItem} />); 
    
    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeEnabled();

    // Open sharing menu
    await user.click(shareButton);

    // Wait for popover content
    await waitFor(() => {
        expect(screen.getByRole('button', { name: /twitter/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /twitter/i }));
    
    // Use mock data for assertion
    expect(window.trackEvent).toHaveBeenCalledWith('share_content', {
      platform: 'twitter',
      content_id: mockPostItem.id,
      content_type: mockPostItem.content_type, 
      content_title: mockPostItem.title
    });
  });

  test('Shows appropriate sharing platforms based on content type', async () => {
    vi.stubGlobal('location', { ...window.location, origin: 'https://app.example.com' });

    // Render with image item data
    const { rerender } = render(<SocialSharingComponent itemData={mockImageItem} />); 
    
    const shareButton1 = screen.getByRole('button', { name: /share/i });
    expect(shareButton1).toBeEnabled();
    await user.click(shareButton1);

    await waitFor(() => {
        expect(screen.getByTestId('shared-item-title')).toHaveTextContent(mockImageItem.title);
        expect(screen.getByRole('button', { name: /pinterest/i })).toBeInTheDocument();
    });
    
    // Rerender with document item data
    rerender(<SocialSharingComponent itemData={mockDocItem} />); 
    
    await waitFor(() => {
        expect(screen.getByTestId('shared-item-title')).toHaveTextContent(mockDocItem.title);
        expect(screen.queryByRole('button', { name: /pinterest/i })).not.toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /pinterest/i })).not.toBeInTheDocument();
  });
});
