
-- Create admin contacts table for SMS/push notifications
CREATE TABLE public.admin_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('sms', 'push', 'email')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create WhatsApp contacts table for bulk messaging
CREATE TABLE public.whatsapp_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications log table to track sent notifications
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  guest_id TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('confirmation', 'apology')),
  sent_to TEXT NOT NULL,
  sent_via TEXT NOT NULL CHECK (sent_via IN ('sms', 'push', 'email', 'whatsapp')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies (making them public for admin functionality)
ALTER TABLE public.admin_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for admin functionality
CREATE POLICY "Allow all operations on admin_contacts" ON public.admin_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on whatsapp_contacts" ON public.whatsapp_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on notification_logs" ON public.notification_logs FOR ALL USING (true) WITH CHECK (true);
