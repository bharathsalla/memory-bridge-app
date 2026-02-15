import { useApp } from '@/contexts/AppContext';
import { ChevronLeft, Bell, BarChart3, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  /** Show reminder bell icon for patient view */
  showReminderBell?: boolean;
  onReminderClick?: () => void;
  /** Show caregiver extra nav icons */
  showCaregiverExtras?: boolean;
  onReportsClick?: () => void;
  onSettingsClick?: () => void;
}

export default function NavBar({ title, showBack, onBack, rightAction, showReminderBell, onReminderClick, showCaregiverExtras, onReportsClick, onSettingsClick }: NavBarProps) {
  const { mode } = useApp();

  if (mode === 'essential') return null;

  return (
    <div className="z-30 bg-background/90 backdrop-blur-xl border-b border-border/20 shrink-0">
      <div className="flex items-center justify-between px-4 h-11">
        <div className="w-20 flex items-start">
          {showBack && (
            <button onClick={onBack} className="touch-target flex items-center gap-0.5 text-primary -ml-2">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-ios-body font-semibold">Back</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-ios-headline text-foreground truncate"
          >
            {title}
          </motion.h1>
          {showCaregiverExtras && (
            <button onClick={onReminderClick} className="touch-target relative p-1 rounded-full hover:bg-muted/50 transition-colors shrink-0" aria-label="Reminders">
              <Bell className="w-4.5 h-4.5 text-primary" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-destructive" />
            </button>
          )}
        </div>
        <div className="w-20 flex justify-end gap-2">
          {showReminderBell && (
            <button onClick={onReminderClick} className="touch-target relative p-1.5 rounded-full hover:bg-muted/50 transition-colors" aria-label="Reminders">
              <Bell className="w-5 h-5 text-primary" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
            </button>
          )}
          {rightAction}
        </div>
      </div>
    </div>
  );
}
