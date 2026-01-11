import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { FileText, Sparkles, Target, Clock, CheckCircle2, Star, Shield, Zap, Upload, ClipboardList, BarChart3, Wand2, Users } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import sampleResult1 from "@/assets/sample-result-1.png";
import sampleResult2 from "@/assets/sample-result-2.png";
import sampleResult3 from "@/assets/sample-result-3.png";
import sampleResult4 from "@/assets/sample-result-4.png";
import sampleResult5 from "@/assets/sample-result-5.png";
const sampleImages = [sampleResult1, sampleResult2, sampleResult3, sampleResult4, sampleResult5];
const stats = [{
  value: "10K+",
  label: "Resumes Analyzed"
}, {
  value: "<60s",
  label: "Analysis Time"
}, {
  value: "4.9/5",
  label: "User Rating"
}];
const steps = [{
  icon: Upload,
  step: "Step 1",
  title: "Upload your resume",
  description: "Drop your PDF or DOCX file to get started."
}, {
  icon: ClipboardList,
  step: "Step 2",
  title: "Paste the job description you are applying for",
  description: "Copy the job posting you want to target."
}, {
  icon: BarChart3,
  step: "Step 3",
  title: "Get ATS and recruiter relevance score for that role",
  description: "See how well your resume matches the specific job."
}, {
  icon: Wand2,
  step: "Step 4",
  title: "Fix gaps instantly with AI suggestions",
  description: "Apply role-specific improvements with one click."
}];
const benefits = ["Resume score matched to the job description", "Missing keywords and skills highlighted", "ATS-safe formatting checks", "Role-specific improvement suggestions", "Achievement and impact quantification"];
const scoreBreakdown = [{
  label: "Keyword Match",
  score: 95
}, {
  label: "Format & Structure",
  score: 88
}, {
  label: "Content Quality",
  score: 90
}, {
  label: "ATS Readability",
  score: 94
}];
export default function IndexV2() {
  const [showSampleModal, setShowSampleModal] = useState(false);
  return <div className="min-h-screen bg-background">
      {/* Sample Results Modal */}
      <Dialog open={showSampleModal} onOpenChange={setShowSampleModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Sample Before & After Results
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {sampleImages.map((img, index) => <img key={index} src={img} alt={`Sample result ${index + 1}`} className="w-full h-auto rounded-lg border border-border shadow-sm" />)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10">
          <motion.div className="max-w-4xl mx-auto text-center" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            {/* Trust Badge */}
            <motion.div initial={{
            opacity: 0,
            y: -10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Built for serious job seekers applying to competitive roles</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Tailor Your Resume to Any Job —{" "}
              <span className="text-primary">Get More Interviews</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Upload your resume, paste a job description, and get instant, role-specific 
              optimization that improves your chances of landing interviews.
            </p>
            <p className="text-sm text-muted-foreground/80 max-w-xl mx-auto mb-10">
              Most resumes are rejected because they don't match the job — not because the candidate isn't qualified.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                  <Target className="w-5 h-5 mr-2" />
                  Optimize My Resume for a Job
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Same resume + different jobs = different optimization
              </p>
            </div>

            {/* Stats */}
            <motion.div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4
          }}>
              {stats.map((stat, index) => <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>)}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Positioning Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <motion.div className="text-center mb-16" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">How It Works</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Job-Specific Resume Optimization Engine
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our system compares your resume against real job descriptions, identifies keyword gaps, 
              ATS-breaking issues, and recruiter red flags, then shows exactly what to fix.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
                <div className="text-xs font-semibold text-primary mb-3">{step.step}</div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Secondary Value Section */}
      <section className="py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }}>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Stop Sending the Same Resume{" "}
                <span className="text-primary">to Every Job.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Hiring systems and recruiters look for different keywords in every role. 
                This tool helps you tailor your resume so it actually matches what each job is asking for.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>)}
              </div>
            </motion.div>

            {/* Score Preview Card */}
            <motion.div initial={{
            opacity: 0,
            x: 20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} className="relative">
              {/* Label above score card */}
              <div className="text-center mb-4">
                <span className="text-sm font-medium text-primary">ATS Score for This Job Posting</span>
              </div>
              
              <div className="p-8 rounded-2xl bg-card border border-border shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold">ATS Score Analysis</div>
                      <div className="text-sm text-muted-foreground">Your resume vs. this job</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary">92%</div>
                    <div className="text-sm text-muted-foreground">Match Score</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {scoreBreakdown.map((item, index) => <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{item.label}</span>
                        <span className="font-medium text-primary">{item.score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div className="h-full bg-primary rounded-full" initial={{
                      width: 0
                    }} whileInView={{
                      width: `${item.score}%`
                    }} viewport={{
                      once: true
                    }} transition={{
                      delay: 0.2 + index * 0.1,
                      duration: 0.8
                    }} />
                      </div>
                    </div>)}
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  Missing keywords and skills required by this job are highlighted below.
                </div>

                <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>Strong match for this role. Minor improvements suggested.</span>
                </div>
              </div>
              
              {/* Caption below score card */}
              <div className="text-center mt-4 space-y-1">
                <span className="text-xs text-muted-foreground block">
                  Scores vary by role. Always optimize per job for best results.
                </span>
                <span className="text-xs text-muted-foreground/80 block">
                  Most resumes fail ATS screening due to missing role-specific keywords.
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <motion.div className="max-w-3xl mx-auto text-center" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Results in Under 60 Seconds</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Apply With a Resume Tailored to the Job
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Stop sending generic resumes. Get role-specific optimization that helps you stand out.
            </p>

            <Link to="/dashboard">
              <Button size="lg" className="text-lg px-10 py-6">
                <Target className="w-5 h-5 mr-2" />
                Optimize My Resume for a Job
              </Button>
            </Link>

            <p className="mt-4 text-sm text-muted-foreground">
              Upload resume • Paste job description • Results in under 60 seconds
            </p>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>100% secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>Instant analysis</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>;
}