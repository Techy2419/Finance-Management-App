'use client';

import React, { 
  createContext, 
  useState, 
  useContext, 
  useEffect, 
  ReactNode 
} from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore, logFirebaseError } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

// Define UserInfo interface with optional fields and default values
export interface UserInfo {
  uid?: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  hasEnteredName?: boolean;
  hasCreatedProfile?: boolean;
}

// Define the context type
interface AuthContextType {
  user: User | null;
  userInfo: UserInfo | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateDisplayName: (names: { firstName: string; lastName: string }) => Promise<void>;
  markNameAsEntered: () => Promise<void>;
  markProfileAsCreated: () => Promise<void>;
  createProfile: (profileData: {
    name: string;
    type: string;
    currency: string;
  }) => Promise<void>;
  refreshUserInfo: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch or create user document in Firestore
  const fetchOrCreateUserDoc = async (user: User) => {
    if (!user?.uid) {
      console.error('No user ID found');
      return null;
    }

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const newUserData: UserInfo = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          firstName: '',
          lastName: '',
          hasEnteredName: false,
          hasCreatedProfile: false,
          photoURL: user.photoURL || '',
        };

        await setDoc(userDocRef, newUserData);
        return newUserData;
      }

      return userDoc.data() as UserInfo;
    } catch (error) {
      logFirebaseError(error);
      return null;
    }
  };

  // Refresh user info from Firestore
  const refreshUserInfo = async () => {
    if (!user?.uid) {
      setUserInfo(null);
      return;
    }

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const fetchedUserInfo = userDoc.data() as UserInfo;
        setUserInfo(fetchedUserInfo);
      }
    } catch (error) {
      logFirebaseError(error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fetchedUserInfo = await fetchOrCreateUserDoc(result.user);
      
      if (fetchedUserInfo) {
        setUser(result.user);
        setUserInfo(fetchedUserInfo);
        
        if (!fetchedUserInfo.hasEnteredName) {
          router.push('/profiles');
        } else if (!fetchedUserInfo.hasCreatedProfile) {
          router.push('/profiles');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      logFirebaseError(error);
      throw error;
    }
  };

  // Sign out
  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserInfo(null);
      router.push('/');
    } catch (error) {
      logFirebaseError(error);
    }
  };

  // Update display name
  const updateDisplayName = async ({ firstName, lastName }: { firstName: string; lastName: string }) => {
    if (!user?.uid) throw new Error('No user logged in');

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        hasEnteredName: true
      });
      await refreshUserInfo();
    } catch (error) {
      logFirebaseError(error);
      throw error;
    }
  };

  // Mark name as entered
  const markNameAsEntered = async () => {
    if (!user?.uid) throw new Error('No user logged in');

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { hasEnteredName: true });
      await refreshUserInfo();
    } catch (error) {
      logFirebaseError(error);
      throw error;
    }
  };

  // Mark profile as created
  const markProfileAsCreated = async () => {
    if (!user?.uid) throw new Error('No user logged in');

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { hasCreatedProfile: true });
      await refreshUserInfo();
    } catch (error) {
      logFirebaseError(error);
      throw error;
    }
  };

  // Create profile
  const createProfile = async (profileData: {
    name: string;
    type: string;
    currency: string;
  }) => {
    if (!user?.uid) throw new Error('No user logged in');

    try {
      await markProfileAsCreated();
      router.push('/expenses');
    } catch (error) {
      logFirebaseError(error);
      throw error;
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const fetchedUserInfo = await fetchOrCreateUserDoc(authUser);
        if (fetchedUserInfo) {
          setUserInfo(fetchedUserInfo);
        }
      } else {
        setUser(null);
        setUserInfo(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userInfo,
    loading,
    signInWithGoogle,
    signOutUser,
    updateDisplayName,
    markNameAsEntered,
    markProfileAsCreated,
    createProfile,
    refreshUserInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
