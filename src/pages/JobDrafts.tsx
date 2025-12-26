import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  ExternalLink, 
  Download, 
  Check, 
  X, 
  Loader2, 
  Briefcase,
  MapPin,
  Clock,
  Copy,
  Building2,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobDraft {
  id: string;
  job_title: string;
  company_name: string | null;
  location: string | null;
  job_description: string;
  job_url: string | null;
  ats_score: number;
  score_breakdown: Record<string, number> | unknown | null;
  original_resume: string | null;
  optimized_resume: string | null;
  status: string;
  posted_date: string | null;
  created_at: string;
}

export default function JobDrafts() {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<JobDraft[]>([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedDraft, setSelectedDraft] = useState<JobDraft | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDrafts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDrafts = async () => {
    try {
      const { data, error } = await supabase
        .from('job_drafts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Failed to load job drafts');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (draftId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_drafts')
        .update({ status: newStatus })
        .eq('id', draftId);

      if (error) throw error;

      setDrafts(drafts.map(d => d.id === draftId ? { ...d, status: newStatus } : d));
      
      if (selectedDraft?.id === draftId) {
        setSelectedDraft({ ...selectedDraft, status: newStatus });
      }
      
      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const downloadResume = (resume: string, jobTitle: string) => {
    const blob = new Blob([resume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-resume-${jobTitle.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded');
  };

  const copyResume = async (resume: string) => {
    try {
      await navigator.clipboard.writeText(resume);
      toast.success('Resume copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy resume');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (score >= 60) return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    return 'bg-red-500/10 text-red-600 border-red-500/20';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'reviewed': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'applied': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'dismissed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const filteredDrafts = drafts
    .filter(draft => filter === 'all' || draft.status === filter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'score') {
        return b.ats_score - a.ats_score;
      }
      if (sortBy === 'company') {
        return (a.company_name || '').localeCompare(b.company_name || '');
      }
      return 0;
    });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <Briefcase className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Sign in to view Job Drafts</h1>
        <p className="text-muted-foreground text-center max-w-md">
          View and manage automatically generated job applications with optimized resumes.
        </p>
        <Button onClick={signInWithGoogle} className="gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Job Drafts</h1>
              <p className="text-muted-foreground mt-1">
                {drafts.length} jobs found with optimized resumes
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="score">ATS Score</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : drafts.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No jobs found yet</h2>
                <p className="text-muted-foreground mb-4">
                  Set up job automation to start finding matching jobs automatically.
                </p>
                <Link to="/job-automation">
                  <Button>Set Up Automation</Button>
                </Link>
              </CardContent>
            </Card>
          ) : filteredDrafts.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <p className="text-muted-foreground">
                  No jobs match the current filter. Try changing your filter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {filteredDrafts.map((draft, index) => (
                  <motion.div
                    key={draft.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold">{draft.job_title}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                                  {draft.company_name && (
                                    <span className="flex items-center gap-1">
                                      <Building2 className="w-4 h-4" />
                                      {draft.company_name}
                                    </span>
                                  )}
                                  {draft.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {draft.location}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatDate(draft.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(draft.status)} variant="outline">
                              {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
                            </Badge>
                            <Badge className={getScoreColor(draft.ats_score)} variant="outline">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {draft.ats_score}% ATS
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDraft(draft);
                              setIsModalOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                          {draft.optimized_resume && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadResume(draft.optimized_resume!, draft.job_title)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download Resume
                            </Button>
                          )}
                          {draft.status !== 'applied' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(draft.id, 'applied')}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Mark as Applied
                            </Button>
                          )}
                          {draft.status !== 'dismissed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(draft.id, 'dismissed')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Dismiss
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedDraft && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedDraft.job_title}</DialogTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      {selectedDraft.company_name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {selectedDraft.company_name}
                        </span>
                      )}
                      {selectedDraft.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedDraft.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className={getScoreColor(selectedDraft.ats_score)} variant="outline">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {selectedDraft.ats_score}% ATS Match
                  </Badge>
                </div>
              </DialogHeader>

              <Tabs defaultValue="resumes" className="mt-4">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="resumes">Resumes</TabsTrigger>
                  <TabsTrigger value="job">Job Description</TabsTrigger>
                  <TabsTrigger value="score">Score Breakdown</TabsTrigger>
                </TabsList>

                <TabsContent value="resumes" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Original Resume</h4>
                      </div>
                      <ScrollArea className="h-[400px] border rounded-lg p-4 bg-muted/30">
                        <pre className="text-sm whitespace-pre-wrap font-sans">
                          {selectedDraft.original_resume || 'Original resume not available'}
                        </pre>
                      </ScrollArea>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-primary">Optimized Resume</h4>
                        <div className="flex gap-2">
                          {selectedDraft.optimized_resume && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyResume(selectedDraft.optimized_resume!)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadResume(selectedDraft.optimized_resume!, selectedDraft.job_title)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <ScrollArea className="h-[400px] border border-primary/30 rounded-lg p-4 bg-primary/5">
                        <pre className="text-sm whitespace-pre-wrap font-sans">
                          {selectedDraft.optimized_resume || 'Optimized resume not available'}
                        </pre>
                      </ScrollArea>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="job" className="mt-4">
                  <div className="flex justify-end mb-2">
                    {selectedDraft.job_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedDraft.job_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Original Posting
                        </a>
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[450px] border rounded-lg p-4 bg-muted/30">
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {selectedDraft.job_description}
                    </pre>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="score" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className={`text-6xl font-bold ${selectedDraft.ats_score >= 80 ? 'text-green-600' : selectedDraft.ats_score >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                          {selectedDraft.ats_score}%
                        </div>
                        <p className="text-muted-foreground mt-2">Overall ATS Match Score</p>
                      </div>
                    </div>
                    
                    {selectedDraft.score_breakdown && Object.keys(selectedDraft.score_breakdown).length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(selectedDraft.score_breakdown).map(([key, value]) => (
                          <Card key={key}>
                            <CardContent className="pt-4">
                              <p className="text-sm text-muted-foreground capitalize">
                                {key.replace(/_/g, ' ')}
                              </p>
                              <p className="text-2xl font-semibold">{value}%</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 mt-4 pt-4 border-t">
                {selectedDraft.status !== 'applied' && (
                  <Button onClick={() => updateStatus(selectedDraft.id, 'applied')} className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Mark as Applied
                  </Button>
                )}
                {selectedDraft.optimized_resume && (
                  <Button
                    variant="outline"
                    onClick={() => downloadResume(selectedDraft.optimized_resume!, selectedDraft.job_title)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Optimized Resume
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}