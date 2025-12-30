import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { SantaHat } from '@/components/SantaHat';
import { FileText, Target, Sparkles, Wand2, History, ArrowRight, CheckCircle2 } from 'lucide-react';
const features = [{
  icon: Target,
  title: 'ATS Score Analysis',
  description: 'Get a detailed breakdown of how your resume matches job requirements with our 0-100% scoring system.'
}, {
  icon: Sparkles,
  title: 'Line-by-Line Feedback',
  description: 'Receive specific suggestions for every section of your resume to maximize your match score.'
}, {
  icon: Wand2,
  title: 'AI-Powered Rewriting',
  description: 'Let our AI copilot rewrite your resume to achieve 95%+ ATS compatibility automatically.'
}, {
  icon: History,
  title: 'Scan History',
  description: 'Track your progress over time with saved scans and compare different resume versions.'
}];
const benefits = ['Upload PDF, DOCX, or paste text', 'Instant keyword analysis', 'Skills gap identification', 'Before vs after comparison', 'Export optimized resume', 'Unlimited scan history'];
export default function Index() {
  const {
    theme
  } = useTheme();
  const isChristmas = theme === 'christmas';
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-foreground/90" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        </div>
        

        <div className="relative z-10 container py-24 md:py-32">
          <motion.div className="max-w-3xl mx-auto text-center" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            <motion.div className="inline-flex items-center gap-2 bg-background/10 border border-background/20 rounded-full px-4 py-1.5 mb-6" initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.2
          }}>
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-background/80">AI-Powered Resume Optimization</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-background leading-tight mb-6">
              Get Your{' '}
              <span className="relative inline-block">
                {isChristmas && <SantaHat className="absolute -top-5 left-0 md:-top-8 md:-left-1 w-8 h-7 md:w-12 md:h-10 z-10 pointer-events-none" />}
                R
              </span>
              esume Past Any{' '}
              <span className="text-primary">ATS System</span>
            </h1>
            
            <p className="text-xl text-background/70 mb-8 max-w-2xl mx-auto">
              Upload your resume and job description. Get instant ATS scoring, line-by-line feedback, 
              and AI-powered rewrites to reach 95%+ match rates.
            </p>

            <div className="flex justify-center">
              <Link to="/dashboard">
                <Button size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Start Optimizing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-background">
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
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Land Interviews
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI analyzes your resume against job descriptions to maximize your chances of getting past ATS filters.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => <motion.div key={feature.title} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-muted/30">
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
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Built for Job Seekers Who Want Results
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Stop guessing why your resume isn't getting callbacks. Our AI gives you actionable insights 
                and automated rewrites to match any job posting.
              </p>
              <ul className="grid sm:grid-cols-2 gap-3">
                {benefits.map(benefit => <li key={benefit} className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>)}
              </ul>
            </motion.div>
            <motion.div className="relative" initial={{
            opacity: 0,
            x: 20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }}>
              <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Your ATS Score</p>
                    <p className="text-5xl font-bold text-success">92%</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                    <Target className="w-8 h-8 text-success" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[{
                  label: 'Skills Match',
                  value: 95
                }, {
                  label: 'Experience',
                  value: 88
                }, {
                  label: 'Keywords',
                  value: 90
                }].map(item => <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{
                      width: `${item.value}%`
                    }} />
                      </div>
                    </div>)}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-foreground">
        <div className="container text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">
              Ready to Optimize Your Resume?
            </h2>
            <p className="text-lg text-background/70 mb-8 max-w-xl mx-auto">
              Join thousands of job seekers who have improved their ATS scores and landed more interviews.
            </p>
            <Link to="/dashboard">
              <Button size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-foreground border-t border-background/10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-background">ResumeAI</span>
          </div>
          <p className="text-sm text-background/50">© 2024 ResumeAI. All rights reserved.</p>
        </div>
      </footer>
    </div>;
}