-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Industry profiles table
CREATE TABLE public.industry_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  top_k INTEGER DEFAULT 5 CHECK (top_k > 0),
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data sources table
CREATE TABLE public.data_sources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  industry_profile_id UUID REFERENCES public.industry_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('file', 'url', 'text')),
  content TEXT,
  file_path TEXT,
  url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document chunks table for vector storage
CREATE TABLE public.document_chunks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  data_source_id UUID REFERENCES public.data_sources(id) ON DELETE CASCADE,
  industry_profile_id UUID REFERENCES public.industry_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimensions
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE public.chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  industry_profile_id UUID REFERENCES public.industry_profiles(id) ON DELETE SET NULL,
  title TEXT,
  use_rag BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_industry_profiles_created_by ON public.industry_profiles(created_by);
CREATE INDEX idx_data_sources_industry_profile_id ON public.data_sources(industry_profile_id);
CREATE INDEX idx_data_sources_created_by ON public.data_sources(created_by);
CREATE INDEX idx_document_chunks_data_source_id ON public.document_chunks(data_source_id);
CREATE INDEX idx_document_chunks_industry_profile_id ON public.document_chunks(industry_profile_id);
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_industry_profile_id ON public.chat_sessions(industry_profile_id);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);

-- Vector similarity search index
CREATE INDEX ON public.document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Industry profiles policies
CREATE POLICY "Anyone can view industry profiles" ON public.industry_profiles
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage industry profiles" ON public.industry_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Data sources policies
CREATE POLICY "Anyone can view data sources" ON public.data_sources
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage data sources" ON public.data_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Document chunks policies
CREATE POLICY "Anyone can view document chunks" ON public.document_chunks
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage document chunks" ON public.document_chunks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Chat sessions policies
CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions" ON public.chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view messages from own sessions" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own sessions" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in own sessions" ON public.chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from own sessions" ON public.chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_industry_profiles_updated_at BEFORE UPDATE ON public.industry_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON public.data_sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  filter JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE 
    (filter->>'industry_profile_id' IS NULL OR 
     document_chunks.industry_profile_id = (filter->>'industry_profile_id')::UUID)
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
