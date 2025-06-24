
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, getDocs, onSnapshot, serverTimestamp, updateDoc, query, where } from 'firebase/firestore';

export interface Guest {
  id?: string;
  fullName: string;
  confirmationTimestamp: any;
  invitationId: string;
  status?: 'confirmed' | 'apologized';
  apologyTimestamp?: any;
}

export const confirmAttendance = async (fullName: string): Promise<string> => {
  try {
    const invitationId = generateInvitationId();
    const guestData = {
      fullName,
      confirmationTimestamp: serverTimestamp(),
      invitationId,
      status: 'confirmed'
    };
    
    const docRef = await addDoc(collection(db, 'guests'), guestData);
    return docRef.id;
  } catch (error) {
    console.error('Error confirming attendance:', error);
    throw error;
  }
};

export const apologizeForAttendance = async (invitationId: string): Promise<void> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'guests'));
    const guestDoc = querySnapshot.docs.find(doc => doc.data().invitationId === invitationId);
    
    if (guestDoc) {
      await updateDoc(doc(db, 'guests', guestDoc.id), {
        status: 'apologized',
        apologyTimestamp: serverTimestamp()
      });
    } else {
      throw new Error('Guest not found');
    }
  } catch (error) {
    console.error('Error apologizing for attendance:', error);
    throw error;
  }
};

export const getGuestById = async (guestId: string): Promise<Guest | null> => {
  try {
    const docRef = doc(db, 'guests', guestId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Guest;
    }
    return null;
  } catch (error) {
    console.error('Error getting guest:', error);
    return null;
  }
};

export const getGuestByInvitationId = async (invitationId: string): Promise<Guest | null> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'guests'));
    const guest = querySnapshot.docs.find(doc => doc.data().invitationId === invitationId);
    
    if (guest) {
      return { id: guest.id, ...guest.data() } as Guest;
    }
    return null;
  } catch (error) {
    console.error('Error getting guest by invitation ID:', error);
    return null;
  }
};

export const subscribeToGuests = (callback: (guests: Guest[]) => void) => {
  return onSnapshot(collection(db, 'guests'), (snapshot) => {
    const guests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Guest[];
    callback(guests);
  });
};

const generateInvitationId = (): string => {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
};
