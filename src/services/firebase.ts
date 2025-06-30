import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';

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
    
    const twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    const twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER;
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      console.error('Missing Twilio credentials');
      return false;
    }

    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    const formattedPhone = cleaned.startsWith('+') ? cleaned : '+' + cleaned;
    const whatsappPhone = `whatsapp:${formattedPhone}`;

    const twilioPayload = new URLSearchParams({
      From: twilioWhatsAppNumber,
      To: whatsappPhone,
      Body: message
    });

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: twilioPayload
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending WhatsApp message:', errorData);
      return false;
    }

    const data = await response.json();
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
      const confirmationMessage = `🎉 أهلاً ${fullName}!

تم تأكيد حضوركم لحفل زفافنا.

📅 التاريخ: ٤ يوليو ٢٠٢٥
🕰️ الوقت: ٨:٣٠ مساءً
📍 المكان: فندق إرث

رقم الدعوة: ${invitationId}

بحضوركم تكتمل فرحتنا ❤️`;
      
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
        const apologyMessage = `شكراً لك ${guestData.fullName}

تم استلام اعتذاركم عن حضور حفل الزفاف.

نتفهم ظروفكم ونقدر تواصلكم معنا.

نتمنى لكم كل الخير 🤲`;
        
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