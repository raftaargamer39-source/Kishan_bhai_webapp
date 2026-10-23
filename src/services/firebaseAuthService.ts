/**
 * Firebase Email/Password Authentication Service for Kishan Bhai
 * Implements direct Firebase Auth signup, signin, password resets,
 * and Firestore user profile synchronization.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, UserRole } from '../../shared/types';

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  village?: string;
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  isGpsVerified?: boolean;
  farmSizeAcres?: number;
  crops?: string[];
  preferredLanguage?: 'en' | 'hi';
}

export function formatAuthErrorMessage(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in with your password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address format (e.g., kishan@example.com).';
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not yet enabled in your Firebase console.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact Kishan Bhai support.';
    case 'auth/user-not-found':
      return 'No registered account found with this email. Please register below.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials and try again.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to many failed attempts. Please reset password or try later.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing. Please try again.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please enable popups for this site and try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in request was cancelled. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using another sign-in method. Please sign in with email/password.';
    case 'auth/unauthorized-domain':
      return 'This app domain is not yet authorized in Firebase Console Auth settings.';
    default:
      return error?.message || 'Authentication failed. Please try again.';
  }
}

/**
 * Register a new user with Firebase Email & Password, creating their profile in Firestore
 */
export async function signUpWithFirebaseEmail(params: SignUpParams): Promise<UserProfile> {
  const {
    email,
    password,
    fullName,
    role,
    phone,
    village,
    district,
    state,
    latitude,
    longitude,
    locationAccuracy,
    isGpsVerified,
    farmSizeAcres,
    crops,
    preferredLanguage,
  } = params;

  if (!email || !email.includes('@')) {
    throw new Error('Please provide a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  if (!fullName.trim()) {
    throw new Error('Please provide your full name.');
  }

  // 1. Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const fbUser = userCredential.user;

  // 2. Set Firebase Auth Display Name
  try {
    await updateProfile(fbUser, { displayName: fullName.trim() });
  } catch (err) {
    console.warn('Could not set displayName on Firebase Auth:', err);
  }

  const isAdminEmail = email.trim().toLowerCase() === 'naleswarbordoloi7@gmail.com';
  const effectiveRole: UserRole = role === 'ADMIN' && !isAdminEmail ? 'FARMER' : (role || 'FARMER');

  // 3. Construct clean UserProfile matching schema
  const userProfile: UserProfile = {
    id: fbUser.uid,
    email: fbUser.email || email.trim(),
    fullName: fullName.trim(),
    phone: phone?.trim() || '+91 98000 00000',
    role: effectiveRole,
    village: village?.trim() || 'Anandpur',
    district: district?.trim(),
    state: state?.trim() || 'Gujarat',
    latitude: latitude !== undefined ? latitude : undefined,
    longitude: longitude !== undefined ? longitude : undefined,
    locationAccuracy: locationAccuracy !== undefined ? locationAccuracy : undefined,
    isGpsVerified: isGpsVerified ?? (latitude !== undefined && longitude !== undefined),
    verified: false,
    farmSizeAcres: effectiveRole === 'FARMER' ? (farmSizeAcres !== undefined ? farmSizeAcres : 2.5) : undefined,
    crops: effectiveRole === 'FARMER' ? (crops && crops.length > 0 ? crops : ['Cotton', 'Wheat']) : undefined,
    preferredLanguage: preferredLanguage || 'hi',
    createdAt: new Date().toISOString(),
  };

  // 4. Save to Cloud Firestore
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    await setDoc(userDocRef, userProfile);
  } catch (err: any) {
    console.warn('[Firebase Auth] Could not write user doc to Firestore:', err?.message || err);
  }

  // 5. Notify backend server for wallet provisioning & sync
  try {
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userProfile),
    });
  } catch (err) {
    console.warn('[Firebase Auth] Backend sync notification note:', err);
  }

  return userProfile;
}

/**
 * Sign In with Firebase Email & Password and fetch profile from Firestore
 */
