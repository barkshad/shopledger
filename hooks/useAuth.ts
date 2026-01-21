
import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signOut, 
  User 
} from 'firebase/auth';
import { auth, googleProvider } from '../services/db';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscriber to the Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }, (error) => {
      console.error("[AuthStateError]", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
  
  const register = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
  
  const loginWithGoogle = async () => {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      // In restricted environments, popup might be blocked. 
      // Redirect could be a fallback, but Popup is standard for Web apps.
      throw error;
    }
  };
  
  const logout = () => signOut(auth);

  return { user, loading, login, logout, register, loginWithGoogle };
};
