import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { doc, setDoc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'employee' | 'customer';
  approved: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isStaff: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string, role?: 'admin' | 'employee' | 'customer') => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  const logActivity = async (
    action: 'login' | 'logout' | 'register' | 'approve' | 'reject' | 'profile_update',
    payload: {
      userId: string;
      userName: string;
      userEmail: string;
      details?: string;
    }
  ) => {
    try {
      await addDoc(collection(db, COLLECTIONS.ACTIVITY_LOGS), {
        userId: payload.userId,
        userName: payload.userName,
        userEmail: payload.userEmail,
        action,
        details: payload.details || '',
        timestamp: Timestamp.now(),
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  const updateUserState = async (firebaseUser: FirebaseUser) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const userRole = userData.role || 'customer';
      const userApproved = userData.approved || false;
      const userStatus = userData.status || (userApproved ? 'approved' : 'pending');

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        role: userRole,
        approved: userApproved,
        status: userStatus
      });

      setIsAdmin(userRole === 'admin');
      setIsStaff(userRole === 'admin' || userRole === 'employee');
    } else {
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        role: 'customer',
        approved: true,
        status: 'approved'
      });

      setIsAdmin(false);
      setIsStaff(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await updateUserState(firebaseUser);
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsStaff(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userRole = userData.role || 'customer';
        const userApproved = userData.approved || false;
        const userStatus = userData.status || (userApproved ? 'approved' : 'pending');

        if (!userApproved && userRole !== 'customer') {
          await signOut(auth);
          throw new Error('Account not approved. Please wait for admin approval.');
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || email.split('@')[0] || 'User',
          role: userRole,
          approved: userApproved,
          status: userStatus
        });

        setIsAdmin(userRole === 'admin');
        setIsStaff(userRole === 'admin' || userRole === 'employee');
      } else {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || email.split('@')[0] || 'User',
          role: 'customer',
          approved: true,
          status: 'approved'
        });

        setIsAdmin(false);
        setIsStaff(false);
      }

      await logActivity('login', {
        userId: firebaseUser.uid,
        userName: firebaseUser.displayName || email.split('@')[0] || 'User',
        userEmail: firebaseUser.email || email,
        details: 'User logged in successfully',
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName?: string, role: 'admin' | 'employee' | 'customer' = 'customer') => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      if (displayName) {
        await updateProfile(firebaseUser, {
          displayName: displayName
        });
      }

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const approved = role === 'customer';
      const status = role === 'customer' ? 'approved' : 'pending';

      await setDoc(userDocRef, {
        role,
        approved,
        status,
        email,
        displayName: displayName || email.split('@')[0] || 'User',
        createdAt: new Date()
      });

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName || firebaseUser.email?.split('@')[0] || 'User',
        role,
        approved,
        status: role === 'customer' ? 'approved' : 'pending'
      });

      setIsAdmin(role === 'admin');
      setIsStaff(role === 'admin' || role === 'employee');

      await logActivity('register', {
        userId: firebaseUser.uid,
        userName: displayName || firebaseUser.email?.split('@')[0] || 'User',
        userEmail: firebaseUser.email || email,
        details: `Registered as ${role}`,
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const current = auth.currentUser;
      if (current) {
        await logActivity('logout', {
          userId: current.uid,
          userName: current.displayName || current.email?.split('@')[0] || 'User',
          userEmail: current.email || 'unknown@saurashtra.local',
          details: 'User logged out',
        });
      }

      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      setIsStaff(false);
      localStorage.removeItem('userRole');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAdmin,
    isStaff,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
