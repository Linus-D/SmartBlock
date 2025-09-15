// src/hooks/useFirebaseAuth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export const useFirebaseAuth = () => {
  const signup = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);
  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);
  return { signup, login, logout };
};