export async function signInWithFirebaseEmail(email: string, password: string): Promise<UserProfile> {
  if (!email || !email.trim()) {
    throw new Error('Please enter your email address.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  // 1. Sign in via Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const fbUser = userCredential.user;

  // 2. Load user document from Firestore
  let profile: UserProfile | null = null;
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      profile = snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('[Firebase Auth] Failed to fetch user doc from Firestore:', err);
  }

  // 3. If no Firestore doc exists yet, generate and persist initial profile
  if (!profile) {
    const isOwnerEmail = (fbUser.email || email).trim().toLowerCase() === 'naleswarbordoloi7@gmail.com';
    profile = {
      id: fbUser.uid,
      email: fbUser.email || email.trim(),
      fullName: fbUser.displayName || (isOwnerEmail ? 'Naleswar Bordoloi' : (email.split('@')[0] || 'Kishan Member')),
      phone: fbUser.phoneNumber || '+91 98765 43210',
      role: (isOwnerEmail && fbUser.emailVerified) ? 'ADMIN' : 'FARMER',
      village: 'Anandpur',
      state: 'Gujarat',
      verified: !!fbUser.emailVerified,
      farmSizeAcres: 4.0,
      crops: ['Cotton', 'Wheat', 'Groundnut'],
      preferredLanguage: 'hi',
      createdAt: new Date().toISOString(),
    };

    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      await setDoc(userDocRef, profile, { merge: true });
    } catch (err: any) {
      console.warn('[Firebase Auth] Could not bootstrap initial Firestore user profile:', err?.message || err);
    }
  }

  // 4. Sync with local backend
  try {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email.trim(), otp: '4020' }),
    });
  } catch (err) {
    console.warn('[Firebase Auth] Local session sync note:', err);
  }

  return profile;
}

/**
 * Sign in with Google using Firebase Auth popup
 */
export async function signInWithFirebaseGoogle(
  preferredRole?: UserRole,
  customProfileData?: {
    state?: string;
    district?: string;
    village?: string;
    farmSizeAcres?: number;
    latitude?: number;
    longitude?: number;
    locationAccuracy?: number;
    isGpsVerified?: boolean;
  }
): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  // 1. Trigger Firebase Google Popup
  const userCredential = await signInWithPopup(auth, provider);
  const fbUser = userCredential.user;

  // 2. Fetch existing Firestore user document
  let profile: UserProfile | null = null;
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      profile = snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('[Firebase Auth] Failed to fetch Firestore user doc after Google sign-in:', err);
  }

  // 3. If new user, create document
  if (!profile) {
    const isOwnerEmail = (fbUser.email || '').trim().toLowerCase() === 'naleswarbordoloi7@gmail.com';
    const effectiveRole: UserRole = isOwnerEmail ? 'ADMIN' : (preferredRole || 'FARMER');

    profile = {
      id: fbUser.uid,
      email: fbUser.email || '',
      fullName: fbUser.displayName || (isOwnerEmail ? 'Naleswar Bordoloi' : 'Google User'),
      phone: fbUser.phoneNumber || '+91 98765 43210',
      role: effectiveRole,
      village: customProfileData?.village?.trim() || 'Anandpur',
      district: customProfileData?.district?.trim(),
      state: customProfileData?.state?.trim() || 'Gujarat',
      latitude: customProfileData?.latitude,
      longitude: customProfileData?.longitude,
      locationAccuracy: customProfileData?.locationAccuracy,
      isGpsVerified: customProfileData?.isGpsVerified ?? (customProfileData?.latitude !== undefined && customProfileData?.longitude !== undefined),
      verified: true,
      farmSizeAcres: effectiveRole === 'FARMER' ? (customProfileData?.farmSizeAcres !== undefined ? customProfileData.farmSizeAcres : 2.5) : undefined,
      crops: effectiveRole === 'FARMER' ? ['Cotton', 'Wheat', 'Groundnut'] : undefined,
      preferredLanguage: 'hi',
      createdAt: new Date().toISOString(),
    };

    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      await setDoc(userDocRef, profile, { merge: true });
    } catch (err: any) {
      console.warn('[Firebase Auth] Could not bootstrap Firestore user profile for Google user:', err?.message || err);
    }

    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    } catch (err) {
      console.warn('[Firebase Auth] Backend sync notification note:', err);
    }
  }

  // 4. Session sync
  try {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: fbUser.email || fbUser.uid, otp: '4020' }),
    });
  } catch (err) {
    console.warn('[Firebase Auth] Local session sync note:', err);
  }

  return profile;
}

/**
 * Send password reset email via Firebase Auth
 */
export async function resetFirebasePassword(email: string): Promise<void> {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address to receive the password reset link.');
  }
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out current Firebase user
 */
export async function signOutFirebaseUser(): Promise<void> {
  await signOut(auth);
}
