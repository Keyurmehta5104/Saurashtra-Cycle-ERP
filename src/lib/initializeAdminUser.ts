import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

// This function creates an initial admin user if one doesn't exist
export const initializeAdminUser = async () => {
  const auth = getAuth();
  const adminEmail = 'admin@saurashtracyclehub.com';
  const adminPassword = 'Admin@2024'; // Strong default password

  try {
    // Check if admin user already exists by trying to create it
    // This is a simplified approach - in production you might want to check first
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    // Set user role and approval status in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      role: 'admin',
      approved: true,
      status: 'approved',
      email: adminEmail,
      displayName: 'System Administrator',
      createdAt: new Date()
    });
    
    console.log('Admin user created successfully');
    console.log('Email:', adminEmail);
    console.log('Password: Admin@2024');
    
    return { success: true, user: userCredential.user };
  } catch (error: unknown) {
    // If user already exists, that's fine
    if ((error as { code?: string })?.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists');
      return { success: true, message: 'Admin user already exists' };
    } else {
      console.error('Error initializing admin user:', error);
      return { success: false, error: error.message };
    }
  }
};