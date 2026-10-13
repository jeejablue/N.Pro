import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Warehouse User definition compatible with App and Navbar
export interface WarehouseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Re-export type User for existing imports
export type User = WarehouseUser;

// Initialize Firebase App instance safely (prevent duplicate app error)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Required Workspace scopes for managing warehouse data in Google Sheets & Drive
const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid'
];

WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account'
});

// Cache tokens and user in memory and sessionStorage
const SESSION_STORAGE_KEY = 'warehouse_oauth_session_v2';
let cachedAccessToken: string | null = null;
let cachedUser: WarehouseUser | null = null;
let isSigningIn = false;

// Global TypeScript declaration for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
              error_uri?: string;
            }) => void;
            error_callback?: (error: any) => void;
            prompt?: string;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          revoke?: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

/**
 * Dynamically load Google Identity Services SDK script if not already loaded.
 */
export const loadGsiScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) {
      resolve(true);
      return;
    }
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      if (window.google?.accounts?.oauth2) resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

interface StoredSession {
  user: WarehouseUser;
  accessToken: string;
  expiresAt: number;
}

const saveSession = (user: WarehouseUser, token: string) => {
  try {
    const session: StoredSession = {
      user,
      accessToken: token,
      expiresAt: Date.now() + 3500 * 1000 // Tokens are valid for ~1 hour
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Could not save session to sessionStorage:', err);
  }
};

const clearSession = () => {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    // Ignore error
  }
};

/**
 * Perform sign-in via Google Identity Services Token Client.
 * This directly talks to Google OAuth using the provisioned OAuth Client ID,
 * completely bypassing Firebase's unauthorized-domain restriction on Cloud Run/preview domains.
 */
