import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADZUNA_APP_ID = "cb63fe68";
const ADZUNA_API_KEY = "af2183ca6e725db420c584b25b868953";
const DAILY_LIMIT = 3;

interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  created: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { automationId } = await req.json();

    // Get automation settings
    const { data: settings, error: settingsError } = await supabase
      .from("automation_settings")
      .select("*")
      .eq("id", automationId)
      .eq("user_id", user.id)
      .single();

    if (settingsError || !settings) {
      return new Response(JSON.stringify({ error: "Automation settings not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check and reset daily counter if needed
    const today = new Date().toISOString().split("T")[0];
    let jobsFoundToday = settings.jobs_found_today;
    
    if (settings.jobs_found_today_reset_at !== today) {
      jobsFoundToday = 0;
      await supabase
        .from("automation_settings")
        .update({ 
          jobs_found_today: 0, 
          jobs_found_today_reset_at: today 
        })
        .eq("id", automationId);
    }

    // Check daily limit
    if (jobsFoundToday >= DAILY_LIMIT) {
      return new Response(JSON.stringify({ 
        error: "Daily limit reached", 
        jobsFound: 0,
        jobsFoundToday: DAILY_LIMIT,
        limit: DAILY_LIMIT
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const remainingSlots = DAILY_LIMIT - jobsFoundToday;

    // Build search query
    const searchParams = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_API_KEY,
      results_per_page: Math.min(remainingSlots, 10).toString(),
      what: settings.job_title,
      where: settings.location,
      content_type: "application/json",
    });

    // Add experience level filter
    if (settings.experience_level === "entry") {
      searchParams.append("what_or", "junior entry-level graduate");
    } else if (settings.experience_level === "senior") {
      searchParams.append("what_or", "senior lead principal");
    } else if (settings.experience_level === "director") {
      searchParams.append("what_or", "director vp head");
    }

    // Add include keywords
    if (settings.keywords_include?.length > 0) {
      searchParams.append("what_and", settings.keywords_include.join(" "));
    }

    // Add exclude keywords
    if (settings.keywords_exclude?.length > 0) {
      searchParams.append("what_exclude", settings.keywords_exclude.join(" "));
    }

    console.log("Searching Adzuna:", `https://api.adzuna.com/v1/api/jobs/us/search/1?${searchParams}`);

    // Search Adzuna
    const adzunaResponse = await fetch(
      `https://api.adzuna.com/v1/api/jobs/us/search/1?${searchParams}`
    );

    if (!adzunaResponse.ok) {
      const errorText = await adzunaResponse.text();
      console.error("Adzuna API error:", adzunaResponse.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to search jobs" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adzunaData = await adzunaResponse.json();
    const jobs: AdzunaJob[] = adzunaData.results || [];

    console.log(`Found ${jobs.length} jobs from Adzuna`);

    // Get existing job IDs to avoid duplicates
    const { data: existingDrafts } = await supabase
      .from("job_drafts")
      .select("adzuna_job_id")
      .eq("user_id", user.id);

    const existingJobIds = new Set(existingDrafts?.map(d => d.adzuna_job_id) || []);

    // Filter out duplicates and limit to remaining slots
    const newJobs = jobs
      .filter(job => !existingJobIds.has(job.id))
      .slice(0, remainingSlots);

    console.log(`Processing ${newJobs.length} new jobs`);

    // Get Lovable API key for AI processing
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process each job
    const processedJobs = [];
    for (const job of newJobs) {
      try {
        console.log(`Processing job: ${job.title} at ${job.company?.display_name}`);

        // Optimize resume using AI
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are an expert resume optimizer. Your task is to rewrite the provided resume to better match the job description while maintaining truthfulness. Do not invent experience or skills the candidate does not have.

IMPORTANT FORMATTING RULES:
- Use plain text only, no markdown formatting
- Do not use asterisks, hashes, underscores, or any special formatting characters
- Use clear section headers in ALL CAPS followed by a colon
- Use simple dashes for bullet points
- Keep formatting clean and ATS-friendly

Focus on:
1. Highlighting relevant skills and experience that match the job requirements
2. Using keywords from the job description naturally
3. Restructuring content to emphasize most relevant qualifications
4. Improving action verbs and quantifiable achievements
5. Ensuring ATS compatibility with clean formatting

Return ONLY the optimized resume text, nothing else.`,
              },
              {
                role: "user",
                content: `JOB DESCRIPTION:
${job.description}

ORIGINAL RESUME:
${settings.base_resume_text}

Please optimize this resume for the job above.`,
              },
            ],
          }),
        });

        if (!aiResponse.ok) {
          console.error("AI optimization failed:", await aiResponse.text());
          continue;
        }

        const aiData = await aiResponse.json();
        const optimizedResume = aiData.choices?.[0]?.message?.content || "";

        // Calculate ATS score
        const scoreResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are an ATS scoring expert. Analyze the resume against the job description and provide a score.

Return ONLY a JSON object with this exact format (no markdown, no code blocks):
{"overall_score": 85, "skills_match": 80, "experience_match": 90, "keyword_density": 85, "formatting": 90}

Scores should be 0-100. Be realistic and critical in scoring.`,
              },
              {
                role: "user",
                content: `JOB DESCRIPTION:
${job.description}

OPTIMIZED RESUME:
${optimizedResume}

Score this resume.`,
              },
            ],
          }),
        });

        let atsScore = 75;
        let scoreBreakdown = {};

        if (scoreResponse.ok) {
          const scoreData = await scoreResponse.json();
          const scoreText = scoreData.choices?.[0]?.message?.content || "";
          try {
            const cleanedScore = scoreText.replace(/```json\n?|\n?```/g, "").trim();
            const parsed = JSON.parse(cleanedScore);
            atsScore = parsed.overall_score || 75;
            scoreBreakdown = {
              skills_match: parsed.skills_match || 75,
              experience_match: parsed.experience_match || 75,
              keyword_density: parsed.keyword_density || 75,
              formatting: parsed.formatting || 85,
            };
          } catch (e) {
            console.error("Failed to parse score:", e);
          }
        }

        // Save to database
        const { error: insertError } = await supabase.from("job_drafts").insert({
          user_id: user.id,
          automation_id: automationId,
          job_title: job.title,
          company_name: job.company?.display_name || null,
          location: job.location?.display_name || null,
          job_description: job.description,
          job_url: job.redirect_url,
          ats_score: atsScore,
          score_breakdown: scoreBreakdown,
          original_resume: settings.base_resume_text,
          optimized_resume: optimizedResume,
          status: "new",
          posted_date: job.created,
          adzuna_job_id: job.id,
        });

        if (insertError) {
          console.error("Failed to save job draft:", insertError);
          continue;
        }

        processedJobs.push(job);
        console.log(`Saved job: ${job.title} with ATS score ${atsScore}`);
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
      }
    }

    // Update automation settings
    const newJobsFoundToday = jobsFoundToday + processedJobs.length;
    await supabase
      .from("automation_settings")
      .update({
        last_searched_at: new Date().toISOString(),
        jobs_found_today: newJobsFoundToday,
        jobs_found_today_reset_at: today,
      })
      .eq("id", automationId);

    console.log(`Completed: Found ${processedJobs.length} new jobs`);

    return new Response(
      JSON.stringify({
        success: true,
        jobsFound: processedJobs.length,
        jobsFoundToday: newJobsFoundToday,
        limit: DAILY_LIMIT,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in search-jobs function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});