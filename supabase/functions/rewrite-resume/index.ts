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
    const { resumeText, jobDescription, feedback } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert resume writer specializing in ATS optimization. Your task is to rewrite resume lines to maximize ATS compatibility while maintaining truthfulness.

Rules:
1. NEVER fabricate experience or skills
2. Inject relevant keywords naturally
3. Quantify achievements where possible
4. Use action verbs
5. Keep the core meaning intact
6. Make language more impactful

Return ONLY valid JSON in this exact format:
{
  "optimizedLines": [
    {
      "id": "same-id-from-feedback",
      "originalText": "Original line",
      "optimizedText": "Improved version",
      "accepted": false,
      "section": "Experience",
      "lineIndex": 0
    }
  ]
}`;

    const feedbackSummary = feedback.map((f: any) => 
      `- ID: ${f.id}, Section: ${f.section}, Original: "${f.originalText}", Issue: ${f.issue}`
    ).join('\n');

    const userPrompt = `RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

FEEDBACK TO ADDRESS:
${feedbackSummary}

Rewrite each line from the feedback to achieve a 95% ATS match score while preserving truthfulness.`;

    console.log('Calling AI Gateway for resume rewriting...');
    
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
        temperature: 0.4,
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
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from AI');
    }

    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }

    const rewriteResult = JSON.parse(jsonContent);
    console.log('Rewrite complete. Lines:', rewriteResult.optimizedLines?.length);

    return new Response(JSON.stringify(rewriteResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in rewrite-resume:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Rewrite failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
