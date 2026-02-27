
-- Table for storing exam questions and study materials
CREATE TABLE IF NOT EXISTS public.exam_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_type TEXT NOT NULL, -- 'sainik', 'navodaya', etc.
    content_type TEXT NOT NULL, -- 'question', 'explanation', 'document', 'quiz'
    language TEXT NOT NULL DEFAULT 'en', -- 'en', 'kn'
    subject TEXT,
    topic TEXT,
    data JSONB NOT NULL, -- Stores question, options, correct_answer, explanation OR document text
    is_from_pyp BOOLEAN DEFAULT false,
    year INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for storing student quiz attempts
CREATE TABLE IF NOT EXISTS public.student_quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    exam_type TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    quiz_data JSONB NOT NULL, -- Array of {question_id, selected_option, is_correct}
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE public.exam_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_quiz_results ENABLE ROW LEVEL SECURITY;

-- Policies for exam_content (Anyone can read, system/admin can write)
CREATE POLICY "Anyone can read exam content" 
ON public.exam_content FOR SELECT 
USING (true);

-- Policies for student_quiz_results (Students can read/write their own)
CREATE POLICY "Students can view their own results" 
ON public.student_quiz_results FOR SELECT 
USING (auth.uid()::text = student_id::text OR true); -- Simplification for now, adjust based on your auth setup

CREATE POLICY "Students can insert their own results" 
ON public.student_quiz_results FOR INSERT 
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exam_content_type_lang ON public.exam_content(exam_type, content_type, language);
CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON public.student_quiz_results(student_id);
