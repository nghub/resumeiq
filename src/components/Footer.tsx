import { Link } from "react-router-dom";
import { FileText, Shield } from "lucide-react";

interface FooterProps {
  variant?: "dark" | "light";
}

export const Footer = ({ variant = "light" }: FooterProps) => {
  const isDark = variant === "dark";

  return (
    <footer className={`py-8 border-t ${isDark ? "bg-foreground border-background/10" : "border-border"}`}>
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className={`font-semibold ${isDark ? "text-background" : "text-foreground"}`}>ResumeAI</span>
            <span className={`text-sm ${isDark ? "text-background/50" : "text-muted-foreground"}`}>
              • Job-Specific Optimization
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
            <Link 
              to="/terms" 
              className={`hover:underline transition-colors ${isDark ? "text-background/70 hover:text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              Terms of Service
            </Link>
            <Link 
              to="/privacy" 
              className={`hover:underline transition-colors ${isDark ? "text-background/70 hover:text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              Privacy Policy
            </Link>
            <span className={`flex items-center gap-1 ${isDark ? "text-background/70" : "text-muted-foreground"}`}>
              <Shield className="w-4 h-4" />
              Secure & Private
            </span>
          </div>
          
          <span className={`text-sm ${isDark ? "text-background/50" : "text-muted-foreground"}`}>
            © 2024 ResumeAI. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};
