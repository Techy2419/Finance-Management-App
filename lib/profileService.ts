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
  Timestamp
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
      createdAt: new Date(),
      updatedAt: new Date(),
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
  } catch (err) {
    console.error('Error in profileService.createProfile:', err);
    throw err; // Let the context handle the error
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
  } catch (err) {
    console.error('Error getting profiles:', err);
    throw err;
  }
}

export async function updateProfile(profileId: string, updates: Partial<Profile>) {
  try {
    const profileRef = doc(firestore, PROFILES_COLLECTION, profileId);
    const updatedData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    await updateDoc(profileRef, updatedData);
    return {
      id: profileId,
      ...updates, // Return the updated fields without timestamp
    } as Profile;
  } catch (err) {
    console.error('Error updating profile:', err);
    throw err;
  }
}

export async function deleteProfile(profileId: string) {
  try {
    const profileRef = doc(firestore, PROFILES_COLLECTION, profileId);
    await deleteDoc(profileRef);
  } catch (err) {
    console.error('Error deleting profile:', err);
    throw err;
  }
}
