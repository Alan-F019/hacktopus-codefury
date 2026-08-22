import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  isConfigured,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from '../services/firebase';
import { UserProfile } from '../types';
import { api, localStore } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseLive: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoUser: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserContext: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync profile from localStore or api
  const refreshProfile = async () => {
    try {
      const profile = await api.getUserProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        try {
          if (fbUser) {
            const profile = await api.getUserProfile();
            setUser({
              ...profile,
              uid: fbUser.uid,
              email: fbUser.email || profile.email,
              name: fbUser.displayName || profile.name,
              photoURL: fbUser.photoURL || profile.photoURL,
            });
          } else {
            // Check if demo user was logged in
            const savedUser = localStorage.getItem('finwise_current_user');
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            } else {
              setUser(null);
            }
          }
        } catch (err) {
          console.error("Auth state initialization error:", err);
          setUser(null);
        } finally {
          setLoading(false);
        }
      });
      return () => unsubscribe();
    } else {
      // Offline/Mock mode
      const savedUser = localStorage.getItem('finwise_current_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Default to logged in as demo user for instant preview capability
        const defaultUser = { ...localStore.user };
        setUser(defaultUser);
        localStorage.setItem('finwise_current_user', JSON.stringify(defaultUser));
      }
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (isConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const profile = await api.getUserProfile();
        const updated = {
          ...profile,
          uid: cred.user.uid,
          email: cred.user.email || email,
        };
        setUser(updated);
        localStorage.setItem('finwise_current_user', JSON.stringify(updated));
      } else {
        // Mock fallback
        await new Promise((r) => setTimeout(r, 400));
        const updated: UserProfile = {
          ...localStore.user,
          email,
          name: email.split('@')[0] || 'User',
          uid: `usr-${Date.now()}`,
        };
        localStore.user = updated;
        localStore.save();
        setUser(updated);
        localStorage.setItem('finwise_current_user', JSON.stringify(updated));
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      if (isConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        const updated: UserProfile = {
          ...localStore.user,
          uid: cred.user.uid,
          name,
          email: cred.user.email || email,
          isOnboarded: false, // New user needs onboarding
        };
        localStore.user = updated;
        localStore.save();
        setUser(updated);
        localStorage.setItem('finwise_current_user', JSON.stringify(updated));
      } else {
        await new Promise((r) => setTimeout(r, 400));
        const updated: UserProfile = {
          ...localStore.user,
          uid: `usr-${Date.now()}`,
          name,
          email,
          isOnboarded: false,
        };
        localStore.user = updated;
        localStore.save();
        setUser(updated);
        localStorage.setItem('finwise_current_user', JSON.stringify(updated));
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (isConfigured && auth && googleProvider) {
        const cred = await signInWithPopup(auth, googleProvider);
        const updated: UserProfile = {
          ...localStore.user,
          uid: cred.user.uid,
          name: cred.user.displayName || 'Google User',
          email: cred.user.email || 'google@user.com',
          photoURL: cred.user.photoURL || undefined,
        };
        localStore.user = updated;
        localStore.save();
        setUser(updated);
        localStorage.setItem('finwise_current_user', JSON.stringify(updated));
      } else {
        await new Promise((r) => setTimeout(r, 400));
        const updated: UserProfile = {
          ...localStore.user,
          name: 'Alex Morgan',
          email: 'alex.morgan@gmail.com',
          uid: 'google-demo-user-1',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
        localStore.user = updated;
        localStore.save();
        setUser(updated);
        localStorage.setItem('finwise_current_user', JSON.stringify(updated));
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoUser = async () => {
    setLoading(true);
    try {
      localStorage.setItem('finwise_auth_token', 'demo-sandbox-token');
      await new Promise((r) => setTimeout(r, 200));
      localStore.reset();
      try {
        const profile = await api.getUserProfile();
        setUser(profile);
        localStorage.setItem('finwise_current_user', JSON.stringify(profile));
      } catch {
        setUser({ ...localStore.user });
        localStorage.setItem('finwise_current_user', JSON.stringify(localStore.user));
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isConfigured && auth) {
      await fbSignOut(auth);
    }
    localStorage.removeItem('finwise_current_user');
    localStorage.removeItem('finwise_auth_token');
    setUser(null);
  };

  const updateUserContext = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStore.user = updated;
    localStore.save();
    localStorage.setItem('finwise_current_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseLive: isConfigured,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogle,
        loginAsDemoUser,
        logout,
        refreshProfile,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
