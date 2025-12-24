import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the provided resume against the job description and return a detailed JSON response.

Your analysis must include:
1. An overall ATS match score (0-100)
2. Score breakdown by category:
   - skills: How well the resume's skills match required/preferred skills (0-100)
   - experience: How relevant the work experience is (0-100)
   - keywords: How many important keywords are present (0-100)
   - roleAlignment: How well the resume aligns with the role (0-100)
3. Line-by-line feedback for improvement opportunities

Return ONLY valid JSON in this exact format:
{
  "overallScore": 72,
  "scoreBreakdown": {
    "skills": 75,
    "experience": 68,
    "keywords": 70,
    "roleAlignment": 80
  },
  "feedback": [
    {
      "id": "unique-id-1",
      "lineIndex": 0,
      "originalText": "The exact text from resume",
      "issue": "What's wrong with this line",
      "suggestion": "How to improve it",
      "scoreImpact": 5,
      "type": "keyword|vague|missing|impact",
      "section": "Summary|Experience|Skills|Education"
    }
  ]
}

Focus on actionable, specific feedback. Identify missing keywords, vague language, and opportunities to quantify achievements.`;

    const userPrompt = `RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Analyze this resume against the job description and provide the ATS score breakdown and feedback.`;

    console.log('Calling AI Gateway for resume analysis...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }

    const analysisResult = JSON.parse(jsonContent);
    console.log('Analysis complete. Score:', analysisResult.overallScore);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-resume:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Analysis failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
