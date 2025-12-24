import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, History, Moon, Sun, Snowflake } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

interface HeaderProps {
  onSnowToggle?: () => void;
  isSnowing?: boolean;
}

export function Header({ onSnowToggle, isSnowing }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(190,70%,45%)] flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">ResumeAI</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
          <Link to="/history">
            <Button variant="ghost" size="sm">
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onSnowToggle}
          >
            <Snowflake className={`w-4 h-4 transition-colors ${isSnowing ? 'text-primary' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>
      </div>
    </motion.header>
  );
}
