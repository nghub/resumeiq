import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, FileText, Clock, Search, Zap, Loader2, Play, Pause } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface AutomationSettings {
  id: string;
  job_title: string;
  location: string;
  experience_level: string;
  keywords_include: string[];
  keywords_exclude: string[];
  search_frequency: string;
  base_resume_text: string | null;
  base_resume_title: string | null;
  is_active: boolean;
  last_searched_at: string | null;
  jobs_found_today: number;
  jobs_found_today_reset_at: string;
}

export default function JobAutomation() {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  
  // Form state
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [keywordsInclude, setKeywordsInclude] = useState<string[]>([]);
  const [keywordsExclude, setKeywordsExclude] = useState<string[]>([]);
  const [searchFrequency, setSearchFrequency] = useState('daily');
  const [baseResumeText, setBaseResumeText] = useState<string | null>(null);
  const [baseResumeTitle, setBaseResumeTitle] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  
  // Tag input state
  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');

  // Stats
  const [weeklyJobsCount, setWeeklyJobsCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchWeeklyStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_settings')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setJobTitle(data.job_title);
        setLocation(data.location);
        setExperienceLevel(data.experience_level);
        setKeywordsInclude(data.keywords_include || []);
        setKeywordsExclude(data.keywords_exclude || []);
        setSearchFrequency(data.search_frequency);
        setBaseResumeText(data.base_resume_text);
        setBaseResumeTitle(data.base_resume_title);
        setIsActive(data.is_active);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count } = await supabase
        .from('job_drafts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .gte('created_at', weekAgo.toISOString());

      setWeeklyJobsCount(count || 0);
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
    }
  };

  const parseFile = async (file: File): Promise<string> => {
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (fileType === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return text.trim();
    } else if (fileType === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else if (fileType === 'txt') {
      return await file.text();
    }
    throw new Error('Unsupported file type');
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const text = await parseFile(file);
      setBaseResumeText(text);
      setBaseResumeTitle(file.name);
      toast.success('Resume uploaded successfully');
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse resume file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const handleAddIncludeKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && includeInput.trim()) {
      e.preventDefault();
      if (!keywordsInclude.includes(includeInput.trim())) {
        setKeywordsInclude([...keywordsInclude, includeInput.trim()]);
      }
      setIncludeInput('');
    }
  };

  const handleAddExcludeKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && excludeInput.trim()) {
      e.preventDefault();
      if (!keywordsExclude.includes(excludeInput.trim())) {
        setKeywordsExclude([...keywordsExclude, excludeInput.trim()]);
      }
      setExcludeInput('');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!jobTitle.trim() || !location.trim()) {
      toast.error('Please fill in Job Title and Location');
      return;
    }
    if (!baseResumeText) {
      toast.error('Please upload your base resume');
      return;
    }

    setSaving(true);
    try {
      const settingsData = {
        user_id: user.id,
        job_title: jobTitle,
        location,
        experience_level: experienceLevel,
        keywords_include: keywordsInclude,
        keywords_exclude: keywordsExclude,
        search_frequency: searchFrequency,
        base_resume_text: baseResumeText,
        base_resume_title: baseResumeTitle,
        is_active: isActive
      };

      if (settings) {
        const { error } = await supabase
          .from('automation_settings')
          .update(settingsData)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('automation_settings')
          .insert(settingsData)
          .select()
          .single();
        if (error) throw error;
        setSettings(data);
      }

      toast.success('Automation settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSearchNow = async () => {
    if (!settings) {
      toast.error('Please save your settings first');
      return;
    }

    if (settings.jobs_found_today >= 3) {
      toast.error('Daily limit reached (3/3). Next search: tomorrow at 9 AM');
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-jobs', {
        body: { automationId: settings.id }
      });

      if (error) throw error;

      toast.success(`Found ${data.jobsFound} new job matches!`);
      fetchSettings();
      fetchWeeklyStats();
    } catch (error) {
      console.error('Error searching jobs:', error);
      toast.error('Failed to search for jobs');
    } finally {
      setSearching(false);
    }
  };

  const toggleActive = async () => {
    if (!settings) {
      setIsActive(!isActive);
      return;
    }

    try {
      const { error } = await supabase
        .from('automation_settings')
        .update({ is_active: !isActive })
        .eq('id', settings.id);

      if (error) throw error;
      setIsActive(!isActive);
      toast.success(isActive ? 'Automation paused' : 'Automation activated');
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast.error('Failed to update automation status');
    }
  };

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
        <FileText className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Sign in to use Job Automation</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Automatically find jobs and generate ATS-optimized resumes for each match.
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

  const jobsFoundToday = settings?.jobs_found_today || 0;
  const lastSearched = settings?.last_searched_at 
    ? new Date(settings.last_searched_at)
    : null;

  const formatLastSearched = () => {
    if (!lastSearched) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastSearched.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 24) return `${Math.floor(hours / 24)} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Job Automation</h1>
              <p className="text-muted-foreground mt-1">
                Automatically find jobs and generate optimized resumes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isActive ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Play className="w-3 h-3 mr-1" /> Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Pause className="w-3 h-3 mr-1" /> Paused
                  </Badge>
                )}
              </div>
              <Switch checked={isActive} onCheckedChange={toggleActive} />
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last searched</p>
                    <p className="font-semibold">{formatLastSearched()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Jobs found today</p>
                    <p className="font-semibold">{jobsFoundToday}/3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Jobs this week</p>
                    <p className="font-semibold">{weeklyJobsCount} jobs found</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Setup Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Search Preferences</CardTitle>
              <CardDescription>
                Configure what types of jobs you're looking for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Product Manager"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Remote, San Francisco"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Search Frequency</Label>
                  <Select value={searchFrequency} onValueChange={setSearchFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="every_3_days">Every 3 Days</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Keywords to Include</Label>
                <Input
                  placeholder="Type a keyword and press Enter"
                  value={includeInput}
                  onChange={(e) => setIncludeInput(e.target.value)}
                  onKeyDown={handleAddIncludeKeyword}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywordsInclude.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {keyword}
                      <button
                        onClick={() => setKeywordsInclude(keywordsInclude.filter((_, i) => i !== index))}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Keywords to Exclude</Label>
                <Input
                  placeholder="Type a keyword and press Enter"
                  value={excludeInput}
                  onChange={(e) => setExcludeInput(e.target.value)}
                  onKeyDown={handleAddExcludeKeyword}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywordsExclude.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="gap-1 border-destructive/50 text-destructive">
                      {keyword}
                      <button
                        onClick={() => setKeywordsExclude(keywordsExclude.filter((_, i) => i !== index))}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Base Resume Upload */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Base Resume</CardTitle>
              <CardDescription>
                Upload your resume - it will be optimized for each job automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              {baseResumeTitle ? (
                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">{baseResumeTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {baseResumeText?.length} characters
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBaseResumeText(null);
                      setBaseResumeTitle(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {isDragActive
                      ? 'Drop your resume here...'
                      : 'Drag & drop your resume, or click to browse'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PDF, DOCX, TXT
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Limit Notice */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Daily Limit: 3 jobs per day</p>
                  <p className="text-sm text-muted-foreground">
                    To ensure quality matches and optimize API usage, we find up to 3 best matching jobs each day. The counter resets at midnight EST.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save & Activate'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleSearchNow}
              disabled={searching || !settings || jobsFoundToday >= 3}
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Now
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}