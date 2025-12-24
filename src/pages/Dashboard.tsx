import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { ScoreGauge } from '@/components/ScoreGauge';
import { ScoreBreakdownCard } from '@/components/ScoreBreakdownCard';
import { LineFeedbackCard } from '@/components/LineFeedbackCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  Target, 
  Loader2, 
  FileText, 
  Briefcase,
  ArrowRight,
  Wand2
} from 'lucide-react';
import type { ScoreBreakdown, LineFeedback, OptimizedLine } from '@/types/resume';

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
  const [feedback, setFeedback] = useState<LineFeedback[]>([]);
  const [optimizedLines, setOptimizedLines] = useState<OptimizedLine[]>([]);

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

      setOptimizedLines(data.optimizedLines || []);
      setActiveTab('copilot');

      toast({ title: 'Rewrite complete!', description: 'Review the AI suggestions below.' });
    } catch (error: any) {
      console.error('Rewrite error:', error);
      toast({ title: 'Rewrite failed', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setRewriting(false);
    }
  };

  const handleAcceptLine = (lineId: string) => {
    setOptimizedLines(prev => 
      prev.map(line => line.id === lineId ? { ...line, accepted: true } : line)
    );
  };

  const handleRejectLine = (lineId: string) => {
    setOptimizedLines(prev => prev.filter(line => line.id !== lineId));
  };

  return (
    <div className="min-h-screen bg-background">
      <AnalysisLoader isAnalyzing={analyzing} />
      <Header />
      
      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Resume Optimizer</h1>
            <p className="text-muted-foreground mt-1">
              Upload your resume and job description to get an ATS-optimized version
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="input" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Input
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2" disabled={!score}>
                <Target className="w-4 h-4" />
                Results
              </TabsTrigger>
              <TabsTrigger value="copilot" className="flex items-center gap-2" disabled={!optimizedLines.length}>
                <Wand2 className="w-4 h-4" />
                AI Copilot
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
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <div className="bg-card rounded-xl border border-border p-6 text-center">
                        <ScoreGauge score={score} size="lg" />
                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-muted-foreground">Target: 95%</p>
                          <Button
                            variant="gradient"
                            onClick={handleRewrite}
                            disabled={rewriting || score >= 95}
                            className="w-full"
                          >
                            {rewriting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Rewriting...
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-4 h-4" />
                                Rewrite to 95%
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <ScoreBreakdownCard breakdown={breakdown} />
                    </div>
                  </div>

                  {feedback.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground">Line-by-Line Feedback</h3>
                      <div className="grid gap-4">
                        {feedback.map((item, index) => (
                          <LineFeedbackCard
                            key={item.id}
                            feedback={item}
                            index={index}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="copilot" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-card-foreground">AI Copilot Suggestions</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  Review each suggestion and accept or reject the changes. Accepted changes will be applied to your optimized resume.
                </p>
                <div className="grid gap-4">
                  {optimizedLines.map((line, index) => {
                    const matchingFeedback = feedback.find(f => f.id === line.id);
                    return matchingFeedback ? (
                      <LineFeedbackCard
                        key={line.id}
                        feedback={matchingFeedback}
                        optimized={line}
                        onAccept={handleAcceptLine}
                        onReject={handleRejectLine}
                        index={index}
                      />
                    ) : null;
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
