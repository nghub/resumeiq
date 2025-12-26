-- Create automation settings table
CREATE TABLE public.automation_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  location TEXT NOT NULL,
  experience_level TEXT NOT NULL DEFAULT 'mid',
  keywords_include TEXT[] DEFAULT '{}',
  keywords_exclude TEXT[] DEFAULT '{}',
  search_frequency TEXT NOT NULL DEFAULT 'daily',
  base_resume_text TEXT,
  base_resume_title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_searched_at TIMESTAMP WITH TIME ZONE,
  jobs_found_today INTEGER NOT NULL DEFAULT 0,
  jobs_found_today_reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_automation UNIQUE (user_id)
);

-- Create job drafts table
CREATE TABLE public.job_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  automation_id UUID REFERENCES public.automation_settings(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company_name TEXT,
  location TEXT,
  job_description TEXT NOT NULL,
  job_url TEXT,
  ats_score INTEGER NOT NULL DEFAULT 0,
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  original_resume TEXT,
  optimized_resume TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  posted_date TIMESTAMP WITH TIME ZONE,
  adzuna_job_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on automation_settings
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for automation_settings
CREATE POLICY "Users can view their own automation settings"
ON public.automation_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own automation settings"
ON public.automation_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automation settings"
ON public.automation_settings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own automation settings"
ON public.automation_settings
FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on job_drafts
ALTER TABLE public.job_drafts ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_drafts
CREATE POLICY "Users can view their own job drafts"
ON public.job_drafts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job drafts"
ON public.job_drafts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job drafts"
ON public.job_drafts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job drafts"
ON public.job_drafts
FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger for automation_settings
CREATE TRIGGER update_automation_settings_updated_at
BEFORE UPDATE ON public.automation_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for job_drafts
CREATE TRIGGER update_job_drafts_updated_at
BEFORE UPDATE ON public.job_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();