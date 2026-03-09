import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

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

  const updateUserState = async (firebaseUser: FirebaseUser) => {
    // Get user data from Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const userRole = userData.role || 'customer';
      const userApproved = userData.approved || false;
      // Handle backward compatibility for users without status field
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
    } else {
      // Fallback for users who don't have a profile in Firestore
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        role: 'customer',
        approved: true, // Default to approved for existing users
        status: 'approved' // Default status for fallback users
      });
      
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await updateUserState(firebaseUser);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      // Get user data from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userRole = userData.role || 'customer';
        const userApproved = userData.approved || false;
        // Handle backward compatibility for users without status field
        const userStatus = userData.status || (userApproved ? 'approved' : 'pending');
        
        // Check if user is approved
        if (!userApproved && userRole !== 'customer') {
          // If user is not approved and not a customer, deny access
          await signOut(auth); // Sign out the user
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
      } else {
        // Fallback for users who don't have a profile in Firestore
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || email.split('@')[0] || 'User',
          role: 'customer',
          approved: true, // Default to approved for existing users
          status: 'approved' // Default status for fallback users
        });
        
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName?: string, role: 'admin' | 'employee' | 'customer' = 'customer') => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      // Update the user profile with display name if provided
      if (displayName) {
        await updateProfile(firebaseUser, {
          displayName: displayName
        });
      }
      
      // Set user role and approval status in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const approved = role === 'customer'; // Customers are auto-approved, others need approval
      const status = role === 'customer' ? 'approved' : 'pending'; // Customers are auto-approved, others are pending
      
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
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('userRole');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAdmin,
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