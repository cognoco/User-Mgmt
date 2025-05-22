import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/ui/primitives/button";
import { useAuth } from '@/hooks/auth/useAuth';
import { LanguageSelector } from '@/ui/styled/settings/language-selector';
import { useTranslation } from "react-i18next";
import { useUserManagement } from "@/lib/auth/UserManagementProvider";
import { Menu, X, User, LogOut, Settings, Home } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/ui/primitives/dropdown-menu";
import { getPlatformClasses } from "@/hooks/utils/usePlatformStyles";
import { useIsMobile } from "@/lib/utils/responsive";

interface HeaderProps {
  type?: 'fixed' | 'static' | 'sticky';
}

export function Header({ type = 'fixed' }: HeaderProps) {
  const { t } = useTranslation();
  const user = useAuth().user;
  const logout = useAuth().logout;
  const isLoading = useAuth().isLoading;
  
  const { isNative, platform } = useUserManagement();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Close mobile menu on location change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Prevent body scrolling when mobile menu is open
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
      navigate('/login');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error("Logout failed:", error) }
      navigate('/login');
    }
  };

  const headerClasses = getPlatformClasses({
    base: `w-full z-40 ${type === 'fixed' ? 'fixed top-0' : type === 'sticky' ? 'sticky top-0' : ''} bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${mobileMenuOpen ? 'shadow-md' : 'border-b'} transition-all duration-100`,
    mobile: 'py-2 px-3',
    web: 'py-3 px-4',
    ios: 'pt-safe',
  }, { platform, isNative });

  if (isNative && platform !== 'web') {
    return (
      <header className={headerClasses}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">User Management</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <LanguageSelector minimal={true} />
            
            {user ? (
              <Button variant="ghost" size="icon" onClick={handleLogout} disabled={isLoading}>
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Link to="/login">
                <Button size="sm">{t('auth.login')}</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  const mainNavItems = [
    { to: "/", label: t('common.home'), icon: <Home className="h-4 w-4 mr-2" /> },
    { to: "/settings", label: t('settings.title'), icon: <Settings className="h-4 w-4 mr-2" /> },
    { to: "/profile", label: t('profile.title'), icon: <User className="h-4 w-4 mr-2" /> },
  ];

  return (
    <header className={headerClasses}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 relative z-20">
          <span className="font-bold text-xl">User Management</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-4">
            {mainNavItems.slice(1).map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isLoading} aria-label={t('profile.menu')}>
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {t('profile.title')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('settings.title')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('auth.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button disabled={isLoading}>{t('auth.login')}</Button>
              </Link>
            )}
          </div>
        </div>
        
        <div className="md:hidden flex items-center gap-3">
          <LanguageSelector minimal={true} />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            disabled={isLoading}
            aria-label={mobileMenuOpen ? t('common.close') : t('common.menu')}
            className="relative z-20"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 transition-transform duration-300" />
            ) : (
              <Menu className="h-6 w-6 transition-transform duration-300" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu - Full Screen Overlay */}
      <div 
        className={`fixed inset-0 z-10 bg-background transition-transform duration-300 ease-in-out pt-16 ${
          mobileMenuOpen ? 'translate-y-0' : 'translate-y-full'
        } md:hidden`}
      >
        <div className="container mx-auto py-6 h-full overflow-y-auto">
          <nav className="flex flex-col space-y-6">
            {mainNavItems.map(item => (
              <Link 
                key={item.to}
                to={item.to} 
                className="px-2 py-3 text-lg font-medium flex items-center transition-colors hover:text-primary border-b border-border/30"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            
            {user ? (
              <Button 
                variant="ghost" 
                className="justify-start px-2 py-6 h-auto text-lg"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                disabled={isLoading}
              >
                <LogOut className="mr-2 h-5 w-5" />
                {t('auth.logout')}
              </Button>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button 
                  variant="default" 
                  size="lg" 
                  disabled={isLoading}
                  className="w-full mt-4"
                >
                  {t('auth.login')}
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}