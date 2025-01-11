import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';

export interface UserInfo {
  uid?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photoURL?: string;
  hasCompletedProfileWizard?: boolean;
  hasEnteredName?: boolean;
  hasCreatedProfile?: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export async function createUserInfo(userId: string, data: Partial<UserInfo>) {
  const userRef = doc(db, 'users', userId);
  const now = Timestamp.now();
  
  await setDoc(userRef, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getUserInfo(userId: string): Promise<UserInfo | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data() as UserInfo;
      
      // Convert Timestamps to Date if needed
      return {
        uid: userId,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        hasCompletedProfileWizard: data.hasCompletedProfileWizard || false,
        hasEnteredName: data.hasEnteredName || false,
        hasCreatedProfile: data.hasCreatedProfile || false,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

export async function updateUserInfo(userId: string, data: Partial<UserInfo>) {
  try {
    const userRef = doc(db, 'users', userId);
    const now = Timestamp.now();
    
    // Check if user document exists
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // If document doesn't exist, create it with the new data
      await setDoc(userRef, {
        ...data,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // If document exists, update it
      await updateDoc(userRef, {
        ...data,
        updatedAt: now,
      });
    }
    console.log('User info updated:', data);
  } catch (error) {
    console.error('Error updating user info:', error);
    throw error;
  }
}

export async function markProfileWizardComplete(userId: string) {
  const userRef = doc(db, 'users', userId);
  const now = Timestamp.now();
  
  await updateDoc(userRef, {
    hasCompletedProfileWizard: true,
    updatedAt: now,
  });
}
