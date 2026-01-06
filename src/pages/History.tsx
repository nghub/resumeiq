import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, FileText, Calendar, TrendingUp, LogIn, Search, LayoutGrid, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { JobDetailsDialog, JobDetails } from '@/components/JobDetailsDialog';

interface ScanHistory {
  id: string;
  created_at: string;
  overall_score: number;
  status: string;
  job_descriptions: {
    title: string;
    company: string | null;
    raw_text?: string | null;
  } | null;
  resumes: {
    title: string;
  } | null;
  trackStatus: TrackerStatus;
  isTracked: boolean;
}

type TrackerStatus = 'bookmarked' | 'applied' | 'interviewing' | 'offer' | 'rejected';

const trackerStatusOptions: { value: TrackerStatus; label: string }[] = [
  { value: 'bookmarked', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
];

type SortOption = 'date-newest' | 'score-highest';

export default function History() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-newest');
  const [trackedScanIds, setTrackedScanIds] = useState<Set<string>>(new Set());
  const [trackingInProgress, setTrackingInProgress] = useState<Set<string>>(new Set());
  const [selectedScan, setSelectedScan] = useState<ScanHistory | null>(null);

  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchTrackedJobs();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('scans')
      .select(`
        id,
        created_at,
        overall_score,
        status,
        job_descriptions (title, company, raw_text),
        resumes (title)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      const scansWithStatus = data.map((scan) => ({
        ...scan,
        trackStatus: 'bookmarked' as TrackerStatus,
        isTracked: false,
      }));
      setScans(scansWithStatus as ScanHistory[]);
    }
    setLoading(false);
  };

  const fetchTrackedJobs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('job_drafts')
      .select('id')
      .eq('user_id', user.id);
    
    if (data) {
      setTrackedScanIds(new Set(data.map((job) => job.id)));
    }
  };

  const handleStatusChange = (scanId: string, newStatus: TrackerStatus) => {
    setScans((prev) =>
      prev.map((scan) =>
        scan.id === scanId ? { ...scan, trackStatus: newStatus } : scan
      )
    );
  };

  const handleTrackJob = async (scan: ScanHistory) => {
    if (!user) return;

    setTrackingInProgress((prev) => new Set(prev).add(scan.id));

    try {
      const { error } = await supabase.from('job_drafts').insert({
        user_id: user.id,
        job_title: scan.job_descriptions?.title || 'Unknown Position',
        company_name: scan.job_descriptions?.company || 'Unknown Company',
        job_description: '',
        status: scan.trackStatus,
        ats_score: scan.overall_score,
      });

      if (error) throw error;

      setScans((prev) =>
        prev.map((s) => (s.id === scan.id ? { ...s, isTracked: true } : s))
      );
      toast.success('Job added to Application Tracker');
    } catch (error) {
      console.error('Error tracking job:', error);
      toast.error('Failed to add job to tracker');
    } finally {
      setTrackingInProgress((prev) => {
        const next = new Set(prev);
        next.delete(scan.id);
        return next;
      });
    }
  };

  // Convert scan to JobDetails for dialog
  const scanToJobDetails = (scan: ScanHistory): JobDetails => ({
    id: scan.id,
    title: scan.job_descriptions?.title || 'Unknown Position',
    company: scan.job_descriptions?.company || 'Unknown Company',
    location: 'Remote',
    dateAdded: format(new Date(scan.created_at), 'MMM d, yyyy'),
    matchScore: scan.overall_score,
    resumeVersion: scan.resumes?.title || 'Unknown Resume',
    status: scan.trackStatus,
    description: scan.job_descriptions?.raw_text || undefined,
  });

  const handleCardClick = (scan: ScanHistory) => {
    setSelectedScan(scan);
  };

  const filteredAndSortedScans = useMemo(() => {
    let result = [...scans];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (scan) =>
          scan.job_descriptions?.title?.toLowerCase().includes(query) ||
          scan.job_descriptions?.company?.toLowerCase().includes(query) ||
          scan.resumes?.title?.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortOption === 'date-newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOption === 'score-highest') {
      result.sort((a, b) => b.overall_score - a.overall_score);
    }

    return result;
  }, [scans, searchQuery, sortOption]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-16 max-w-2xl">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Sign in to View History</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sign in with Google to save your resume scans and access them anytime.
            </p>
            <Button size="lg" onClick={signInWithGoogle} className="gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Scan History</h1>
            <p className="text-muted-foreground mt-1">
              View your past resume scans and scores
            </p>
          </div>

          {/* Control Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by company or job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-newest">Date (Newest)</SelectItem>
                <SelectItem value="score-highest">Score (Highest)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredAndSortedScans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {scans.length === 0 ? 'No scans yet' : 'No results found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {scans.length === 0 ? 'Start by scanning your first resume' : 'Try adjusting your search'}
                </p>
                {scans.length === 0 && (
                  <Link to="/dashboard">
                    <Button>Go to Dashboard</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedScans.map((scan, index) => {
                const isTracking = trackingInProgress.has(scan.id);
                const isAlreadyTracked = scan.isTracked;

                return (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleCardClick(scan)}
                    className="cursor-pointer"
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <FileText className="w-5 h-5 text-primary shrink-0" />
                              <Link
                                to={`/dashboard?scanId=${scan.id}`}
                                className="font-semibold text-foreground hover:text-primary transition-colors truncate"
                              >
                                {scan.resumes?.title || 'Untitled Resume'}
                              </Link>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {scan.job_descriptions?.title || 'Unknown Position'}
                              {scan.job_descriptions?.company && ` at ${scan.job_descriptions.company}`}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(scan.created_at), 'MMM d, yyyy h:mm a')}
                              </div>
                              <Select
                                value={scan.trackStatus}
                                onValueChange={(v) => handleStatusChange(scan.id, v as TrackerStatus)}
                                disabled={isAlreadyTracked}
                              >
                                <SelectTrigger className="h-7 w-28 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {trackerStatusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`text-3xl font-bold ${getScoreColor(scan.overall_score)}`}>
                                {scan.overall_score}%
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <TrendingUp className="w-3 h-3" />
                                ATS Score
                              </div>
                            </div>
                            <Button
                              variant={isAlreadyTracked ? 'secondary' : 'outline'}
                              size="icon"
                              onClick={() => handleTrackJob(scan)}
                              disabled={isTracking || isAlreadyTracked}
                              title={isAlreadyTracked ? 'Already tracked' : 'Add to App Tracker'}
                            >
                              {isTracking ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isAlreadyTracked ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <LayoutGrid className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Job Details Dialog */}
      {selectedScan && (
        <JobDetailsDialog
          job={scanToJobDetails(selectedScan)}
          open={!!selectedScan}
          onOpenChange={(open) => !open && setSelectedScan(null)}
          statusLabels={{
            bookmarked: 'Saved',
            applied: 'Applied',
            interviewing: 'Interview',
            offer: 'Offer',
            rejected: 'Rejected',
          }}
        />
      )}
    </div>
  );
}
