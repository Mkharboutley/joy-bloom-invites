/*
  # Wedding Invitation System Schema

  1. New Tables
    - `invitation_templates`
      - `id` (uuid, primary key)
      - `name` (text, template name)
      - `message` (text, invitation message content)
      - `media_url` (text, optional media attachment)
      - `media_type` (text, type of media: image/video/document)
      - `is_active` (boolean, whether template is active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `template_media`
      - `id` (uuid, primary key)
      - `template_id` (uuid, foreign key to invitation_templates)
      - `file_name` (text, original filename)
      - `file_path` (text, storage path)
      - `file_size` (integer, file size in bytes)
      - `mime_type` (text, file MIME type)
      - `created_at` (timestamp)

  2. Table Updates
    - Add `template_id` column to `whatsapp_contacts`
    - Add `source` column to `whatsapp_contacts` 
    - Add `selected` column to `whatsapp_contacts`

  3. Security
    - Enable RLS on all tables
    - Add policies for public access (admin functionality)
*/

-- Create invitation templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.invitation_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT, -- 'image', 'video', 'document'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'invitation_templates' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.invitation_templates ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invitation_templates' 
    AND policyname = 'Allow all operations on invitation_templates'
  ) THEN
    CREATE POLICY "Allow all operations on invitation_templates" 
      ON public.invitation_templates 
      FOR ALL 
      USING (true);
  END IF;
END $$;

-- Create media storage table for template attachments if it doesn't exist
CREATE TABLE IF NOT EXISTS public.template_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.invitation_templates(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for media if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'template_media' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.template_media ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create media policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'template_media' 
    AND policyname = 'Allow all operations on template_media'
  ) THEN
    CREATE POLICY "Allow all operations on template_media" 
      ON public.template_media 
      FOR ALL 
      USING (true);
  END IF;
END $$;

-- Add template_id column to whatsapp_contacts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_contacts' 
    AND column_name = 'template_id'
  ) THEN
    ALTER TABLE public.whatsapp_contacts 
    ADD COLUMN template_id UUID REFERENCES public.invitation_templates(id);
  END IF;
END $$;

-- Add source column to whatsapp_contacts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_contacts' 
    AND column_name = 'source'
  ) THEN
    ALTER TABLE public.whatsapp_contacts 
    ADD COLUMN source TEXT DEFAULT 'manual';
  END IF;
END $$;

-- Add selected column to whatsapp_contacts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_contacts' 
    AND column_name = 'selected'
  ) THEN
    ALTER TABLE public.whatsapp_contacts 
    ADD COLUMN selected BOOLEAN DEFAULT false;
  END IF;
END $$;