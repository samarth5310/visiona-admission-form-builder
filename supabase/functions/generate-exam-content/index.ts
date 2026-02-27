
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload = await req.json()
        const { examType, contentType, language, topic, count = 5 } = payload

        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
        if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not found in Supabase secrets')

        // Using Stable v1 API and 1.5-flash (or 2.0-flash-exp if you prefer)
        const model = "gemini-1.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        console.log(`Calling Gemini API v1 for ${model}...`)

        const prompt = contentType === 'quiz'
            ? `Generate a ${count} question quiz for the ${examType} entrance exam in ${language === 'kn' ? 'Kannada' : 'English'}. Topic: ${topic || 'General'}. Return raw JSON array of objects with keys: question, options (array of 4), correct_answer (index 0-3), and explanation.`
            : `Create study notes for ${examType} ${topic} in ${language}. Return JSON: { "title": "...", "content": "Markdown", "key_points": [] }`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.7
                }
            })
        })

        const result = await response.json()

        if (result.error) {
            throw new Error(`Google AI API Error: ${result.error.message}`);
        }

        const rawText = result.candidates[0].content.parts[0].text
        let content = JSON.parse(rawText)

        // Handle common AI wrapping patterns
        if (!Array.isArray(content) && content.questions && Array.isArray(content.questions)) {
            content = content.questions;
        } else if (!Array.isArray(content) && content.quiz && Array.isArray(content.quiz)) {
            content = content.quiz;
        }

        return new Response(JSON.stringify(content), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error("Critical Error:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
