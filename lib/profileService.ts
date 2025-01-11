import { firestore } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  Timestamp,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';

export interface Profile {
  id?: string;
  userId: string;
  name: string;
  type: 'personal' | 'family' | 'business';
  currency: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const PROFILES_COLLECTION = 'profiles';

export async function createProfile(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) {
  if (!profile.userId) {
    throw new Error('User ID is required to create a profile');
  }

  try {
    // Create the profile data with timestamps
    const profileData = {
      ...profile,
      name: profile.name.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Log the profile data being sent to Firestore (excluding sensitive info)
    console.log('Creating profile with data:', {
      ...profileData,
      userId: '[REDACTED]' // Don't log the actual userId
    });
    
    const docRef = await addDoc(collection(firestore, PROFILES_COLLECTION), profileData);
    
    // Return the profile data with the new ID
    return { 
      id: docRef.id, 
      ...profile,
    } as Profile;
  } catch (error) {
    console.error('Error in profileService.createProfile:', error);
    throw error; // Let the context handle the error
  }
}

export async function getProfiles(userId: string) {
  try {
    const q = query(
      collection(firestore, PROFILES_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Profile[];
  } catch (error) {
    console.error('Error getting profiles:', error);
    throw error;
  }
}

export async function updateProfile(profileId: string, updates: Partial<Profile>) {
  try {
    const profileRef = doc(firestore, PROFILES_COLLECTION, profileId);
    const updatedData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(profileRef, updatedData);
    return {
      id: profileId,
      ...updates, // Return the updated fields without timestamp
    } as Profile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function deleteProfile(profileId: string) {
  try {
    const profileRef = doc(firestore, PROFILES_COLLECTION, profileId);
    await deleteDoc(profileRef);
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
}
