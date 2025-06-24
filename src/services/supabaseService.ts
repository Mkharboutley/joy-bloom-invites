
import { supabase } from '@/integrations/supabase/client';

export interface AdminContact {
  id?: string;
  name: string;
  phone_number?: string;
  email?: string;
  notification_type: 'sms' | 'push' | 'email';
  is_active: boolean;
}

export interface WhatsAppContact {
  id?: string;
  name: string;
  phone_number: string;
  is_sent: boolean;
  sent_at?: string;
}

export interface NotificationLog {
  id?: string;
  guest_name: string;
  guest_id: string;
  notification_type: 'confirmation' | 'apology';
  sent_to: string;
  sent_via: 'sms' | 'push' | 'email' | 'whatsapp';
  status: 'pending' | 'sent' | 'failed';
}

// Admin Contacts
export const getAdminContacts = async (): Promise<AdminContact[]> => {
  const { data, error } = await supabase
    .from('admin_contacts')
    .select('*')
    .eq('is_active', true);
  
  if (error) throw error;
  return data || [];
};

export const addAdminContact = async (contact: Omit<AdminContact, 'id'>): Promise<void> => {
  const { error } = await supabase
    .from('admin_contacts')
    .insert([contact]);
  
  if (error) throw error;
};

export const updateAdminContact = async (id: string, contact: Partial<AdminContact>): Promise<void> => {
  const { error } = await supabase
    .from('admin_contacts')
    .update(contact)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteAdminContact = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('admin_contacts')
    .update({ is_active: false })
    .eq('id', id);
  
  if (error) throw error;
};

// WhatsApp Contacts
export const getWhatsAppContacts = async (): Promise<WhatsAppContact[]> => {
  const { data, error } = await supabase
    .from('whatsapp_contacts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const addWhatsAppContact = async (contact: Omit<WhatsAppContact, 'id' | 'is_sent' | 'sent_at'>): Promise<void> => {
  const { error } = await supabase
    .from('whatsapp_contacts')
    .insert([{ ...contact, is_sent: false }]);
  
  if (error) throw error;
};

export const addBulkWhatsAppContacts = async (contacts: Array<Omit<WhatsAppContact, 'id' | 'is_sent' | 'sent_at'>>): Promise<void> => {
  const contactsToInsert = contacts.map(contact => ({ ...contact, is_sent: false }));
  const { error } = await supabase
    .from('whatsapp_contacts')
    .insert(contactsToInsert);
  
  if (error) throw error;
};

export const markWhatsAppContactAsSent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('whatsapp_contacts')
    .update({ is_sent: true, sent_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) throw error;
};

// Notification Logs
export const logNotification = async (log: Omit<NotificationLog, 'id'>): Promise<void> => {
  const { error } = await supabase
    .from('notification_logs')
    .insert([log]);
  
  if (error) throw error;
};

export const getNotificationLogs = async (): Promise<NotificationLog[]> => {
  const { data, error } = await supabase
    .from('notification_logs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};
