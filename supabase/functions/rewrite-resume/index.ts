import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Feedback item schema
const feedbackItemSchema = z.object({
  id: z.string(),
  section: z.string().optional(),
  originalText: z.string(),
  issue: z.string().optional(),
});

// Chat history message schema
const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(50000),
});

// Full rewrite mode schema
const fullRewriteSchema = z.object({
  resumeText: z.string().min(1).max(100000),
  jobDescription: z.string().min(1).max(50000),
  mode: z.literal('full_rewrite'),
});

// Chat mode schema
const chatModeSchema = z.object({
  resumeText: z.string().max(100000).optional(),
  jobDescription: z.string().max(50000).optional(),
  userMessage: z.string().min(1).max(10000),
  chatHistory: z.array(chatMessageSchema).max(50).optional(),
});

// Feedback mode schema
const feedbackModeSchema = z.object({
  resumeText: z.string().min(1).max(100000),
  jobDescription: z.string().min(1).max(50000),
  feedback: z.array(feedbackItemSchema).min(1).max(50),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Optional authentication - allow both guests and authenticated users
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      
      if (!claimsError && claimsData?.claims) {
        userId = claimsData.claims.sub as string;
        console.log('Authenticated user:', userId);
      } else {
        console.log('Guest user (invalid/no token)');
      }
    } else {
      console.log('Guest user (no auth header)');
    }
    // Parse JSON input
    let rawInput: unknown;
    try {
      rawInput = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Determine mode and validate accordingly
    const inputObj = rawInput as Record<string, unknown>;

    // Full resume rewrite mode - Target 95%+ ATS score
    if (inputObj.mode === 'full_rewrite') {
      const validationResult = fullRewriteSchema.safeParse(rawInput);
      if (!validationResult.success) {
        console.error('Input validation failed:', validationResult.error.errors);
        return new Response(JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.errors.map(e => e.message) 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { resumeText, jobDescription } = validationResult.data;

      const systemPrompt = `You are an expert Resume Writer and ATS Optimization Specialist. Your task is to completely rewrite the provided resume to achieve a 95%+ ATS (Applicant Tracking System) compatibility score against the target job description.

CRITICAL INSTRUCTIONS:
1. You MUST generate the COMPLETE resume from start to finish - do NOT stop until every section is complete
2. NEVER truncate or abbreviate - provide the full, formatted resume
3. Preserve all truthful information - do NOT fabricate experience, skills, or achievements
4. Inject ALL relevant keywords from the job description naturally throughout the resume
5. Use powerful action verbs and quantify achievements wherever possible
6. Follow modern resume best practices for formatting and structure
7. DO NOT use any markdown formatting - no asterisks (**), no hashtags (#), no underscores. Use plain text only.

REQUIRED SECTIONS (include all that apply):
- Professional Summary/Objective (tailored to the job)
- Skills (prioritize JD keywords)
- Work Experience (with quantified achievements)
- Education
- Certifications (if any)
- Projects (if relevant)

FORMAT GUIDELINES:
- Use clear section headers in UPPERCASE or Title Case (no markdown)
- Use bullet points (• or -) for achievements
- Start bullets with action verbs
- Include metrics and numbers where possible
- Keep it ATS-friendly (no tables, graphics, or fancy formatting)
- Use plain text only - NO markdown syntax like ** or ## or __

Generate the COMPLETE rewritten resume now. Do not stop until finished.`;

      console.log('Calling AI Gateway for full resume rewrite...');
      
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
            { role: 'user', content: `ORIGINAL RESUME:\n${resumeText}\n\nTARGET JOB DESCRIPTION:\n${jobDescription}\n\nRewrite this resume completely to achieve 95%+ ATS score for this job. Generate the FULL resume - do not stop until complete.` }
          ],
          max_tokens: 4000,
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

      console.log('Full resume rewrite complete. Length:', content.length);

      return new Response(JSON.stringify({ 
        rewrittenResume: content,
        response: content
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Chat mode - Resume Copilot
    if (inputObj.userMessage) {
      const validationResult = chatModeSchema.safeParse(rawInput);
      if (!validationResult.success) {
        console.error('Input validation failed:', validationResult.error.errors);
        return new Response(JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.errors.map(e => e.message) 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { resumeText, jobDescription, userMessage, chatHistory } = validationResult.data;

      const systemPrompt = `You are an expert Resume Copilot AI assistant. You help users optimize their resumes for ATS (Applicant Tracking Systems) and improve their chances of getting interviews.

Your capabilities:
1. Rewrite entire resumes or specific sections
2. Add metrics and quantifiable achievements
3. Write cover letters tailored to job descriptions
4. Fix grammar and improve language
5. Suggest improvements and optimizations
6. Answer questions about resume best practices

Context:
${resumeText ? `CURRENT RESUME:\n${resumeText}\n` : 'No resume uploaded yet.'}
${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n` : 'No job description provided.'}

Guidelines:
- Be helpful, friendly, and professional
- When rewriting, preserve truthfulness - never fabricate experience
- Use action verbs and quantify achievements where possible
- Inject relevant keywords naturally from the job description
- Keep responses concise but thorough
- If asked to rewrite the full resume, return it formatted clearly
- DO NOT use markdown formatting - no asterisks (**), no hashtags (#), no underscores (__). Use plain text only.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...(chatHistory || []).slice(-10), // Keep last 10 messages for context
        { role: 'user', content: userMessage }
      ];

      console.log('Calling AI Gateway for copilot chat...');
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages,
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

      // Check if the response contains a full resume rewrite
      const isFullRewrite = userMessage.toLowerCase().includes('rewrite resume') || 
                           userMessage.toLowerCase().includes('full resume') ||
                           userMessage.toLowerCase().includes('target 95');
      
      return new Response(JSON.stringify({ 
        response: content,
        rewrittenResume: isFullRewrite ? content : null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Original rewrite mode - batch feedback processing
    if (inputObj.feedback) {
      const validationResult = feedbackModeSchema.safeParse(rawInput);
      if (!validationResult.success) {
        console.error('Input validation failed:', validationResult.error.errors);
        return new Response(JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.errors.map(e => e.message) 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { resumeText, jobDescription, feedback } = validationResult.data;

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

      const feedbackSummary = feedback.map((f) => 
        `- ID: ${f.id}, Section: ${f.section || 'Unknown'}, Original: "${f.originalText}", Issue: ${f.issue || 'Needs improvement'}`
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
    }

    // No valid mode detected
    return new Response(JSON.stringify({ 
      error: 'Invalid request: must specify mode, userMessage, or feedback' 
    }), {
      status: 400,
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