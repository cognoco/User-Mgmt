import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import { useUserManagement } from '@/lib/auth/UserManagementProvider';
import { getPlatformClasses } from '@/hooks/utils/usePlatformStyles';
import { useIsMobile } from '@/lib/utils/responsive';

export interface NavItem {
  to: string;
  label: string;
  icon?: React.ReactNode;
}

export interface HeaderProps {
  type?: 'fixed' | 'static' | 'sticky';
  navItems?: NavItem[];
  children: (props: {
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    handleLogout: () => Promise<void>;
    isLoading: boolean;
    user: any;
    isMobile: boolean;
    headerClasses: string;
    navItems: NavItem[];
    platform: string;
    isNative: boolean;
  }) => React.ReactNode;
}

export function Header({ type = 'fixed', navItems, children }: HeaderProps) {
  const { user, logout, loading: isLoading } = useAuth();
  const { isNative, platform } = useUserManagement();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      navigate('/auth/login');
    }
  };

  const headerClasses = getPlatformClasses(
    {
      base: `w-full z-40 ${
        type === 'fixed' ? 'fixed top-0' : type === 'sticky' ? 'sticky top-0' : ''
      } bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
        mobileMenuOpen ? 'shadow-md' : 'border-b'
      } transition-all duration-100`,
      mobile: 'py-2 px-3',
      web: 'py-3 px-4',
      ios: 'pt-safe',
    },
    { platform, isNative }
  );

  const items: NavItem[] =
    navItems ?? [
      { to: '/', label: 'Home' },
      { to: '/settings', label: 'Settings' },
      { to: '/account/profile', label: 'Profile' },
    ];

  return (
    <>
      {children({
        mobileMenuOpen,
        setMobileMenuOpen,
        handleLogout,
        isLoading,
        user,
        isMobile,
        headerClasses,
        navItems: items,
        platform,
        isNative,
      })}
    </>
  );
}
