export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
  location?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
}

export interface ParsedResume {
  summary: string;
  experience: Experience[];
  skills: string[];
  education: Education[];
  certifications: Certification[];
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
  };
}

export interface ParsedJobDescription {
  title: string;
  company?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  responsibilities: string[];
  tools: string[];
  experience?: string;
  education?: string;
}

export interface ScoreBreakdown {
  skills: number;
  experience: number;
  keywords: number;
  roleAlignment: number;
}

export interface LineFeedback {
  id: string;
  lineIndex: number;
  originalText: string;
  issue: string;
  suggestion: string;
  scoreImpact: number;
  type: 'keyword' | 'vague' | 'missing' | 'impact';
  section: string;
}

export interface OptimizedLine {
  id: string;
  originalText: string;
  optimizedText: string;
  accepted: boolean;
  section: string;
  lineIndex: number;
}

export interface Scan {
  id: string;
  userId: string;
  resumeId?: string;
  jobDescriptionId?: string;
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  feedback: LineFeedback[];
  optimizedResume: ParsedResume | null;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  rawText: string;
  parsedData: ParsedResume;
  createdAt: string;
  updatedAt: string;
}

export interface JobDescription {
  id: string;
  userId: string;
  title: string;
  company?: string;
  rawText: string;
  parsedData: ParsedJobDescription;
  createdAt: string;
}
