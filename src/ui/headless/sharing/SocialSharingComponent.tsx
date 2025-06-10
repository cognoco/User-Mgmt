/**
 * Headless Social Sharing Component
 *
 * Generates share URLs and exposes copy/share handlers.
 */
import { useEffect, useState } from 'react';

export interface SharedItemData {
  id: string;
  title: string;
  slug: string;
}

export interface SocialSharingComponentProps {
  itemData: SharedItemData;
  basePath?: string;
  render: (props: {
    shareUrl: string;
    isCopied: boolean;
    copy: () => void;
    open: boolean;
    setOpen: (v: boolean) => void;
  }) => React.ReactNode;
}

export function SocialSharingComponent({ itemData, basePath = '', render }: SocialSharingComponentProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setShareUrl(`${basePath}/${itemData.slug}`);
  }, [basePath, itemData.slug]);

  const copy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => setIsCopied(true));
  };

  return <>{render({ shareUrl, isCopied, copy, open, setOpen })}</>;
}
