'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfileStore } from '@/lib/stores/profile.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ReactCrop, { type Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  isValidImage, 
  MAX_FILE_SIZE, 
  ALLOWED_IMAGE_TYPES,
  formatFileSize,
  canvasPreview // Re-using canvasPreview helper
} from '@/lib/utils/file-upload';
import { Upload, Building, Trash, Camera } from 'lucide-react'; // Use Building icon for company
import { getPlatformClasses } from '@/hooks/usePlatformStyles';
import { useUserManagement } from '@/lib/auth/UserManagementProvider';

// Helper function (same as AvatarUpload) - can be moved to utils
async function getCroppedImgBlob(image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  await canvasPreview(image, canvas, crop);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png', 0.9);
  });
}

// --- CompanyLogoUpload Component ---
export function CompanyLogoUpload() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Use profile store to get logo URL and trigger updates
  const { profile, isLoading: storeLoading, error: storeError } = useProfileStore();
  // Use the correct actions from the store
  const uploadCompanyLogoAction = useProfileStore(state => state.uploadCompanyLogo);
  const removeCompanyLogoAction = useProfileStore(state => state.removeCompanyLogo);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect] = useState<number | undefined>(1); // Keep aspect ratio 1:1
  
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingCrop, setIsProcessingCrop] = useState(false);

  const { platform, isNative } = useUserManagement();

  useEffect(() => {
      setUploadError(null);
  }, [storeError, isModalOpen]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      const initialCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90, // Initial crop size
          },
          aspect,
          width,
          height,
        ),
        width,
        height,
      );
      setCrop(initialCrop);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!isValidImage(file)) {
      setUploadError(t('profile.errors.invalidImage', { types: ALLOWED_IMAGE_TYPES.map(type => type.replace('image/', '.')).join(', '), size: formatFileSize(MAX_FILE_SIZE) }));
      return;
    }
    
    setUploadError(null);
    const reader = new FileReader();
    reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
    reader.readAsDataURL(file);
    setIsModalOpen(true);
  };

  const handleCropAndUpload = async () => {
    if (!completedCrop || !imgRef.current) {
        setUploadError('Could not process crop.');
        return;
    }
    setIsProcessingCrop(true);
    setUploadError(null);
    
    try {
        const croppedBlob = await getCroppedImgBlob(imgRef.current, completedCrop);
        if (!croppedBlob) {
            throw new Error('Failed to create cropped image blob.');
        }
        
        const reader = new FileReader();
        reader.readAsDataURL(croppedBlob);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            // Call the correct store action
            const newLogoUrl = await uploadCompanyLogoAction(base64data); 
            setIsProcessingCrop(false);
            if (newLogoUrl) { // Check if upload was successful (returned URL)
                closeModalAndReset();
            } else {
                // Error is set within the store action
                setUploadError(useProfileStore.getState().error || t('profile.errors.uploadFailed'));
            }
        };
        reader.onerror = () => {
            setIsProcessingCrop(false);
            setUploadError('Failed to read cropped image data.');
        }
       
    } catch (error: any) {
        if (process.env.NODE_ENV === 'development') { console.error("Cropping/Upload error:", error); }
        setUploadError(error.message || t('profile.errors.uploadFailed'));
        setIsProcessingCrop(false);
    }
  };

  const handleRemove = async () => {
      // Call the correct store action
      await removeCompanyLogoAction(); 
  };

  const triggerFileInput = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const closeModalAndReset = () => {
      setIsModalOpen(false);
      setImgSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  };

  const logoClasses = getPlatformClasses({
    base: "h-32 w-32 border-4 border-background relative rounded-md", // Square for logo
    mobile: "h-24 w-24"
  }, { platform, isNative });
  const iconButtonClasses = getPlatformClasses({
    base: "absolute -bottom-3 -right-3 rounded-full bg-primary text-primary-foreground h-10 w-10 flex items-center justify-center shadow hover:bg-primary/90",
    mobile: "h-8 w-8 -bottom-2 -right-2"
  }, { platform, isNative });

  const isLoading = storeLoading || isProcessingCrop;

  return (
    <Card className="border-none shadow-none p-0">
      <CardContent className="pt-0 flex flex-col items-center space-y-4">
          <div className="relative" data-testid="company-logo-upload">
            {/* Using Avatar component structure but with square fallback */}
            <div className={`${logoClasses} flex items-center justify-center overflow-hidden bg-muted`}>
                {profile?.companyLogoUrl ? (
                    <img src={profile.companyLogoUrl} alt={t('profile.companyLogoAlt')} className="h-full w-full object-cover" />
                ) : (
                    <Building className="h-1/2 w-1/2 text-muted-foreground" />
                )}
            </div>
             <button
                type="button"
                className={iconButtonClasses}
                onClick={triggerFileInput}
                disabled={isLoading}
                aria-label={t('profile.changeCompanyLogo')}
              >
                <Camera className="h-5 w-5" />
              </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={handleFileChange}
            className="hidden"
            data-testid="company-logo-file-input"
          />

          {profile?.companyLogoUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={isLoading}
              size="sm"
            >
              <Trash className="mr-2 h-4 w-4" />
              {t('profile.removeCompanyLogo')}
            </Button>
          )}
          
          {(uploadError || storeError) && (
            <Alert variant="destructive" className="w-full">
              <AlertTitle>{t('common.error')}</AlertTitle>
              <AlertDescription>{uploadError || storeError}</AlertDescription>
            </Alert>
          )}
          
          <p className="text-xs text-muted-foreground text-center">
            {t('profile.avatarHelpText', { types: ALLOWED_IMAGE_TYPES.map(type => type.replace('image/', '.')).join(', '), size: formatFileSize(MAX_FILE_SIZE) })}
          </p>

        <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) closeModalAndReset(); }}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{t('profile.cropCompanyLogoTitle')}</DialogTitle>
                </DialogHeader>
                {uploadError && (
                     <Alert variant="destructive">
                         <AlertTitle>{t('common.error')}</AlertTitle>
                         <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                )}
                <div className="mt-4 max-h-[60vh] overflow-auto"> 
                    {imgSrc && (
                        <ReactCrop
                          crop={crop}
                          onChange={(_: Crop, percentCrop: Crop) => setCrop(percentCrop)}
                          onComplete={(c: PixelCrop) => setCompletedCrop(c)}
                          aspect={aspect} // Keep square aspect ratio
                          minWidth={100}
                          minHeight={100}
                          // circularCrop={false} // Keep it square
                        >
                          <img
                            ref={imgRef}
                            alt="Crop me"
                            src={imgSrc}
                            onLoad={onImageLoad}
                            style={{ maxHeight: '50vh' }}
                          />
                        </ReactCrop>
                    )}
                </div>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={closeModalAndReset} disabled={isLoading}>{t('common.cancel')}</Button>
                    <Button onClick={handleCropAndUpload} disabled={isLoading || !completedCrop?.width || !completedCrop?.height}>
                       {isLoading ? t('common.loading') : t('profile.uploadAndSave')}
                       <Upload className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 