const signInWithGis = async (clientId: string): Promise<{ user: WarehouseUser; accessToken: string }> => {
  await loadGsiScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services SDK ยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง');
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = window.google!.accounts!.oauth2!.initTokenClient({
        client_id: clientId,
        scope: WORKSPACE_SCOPES.join(' '),
        prompt: 'select_account',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.error('GIS token error:', tokenResponse);
            reject(
              new Error(tokenResponse.error_description || tokenResponse.error || 'การยืนยันตัวตนถูกยกเลิก')
            );
            return;
          }

          const accessToken = tokenResponse.access_token;
          if (!accessToken) {
            reject(new Error('ไม่ได้รับ Access Token จาก Google'));
            return;
          }

          try {
            // Fetch User profile from Google's userinfo endpoint
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });

            let userProfile: WarehouseUser;
            if (res.ok) {
              const info = await res.json();
              userProfile = {
                uid: info.sub || `user_${Date.now()}`,
                email: info.email || null,
                displayName: info.name || info.given_name || info.email?.split('@')[0] || 'ผู้ใช้งาน Google',
                photoURL: info.picture || null
              };
            } else {
              userProfile = {
                uid: `user_${Date.now()}`,
                email: 'operator@warehouse.local',
                displayName: 'ผู้ดูแลคลังสินค้า',
                photoURL: null
              };
            }

            cachedAccessToken = accessToken;
            cachedUser = userProfile;
            saveSession(userProfile, accessToken);

            resolve({ user: userProfile, accessToken });
          } catch (profileErr) {
            console.warn('Could not fetch userinfo, using fallback profile:', profileErr);
            const fallbackUser: WarehouseUser = {
              uid: `user_${Date.now()}`,
              email: null,
              displayName: 'ผู้ใช้งาน Google',
              photoURL: null
            };
            cachedAccessToken = accessToken;
            cachedUser = fallbackUser;
            saveSession(fallbackUser, accessToken);
            resolve({ user: fallbackUser, accessToken });
          }
        },
        error_callback: (err) => {
          console.error('GIS Error callback:', err);
          reject(new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ Google OAuth'));
        }
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Initialize Authentication state.
 * Checks in-memory cache, sessionStorage, and Firebase Auth.
 */
export const initAuth = (
  onAuthSuccess?: (user: WarehouseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Preload GSI script in background
  loadGsiScript().catch(() => {});

  // 1. Check in-memory first
  if (cachedUser && cachedAccessToken) {
    if (onAuthSuccess) onAuthSuccess(cachedUser, cachedAccessToken);
    return () => {};
  }

  // 2. Check sessionStorage for active session
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const session: StoredSession = JSON.parse(raw);
      if (session.expiresAt > Date.now() && session.accessToken && session.user) {
        cachedUser = session.user;
        cachedAccessToken = session.accessToken;
        if (onAuthSuccess) onAuthSuccess(session.user, session.accessToken);
        return () => {};
      } else {
        clearSession();
      }
    }
  } catch (err) {
    console.warn('Could not restore session from storage:', err);
  }

  // 3. Fallback to Firebase onAuthStateChanged
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const mappedUser: WarehouseUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      };
      cachedUser = mappedUser;
      if (cachedAccessToken && onAuthSuccess) {
        onAuthSuccess(mappedUser, cachedAccessToken);
      } else if (!isSigningIn && onAuthFailure) {
        onAuthFailure();
      }
    } else {
      if (!cachedUser && onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

/**
 * Unified Sign-in with Google.
 * Uses Google Identity Services (GIS) token client as the primary mechanism
 * to prevent Firebase auth/unauthorized-domain errors on preview and cloud run URLs.
 * Falls back to Firebase signInWithPopup if GIS is unavailable.
 */
export const googleSignIn = async (): Promise<{ user: WarehouseUser; accessToken: string } | null> => {
  isSigningIn = true;
  try {
    const clientId = firebaseConfig.oAuthClientId;

    // 1. PRIMARY: Google Identity Services (Direct Google OAuth Token Client)
    if (clientId) {
      try {
        console.log('Signing in via Google Identity Services Token Client...');
        const result = await signInWithGis(clientId);
        return result;
      } catch (gisError: any) {
        console.warn('GIS sign-in failed, trying Firebase fallback:', gisError);
        // If user actively cancelled/closed the popup, rethrow immediately
        if (
          gisError.message?.includes('user closed') ||
          gisError.message?.includes('popup_closed') ||
          gisError.message?.includes('ยกเลิก')
        ) {
          throw gisError;
        }
      }
    }

    // 2. FALLBACK: Firebase Auth signInWithPopup
    console.log('Signing in via Firebase signInWithPopup...');
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('ไม่สามารถดึง Access Token จาก Google Auth ได้');
    }

    const appUser: WarehouseUser = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL
    };

    cachedAccessToken = credential.accessToken;
    cachedUser = appUser;
    saveSession(appUser, cachedAccessToken);

    return { user: appUser, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in failed:', error);

    // Human-friendly Thai translation for specific errors
    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('auth/unauthorized-domain')) {
      const currentHost = window.location.hostname;
      throw new Error(
        `โดเมน ${currentHost} ยังไม่ได้เปิดสิทธิ์ใน Firebase (auth/unauthorized-domain) กำลังเปลี่ยนไปใช้ Google Direct Login กรุณากดลองอีกครั้ง`
      );
    }
    if (error?.code === 'auth/popup-closed-by-user' || error?.message?.includes('popup-closed-by-user')) {
      throw new Error('หน้าต่างล็อกอินถูกปิด กรุณาลองใหม่อีกครั้ง');
    }
    if (error?.code === 'auth/popup-blocked' || error?.message?.includes('popup-blocked')) {
      throw new Error('เบราว์เซอร์บล็อกหน้าต่าง Popup กรุณากดอนุญาตให้เปิด Popup สำหรับเว็บไซต์นี้');
    }

    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async (): Promise<void> => {
  try {
    if (cachedAccessToken && window.google?.accounts?.oauth2?.revoke) {
      window.google.accounts.oauth2.revoke(cachedAccessToken, () => {});
    }
    await signOut(auth);
  } catch (err) {
    console.warn('Error during sign out:', err);
  } finally {
    cachedAccessToken = null;
    cachedUser = null;
    clearSession();
  }
};
