
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
  template_id?: string;
  source?: string;
  selected?: boolean;
}

export interface InvitationTemplate {
  id?: string;
  name: string;
  message: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'document';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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
  return (data || []) as AdminContact[];
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
  return (data || []) as WhatsAppContact[];
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

export const markWhatsAppContactAsSent = async (id: string, templateId?: string): Promise<void> => {
  const updateData: any = { is_sent: true, sent_at: new Date().toISOString() };
  if (templateId) updateData.template_id = templateId;
  
  const { error } = await supabase
    .from('whatsapp_contacts')
    .update(updateData)
    .eq('id', id);
  
  if (error) throw error;
};

export const updateWhatsAppContactSelection = async (id: string, selected: boolean): Promise<void> => {
  const { error } = await supabase
    .from('whatsapp_contacts')
    .update({ selected })
    .eq('id', id);
  
  if (error) throw error;
};

export const markBulkWhatsAppContactsAsSent = async (ids: string[], templateId: string): Promise<void> => {
  const { error } = await supabase
    .from('whatsapp_contacts')
    .update({ 
      is_sent: true, 
      sent_at: new Date().toISOString(),
      template_id: templateId,
      selected: false
    })
    .in('id', ids);
  
  if (error) throw error;
};

// Invitation Templates
export const getInvitationTemplates = async (): Promise<InvitationTemplate[]> => {
  const { data, error } = await supabase
    .from('invitation_templates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as InvitationTemplate[];
};

export const addInvitationTemplate = async (template: Omit<InvitationTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const { data, error } = await supabase
    .from('invitation_templates')
    .insert([template])
    .select('id')
    .single();
  
  if (error) throw error;
  return data.id;
};

export const updateInvitationTemplate = async (id: string, template: Partial<InvitationTemplate>): Promise<void> => {
  const { error } = await supabase
    .from('invitation_templates')
    .update({ ...template, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteInvitationTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('invitation_templates')
    .update({ is_active: false })
    .eq('id', id);
  
  if (error) throw error;
};

// Contact Import from Phone
export const importContactsFromPhone = async (): Promise<WhatsAppContact[]> => {
  // This will be a placeholder for now - in a real implementation,
  // you would use the Contacts API or a third-party service
  return new Promise((resolve) => {
    if ('contacts' in navigator) {
      // Web Contacts API (limited support)
      resolve([]);
    } else {
      // Fallback - show file upload or manual entry
      resolve([]);
    }
  });
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
  return (data || []) as NotificationLog[];
};
