
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { supabase } from '@/integrations/supabase/client';

const firebaseConfig = {
  apiKey: "AIzaSyC2GHe8k-8ceL0ikWmkoUUILIyuQCBfWSk",
  authDomain: "wedding-f09cd.firebaseapp.com",
  projectId: "wedding-f09cd",
  storageBucket: "wedding-f09cd.firebasestorage.app",
  messagingSenderId: "1024579602427",
  appId: "1:1024579602427:web:eefb44a0779632ad88ed5e",
  measurementId: "G-N7Q3EF4796"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface Guest {
  id?: string;
  fullName: string;
  confirmationTimestamp: any;
  invitationId: string;
  status?: 'confirmed' | 'apologized';
  apologyTimestamp?: any;
  phoneNumber?: string;
}

const sendWhatsAppNotification = async (phoneNumber: string, message: string, guestName: string, type: 'confirmation' | 'apology') => {
  try {
    console.log(`Sending WhatsApp notification to ${guestName} at ${phoneNumber}`);
    
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        phoneNumber,
        message,
        guestName,
        type
      }
    });

    if (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }

    console.log('WhatsApp message sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in WhatsApp notification:', error);
    return false;
  }
};

export const confirmAttendance = async (fullName: string, phoneNumber?: string): Promise<string> => {
  try {
    const invitationId = generateInvitationId();
    const guestData = {
      fullName,
      confirmationTimestamp: serverTimestamp(),
      invitationId,
      status: 'confirmed',
      ...(phoneNumber && { phoneNumber })
    };
    
    const docRef = await addDoc(collection(db, 'guests'), guestData);
    
    if (phoneNumber) {
      const confirmationMessage = `🎉 أهلاً ${fullName}!\n\nتم تأكيد حضوركم لحفل زفافنا.\n\n📅 التاريخ: ٤ يوليو ٢٠٢٥\n📍 المكان: فندق إرث\n\nرقم الدعوة: ${invitationId}\n\nبحضوركم تكتمل فرحتنا ❤️`;
      
      await sendWhatsAppNotification(phoneNumber, confirmationMessage, fullName, 'confirmation');
    }
    
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
      const guestData = guestDoc.data();
      
      await updateDoc(doc(db, 'guests', guestDoc.id), {
        status: 'apologized',
        apologyTimestamp: serverTimestamp()
      });

      if (guestData.phoneNumber) {
        const apologyMessage = `شكراً لك ${guestData.fullName}\n\nتم استلام اعتذاركم عن حضور حفل الزفاف.\n\nنتفهم ظروفكم ونقدر تواصلكم معنا.\n\nنتمنى لكم كل الخير 🤲`;
        
        await sendWhatsAppNotification(guestData.phoneNumber, apologyMessage, guestData.fullName, 'apology');
      }
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
