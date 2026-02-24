import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '../config/firebase.js';

function isPermissionDenied(err) {
  const code = err?.code ?? '';
  return code === 'permission-denied' || code === 'firestore/permission-denied';
}

function fallbackProfile(email) {
  return {
    email: email ?? '',
    role: 'student',
    localFallback: true,
  };
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function createUserProfileIfMissing({ uid, email }) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);

  if (snap.exists()) return snap.data();

  const profile = {
    email: email ?? '',
    role: 'student',
    createdAt: serverTimestamp(),
  };

  await setDoc(ref, profile);
  const createdSnap = await getDoc(ref);
  return createdSnap.exists() ? createdSnap.data() : null;
}

export async function getOrCreateUserProfile({ uid, email }) {
  try {
    return (await getUserProfile(uid)) ?? (await createUserProfileIfMissing({ uid, email }));
  } catch (err) {
    if (isPermissionDenied(err)) {
      return fallbackProfile(email);
    }
    throw err;
  }
}
