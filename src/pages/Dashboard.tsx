import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { ScoreBreakdownCard } from '@/components/ScoreBreakdownCard';
import { ResultsHeader } from '@/components/ResultsHeader';
import { KeywordDensityCard } from '@/components/KeywordDensityCard';
import { SkillsGapCard } from '@/components/SkillsGapCard';
import { ActionPlanCard } from '@/components/ActionPlanCard';

import { ResumeCopilot } from '@/components/ResumeCopilot';
import { OptimizedResumePanel } from '@/components/OptimizedResumePanel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardSession } from '@/contexts/DashboardSessionContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  Loader2, 
  FileText, 
  Briefcase,
  ArrowRight,
  ListChecks,
  MessageSquare
} from 'lucide-react';

const DASHBOARD_STATE_KEY = 'resumeai_dashboard_state';
import type { ScoreBreakdown, LineFeedback } from '@/types/resume';

export default function Dashboard() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();

  // Use global context for all state
  const {
    resumeText,
    setResumeText,
    jobDescription,
    setJobDescription,
    companyName,
    setCompanyName,
    jobTitle,
    setJobTitle,
    resumeFileName,
    setResumeFileName,
    score,
    setScore,
    breakdown,
    setBreakdown,
    summary,
    setSummary,
    keywordDensity,
    setKeywordDensity,
    feedback,
    setFeedback,
    skillsGapData,
    setSkillsGapData,
    previousScore,
    setPreviousScore,
    showComparison,
    setShowComparison,
    optimizedResume,
    setOptimizedResume,
    activeTab,
    setActiveTab,
    analyzing,
    setAnalyzing,
    rewriting,
    setRewriting,
    analyzingSkills,
    setAnalyzingSkills,
    loadingScan,
    setLoadingScan,
    isAnalysisComplete,
    resetSession,
  } = useDashboardSession();

  // Load scan from URL parameter
  useEffect(() => {
    const scanId = searchParams.get('scanId');
    if (!scanId) return;

    const loadScan = async () => {
      setLoadingScan(true);
      try {
        const { data: scan, error } = await supabase
          .from('scans')
          .select(`
            *,
            resumes (raw_text, title),
            job_descriptions (raw_text, title, company)
          `)
          .eq('id', scanId)
          .maybeSingle();

        if (error) throw error;
        if (!scan) {
          toast({ title: 'Scan not found', description: 'The requested scan could not be found.', variant: 'destructive' });
          return;
        }

        // Populate state with saved scan data
        setScore(scan.overall_score);
        setBreakdown(scan.score_breakdown as unknown as ScoreBreakdown);
        setFeedback((scan.feedback as unknown as LineFeedback[]) || []);
        setSummary('Analysis loaded from history.');

        // Load resume text if available
        if (scan.resumes?.raw_text) {
          setResumeText(scan.resumes.raw_text);
        }

        // Load job description if available
        if (scan.job_descriptions?.raw_text) {
          setJobDescription(scan.job_descriptions.raw_text);
        }
        if (scan.job_descriptions?.company) {
          setCompanyName(scan.job_descriptions.company);
        }
        if (scan.job_descriptions?.title) {
          setJobTitle(scan.job_descriptions.title);
        }

        // Auto-switch to Results tab
        setActiveTab('results');
        
        toast({ title: 'Scan loaded', description: 'Viewing your saved scan results.' });
      } catch (error: any) {
        console.error('Error loading scan:', error);
        toast({ title: 'Failed to load scan', description: error.message || 'Please try again.', variant: 'destructive' });
      } finally {
        setLoadingScan(false);
      }
    };

    loadScan();
  }, [searchParams, toast, setScore, setBreakdown, setFeedback, setSummary, setResumeText, setJobDescription, setCompanyName, setJobTitle, setActiveTab, setLoadingScan]);

  // Save state to localStorage before sign-in
  const saveStateToStorage = useCallback(() => {
    const state = {
      resumeText,
      jobDescription,
      companyName,
      jobTitle,
      resumeFileName,
      score,
      breakdown,
      summary,
      keywordDensity,
      feedback,
      previousScore,
      showComparison,
      optimizedResume,
      skillsGapData,
      activeTab
    };
    localStorage.setItem(DASHBOARD_STATE_KEY, JSON.stringify(state));
  }, [resumeText, jobDescription, companyName, jobTitle, resumeFileName, score, breakdown, summary, keywordDensity, feedback, previousScore, showComparison, optimizedResume, skillsGapData, activeTab]);

  // Restore state from localStorage after login
  useEffect(() => {
    if (!authLoading && user) {
      const savedState = localStorage.getItem(DASHBOARD_STATE_KEY);
      const redirectPath = localStorage.getItem('authRedirectPath');
      
      if (savedState && redirectPath === '/dashboard') {
        try {
          const state = JSON.parse(savedState);
          if (state.resumeText) setResumeText(state.resumeText);
          if (state.jobDescription) setJobDescription(state.jobDescription);
          if (state.companyName) setCompanyName(state.companyName);
          if (state.jobTitle) setJobTitle(state.jobTitle);
          if (state.resumeFileName) setResumeFileName(state.resumeFileName);
          if (state.score !== null && state.score !== undefined) setScore(state.score);
          if (state.breakdown) setBreakdown(state.breakdown);
          if (state.summary) setSummary(state.summary);
          if (state.keywordDensity) setKeywordDensity(state.keywordDensity);
          if (state.feedback) setFeedback(state.feedback);
          if (state.previousScore !== null && state.previousScore !== undefined) setPreviousScore(state.previousScore);
          if (state.showComparison) setShowComparison(state.showComparison);
          if (state.optimizedResume) setOptimizedResume(state.optimizedResume);
          if (state.skillsGapData) setSkillsGapData(state.skillsGapData);
          if (state.activeTab) setActiveTab(state.activeTab);
          
          toast({ title: 'Welcome back!', description: 'Your analysis has been restored.' });
        } catch (e) {
          console.error('Failed to restore state:', e);
        }
        
        // Clear saved state after restoration
        localStorage.removeItem(DASHBOARD_STATE_KEY);
        localStorage.removeItem('authRedirectPath');
      }
    }
  }, [authLoading, user, toast, setResumeText, setJobDescription, setCompanyName, setJobTitle, setResumeFileName, setScore, setBreakdown, setSummary, setKeywordDensity, setFeedback, setPreviousScore, setShowComparison, setOptimizedResume, setSkillsGapData, setActiveTab]);

  // Save state before user initiates sign-in (triggered by Header component)
  useEffect(() => {
    const handleBeforeSignIn = () => {
      if (resumeText || jobDescription || score !== null) {
        saveStateToStorage();
      }
    };

    window.addEventListener('beforeSignIn', handleBeforeSignIn);
    return () => window.removeEventListener('beforeSignIn', handleBeforeSignIn);
  }, [saveStateToStorage, resumeText, jobDescription, score]);

  // Save scan to history for logged-in users
  const saveScanToHistory = useCallback(async (
    overallScore: number,
    scoreBreakdown: ScoreBreakdown,
    feedbackData: LineFeedback[],
    resumeTitle?: string,
    jobTitleParam?: string,
    company?: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('scans').insert({
        user_id: user.id,
        overall_score: overallScore,
        score_breakdown: scoreBreakdown as any,
        feedback: feedbackData as any,
        status: 'completed'
      });

      if (error) {
        console.error('Failed to save scan:', error);
      }
    } catch (error) {
      console.error('Error saving scan to history:', error);
    }
  }, [user]);

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({ title: 'Missing input', description: 'Please provide both resume and job description.', variant: 'destructive' });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeText, jobDescription, companyName: companyName.trim() || undefined, jobTitle: jobTitle.trim() || undefined }
      });

      if (error) throw error;

      setScore(data.overallScore);
      setBreakdown(data.scoreBreakdown);
      setSummary(data.summary || 'Analysis complete. Review the detailed breakdown below.');
      setKeywordDensity(data.keywordDensity || []);
      setFeedback(data.feedback || []);
      setActiveTab('results');

      // Save to history if user is logged in
      await saveScanToHistory(
        data.overallScore,
        data.scoreBreakdown,
        data.feedback || []
      );

      toast({ title: 'Analysis complete!', description: `Your ATS score is ${data.overallScore}%` });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({ title: 'Analysis failed', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNewScan = () => {
    resetSession();
  };

  const handleAnalyzeSkills = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({ title: 'Missing input', description: 'Please provide both resume and job description.', variant: 'destructive' });
      return;
    }

    setAnalyzingSkills(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-skills', {
        body: { resumeText, jobDescription }
      });

      if (error) throw error;

      setSkillsGapData(data);
      toast({ title: 'Skills analysis complete!', description: 'Review your skills gap and course recommendations.' });
    } catch (error: any) {
      console.error('Skills analysis error:', error);
      toast({ title: 'Skills analysis failed', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setAnalyzingSkills(false);
    }
  };

  const handleRewrite = async () => {
    if (!feedback.length) {
      toast({ title: 'No feedback', description: 'Please analyze your resume first.', variant: 'destructive' });
      return;
    }

    setRewriting(true);
    try {
      const { data, error } = await supabase.functions.invoke('rewrite-resume', {
        body: { resumeText, jobDescription, feedback }
      });

      if (error) throw error;

      toast({ title: 'Rewrite complete!', description: 'Review the AI suggestions in the action plan.' });
    } catch (error: any) {
      console.error('Rewrite error:', error);
      toast({ title: 'Rewrite failed', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setRewriting(false);
    }
  };

  // Re-analyze resume after copilot updates it to get new ATS score
  const handleUpdateResume = async (newText: string, isFullRewrite?: boolean) => {
    // Store the optimized resume if it's a full rewrite
    if (isFullRewrite) {
      setOptimizedResume(newText);
    }
    setResumeText(newText);

    // Store the old score before re-analysis
    const oldScore = score;

    // Re-analyze the updated resume (silently in background for copilot rewrites)
    if (jobDescription.trim()) {
      // Don't show loader for full rewrites - keep copilot visible
      if (!isFullRewrite) {
        setAnalyzing(true);
      }
      try {
        const { data, error } = await supabase.functions.invoke('analyze-resume', {
          body: { resumeText: newText, jobDescription }
        });

        if (error) throw error;

        // Show comparison if we had a previous score
        if (oldScore !== null) {
          setPreviousScore(oldScore);
          setShowComparison(true);
        }

        setScore(data.overallScore);
        setBreakdown(data.scoreBreakdown);
        setSummary(data.summary || 'Analysis complete. Review the detailed breakdown below.');
        setKeywordDensity(data.keywordDensity || []);
        setFeedback(data.feedback || []);
        
        // Don't redirect to results for full rewrites - stay on copilot
        if (!isFullRewrite) {
          setActiveTab('results');
        }

        // Save updated scan to history
        await saveScanToHistory(
          data.overallScore,
          data.scoreBreakdown,
          data.feedback || []
        );

        toast({ title: 'Score updated!', description: `Your new ATS score is ${data.overallScore}%` });
      } catch (error: any) {
        console.error('Re-analysis error:', error);
        toast({ title: 'Score update failed', description: 'Resume was updated but score refresh failed.', variant: 'destructive' });
      } finally {
        if (!isFullRewrite) {
          setAnalyzing(false);
        }
      }
    }
  };

  const handleDismissComparison = () => {
    setShowComparison(false);
    setPreviousScore(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <AnalysisLoader isAnalyzing={analyzing || loadingScan} />
      
      <main className="container py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Resume Optimizer</h1>
            <p className="text-muted-foreground mt-1">
              Upload your resume and job description to get an ATS-optimized analysis
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="input" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Input
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2" disabled={!isAnalysisComplete}>
                <ListChecks className="w-4 h-4" />
                Results
              </TabsTrigger>
              <TabsTrigger value="copilot" className="flex items-center gap-2" disabled={!isAnalysisComplete}>
                <MessageSquare className="w-4 h-4" />
                Copilot
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" forceMount className={`space-y-6 ${activeTab !== 'input' ? 'hidden' : ''}`}>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Resume Input */}
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-card-foreground">Resume</h2>
                  </div>
                  <FileUpload 
                    onFileContent={setResumeText}
                    fileName={resumeFileName}
                    onFileNameChange={setResumeFileName}
                  />
                  <div className="relative">
                    <Textarea
                      placeholder="Or paste your resume text here..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      className="min-h-[300px] font-mono text-sm"
                    />
                    {resumeText && (
                      <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                        {resumeText.length} characters
                      </span>
                    )}
                  </div>
                </div>

                {/* Job Description Input */}
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-card-foreground">Job Description</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label htmlFor="companyName" className="text-sm text-muted-foreground">
                        Company Name <span className="text-xs">(optional)</span>
                      </label>
                      <input
                        id="companyName"
                        type="text"
                        placeholder="e.g., Google, Microsoft..."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="jobTitle" className="text-sm text-muted-foreground">
                        Job Title <span className="text-xs">(optional)</span>
                      </label>
                      <input
                        id="jobTitle"
                        type="text"
                        placeholder="e.g., Senior Software Engineer..."
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <Textarea
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[340px] font-mono text-sm"
                  />
                  {jobDescription && (
                    <span className="text-xs text-muted-foreground">
                      {jobDescription.length} characters
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  variant="gradient"
                  onClick={handleAnalyze}
                  disabled={analyzing || !resumeText.trim() || !jobDescription.trim()}
                  className="min-w-[200px]"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Resume
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="results" forceMount className={`space-y-6 ${activeTab !== 'results' ? 'hidden' : ''}`}>
              {score !== null && breakdown && (
                <>
                  {/* Top Section: Score + Breakdown */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <ResultsHeader 
                      score={score} 
                      summary={summary}
                      onNewScan={handleNewScan}
                      previousScore={previousScore}
                      showComparison={showComparison}
                      onDismissComparison={handleDismissComparison}
                    />
                    <ScoreBreakdownCard breakdown={breakdown} />
                  </div>

                  {/* Action Plan + Keyword Density Side by Side */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Prioritized Action Plan - Left */}
                    {feedback.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ListChecks className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Prioritized Action Plan</h3>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab('copilot')}
                            className="text-xs"
                            disabled={!isAnalysisComplete}
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Open Resume Rewriter
                          </Button>
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                          {feedback.map((item, index) => (
                            <ActionPlanCard
                              key={item.id}
                              feedback={item}
                              index={index}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keyword Density - Right */}
                    {keywordDensity.length > 0 && (
                      <KeywordDensityCard keywords={keywordDensity} />
                    )}
                  </div>

                  {/* Skills Gap Analysis - Full Width */}
                  <SkillsGapCard 
                    data={skillsGapData}
                    isLoading={analyzingSkills}
                    onAnalyze={handleAnalyzeSkills}
                  />

                </>
              )}
            </TabsContent>

            <TabsContent value="copilot" forceMount className={activeTab !== 'copilot' ? 'hidden' : ''}>
              <div className="grid lg:grid-cols-2 gap-6">
                <ResumeCopilot 
                  resumeText={resumeText}
                  jobDescription={jobDescription}
                  score={score}
                  onUpdateResume={handleUpdateResume}
                />
                {optimizedResume && (
                  <OptimizedResumePanel 
                    resumeText={optimizedResume}
                    score={score}
                    previousScore={previousScore}
                    onClose={() => setOptimizedResume('')}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Show optimized resume panel on other tabs too */}
          {optimizedResume && activeTab !== 'copilot' && (
            <div className="mt-6">
              <OptimizedResumePanel 
                resumeText={optimizedResume}
                onClose={() => setOptimizedResume('')}
              />
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
