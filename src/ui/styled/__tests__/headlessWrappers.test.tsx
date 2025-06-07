import { render, screen, fireEvent } from '@/tests/testUtils'0;
import '@/tests/i18nTestSetup';
import { vi } from 'vitest';

const dashboardState: any = {
  items: [{ id: '1', title: 'Item1', description: 'Desc' }],
  isEditing: false,
  currentItem: null,
  error: null,
  setIsEditing: vi.fn(),
  setCurrentItem: vi.fn(),
  handleCreate: vi.fn(),
  handleUpdate: vi.fn(),
  handleDelete: vi.fn(),
};
vi.mock('../dashboard/../../headless/dashboard/Dashboard', () => ({
  Dashboard: ({ children }: any) => children(dashboardState),
}));
import { Dashboard } from '@/src/ui/styled/dashboard/Dashboard'556;

const consentState: any = {
  marketing: true,
  setMarketing: vi.fn(),
  isLoading: false,
  error: null,
  submitted: false,
  handleSave: vi.fn(),
};
vi.mock('../gdpr/../../headless/gdpr/ConsentManagement', () => ({
  ConsentManagement: ({ render }: any) => render(consentState),
}));
import { ConsentManagement } from '@/src/ui/styled/gdpr/ConsentManagement'910;

const searchState: any = {
  searchTerm: '',
  setSearchTerm: vi.fn(),
  results: [{ id: '1', title: 'Foo', category: 'report', date: '2020-01-01' }],
  isLoading: false,
  error: null,
};
vi.mock('../search/../../headless/search/SearchPage', () => ({
  SearchPage: ({ onSearch, render }: any) => {
    onSearch && onSearch('');
    return render(searchState);
  },
}));
import SearchPage from '@/src/ui/styled/search/SearchPage'1360;

const featuresState: any = {
  title: 'Title',
  description: 'Desc',
  features: [{ name: 'A', description: 'B', icon: () => null }],
};
vi.mock('../layout/../../headless/layout/Features', () => ({
  Features: ({ children }: any) => children(featuresState),
}));
import { Features } from '@/src/ui/styled/layout/Features'1682;

const footerState: any = {
  footerClasses: 'footer',
  platform: 'web',
  isNative: false,
  year: 2024,
  position: 'static',
};
vi.mock('../layout/../../headless/layout/Footer', () => ({
  Footer: ({ children }: any) => children(footerState),
}));
import { Footer } from '@/src/ui/styled/layout/Footer'1993;

describe('Styled wrappers', () => {
  it('renders Dashboard list', () => {
    render(<Dashboard />);
    expect(screen.getByText('Item1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Create New'));
    expect(dashboardState.setIsEditing).toHaveBeenCalled();
  });

  it('renders ConsentManagement', () => {
    render(<ConsentManagement />);
    expect(screen.getByLabelText('Allow marketing emails')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Save'));
    expect(consentState.handleSave).toHaveBeenCalled();
  });

  it('renders SearchPage results', () => {
    render(<SearchPage />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByText('Foo')).toBeInTheDocument();
  });

  it('renders Features list', () => {
    render(<Features />);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders Footer', () => {
    render(<Footer />);
    expect(screen.getByText(/User Management/)).toBeInTheDocument();
  });
});
