import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/ui/styled/gdpr/DataExportRequest', () => ({ DataExportRequest: () => <div>ExportComponent</div> }));
vi.mock('@/ui/styled/gdpr/DataDeletionRequest', () => ({ DataDeletionRequest: () => <div>DeleteComponent</div> }));
vi.mock('@/ui/styled/gdpr/ConsentManagement', () => ({ ConsentManagement: () => <div>ConsentComponent</div> }));

import GdprSettingsPage from '@/app/settings/gdpr/page'458;

describe('GdprSettingsPage', () => {
  it('renders gdpr controls', () => {
    render(<GdprSettingsPage />);
    expect(screen.getByText('Privacy & Data Controls')).toBeInTheDocument();
    expect(screen.getByText('ExportComponent')).toBeInTheDocument();
    expect(screen.getByText('DeleteComponent')).toBeInTheDocument();
    expect(screen.getByText('ConsentComponent')).toBeInTheDocument();
  });
});
