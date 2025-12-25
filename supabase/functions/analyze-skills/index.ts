import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    console.log('Analyzing skills gap...');

    const systemPrompt = `You are an expert career advisor and skills analyst. Analyze the resume and job description to identify skills gaps and provide learning recommendations.

Extract skills from both documents and categorize them. For missing skills, provide course recommendations from popular platforms.

Return ONLY valid JSON in this exact format:
{
  "matchedSkills": [
    { "skill": "Python", "importance": "high" },
    { "skill": "SQL", "importance": "medium" }
  ],
  "requiredSkills": [
    { "skill": "Python", "importance": "high" },
    { "skill": "Machine Learning", "importance": "high" },
    { "skill": "SQL", "importance": "medium" }
  ],
  "missingSkills": [
    {
      "skill": "Machine Learning",
      "importance": "high",
      "courses": [
        {
          "platform": "Coursera",
          "title": "Machine Learning by Andrew Ng",
          "duration": "60 hours",
          "rating": 4.9,
          "price": "Free to audit",
          "url": "https://www.coursera.org/learn/machine-learning"
        },
        {
          "platform": "Udemy",
          "title": "Machine Learning A-Z",
          "duration": "44 hours",
          "rating": 4.5,
          "price": "$19.99",
          "url": "https://www.udemy.com/course/machinelearning/"
        }
      ]
    }
  ]
}

Guidelines:
- Match skills accounting for synonyms (JavaScript = JS, ML = Machine Learning)
- Importance levels: "high" (mentioned 3+ times or in requirements), "medium" (mentioned 1-2 times), "low" (nice to have)
- Include 3-5 course recommendations per missing skill from Coursera, Udemy, LinkedIn Learning, edX, Pluralsight
- Use real, popular courses that exist on these platforms
- Prioritize free or affordable options
- Include actual course URLs`;

    const userPrompt = `Analyze the skills gap between this resume and job description:

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Extract all skills, identify matches and gaps, and provide course recommendations for missing skills.`;

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

    const data = await response.json();
    console.log('AI response received');

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Clean up potential markdown code blocks
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    const result = JSON.parse(cleanedContent);
    console.log('Skills analysis complete:', {
      matched: result.matchedSkills?.length || 0,
      required: result.requiredSkills?.length || 0,
      missing: result.missingSkills?.length || 0
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-skills function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      matchedSkills: [],
      requiredSkills: [],
      missingSkills: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
