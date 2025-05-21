'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfileStore } from '@/lib/stores/profile.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactCrop, { type Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  isValidImage, 
  MAX_FILE_SIZE, 
  ALLOWED_IMAGE_TYPES,
  formatFileSize,
  canvasPreview
} from '@/lib/utils/file-upload';
import { Upload, User, Trash, Camera, Image } from 'lucide-react';
import { getPlatformClasses } from '@/hooks/utils/usePlatformStyles';
import { useUserManagement } from '@/lib/auth/UserManagementProvider';
import { api } from '@/lib/api/axios';

// Predefined avatar type
interface PredefinedAvatar {
  id: string;
  url: string;
  name: string;
}

async function getCroppedImgBlob(image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  await canvasPreview(image, canvas, crop);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png', 0.9);
  });
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

export function AvatarUpload() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { profile, uploadAvatar, removeAvatar, isLoading: storeLoading, error: storeError } = useProfileStore();
  const { platform, isNative } = useUserManagement();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect] = useState<number | undefined>(1);
  
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingCrop, setIsProcessingCrop] = useState(false);
  const [predefinedAvatars, setPredefinedAvatars] = useState<PredefinedAvatar[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(false);

  useEffect(() => {
    setUploadError(null);
  }, [storeError, isModalOpen]);

  // Load predefined avatars when the component mounts
  useEffect(() => {
    async function fetchPredefinedAvatars() {
      setIsLoadingAvatars(true);
      try {
        const response = await api.get('/api/profile/avatar');
        setPredefinedAvatars(response.data.avatars || []);
      } catch (error) {
        console.error('Failed to load predefined avatars:', error);
        setUploadError('Failed to load predefined avatars');
      } finally {
        setIsLoadingAvatars(false);
      }
    }
    
    fetchPredefinedAvatars();
  }, []);

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
    setActiveTab("upload");
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

  const handleSelectPredefinedAvatar = async (avatarId: string) => {
    setSelectedAvatarId(avatarId);
  };

  const handleApplySelectedAvatar = async () => {
    if (!selectedAvatarId) {
      setUploadError('Please select an avatar first.');
      return;
    }
    
    setIsProcessingCrop(true);
    setUploadError(null);
    
    try {
      const success = await uploadAvatar(selectedAvatarId);
      if (success) {
        closeModalAndReset();
      } else {
        setUploadError(t('profile.errors.uploadFailed'));
      }
    } catch (error: any) {
      setUploadError(error.message || t('profile.errors.uploadFailed'));
    } finally {
      setIsProcessingCrop(false);
    }
  };

  const handleRemove = async () => {
    await removeAvatar();
  };

  const openAvatarModal = () => {
    setUploadError(null);
    setIsModalOpen(true);
    setSelectedAvatarId(null);
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
    setSelectedAvatarId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const avatarClasses = getPlatformClasses({
    base: "h-32 w-32 border-4 border-background relative",
    mobile: "h-24 w-24"
  }, { platform, isNative });
  
  const iconButtonClasses = getPlatformClasses({
    base: "absolute -bottom-3 -right-3 rounded-full bg-primary text-primary-foreground h-10 w-10 flex items-center justify-center shadow hover:bg-primary/90",
    mobile: "h-8 w-8 -bottom-2 -right-2"
  }, { platform, isNative });

  const isLoading = storeLoading || isProcessingCrop;

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className={avatarClasses}>
            <AvatarImage src={profile?.avatarUrl || undefined} alt={t('profile.avatar')} />
            <AvatarFallback>
              <User className="h-1/2 w-1/2 text-muted-foreground" />
            </AvatarFallback>
            <button
              type="button"
              className={iconButtonClasses}
              onClick={openAvatarModal}
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

        {profile?.avatarUrl && (
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
              <DialogTitle>{t('profile.changeAvatar')}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="gallery" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="gallery">Select Avatar</TabsTrigger>
                <TabsTrigger value="upload">Upload Photo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="gallery" className="space-y-4">
                {isLoadingAvatars ? (
                  <div className="flex justify-center py-8">
                    <p>Loading avatars...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                      {predefinedAvatars.map((avatar) => (
                        <div 
                          key={avatar.id}
                          className={`cursor-pointer p-2 rounded-md transition-all ${selectedAvatarId === avatar.id ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted'}`}
                          onClick={() => handleSelectPredefinedAvatar(avatar.id)}
                        >
                          <Avatar className="h-16 w-16 mx-auto">
                            <AvatarImage src={avatar.url} alt={avatar.name} />
                            <AvatarFallback>{avatar.name[0]}</AvatarFallback>
                          </Avatar>
                          <p className="text-xs text-center mt-2">{avatar.name}</p>
                        </div>
                      ))}
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={closeModalAndReset} disabled={isLoading}>
                        {t('common.cancel')}
                      </Button>
                      <Button onClick={handleApplySelectedAvatar} disabled={isLoading || !selectedAvatarId}>
                        {isLoading ? t('common.loading') : t('profile.applyAvatar')}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4">
                {uploadError && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}
                
                {!imgSrc ? (
                  <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg">
                    <Image className="h-10 w-10 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('profile.dragOrClick')}
                      </p>
                      <Button onClick={triggerFileInput} disabled={isLoading}>
                        {t('profile.selectImage')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 max-h-[60vh] overflow-auto"> 
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
                        style={{ maxHeight: '50vh', margin: '0 auto' }}
                      />
                    </ReactCrop>
                  </div>
                )}
                
                <DialogFooter>
                  <Button variant="outline" onClick={closeModalAndReset} disabled={isLoading}>
                    {t('common.cancel')}
                  </Button>
                  {imgSrc && (
                    <Button 
                      onClick={handleCropAndUpload} 
                      disabled={isLoading || !completedCrop?.width || !completedCrop?.height}
                    >
                      {isLoading ? t('common.loading') : t('profile.uploadAndSave')}
                      <Upload className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 