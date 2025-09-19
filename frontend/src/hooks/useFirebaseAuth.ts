// src/hooks/useFirebaseAuth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, isFirebaseEnabled } from "../lib/firebase";

export const useFirebaseAuth = () => {
  const signup = async (email: string, password: string) => {
    if (!isFirebaseEnabled || !auth) {
      throw new Error("Firebase authentication is not available");
    }
    return createUserWithEmailAndPassword(auth, email, password);
  };
  
  const login = async (email: string, password: string) => {
    if (!isFirebaseEnabled || !auth) {
      throw new Error("Firebase authentication is not available");
    }
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  const logout = async () => {
    if (!isFirebaseEnabled || !auth) {
      throw new Error("Firebase authentication is not available");
    }
    return signOut(auth);
  };
  
  return { signup, login, logout, isFirebaseEnabled };
};
