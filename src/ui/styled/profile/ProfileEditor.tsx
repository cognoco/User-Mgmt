/**
 * Styled Profile Editor Component
 * 
 * This component provides a default styled implementation of the headless ProfileEditor.
 * It uses the headless component for behavior and adds UI rendering with Shadcn UI components.
 */

import React from 'react';
import { ProfileEditor as HeadlessProfileEditor, ProfileEditorProps } from '../../headless/profile/ProfileEditor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons';

export interface StyledProfileEditorProps extends Omit<ProfileEditorProps, 'render'> {
  /**
   * Optional title for the profile editor
   */
  title?: string;
  
  /**
   * Optional description for the profile editor
   */
  description?: string;
  
  /**
   * Optional footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Optional className for styling
   */
  className?: string;
}

export function ProfileEditor({
  title = 'Edit Profile',
  description = 'Update your personal information',
  footer,
  className,
  ...headlessProps
}: StyledProfileEditorProps) {
  return (
    <HeadlessProfileEditor
      {...headlessProps}
      render={({
        handleSubmit,
        profile,
        updateProfile,
        isSubmitting,
        isSuccess,
        errors,
        touched,
        handleBlur,
        handleAvatarChange,
        avatarPreview,
        removeAvatar,
        availableCountries,
        availableTimezones,
        availableLanguages
      }) => (
        <Card className={className}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircledIcon className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Profile updated successfully
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 mb-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || profile.avatarUrl} alt={profile.displayName || 'Profile'} />
                    <AvatarFallback>
                      {profile.displayName?.split(' ').map(name => name[0]).join('') || profile.firstName?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="avatar">Profile Picture</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="max-w-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: Square image, at least 200x200 pixels, maximum 5MB
                  </p>
                  
                  {(avatarPreview || profile.avatarUrl) && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={removeAvatar}
                      className="w-fit"
                    >
                      Remove Picture
                    </Button>
                  )}
                </div>
              </div>
              
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>
                
                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName || ''}
                        onChange={(e) => updateProfile('firstName', e.target.value)}
                        onBlur={() => handleBlur('firstName')}
                        disabled={isSubmitting}
                        aria-invalid={touched.firstName && !!errors.firstName}
                        className={touched.firstName && errors.firstName ? 'border-red-500' : ''}
                      />
                      {touched.firstName && errors.firstName && (
                        <p className="text-sm text-red-500">{errors.firstName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName || ''}
                        onChange={(e) => updateProfile('lastName', e.target.value)}
                        onBlur={() => handleBlur('lastName')}
                        disabled={isSubmitting}
                        aria-invalid={touched.lastName && !!errors.lastName}
                        className={touched.lastName && errors.lastName ? 'border-red-500' : ''}
                      />
                      {touched.lastName && errors.lastName && (
                        <p className="text-sm text-red-500">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profile.displayName || ''}
                      onChange={(e) => updateProfile('displayName', e.target.value)}
                      onBlur={() => handleBlur('displayName')}
                      disabled={isSubmitting}
                      aria-invalid={touched.displayName && !!errors.displayName}
                      className={touched.displayName && errors.displayName ? 'border-red-500' : ''}
                    />
                    {touched.displayName && errors.displayName && (
                      <p className="text-sm text-red-500">{errors.displayName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio || ''}
                      onChange={(e) => updateProfile('bio', e.target.value)}
                      onBlur={() => handleBlur('bio')}
                      disabled={isSubmitting}
                      rows={4}
                      aria-invalid={touched.bio && !!errors.bio}
                      className={touched.bio && errors.bio ? 'border-red-500' : ''}
                    />
                    {touched.bio && errors.bio && (
                      <p className="text-sm text-red-500">{errors.bio}</p>
                    )}
                  </div>
                </TabsContent>
                
                {/* Contact Information Tab */}
                <TabsContent value="contact" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => updateProfile('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      disabled={isSubmitting || headlessProps.disableEmailEdit}
                      aria-invalid={touched.email && !!errors.email}
                      className={touched.email && errors.email ? 'border-red-500' : ''}
                    />
                    {touched.email && errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                    {headlessProps.disableEmailEdit && (
                      <p className="text-xs text-gray-500">
                        Email address cannot be changed. Contact support if you need to update it.
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => updateProfile('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      disabled={isSubmitting}
                      aria-invalid={touched.phone && !!errors.phone}
                      className={touched.phone && errors.phone ? 'border-red-500' : ''}
                    />
                    {touched.phone && errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={profile.country || ''}
                      onValueChange={(value) => updateProfile('country', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCountries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.country && errors.country && (
                      <p className="text-sm text-red-500">{errors.country}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profile.city || ''}
                        onChange={(e) => updateProfile('city', e.target.value)}
                        onBlur={() => handleBlur('city')}
                        disabled={isSubmitting}
                        aria-invalid={touched.city && !!errors.city}
                        className={touched.city && errors.city ? 'border-red-500' : ''}
                      />
                      {touched.city && errors.city && (
                        <p className="text-sm text-red-500">{errors.city}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={profile.postalCode || ''}
                        onChange={(e) => updateProfile('postalCode', e.target.value)}
                        onBlur={() => handleBlur('postalCode')}
                        disabled={isSubmitting}
                        aria-invalid={touched.postalCode && !!errors.postalCode}
                        className={touched.postalCode && errors.postalCode ? 'border-red-500' : ''}
                      />
                      {touched.postalCode && errors.postalCode && (
                        <p className="text-sm text-red-500">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={profile.language || ''}
                      onValueChange={(value) => updateProfile('language', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguages.map((language) => (
                          <SelectItem key={language.code} value={language.code}>
                            {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.language && errors.language && (
                      <p className="text-sm text-red-500">{errors.language}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={profile.timezone || ''}
                      onValueChange={(value) => updateProfile('timezone', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select a timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimezones.map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value}>
                            {timezone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.timezone && errors.timezone && (
                      <p className="text-sm text-red-500">{errors.timezone}</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              {errors.form && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>{errors.form}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
          
          {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
      )}
    />
  );
}
