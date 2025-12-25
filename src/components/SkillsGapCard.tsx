import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  BookOpen,
  Clock,
  Star,
  GraduationCap,
  Loader2
} from 'lucide-react';

interface Course {
  platform: string;
  title: string;
  duration: string;
  rating: number;
  price: string;
  url: string;
}

interface SkillItem {
  skill: string;
  importance: 'high' | 'medium' | 'low';
}

interface MissingSkill extends SkillItem {
  courses: Course[];
}

interface SkillsGapData {
  matchedSkills: SkillItem[];
  requiredSkills: SkillItem[];
  missingSkills: MissingSkill[];
}

interface SkillsGapCardProps {
  data: SkillsGapData | null;
  isLoading: boolean;
  onAnalyze: () => void;
}

export function SkillsGapCard({ data, isLoading, onAnalyze }: SkillsGapCardProps) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [learnedSkills, setLearnedSkills] = useState<Set<string>>(new Set());

  const toggleExpanded = (skill: string) => {
    setExpandedSkill(expandedSkill === skill ? null : skill);
  };

  const toggleLearned = (skill: string) => {
    const newLearned = new Set(learnedSkills);
    if (newLearned.has(skill)) {
      newLearned.delete(skill);
    } else {
      newLearned.add(skill);
    }
    setLearnedSkills(newLearned);
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Critical</span>;
      case 'medium':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">Important</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">Nice to have</span>;
    }
  };

  if (!data && !isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Skills Gap Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Analyze your skills against the job requirements and get personalized course recommendations.
            </p>
            <Button onClick={onAnalyze} variant="gradient">
              <GraduationCap className="w-4 h-4 mr-2" />
              Analyze Skills Gap
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Skills Gap Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Analyzing your skills...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRequired = data!.requiredSkills.length;
  const totalMatched = data!.matchedSkills.length;
  const effectiveMatched = totalMatched + learnedSkills.size;
  const coveragePercent = totalRequired > 0 ? Math.round((effectiveMatched / totalRequired) * 100) : 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Skills Gap Analysis</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {effectiveMatched}/{totalRequired} skills covered
            </span>
          </div>
        </div>
        <div className="mt-3">
          <Progress value={coveragePercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{coveragePercent}% coverage</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Three Column Layout */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Skills You Have - Green */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-success/30">
              <CheckCircle className="w-4 h-4 text-success" />
              <h4 className="font-semibold text-success text-sm">Skills You Have</h4>
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full ml-auto">
                {data!.matchedSkills.length}
              </span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {data!.matchedSkills.map((item, index) => (
                <motion.div
                  key={item.skill}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-success/5 border border-success/20"
                >
                  <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{item.skill}</span>
                </motion.div>
              ))}
              {data!.matchedSkills.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No matching skills found</p>
              )}
            </div>
          </div>

          {/* Skills Required - Orange */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-warning/30">
              <AlertCircle className="w-4 h-4 text-warning" />
              <h4 className="font-semibold text-warning text-sm">Skills Required</h4>
              <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full ml-auto">
                {data!.requiredSkills.length}
              </span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {data!.requiredSkills.map((item, index) => (
                <motion.div
                  key={item.skill}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-warning/5 border border-warning/20"
                >
                  <span className="text-sm text-foreground truncate">{item.skill}</span>
                  {getImportanceBadge(item.importance)}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Missing Skills - Red */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-destructive/30">
              <XCircle className="w-4 h-4 text-destructive" />
              <h4 className="font-semibold text-destructive text-sm">Missing Skills</h4>
              <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full ml-auto">
                {data!.missingSkills.length - learnedSkills.size}
              </span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {data!.missingSkills.map((item, index) => {
                const isLearned = learnedSkills.has(item.skill);
                const isExpanded = expandedSkill === item.skill;
                
                return (
                  <motion.div
                    key={item.skill}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-lg border ${isLearned ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}
                  >
                    <div 
                      className="flex items-center justify-between gap-2 p-2 cursor-pointer"
                      onClick={() => toggleExpanded(item.skill)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isLearned ? (
                          <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-destructive flex-shrink-0" />
                        )}
                        <span className={`text-sm truncate ${isLearned ? 'text-success line-through' : 'text-foreground'}`}>
                          {item.skill}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {getImportanceBadge(item.importance)}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-2 pb-2 space-y-2">
                            {/* Mark as learned checkbox */}
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                              <Checkbox 
                                id={`learned-${item.skill}`}
                                checked={isLearned}
                                onCheckedChange={() => toggleLearned(item.skill)}
                              />
                              <label 
                                htmlFor={`learned-${item.skill}`}
                                className="text-xs text-muted-foreground cursor-pointer"
                              >
                                Mark as learned
                              </label>
                            </div>
                            
                            {/* Course recommendations */}
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-foreground flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                Recommended Courses
                              </p>
                              {item.courses.slice(0, 3).map((course, cIndex) => (
                                <div 
                                  key={cIndex}
                                  className="p-2 bg-card rounded-md border border-border space-y-1"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium text-foreground line-clamp-2">
                                        {course.title}
                                      </p>
                                      <p className="text-xs text-primary">{course.platform}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {course.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-warning fill-warning" />
                                      {course.rating}
                                    </span>
                                    <span className="text-success font-medium">{course.price}</span>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full h-7 text-xs mt-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(course.url, '_blank');
                                    }}
                                  >
                                    Enroll Now
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
              {data!.missingSkills.length === 0 && (
                <p className="text-xs text-success italic">Great! You have all required skills!</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
