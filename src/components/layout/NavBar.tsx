import { useApp } from '@/contexts/AppContext';
import { ChevronLeft, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showReminderBell?: boolean;
  onReminderClick?: () => void;
  showCaregiverExtras?: boolean;
  onReportsClick?: () => void;
  onSettingsClick?: () => void;
}

export default function NavBar({ title, showBack, onBack, rightAction, showReminderBell, onReminderClick, showCaregiverExtras }: NavBarProps) {
  const { mode } = useApp();

  if (mode === 'essential') return null;

  return (
    <div className="z-30 bg-background/90 backdrop-blur-xl border-b border-border/15 shrink-0">
      <div className="flex items-center justify-between px-5 h-14 mx-[22px]">
        <div className="w-24 flex items-start">
          {showBack && (
            <button onClick={onBack} className="touch-target flex items-center gap-1 text-primary -ml-2">
              <ChevronLeft className="w-6 h-6" />
              <span className="text-[17px] font-bold">Back</span>
            </button>
          )}
        </div>
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[18px] font-extrabold text-foreground truncate"
        >
          {title}
        </motion.h1>
        <div className="w-24 flex justify-end gap-2">
          {showReminderBell && (
            <button onClick={onReminderClick} className="touch-target relative p-2 hover:bg-muted/50 transition-colors" aria-label="Reminders">
              <Bell className="w-6 h-6 text-primary" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-secondary" />
            </button>
          )}
          {showCaregiverExtras && (
            <button onClick={onReminderClick} className="touch-target relative p-2 hover:bg-muted/50 transition-colors" aria-label="Reminders">
              <Bell className="w-6 h-6 text-primary" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-secondary" />
            </button>
          )}
          {rightAction}
        </div>
      </div>
    </div>
  );
}
