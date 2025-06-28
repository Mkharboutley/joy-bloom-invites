/*
  # Add 'test' to notification_type check constraint

  1. Changes
    - Modify the notification_type check constraint to include 'test' as an allowed value
    - This allows the application to send test notifications for admin functionality

  2. Security
    - No changes to RLS policies needed as they remain the same
*/

-- Drop the existing check constraint
ALTER TABLE public.notification_logs DROP CONSTRAINT notification_logs_notification_type_check;

-- Add the new check constraint that includes 'test'
ALTER TABLE public.notification_logs ADD CONSTRAINT notification_logs_notification_type_check 
  CHECK (notification_type IN ('confirmation', 'apology', 'test'));