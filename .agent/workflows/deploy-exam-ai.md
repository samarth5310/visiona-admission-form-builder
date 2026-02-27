---
description: How to deploy the AI Exam Preparation system
---

To get the AI-powered exam preparation system running, follow these steps:

1. **Apply the Database Schema**
   - Head to your Supabase Dashboard -> SQL Editor.
   - Copy and paste the contents of `supabase/migrations/20251221_exam_preparation.sql`.
   - Run the query.

2. **Set up the Gemini API Key**
   - Get your API key from [Google AI Studio](https://aistudio.google.com/).
   - Open your terminal and run:
   ```bash
   supabase secrets set GEMINI_API_KEY=your_actual_key_here
   ```

3. **Deploy the Edge Function**
   - ensure you have the Supabase CLI installed.
   - Run:
   ```bash
   supabase functions deploy generate-exam-content
   ```

4. **Verify Frontend**
   - Run `npm run dev` (or use your existing dev server).
   - Go to the Student Dashboard.
   - Click "View" on "Sainik Preparation".
   - You should see the new AI Preparation Portal!

// turbo
5. Rebuild the Mobile App
   ```bash
   npm run build
   npx cap sync android
   ```
