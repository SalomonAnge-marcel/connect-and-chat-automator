-- Create linkedin_sessions table
CREATE TABLE IF NOT EXISTS public.linkedin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_cookies JSONB NOT NULL,
    li_at_token TEXT, -- Main LinkedIn authentication token
    jsessionid TEXT, -- Java session ID
    bcookie TEXT, -- Browser cookie
    bscookie TEXT, -- Secure browser cookie
    lang TEXT DEFAULT 'en_US',
    timezone TEXT DEFAULT 'UTC',
    csrf_token TEXT,
    session_status TEXT DEFAULT 'active' CHECK (session_status IN ('active', 'expired', 'invalid')),
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    user_agent TEXT,
    ip_address INET,
    linkedin_user_id TEXT, -- LinkedIn's internal user ID
    linkedin_profile_data JSONB, -- Store profile info like name, email, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.linkedin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy - users can only access their own sessions
CREATE POLICY "Users can manage their own LinkedIn sessions" ON public.linkedin_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_linkedin_sessions_user_id ON public.linkedin_sessions(user_id);
CREATE INDEX idx_linkedin_sessions_status ON public.linkedin_sessions(session_status);
CREATE INDEX idx_linkedin_sessions_expires_at ON public.linkedin_sessions(expires_at);

-- Create updated_at trigger
CREATE TRIGGER handle_linkedin_sessions_updated_at 
    BEFORE UPDATE ON public.linkedin_sessions
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_updated_at();