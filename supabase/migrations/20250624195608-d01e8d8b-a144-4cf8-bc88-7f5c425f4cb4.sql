
-- Create invitation templates table
CREATE TABLE public.invitation_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT, -- 'image', 'video', 'document'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.invitation_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since this is admin functionality)
CREATE POLICY "Allow all operations on invitation_templates" 
  ON public.invitation_templates 
  FOR ALL 
  USING (true);

-- Create media storage table for template attachments
CREATE TABLE public.template_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.invitation_templates(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for media
ALTER TABLE public.template_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on template_media" 
  ON public.template_media 
  FOR ALL 
  USING (true);

-- Add template_id column to whatsapp_contacts for tracking which template was used
ALTER TABLE public.whatsapp_contacts 
ADD COLUMN template_id UUID REFERENCES public.invitation_templates(id);

-- Add source column to track how contacts were added
ALTER TABLE public.whatsapp_contacts 
ADD COLUMN source TEXT DEFAULT 'manual';

-- Add selected column for bulk operations
ALTER TABLE public.whatsapp_contacts 
ADD COLUMN selected BOOLEAN DEFAULT false;
