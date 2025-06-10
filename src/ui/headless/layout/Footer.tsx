import { getPlatformClasses } from '@/hooks/utils/usePlatformStyles';
import { useUserManagement } from '@/lib/auth/UserManagementProvider';

export interface FooterProps {
  position?: 'static' | 'sticky' | 'fixed';
  children: (props: {
    footerClasses: string;
    platform: string;
    isNative: boolean;
    year: number;
    position: 'static' | 'sticky' | 'fixed';
  }) => React.ReactNode;
}

export function Footer({ position = 'static', children }: FooterProps) {
  const { platform, isNative } = useUserManagement();

  if (isNative && platform !== 'web') {
    return null;
  }

  const footerClasses = getPlatformClasses(
    {
      base: `w-full py-6 border-t ${
        position === 'sticky'
          ? 'sticky bottom-0'
          : position === 'fixed'
            ? 'fixed bottom-0'
            : ''
      } bg-background`,
      web: 'px-8',
      mobile: 'px-4 py-3',
    },
    { platform, isNative }
  );

  const year = new Date().getFullYear();

  return <>{children({ footerClasses, platform, isNative, year, position })}</>;
}
