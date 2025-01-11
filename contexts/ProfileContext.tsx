'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { createProfile, getProfiles, updateProfile, deleteProfile } from '@/lib/profileService';
import { FirebaseError } from 'firebase/app';

interface Profile {
  id?: string;
  name: string;
  type: 'personal' | 'business' | 'family';
  currency: string;
  userId?: string;
}

interface ProfileContextType {
  profiles: Profile[];
  loading: boolean;
  activeProfile: Profile | null;
  createProfile: (profile: Omit<Profile, 'id' | 'userId'>) => Promise<void>;
  updateProfile: (id: string, profile: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setActiveProfile: (profile: Profile) => void;
  getProfiles: (userId: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const { user } = useAuth();

  const loadProfiles = async (userId: string) => {
    try {
      const userProfiles = await getProfiles(userId);
      setProfiles(userProfiles);
      if (userProfiles.length > 0 && !activeProfile) {
        setActiveProfile(userProfiles[0]);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      setProfiles([]);
      if (error instanceof FirebaseError) {
        console.error('Firebase error:', error.code, error.message);
      }
    }
  };

  useEffect(() => {
    if (!user) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    loadProfiles(user.uid)
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreateProfile = async (profileData: Omit<Profile, 'id' | 'userId'>) => {
    if (!user || !user.uid) {
      throw new Error('You must be logged in to create a profile');
    }

    try {
      // Log the user and profile data for debugging
      console.log('Creating profile for user:', user.uid, profileData);
      
      const newProfile = await createProfile({
        ...profileData,
        userId: user.uid,
      });

      // Update local state with the new profile
      setProfiles(prev => [...prev, newProfile]);

      // Set as active profile if it's the first one
      if (profiles.length === 0) {
        setActiveProfile(newProfile);
      }

      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      if (error instanceof FirebaseError) {
        // Add more specific error messages based on Firebase error codes
        const message = error.code === 'permission-denied' 
          ? 'You do not have permission to create profiles. Please make sure you are logged in.'
          : error.message;
        throw new Error(message);
      }
      throw new Error('Failed to create profile. Please try again.');
    }
  };

  const handleUpdateProfile = async (id: string, profileData: Partial<Profile>) => {
    if (!user) {
      throw new Error('User must be authenticated to update a profile');
    }

    try {
      const updatedProfile = await updateProfile(id, profileData);
      setProfiles(prev => 
        prev.map(profile => 
          profile.id === id ? { ...profile, ...updatedProfile } : profile
        )
      );
      if (activeProfile?.id === id) {
        setActiveProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase error: ${error.message}`);
      }
      throw new Error('Failed to update profile');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!user) {
      throw new Error('User must be authenticated to delete a profile');
    }

    try {
      await deleteProfile(id);
      setProfiles(prev => prev.filter(profile => profile.id !== id));
      if (activeProfile?.id === id) {
        const remainingProfiles = profiles.filter(p => p.id !== id);
        setActiveProfile(remainingProfiles[0] || null);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      if (error instanceof FirebaseError) {
        throw new Error(`Firebase error: ${error.message}`);
      }
      throw new Error('Failed to delete profile');
    }
  };

  const value = {
    profiles,
    loading,
    activeProfile,
    createProfile: handleCreateProfile,
    updateProfile: handleUpdateProfile,
    deleteProfile: handleDeleteProfile,
    setActiveProfile,
    getProfiles: loadProfiles,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
