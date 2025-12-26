import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, FileText, Clock, Search, Zap, Loader2, Play, Pause, Plus, Edit2, Trash2, ArrowLeft, Briefcase } from 'lucide-react';
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

const MAX_AUTOMATIONS = 5;

export default function JobAutomation() {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState<string | null>(null);
  const [automations, setAutomations] = useState<AutomationSettings[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<AutomationSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
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
      fetchAutomations();
      fetchWeeklyStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_settings')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAutomations(data || []);
    } catch (error) {
      console.error('Error fetching automations:', error);
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

  const resetForm = () => {
    setJobTitle('');
    setLocation('');
    setExperienceLevel('mid');
    setKeywordsInclude([]);
    setKeywordsExclude([]);
    setSearchFrequency('daily');
    setBaseResumeText(null);
    setBaseResumeTitle(null);
    setIsActive(false);
    setIncludeInput('');
    setExcludeInput('');
  };

  const loadAutomationToForm = (automation: AutomationSettings) => {
    setJobTitle(automation.job_title);
    setLocation(automation.location);
    setExperienceLevel(automation.experience_level);
    setKeywordsInclude(automation.keywords_include || []);
    setKeywordsExclude(automation.keywords_exclude || []);
    setSearchFrequency(automation.search_frequency);
    setBaseResumeText(automation.base_resume_text);
    setBaseResumeTitle(automation.base_resume_title);
    setIsActive(automation.is_active);
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

      if (isEditing && selectedAutomation) {
        const { error } = await supabase
          .from('automation_settings')
          .update(settingsData)
          .eq('id', selectedAutomation.id);
        if (error) throw error;
        toast.success('Automation updated');
      } else {
        const { error } = await supabase
          .from('automation_settings')
          .insert(settingsData);
        if (error) throw error;
        toast.success('Automation created');
      }

      await fetchAutomations();
      setIsEditing(false);
      setIsCreating(false);
      setSelectedAutomation(null);
      resetForm();
    } catch (error) {
      console.error('Error saving automation:', error);
      toast.error('Failed to save automation');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('automation_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Automation deleted');
      setDeleteConfirmId(null);
      await fetchAutomations();
    } catch (error) {
      console.error('Error deleting automation:', error);
      toast.error('Failed to delete automation');
    }
  };

  const handleSearchNow = async (automation: AutomationSettings) => {
    if (automation.jobs_found_today >= 3) {
      toast.error('Daily limit reached (3/3). Next search: tomorrow at 9 AM');
      return;
    }

    setSearching(automation.id);
    try {
      const { data, error } = await supabase.functions.invoke('search-jobs', {
        body: { automationId: automation.id }
      });

      if (error) throw error;

      toast.success(`Found ${data.jobsFound} new job matches!`);
      fetchAutomations();
      fetchWeeklyStats();
    } catch (error) {
      console.error('Error searching jobs:', error);
      toast.error('Failed to search for jobs');
    } finally {
      setSearching(null);
    }
  };

  const toggleActive = async (automation: AutomationSettings) => {
    try {
      const { error } = await supabase
        .from('automation_settings')
        .update({ is_active: !automation.is_active })
        .eq('id', automation.id);

      if (error) throw error;
      
      setAutomations(automations.map(a => 
        a.id === automation.id ? { ...a, is_active: !a.is_active } : a
      ));
      toast.success(automation.is_active ? 'Automation paused' : 'Automation activated');
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast.error('Failed to update automation status');
    }
  };

  const formatLastSearched = (lastSearchedAt: string | null) => {
    if (!lastSearchedAt) return 'Never';
    const lastSearched = new Date(lastSearchedAt);
    const now = new Date();
    const diff = now.getTime() - lastSearched.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 24) return `${Math.floor(hours / 24)} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return 'Just now';
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
    setIsEditing(false);
    setSelectedAutomation(null);
  };

  const startEdit = (automation: AutomationSettings) => {
    setSelectedAutomation(automation);
    loadAutomationToForm(automation);
    setIsEditing(true);
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedAutomation(null);
    resetForm();
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

  // Show form view when creating or editing
  if (isCreating || isEditing) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button variant="ghost" onClick={cancelEdit} className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Automations
            </Button>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {isCreating ? 'Create Automation' : 'Edit Automation'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {isCreating ? 'Set up a new job search automation' : `Editing: ${selectedAutomation?.job_title}`}
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
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
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
                      <Badge key={index} variant="outline" className="gap-1 text-destructive border-destructive/30">
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

                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Limit:</span> 3 jobs per day
                </div>
              </CardContent>
            </Card>

            {/* Resume Upload */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Base Resume</CardTitle>
                <CardDescription>
                  Upload your base resume to be optimized for each job
                </CardDescription>
              </CardHeader>
              <CardContent>
                {baseResumeText ? (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">{baseResumeTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {baseResumeText.length} characters
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
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      This resume will be automatically optimized for each job found.
                    </p>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">
                      {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse (PDF, DOCX, TXT)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isCreating ? 'Create Automation' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // List view
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
              <h1 className="text-3xl font-bold text-foreground">Job Automations</h1>
              <p className="text-muted-foreground mt-1">
                {automations.length}/{MAX_AUTOMATIONS} automations configured
              </p>
            </div>
            {automations.length < MAX_AUTOMATIONS && (
              <Button onClick={startCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                New Automation
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active automations</p>
                    <p className="font-semibold">{automations.filter(a => a.is_active).length}</p>
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
                    <p className="text-sm text-muted-foreground">Total jobs today</p>
                    <p className="font-semibold">{automations.reduce((acc, a) => acc + a.jobs_found_today, 0)}/3</p>
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

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : automations.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No automations yet</h2>
                <p className="text-muted-foreground mb-4">
                  Create your first job search automation to start finding matching jobs.
                </p>
                <Button onClick={startCreate} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Automation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {automations.map((automation, index) => (
                  <motion.div
                    key={automation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{automation.job_title}</h3>
                              {automation.is_active ? (
                                <Badge className="bg-primary/10 text-primary border-primary/20">
                                  <Play className="w-3 h-3 mr-1" /> Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Pause className="w-3 h-3 mr-1" /> Paused
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span>{automation.location}</span>
                              <span>•</span>
                              <span className="capitalize">{automation.experience_level} level</span>
                              <span>•</span>
                              <span className="capitalize">{automation.search_frequency.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Last: {formatLastSearched(automation.last_searched_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Search className="w-4 h-4" />
                                {automation.jobs_found_today}/3 today
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={automation.is_active}
                              onCheckedChange={() => toggleActive(automation)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSearchNow(automation)}
                              disabled={searching === automation.id || automation.jobs_found_today >= 3}
                            >
                              {searching === automation.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Search className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(automation)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirmId(automation.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {automation.keywords_include.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {automation.keywords_include.map((kw, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {automations.length >= MAX_AUTOMATIONS && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Maximum of {MAX_AUTOMATIONS} automations reached. Delete one to create a new one.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Automation?</DialogTitle>
            <DialogDescription>
              This will permanently delete this automation and cannot be undone. Job drafts will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
