
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('patient', 'professional');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create patient_professional_links table
CREATE TABLE public.patient_professional_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (patient_id, professional_id)
);
ALTER TABLE public.patient_professional_links ENABLE ROW LEVEL SECURITY;

-- Create mood_entries table
CREATE TABLE public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  sleep_hours NUMERIC(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  exercise_minutes INTEGER CHECK (exercise_minutes >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, entry_date)
);
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Create treatment_notes table
CREATE TABLE public.treatment_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note_type TEXT NOT NULL CHECK (note_type IN ('medication', 'intervention', 'session')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.treatment_notes ENABLE ROW LEVEL SECURITY;

-- Create finnish_health_cache table
CREATE TABLE public.finnish_health_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  indicator_id INTEGER NOT NULL,
  indicator_name TEXT NOT NULL,
  region TEXT,
  year INTEGER NOT NULL,
  value NUMERIC,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (indicator_id, region, year)
);
ALTER TABLE public.finnish_health_cache ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mood_entries_updated_at BEFORE UPDATE ON public.mood_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_treatment_notes_updated_at BEFORE UPDATE ON public.treatment_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Patient-professional links
CREATE POLICY "Professionals can view own links" ON public.patient_professional_links
  FOR SELECT USING (auth.uid() = professional_id);
CREATE POLICY "Patients can view own links" ON public.patient_professional_links
  FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Professionals can create links" ON public.patient_professional_links
  FOR INSERT WITH CHECK (auth.uid() = professional_id AND public.has_role(auth.uid(), 'professional'));
CREATE POLICY "Professionals can delete links" ON public.patient_professional_links
  FOR DELETE USING (auth.uid() = professional_id AND public.has_role(auth.uid(), 'professional'));

-- Mood entries
CREATE POLICY "Users can view own mood entries" ON public.mood_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Professionals can view linked patient mood entries" ON public.mood_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patient_professional_links
      WHERE patient_id = mood_entries.user_id AND professional_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own mood entries" ON public.mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood entries" ON public.mood_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mood entries" ON public.mood_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Treatment notes
CREATE POLICY "Professionals can view own treatment notes" ON public.treatment_notes
  FOR SELECT USING (auth.uid() = professional_id);
CREATE POLICY "Patients can view their treatment notes" ON public.treatment_notes
  FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Professionals can insert treatment notes" ON public.treatment_notes
  FOR INSERT WITH CHECK (
    auth.uid() = professional_id
    AND public.has_role(auth.uid(), 'professional')
    AND EXISTS (
      SELECT 1 FROM public.patient_professional_links
      WHERE patient_id = treatment_notes.patient_id AND professional_id = auth.uid()
    )
  );
CREATE POLICY "Professionals can update own treatment notes" ON public.treatment_notes
  FOR UPDATE USING (auth.uid() = professional_id);

-- Finnish health cache (public read)
CREATE POLICY "Anyone can read finnish health cache" ON public.finnish_health_cache
  FOR SELECT USING (true);
CREATE POLICY "Only service role can insert health cache" ON public.finnish_health_cache
  FOR INSERT WITH CHECK (false);
CREATE POLICY "Only service role can update health cache" ON public.finnish_health_cache
  FOR UPDATE USING (false);

-- Indexes for performance
CREATE INDEX idx_mood_entries_user_date ON public.mood_entries (user_id, entry_date DESC);
CREATE INDEX idx_treatment_notes_patient ON public.treatment_notes (patient_id, created_at DESC);
CREATE INDEX idx_patient_links_professional ON public.patient_professional_links (professional_id);
CREATE INDEX idx_patient_links_patient ON public.patient_professional_links (patient_id);
CREATE INDEX idx_finnish_health_indicator ON public.finnish_health_cache (indicator_id, year);
