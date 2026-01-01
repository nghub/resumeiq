import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  Sparkles, 
  Target, 
  Clock, 
  CheckCircle2, 
  Star,
  Shield,
  Zap,
  Brain,
  TrendingUp,
  Users,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "95%+", label: "Success Rate" },
  { value: "10K+", label: "Resumes Optimized" },
  { value: "<30s", label: "Analysis Time" },
  { value: "4.9/5", label: "User Rating" },
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered ATS Analysis",
    description: "Our advanced AI scans your resume against real ATS systems used by Fortune 500 companies."
  },
  {
    icon: Target,
    title: "Smart Feedback Engine",
    description: "Get actionable, line-by-line suggestions to improve your resume's impact and visibility."
  },
  {
    icon: Sparkles,
    title: "Intelligent Rewriting",
    description: "One-click optimization that rewrites your content while preserving your unique voice."
  },
  {
    icon: TrendingUp,
    title: "Skills Gap Analysis",
    description: "Identify missing keywords and skills that recruiters are actively searching for."
  }
];

const benefits = [
  "Instant ATS compatibility score",
  "Keyword optimization suggestions",
  "Industry-specific insights",
  "Formatting improvements",
  "Experience highlighting",
  "Achievement quantification"
];

const scoreBreakdown = [
  { label: "Keyword Match", score: 95 },
  { label: "Format & Structure", score: 88 },
  { label: "Content Quality", score: 90 },
  { label: "ATS Readability", score: 94 },
];

export default function IndexV2() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Trusted by 10,000+ Job Seekers • AI-Powered Analysis
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Beat Any{" "}
              <span className="text-primary">ATS System</span>
              {" "}With AI Precision
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Upload your resume and get instant, AI-powered feedback. Our advanced analysis 
              helps you optimize for any job posting and beat applicant tracking systems.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Free Analysis
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                  View Sample Results
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Cutting-Edge Technology</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Enterprise-Grade AI Analysis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by advanced machine learning models trained on millions of successful resumes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stop Guessing Section */}
      <section className="py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">For Serious Job Seekers</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Stop Guessing.{" "}
                <span className="text-primary">Start Winning.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Every application matters. Our AI ensures your resume passes through 
                ATS filters and catches the attention of hiring managers.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Score Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="p-8 rounded-2xl bg-card border border-border shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold">ATS Score Analysis</div>
                      <div className="text-sm text-muted-foreground">Your resume performance</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary">92%</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {scoreBreakdown.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{item.label}</span>
                        <span className="font-medium text-primary">{item.score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.score}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + index * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>Excellent! Your resume is well-optimized for ATS systems.</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Start in Under 60 Seconds</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to 10x Your Interview Rate?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of job seekers who landed their dream jobs with our AI-powered resume optimization.
            </p>

            <Link to="/dashboard">
              <Button size="lg" className="text-lg px-10 py-6">
                <Zap className="w-5 h-5 mr-2" />
                Analyze Your Resume Free
              </Button>
            </Link>

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
                <span>Results in 30 seconds</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">ResumeAI</span>
              <span className="text-sm text-muted-foreground">• AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>© 2024 ResumeAI. All rights reserved.</span>
              <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Secure & Private
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}