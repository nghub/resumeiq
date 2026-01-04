import { useState } from "react";
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
  X,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

// Mock Data
const initialJobs: JobApplication[] = [
  {
    id: "1",
    title: "Senior Product Manager",
    company: "Spotify",
    location: "New York, NY",
    dateAdded: "Dec 28, 2025",
    matchScore: 92,
    resumeVersion: "PM_v3.pdf",
    status: "bookmarked",
  },
  {
    id: "2",
    title: "Frontend Developer",
    company: "Vercel",
    location: "Remote",
    dateAdded: "Dec 30, 2025",
    matchScore: 88,
    resumeVersion: "Dev_v2.pdf",
    status: "applied",
  },
  {
    id: "3",
    title: "UX Designer",
    company: "Figma",
    location: "San Francisco, CA",
    dateAdded: "Jan 2, 2026",
    matchScore: 85,
    resumeVersion: "Design_v1.pdf",
    status: "interviewing",
  },
  {
    id: "4",
    title: "Software Engineer",
    company: "Stripe",
    location: "Seattle, WA",
    dateAdded: "Jan 3, 2026",
    matchScore: 78,
    resumeVersion: "Dev_v2.pdf",
    status: "bookmarked",
  },
];

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
  const location = useLocation();
  const [jobs, setJobs] = useState<JobApplication[]>(initialJobs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    jobUrl: "",
    title: "",
    company: "",
    location: "",
    description: "",
    resumeVersion: "",
    status: "bookmarked" as ColumnId,
  });

  const getJobsByStatus = (status: string) => jobs.filter((job) => job.status === status);

  const handleAddJob = () => {
    if (!newJob.title || !newJob.company) return;
    
    const job: JobApplication = {
      id: Date.now().toString(),
      title: newJob.title,
      company: newJob.company,
      location: newJob.location || "Remote",
      dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      matchScore: Math.floor(Math.random() * 30) + 70,
      resumeVersion: newJob.resumeVersion || "General_v1.pdf",
      status: newJob.status,
      jobUrl: newJob.jobUrl,
      description: newJob.description,
    };
    
    setJobs([...jobs, job]);
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
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">ResumeAI</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
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
          <div className="flex gap-4 min-w-max pb-4">
            {columns.map((column) => {
              const columnJobs = getJobsByStatus(column.id);
              return (
                <div
                  key={column.id}
                  className={cn(
                    "flex flex-col w-80 rounded-xl border border-border/50",
                    column.bgColor
                  )}
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
                      <JobCard key={job.id} job={job} />
                    ))}
                    {columnJobs.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-sm text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
                        Drop jobs here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
    </div>
  );
}

// Job Card Component
function JobCard({ job }: { job: JobApplication }) {
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";
    if (score >= 80) return "bg-primary/10 text-primary";
    if (score >= 70) return "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300";
    return "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400";
  };

  return (
    <Card className="group cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 bg-card border-border/50">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">{job.title}</h4>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
          <Badge className={cn("shrink-0 text-xs font-medium", getMatchScoreColor(job.matchScore))}>
            {job.matchScore}% Match
          </Badge>
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
