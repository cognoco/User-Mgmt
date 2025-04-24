'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfileStore } from '@/lib/stores/profile.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ReactCrop, { type Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  isValidImage, 
  MAX_FILE_SIZE, 
  ALLOWED_IMAGE_TYPES,
  createFilePreview,
  revokeFilePreview,
  formatFileSize,
  canvasPreview
} from '@/lib/utils/file-upload';
import { Upload, User, Trash, X, Camera, RotateCw } from 'lucide-react';
import { getPlatformClasses } from '@/lib/hooks/usePlatformStyles';
import { useUserManagement } from '@/lib/UserManagementProvider';
import { useDebounceEffect } from '@/lib/hooks/useDebounceEffect';

async function getCroppedImgBlob(image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  await canvasPreview(image, canvas, crop);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png', 0.9);
  });
}

export function AvatarUpload() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { profile, uploadAvatar, removeAvatar, isLoading: storeLoading, error: storeError } = useProfileStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(1);
  
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingCrop, setIsProcessingCrop] = useState(false);
  const { platform } = useUserManagement();

  useEffect(() => {
      setUploadError(null);
  }, [storeError, isModalOpen]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
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
            const success = await uploadAvatar(base64data);
             setIsProcessingCrop(false);
            if (success) {
                closeModalAndReset();
            } else {
                setUploadError(t('profile.errors.uploadFailed'));
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
    await removeAvatar();
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

  const avatarClasses = getPlatformClasses({
    base: "h-32 w-32 border-4 border-background relative",
    mobile: "h-24 w-24"
  });
  const iconButtonClasses = getPlatformClasses({
    base: "absolute -bottom-3 -right-3 rounded-full bg-primary text-primary-foreground h-10 w-10 flex items-center justify-center shadow hover:bg-primary/90",
    mobile: "h-8 w-8 -bottom-2 -right-2"
  });

  const isLoading = storeLoading || isProcessingCrop;

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className={avatarClasses}>
               <AvatarImage src={profile?.avatar_url || undefined} alt={t('profile.avatar')} />
                <AvatarFallback>
                  <User className="h-1/2 w-1/2 text-muted-foreground" />
                </AvatarFallback>
              <button
                type="button"
                className={iconButtonClasses}
                onClick={triggerFileInput}
                disabled={isLoading}
                aria-label={t('profile.changeAvatar')}
              >
                <Camera className="h-5 w-5" />
              </button>
            </Avatar>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />

          {profile?.avatar_url && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={isLoading}
              size="sm"
            >
              <Trash className="mr-2 h-4 w-4" />
              {t('profile.removeAvatar')}
            </Button>
          )}
          
          {(uploadError || storeError) && (
            <Alert variant="destructive" className="w-full">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{uploadError || storeError}</AlertDescription>
            </Alert>
          )}
          
          <p className="text-xs text-muted-foreground text-center">
            {t('profile.avatarHelpText', { types: ALLOWED_IMAGE_TYPES.map(type => type.replace('image/', '.')).join(', '), size: formatFileSize(MAX_FILE_SIZE) })}
          </p>

        <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) closeModalAndReset(); }}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{t('profile.cropImageTitle')}</DialogTitle>
                </DialogHeader>
                {uploadError && (
                     <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                         <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                )}
                <div className="mt-4 max-h-[60vh] overflow-auto"> 
                    {imgSrc && (
                        <ReactCrop
                          crop={crop}
                          onChange={(_, percentCrop) => setCrop(percentCrop)}
                          onComplete={(c) => setCompletedCrop(c)}
                          aspect={aspect}
                          minWidth={100}
                          minHeight={100}
                          circularCrop
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

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  const mediaAspect = mediaWidth / mediaHeight;
  let cropWidth: number;
  let cropHeight: number;

  if (mediaAspect > aspect) {
    cropWidth = mediaHeight * aspect;
    cropHeight = mediaHeight;
  } else {
    cropHeight = mediaWidth / aspect;
    cropWidth = mediaWidth;
  }
  cropWidth *= 0.8;
  cropHeight *= 0.8;

  const x = (mediaWidth - cropWidth) / 2;
  const y = (mediaHeight - cropHeight) / 2;

  return {
    unit: 'px',
    x,
    y,
    width: cropWidth,
    height: cropHeight,
  };
} 