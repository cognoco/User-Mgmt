'use client';

import React, { useRef, useState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Alert } from '@/ui/primitives/alert';
import { Avatar } from '@/ui/primitives/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/primitives/dialog';
import { ConnectedAccounts } from '@/ui/styled/shared/ConnectedAccounts';
import { ProfileEditor as HeadlessProfileEditor } from '@/ui/headless/profile/ProfileEditor';

export function ProfileEditor() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const cropperRef = useRef<Cropper>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setTempAvatar(reader.result as string);
      setIsAvatarDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  return (
    <HeadlessProfileEditor
      render={({
        handleSubmit,
        handleUploadProfilePicture,
        profile,
        formValues,
        setFormValue,
        isSubmitting,
        errors
      }) => {
        const handleCropComplete = async () => {
          if (cropperRef.current) {
            const canvas = cropperRef.current.getCroppedCanvas();
            canvas.toBlob(async (blob) => {
              if (blob) {
                await handleUploadProfilePicture(blob);
                setAvatarPreview(canvas.toDataURL());
              }
            });
            setIsAvatarDialogOpen(false);
          }
        };

        return (
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <img src={avatarPreview || profile?.profilePictureUrl || '/default-avatar.png'} alt="Profile" />
              </Avatar>

              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                  data-testid="avatar-upload"
                />
                <Label htmlFor="avatar-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Change Avatar
                  </Button>
                </Label>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formValues.firstName}
                  onChange={(e) => setFormValue('firstName', e.target.value)}
                />
                {errors.firstName && (
                  <Alert variant="destructive" role="alert">{errors.firstName}</Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formValues.lastName}
                  onChange={(e) => setFormValue('lastName', e.target.value)}
                />
                {errors.lastName && (
                  <Alert variant="destructive" role="alert">{errors.lastName}</Alert>
                )}
              </div>

              {errors.form && (
                <Alert variant="destructive" role="alert">{errors.form}</Alert>
              )}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>

            <div className="pt-8">
              <h3 className="text-lg font-medium mb-4">Connected Accounts</h3>
              <ConnectedAccounts variant="profile" />
            </div>

            <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crop Avatar</DialogTitle>
                </DialogHeader>
                {tempAvatar && (
                  <>
                    <Cropper
                      ref={cropperRef}
                      src={tempAvatar}
                      style={{ height: 400, width: '100%' }}
                      aspectRatio={1}
                      guides={false}
                    />
                    <Button onClick={handleCropComplete}>Save</Button>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        );
      }}
    />
  );
}

