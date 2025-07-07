import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export const checkIfPlatePaid = async (plate) => {
  const docRef = doc(db, 'plates', plate.toLowerCase());
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};
