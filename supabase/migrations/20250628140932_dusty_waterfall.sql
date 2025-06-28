/*
  # Add WhatsApp to notification types

  1. Changes
    - Drop existing check constraint on admin_contacts.notification_type
    - Add new check constraint that includes 'whatsapp' as a valid notification type
    - Update notification_logs table constraint to include 'whatsapp' as well

  2. Security
    - Maintains existing RLS policies
    - No changes to permissions or access control
*/

-- Drop the existing check constraint on admin_contacts
ALTER TABLE public.admin_contacts DROP CONSTRAINT IF EXISTS admin_contacts_notification_type_check;

-- Add new check constraint that includes 'whatsapp'
ALTER TABLE public.admin_contacts ADD CONSTRAINT admin_contacts_notification_type_check
  CHECK (notification_type IN ('sms', 'push', 'email', 'whatsapp'));

-- Also update notification_logs table to allow 'test' notification type (used in the code)
ALTER TABLE public.notification_logs DROP CONSTRAINT IF EXISTS notification_logs_notification_type_check;
ALTER TABLE public.notification_logs ADD CONSTRAINT notification_logs_notification_type_check
  CHECK (notification_type IN ('confirmation', 'apology', 'test'));