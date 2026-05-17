"use client";

import { firebaseAuth } from "./firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";

async function exchangeIdTokenForSession(credential: UserCredential) {
  const idToken = await credential.user.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("Failed to create session");
}

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(firebaseAuth, provider);
  await exchangeIdTokenForSession(credential);
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<void> {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password
  );
  await exchangeIdTokenForSession(credential);
}

export async function firebaseSignOut(): Promise<void> {
  await signOut(firebaseAuth);
  await fetch("/api/auth/session", { method: "DELETE" });
}

async function exchangeAdminIdTokenForSession(credential: UserCredential) {
  const idToken = await credential.user.getIdToken();
  const res = await fetch("/api/admin/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("Failed to create admin session");
}

export async function adminSignInWithEmail(
  email: string,
  password: string
): Promise<void> {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password
  );
  await exchangeAdminIdTokenForSession(credential);
}

export async function adminFirebaseSignOut(): Promise<void> {
  await signOut(firebaseAuth);
  await fetch("/api/admin/auth/session", { method: "DELETE" });
}
