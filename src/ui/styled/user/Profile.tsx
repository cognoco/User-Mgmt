import React from 'react';
import HeadlessProfile from '@/ui/headless/user/Profile';
import { UserProfile, ProfileUpdatePayload } from '@/core/user/models';
import DataExport from '../profile/DataExport';
import CompanyDataExport from '../profile/CompanyDataExport';
import NotificationPreferences from '../profile/NotificationPreferences';
import ActivityLog from '../profile/ActivityLog';

interface ProfileProps {
  userId?: string;
}

/**
 * Styled Profile component that uses the headless Profile component
 * This component only contains UI elements and styling, with all business logic in the headless component
 */
export default function Profile({ userId }: ProfileProps) {
  return (
    <HeadlessProfile userId={userId}>
      {({
        profile,
        isLoading,
        error,
        successMessage,
        uploadingAvatar,
        updateProfile,
        uploadAvatar,
        deleteAvatar,
        updateProfileField,
        clearMessages
      }) => {
        if (isLoading) return <div>Loading...</div>;
        if (!profile) return <div>No profile found</div>;

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (profile) {
            const profileData: ProfileUpdatePayload = {
              fullName: profile.fullName,
              website: profile.website,
              avatarUrl: profile.avatarUrl
            };
            await updateProfile(profileData);
          }
        };

        const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
          if (!e.target.files || e.target.files.length === 0) {
            return;
          }
          const file = e.target.files[0];
          await uploadAvatar(file);
        };

        return (
          <div className="profile">
            <h2>Profile</h2>
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <div className="avatar">
              <img 
                src={profile.avatarUrl || 'https://example.com/avatar.jpg'} 
                alt="Avatar" 
                className="avatar-image"
              />
              <div className="avatar-upload">
                <label htmlFor="avatar-upload" className="avatar-upload-label">
                  Upload Avatar
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingAvatar}
                    className="hidden-file-input"
                  />
                </label>
                {profile.avatarUrl && (
                  <button 
                    onClick={() => deleteAvatar()}
                    className="delete-avatar-button"
                    type="button"
                  >
                    Remove Avatar
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name:
                  <input
                    id="fullName"
                    type="text"
                    value={profile.fullName || ''}
                    onChange={(e) => updateProfileField('fullName', e.target.value)}
                    className="form-input"
                  />
                </label>
              </div>
              
              <div className="form-group">
                <label htmlFor="website" className="form-label">
                  Website:
                  <input
                    id="website"
                    type="url"
                    value={profile.website || ''}
                    onChange={(e) => updateProfileField('website', e.target.value)}
                    className="form-input"
                  />
                </label>
              </div>
              
              <div className="button-container">
                <button 
                  type="submit" 
                  disabled={isLoading || uploadingAvatar}
                  className="submit-button"
                >
                  Update Profile
                </button>
              </div>
            </form>

            <hr className="section-divider" />
            
            {/* Data Export Section */}
            <DataExport />
            
            {/* Company Data Export Section (admin only) */}
            <CompanyDataExport />
            
            <hr className="section-divider" />
            
            {/* Notification Preferences Section */}
            <NotificationPreferences />
            
            <hr className="section-divider" />
            
            {/* Activity Log Section */}
            {profile.id && <ActivityLog />}

            <style jsx>{`
              .profile {
                max-width: 500px;
                margin: 0 auto;
                padding: 20px;
              }
              .avatar {
                margin: 20px 0;
                text-align: center;
              }
              .avatar-image {
                width: 150px;
                height: 150px;
                border-radius: 50%;
                object-fit: cover;
              }
              .avatar-upload {
                margin-top: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
              }
              .hidden-file-input {
                display: none;
              }
              .avatar-upload-label {
                cursor: pointer;
                padding: 8px 16px;
                background-color: #3b82f6;
                color: white;
                border-radius: 4px;
                display: inline-block;
              }
              .delete-avatar-button {
                padding: 8px 16px;
                background-color: #ef4444;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
              }
              .form-label {
                display: block;
                margin: 10px 0;
              }
              .form-input {
                width: 100%;
                padding: 8px;
                margin-top: 5px;
                border: 1px solid #ddd;
                border-radius: 4px;
              }
              .button-container {
                margin-top: 20px;
                text-align: center;
              }
              .submit-button {
                padding: 8px 16px;
                background-color: #3b82f6;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
              }
              .submit-button:disabled {
                background-color: #9ca3af;
                cursor: not-allowed;
              }
              .error-message {
                margin: 10px 0;
                padding: 10px;
                background-color: #fee2e2;
                color: #b91c1c;
                border-radius: 4px;
              }
              .success-message {
                margin: 10px 0;
                padding: 10px;
                background-color: #dcfce7;
                color: #166534;
                border-radius: 4px;
              }
              .section-divider {
                margin: 2rem 0;
                border: 0;
                border-top: 1px solid #e5e7eb;
              }
            `}</style>
          </div>
        );
      }}
    </HeadlessProfile>
  );
}
