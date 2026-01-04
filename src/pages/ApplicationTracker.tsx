import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Kanban, 
  Settings, 
  Plus, 
  MapPin, 
  Calendar,
  Bookmark,
  Send,
  MessageSquare,
  Gift,
  XCircle,
  ExternalLink,
  GripVertical,
  Building2,
  FileCheck,
  Loader2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Types
interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  dateAdded: string;
  matchScore: number;
  resumeVersion: string;
  status: string;
  jobUrl?: string;
  description?: string;
}

type ColumnId = "bookmarked" | "applied" | "interviewing" | "offer" | "rejected";

interface Column {
  id: ColumnId;
  title: string;
  icon: React.ReactNode;
  bgColor: string;
}

const columns: Column[] = [
  { id: "bookmarked", title: "Bookmarked", icon: <Bookmark className="h-4 w-4" />, bgColor: "bg-amber-50 dark:bg-amber-950/30" },
  { id: "applied", title: "Applied", icon: <Send className="h-4 w-4" />, bgColor: "bg-blue-50 dark:bg-blue-950/30" },
  { id: "interviewing", title: "Interviewing", icon: <MessageSquare className="h-4 w-4" />, bgColor: "bg-purple-50 dark:bg-purple-950/30" },
  { id: "offer", title: "Offer", icon: <Gift className="h-4 w-4" />, bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
  { id: "rejected", title: "Rejected", icon: <XCircle className="h-4 w-4" />, bgColor: "bg-stone-100 dark:bg-stone-900/30" },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Resume Editor", icon: FileText, href: "/" },
  { label: "App Tracker", icon: Kanban, href: "/app-tracker" },
  { label: "Settings", icon: Settings, href: "/admin-settings" },
];

const resumeVersions = [
  { value: "PM_v3.pdf", label: "PM_v3.pdf" },
  { value: "Dev_v2.pdf", label: "Dev_v2.pdf" },
  { value: "Design_v1.pdf", label: "Design_v1.pdf" },
  { value: "General_v1.pdf", label: "General_v1.pdf" },
];

export default function ApplicationTracker() {
  const loc = useLocation();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draggedJob, setDraggedJob] = useState<JobApplication | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null);
  const [newJob, setNewJob] = useState({
    jobUrl: "",
    title: "",
    company: "",
    location: "",
    description: "",
    resumeVersion: "",
    status: "bookmarked" as ColumnId,
  });

  // Fetch jobs from database
  const fetchJobs = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("job_drafts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedJobs: JobApplication[] = (data || []).map((job) => ({
        id: job.id,
        title: job.job_title,
        company: job.company_name || "Unknown Company",
        location: job.location || "Remote",
        dateAdded: new Date(job.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        matchScore: job.ats_score || 0,
        resumeVersion: job.original_resume || "General_v1.pdf",
        status: job.status,
        jobUrl: job.job_url || undefined,
        description: job.job_description,
      }));

      setJobs(mappedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const getJobsByStatus = (status: string) => jobs.filter((job) => job.status === status);

  const handleAddJob = async () => {
    if (!newJob.title || !newJob.company || !user) return;

    try {
      const { data, error } = await supabase
        .from("job_drafts")
        .insert({
          user_id: user.id,
          job_title: newJob.title,
          company_name: newJob.company,
          location: newJob.location || "Remote",
          job_description: newJob.description,
          job_url: newJob.jobUrl || null,
          original_resume: newJob.resumeVersion || "General_v1.pdf",
          status: newJob.status,
          ats_score: Math.floor(Math.random() * 30) + 70,
        })
        .select()
        .single();

      if (error) throw error;

      const newJobData: JobApplication = {
        id: data.id,
        title: data.job_title,
        company: data.company_name || "Unknown Company",
        location: data.location || "Remote",
        dateAdded: new Date(data.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        matchScore: data.ats_score || 0,
        resumeVersion: data.original_resume || "General_v1.pdf",
        status: data.status,
        jobUrl: data.job_url || undefined,
        description: data.job_description,
      };

      setJobs([newJobData, ...jobs]);
      setNewJob({
        jobUrl: "",
        title: "",
        company: "",
        location: "",
        description: "",
        resumeVersion: "",
        status: "bookmarked",
      });
      setIsModalOpen(false);
      toast.success("Job added successfully");
    } catch (error) {
      console.error("Error adding job:", error);
      toast.error("Failed to add job");
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (job: JobApplication) => {
    setDraggedJob(job);
  };

  const handleDragEnd = () => {
    setDraggedJob(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedJob || draggedJob.status === columnId) {
      setDraggedJob(null);
      return;
    }

    // Optimistic update
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === draggedJob.id ? { ...job, status: columnId } : job
      )
    );

    try {
      const { error } = await supabase
        .from("job_drafts")
        .update({ status: columnId })
        .eq("id", draggedJob.id);

      if (error) throw error;

      toast.success(`Moved to ${columns.find((c) => c.id === columnId)?.title}`);
    } catch (error) {
      console.error("Error updating job status:", error);
      // Revert on error
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === draggedJob.id ? { ...job, status: draggedJob.status } : job
        )
      );
      toast.error("Failed to update job status");
    }

    setDraggedJob(null);
  };

  const handleCardClick = (job: JobApplication) => {
    setSelectedJob(job);
  };

  const handleDeleteClick = (e: React.MouseEvent, job: JobApplication) => {
    e.stopPropagation();
    setJobToDelete(job);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("job_drafts")
        .delete()
        .eq("id", jobToDelete.id);

      if (error) throw error;

      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobToDelete.id));
      toast.success("Job deleted successfully");
      
      // Close detail modal if deleting the currently viewed job
      if (selectedJob?.id === jobToDelete.id) {
        setSelectedJob(null);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    } finally {
      setIsDeleting(false);
      setJobToDelete(null);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Sign in to track your applications</h2>
          <Button asChild>
            <Link to="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">ResumeAI</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = loc.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <h1 className="text-2xl font-semibold text-foreground">Application Tracker</h1>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Job
          </Button>
        </header>

        {/* Kanban Board */}
        <main className="flex-1 overflow-x-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex gap-4 min-w-max pb-4">
              {columns.map((column) => {
                const columnJobs = getJobsByStatus(column.id);
                const isOver = dragOverColumn === column.id;
                return (
                  <div
                    key={column.id}
                    className={cn(
                      "flex flex-col w-80 rounded-xl border transition-all duration-200",
                      column.bgColor,
                      isOver ? "border-primary border-2 scale-[1.02]" : "border-border/50"
                    )}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border/30">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{column.icon}</span>
                        <h3 className="font-medium text-foreground">{column.title}</h3>
                      </div>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {columnJobs.length}
                      </Badge>
                    </div>

                    {/* Column Content */}
                    <div className="flex-1 p-3 space-y-3 min-h-[400px]">
                      {columnJobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onClick={handleCardClick}
                          onDelete={handleDeleteClick}
                          isDragging={draggedJob?.id === job.id}
                        />
                      ))}
                      {columnJobs.length === 0 && (
                        <div className={cn(
                          "flex items-center justify-center h-24 text-sm text-muted-foreground border-2 border-dashed rounded-lg transition-colors",
                          isOver ? "border-primary bg-primary/5" : "border-border/50"
                        )}>
                          Drop jobs here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Add Job Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Job</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="jobUrl">Job URL</Label>
              <div className="relative">
                <Input
                  id="jobUrl"
                  placeholder="https://..."
                  value={newJob.jobUrl}
                  onChange={(e) => setNewJob({ ...newJob, jobUrl: e.target.value })}
                  className="pr-10"
                />
                <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Product Manager"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  placeholder="e.g. Spotify"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. San Francisco, CA or Remote"
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                placeholder="Paste JD here for archival..."
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Resume Version</Label>
                <Select
                  value={newJob.resumeVersion}
                  onValueChange={(value) => setNewJob({ ...newJob, resumeVersion: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resume" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {resumeVersions.map((resume) => (
                      <SelectItem key={resume.value} value={resume.value}>
                        {resume.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newJob.status}
                  onValueChange={(value) => setNewJob({ ...newJob, status: value as ColumnId })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddJob} disabled={!newJob.title || !newJob.company}>
              Save Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Detail Modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="sm:max-w-2xl bg-card max-h-[85vh]">
          {selectedJob && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-semibold">{selectedJob.title}</DialogTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{selectedJob.company}</span>
                    </div>
                  </div>
                  <Badge className={cn(
                    "shrink-0 text-sm font-medium",
                    selectedJob.matchScore >= 90 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" :
                    selectedJob.matchScore >= 80 ? "bg-primary/10 text-primary" :
                    selectedJob.matchScore >= 70 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" :
                    "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                  )}>
                    {selectedJob.matchScore}% Match
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedJob.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Added {selectedJob.dateAdded}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileCheck className="h-4 w-4" />
                    <span>{selectedJob.resumeVersion}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Status:</span>
                  <Badge variant="secondary" className="capitalize">
                    {columns.find(c => c.id === selectedJob.status)?.title || selectedJob.status}
                  </Badge>
                </div>

                {/* Job URL */}
                {selectedJob.jobUrl && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Job URL</Label>
                    <a
                      href={selectedJob.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {selectedJob.jobUrl}
                    </a>
                  </div>
                )}

                {/* Job Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Job Description</Label>
                  <ScrollArea className="h-[250px] rounded-lg border border-border bg-muted/30 p-4">
                    {selectedJob.description ? (
                      <p className="text-sm text-foreground whitespace-pre-wrap">{selectedJob.description}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No job description available</p>
                    )}
                  </ScrollArea>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setJobToDelete(selectedJob);
                  }}
                  className="sm:mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
                {selectedJob.jobUrl && (
                  <Button asChild>
                    <a href={selectedJob.jobUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Job Posting
                    </a>
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{jobToDelete?.title}" at {jobToDelete?.company}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Job Card Component
interface JobCardProps {
  job: JobApplication;
  onDragStart: (job: JobApplication) => void;
  onDragEnd: () => void;
  onClick: (job: JobApplication) => void;
  onDelete: (e: React.MouseEvent, job: JobApplication) => void;
  isDragging: boolean;
}

function JobCard({ job, onDragStart, onDragEnd, onClick, onDelete, isDragging }: JobCardProps) {
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";
    if (score >= 80) return "bg-primary/10 text-primary";
    if (score >= 70) return "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300";
    return "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400";
  };

  return (
    <Card
      draggable
      onDragStart={() => onDragStart(job)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(job)}
      className={cn(
        "group cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 bg-card border-border/50",
        isDragging && "opacity-50 scale-95 rotate-2"
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with Drag Handle and Delete */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">{job.title}</h4>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => onDelete(e, job)}
              className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Delete job"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <Badge className={cn("text-xs font-medium", getMatchScoreColor(job.matchScore))}>
              {job.matchScore}% Match
            </Badge>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{job.location}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{job.dateAdded}</span>
          </div>
          <Badge variant="outline" className="text-xs font-normal">
            {job.resumeVersion}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
