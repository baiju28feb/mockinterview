"use server";

import { getDb, getAdminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

const SESSION_DURATION = 60 * 60 * 24 * 5 * 1000; // 5 days in ms

export async function signUp({ uid, name, email }: SignUpParams) {
  try {
    const db = getDb();
    const userRef = db.collection("users").doc(uid);
    const existing = await userRef.get();

    if (existing.exists) {
      return { success: false, message: "An account with this email already exists." };
    }

    await userRef.set({ name, email, createdAt: new Date().toISOString() });
    return { success: true };
  } catch (error) {
    console.error("signUp error:", error);
    return { success: false, message: "Failed to create account. Please try again." };
  }
}

export async function signIn({ idToken }: SignInParams) {
  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken) return { success: false, message: "Invalid credentials." };

    await setSessionCookie(idToken);
    return { success: true };
  } catch (error) {
    console.error("signIn error:", error);
    return { success: false, message: "Failed to sign in. Please check your credentials." };
  }
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const adminAuth = getAdminAuth();
    const db = getDb();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await db.collection("users").doc(decodedClaims.uid).get();
    if (!userDoc.exists) return null;

    return { id: decodedClaims.uid, ...(userDoc.data() as Omit<User, "id">) };
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();
  const adminAuth = getAdminAuth();
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}
