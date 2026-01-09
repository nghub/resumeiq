import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ScoreBreakdown, LineFeedback } from '@/types/resume';

interface KeywordItem {
  keyword: string;
  jdCount: number;
  resumeCount: number;
}

interface SkillItem {
  skill: string;
  importance: 'high' | 'medium' | 'low';
}

interface MissingSkill extends SkillItem {
  courses: {
    platform: string;
    title: string;
    duration: string;
    rating: number;
    price: string;
    url: string;
  }[];
}

interface SkillsGapData {
  matchedSkills: SkillItem[];
  requiredSkills: SkillItem[];
  missingSkills: MissingSkill[];
}

interface DashboardSessionState {
  // Input state
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  jobTitle: string;
  setJobTitle: (title: string) => void;
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  
  // Results state
  score: number | null;
  setScore: (score: number | null) => void;
  breakdown: ScoreBreakdown | null;
  setBreakdown: (breakdown: ScoreBreakdown | null) => void;
  summary: string;
  setSummary: (summary: string) => void;
  keywordDensity: KeywordItem[];
  setKeywordDensity: (keywords: KeywordItem[]) => void;
  feedback: LineFeedback[];
  setFeedback: (feedback: LineFeedback[]) => void;
  skillsGapData: SkillsGapData | null;
  setSkillsGapData: (data: SkillsGapData | null) => void;
  previousScore: number | null;
  setPreviousScore: (score: number | null) => void;
  showComparison: boolean;
  setShowComparison: (show: boolean) => void;
  optimizedResume: string;
  setOptimizedResume: (resume: string) => void;
  
  // UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  rewriting: boolean;
  setRewriting: (rewriting: boolean) => void;
  analyzingSkills: boolean;
  setAnalyzingSkills: (analyzing: boolean) => void;
  loadingScan: boolean;
  setLoadingScan: (loading: boolean) => void;
  
  // Computed
  isAnalysisComplete: boolean;
  
  // Actions
  resetSession: () => void;
}

const DashboardSessionContext = createContext<DashboardSessionState | null>(null);

export function DashboardSessionProvider({ children }: { children: ReactNode }) {
  // Input state
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  
  // Results state
  const [score, setScore] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null);
  const [summary, setSummary] = useState('');
  const [keywordDensity, setKeywordDensity] = useState<KeywordItem[]>([]);
  const [feedback, setFeedback] = useState<LineFeedback[]>([]);
  const [skillsGapData, setSkillsGapData] = useState<SkillsGapData | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState('input');
  const [analyzing, setAnalyzing] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [analyzingSkills, setAnalyzingSkills] = useState(false);
  const [loadingScan, setLoadingScan] = useState(false);
  
  // Computed
  const isAnalysisComplete = score !== null && breakdown !== null;
  
  const resetSession = useCallback(() => {
    setResumeText('');
    setJobDescription('');
    setCompanyName('');
    setJobTitle('');
    setResumeFileName('');
    setScore(null);
    setBreakdown(null);
    setSummary('');
    setKeywordDensity([]);
    setFeedback([]);
    setSkillsGapData(null);
    setPreviousScore(null);
    setShowComparison(false);
    setOptimizedResume('');
    setActiveTab('input');
  }, []);
  
  const value: DashboardSessionState = {
    resumeText,
    setResumeText,
    jobDescription,
    setJobDescription,
    companyName,
    setCompanyName,
    jobTitle,
    setJobTitle,
    resumeFileName,
    setResumeFileName,
    score,
    setScore,
    breakdown,
    setBreakdown,
    summary,
    setSummary,
    keywordDensity,
    setKeywordDensity,
    feedback,
    setFeedback,
    skillsGapData,
    setSkillsGapData,
    previousScore,
    setPreviousScore,
    showComparison,
    setShowComparison,
    optimizedResume,
    setOptimizedResume,
    activeTab,
    setActiveTab,
    analyzing,
    setAnalyzing,
    rewriting,
    setRewriting,
    analyzingSkills,
    setAnalyzingSkills,
    loadingScan,
    setLoadingScan,
    isAnalysisComplete,
    resetSession,
  };
  
  return (
    <DashboardSessionContext.Provider value={value}>
      {children}
    </DashboardSessionContext.Provider>
  );
}

export function useDashboardSession() {
  const context = useContext(DashboardSessionContext);
  if (!context) {
    throw new Error('useDashboardSession must be used within a DashboardSessionProvider');
  }
  return context;
}
