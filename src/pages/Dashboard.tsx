import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { ScoreBreakdownCard } from '@/components/ScoreBreakdownCard';
import { ResultsHeader } from '@/components/ResultsHeader';
import { KeywordDensityCard } from '@/components/KeywordDensityCard';
import { ActionPlanCard } from '@/components/ActionPlanCard';
import { ResumeCopilot } from '@/components/ResumeCopilot';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
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
import type { ScoreBreakdown, LineFeedback } from '@/types/resume';

interface KeywordItem {
  keyword: string;
  jdCount: number;
  resumeCount: number;
}

export default function Dashboard() {
  const { toast } = useToast();

  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [activeTab, setActiveTab] = useState('input');

  // Results
  const [score, setScore] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [keywordDensity, setKeywordDensity] = useState<KeywordItem[]>([]);
  const [feedback, setFeedback] = useState<LineFeedback[]>([]);

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({ title: 'Missing input', description: 'Please provide both resume and job description.', variant: 'destructive' });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeText, jobDescription }
      });

      if (error) throw error;

      setScore(data.overallScore);
      setBreakdown(data.scoreBreakdown);
      setSummary(data.summary || 'Analysis complete. Review the detailed breakdown below.');
      setKeywordDensity(data.keywordDensity || []);
      setFeedback(data.feedback || []);
      setActiveTab('results');

      toast({ title: 'Analysis complete!', description: `Your ATS score is ${data.overallScore}%` });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({ title: 'Analysis failed', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNewScan = () => {
    setScore(null);
    setBreakdown(null);
    setSummary('');
    setKeywordDensity([]);
    setFeedback([]);
    setActiveTab('input');
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

  const handleUpdateResume = (newText: string) => {
    setResumeText(newText);
    toast({ title: 'Resume updated', description: 'Your resume has been updated with the AI suggestions.' });
  };

  return (
    <div className="min-h-screen bg-background">
      <AnalysisLoader isAnalyzing={analyzing} />
      <Header />
      
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
              <TabsTrigger value="results" className="flex items-center gap-2" disabled={!score}>
                <ListChecks className="w-4 h-4" />
                Results
              </TabsTrigger>
              <TabsTrigger value="copilot" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Copilot
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Resume Input */}
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-card-foreground">Resume</h2>
                  </div>
                  <FileUpload onFileContent={setResumeText} />
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
                  <Textarea
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[380px] font-mono text-sm"
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

            <TabsContent value="results" className="space-y-6">
              {score !== null && breakdown && (
                <>
                  {/* Top Section: Score + Breakdown */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <ResultsHeader 
                      score={score} 
                      summary={summary}
                      onNewScan={handleNewScan}
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
                </>
              )}
            </TabsContent>

            <TabsContent value="copilot">
              <ResumeCopilot 
                resumeText={resumeText}
                jobDescription={jobDescription}
                score={score}
                onUpdateResume={handleUpdateResume}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}