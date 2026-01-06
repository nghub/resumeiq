import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  Calendar,
  FileCheck,
  Building2,
  ExternalLink,
  Pencil,
  X,
  Save,
  Loader2,
  Trash2,
  Link as LinkIcon,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface JobDetails {
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

interface JobDetailsDialogProps {
  job: JobDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (job: JobDetails) => Promise<void>;
  onDelete?: (job: JobDetails) => void;
  statusLabels?: Record<string, string>;
}

const defaultStatusLabels: Record<string, string> = {
  bookmarked: "Bookmarked",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

export function JobDetailsDialog({
  job,
  open,
  onOpenChange,
  onSave,
  onDelete,
  statusLabels = defaultStatusLabels,
}: JobDetailsDialogProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedJob, setEditedJob] = useState<JobDetails | null>(null);

  useEffect(() => {
    if (job) {
      setEditedJob({ ...job });
      setIsEditMode(false);
    }
  }, [job]);

  if (!job || !editedJob) return null;

  const handleSave = async () => {
    if (!onSave || !editedJob) return;
    
    setIsSaving(true);
    try {
      await onSave(editedJob);
      setIsEditMode(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedJob({ ...job });
    setIsEditMode(false);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";
    if (score >= 80) return "bg-primary/10 text-primary";
    if (score >= 70) return "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300";
    return "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1 min-w-0">
              {isEditMode ? (
                <div className="space-y-3">
                  <Input
                    value={editedJob.title}
                    onChange={(e) => setEditedJob({ ...editedJob, title: e.target.value })}
                    placeholder="Job Title"
                    className="text-xl font-semibold"
                  />
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      value={editedJob.company}
                      onChange={(e) => setEditedJob({ ...editedJob, company: e.target.value })}
                      placeholder="Company Name"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <DialogTitle className="text-xl font-semibold truncate">
                    {job.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{job.company}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className={cn("text-sm font-medium", getMatchScoreColor(job.matchScore))}>
                {job.matchScore}% Match
              </Badge>
              {!isEditMode && onSave && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditMode(true)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            {isEditMode ? (
              <div className="flex items-center gap-2 flex-1">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  value={editedJob.location}
                  onChange={(e) => setEditedJob({ ...editedJob, location: e.target.value })}
                  placeholder="Location"
                  className="h-8"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Added {job.dateAdded}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileCheck className="h-4 w-4" />
              <span>{job.resumeVersion}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Status:</span>
            <Badge variant="secondary" className="capitalize">
              {statusLabels[job.status] || job.status}
            </Badge>
          </div>

          {/* Job URL */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Job Link
            </Label>
            {isEditMode ? (
              <Input
                value={editedJob.jobUrl || ""}
                onChange={(e) => setEditedJob({ ...editedJob, jobUrl: e.target.value })}
                placeholder="https://..."
              />
            ) : job.jobUrl ? (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Visit Job Posting
              </a>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Link
              </Button>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Job Description</Label>
            {isEditMode ? (
              <Textarea
                value={editedJob.description || ""}
                onChange={(e) => setEditedJob({ ...editedJob, description: e.target.value })}
                placeholder="Paste job description here..."
                className="min-h-[200px] resize-none"
              />
            ) : (
              <ScrollArea className="h-[200px] rounded-lg border border-border bg-muted/30 p-4">
                {job.description ? (
                  <p className="text-sm text-foreground whitespace-pre-wrap">{job.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No job description available</p>
                )}
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0 border-t pt-4">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => onDelete(job)}
                  className="sm:mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {job.jobUrl && (
                <Button asChild>
                  <a href={job.jobUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Job Posting
                  </a>
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
