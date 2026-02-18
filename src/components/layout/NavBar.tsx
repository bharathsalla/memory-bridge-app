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
    <div className="z-30 bg-background/90 backdrop-blur-2xl border-b border-border/8 shrink-0">
      <div className="flex items-center justify-between px-5 h-[52px]">
        <div className="w-24 flex items-start">
          {showBack && (
            <button onClick={onBack} className="touch-target flex items-center gap-0.5 text-primary -ml-2">
              <ChevronLeft className="w-[22px] h-[22px]" />
              <span className="text-[16px] font-semibold">Back</span>
            </button>
          )}
        </div>
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[17px] font-bold text-foreground truncate font-display"
        >
          {title}
        </motion.h1>
        <div className="w-24 flex justify-end gap-2">
          {showReminderBell && (
            <button onClick={onReminderClick} className="touch-target relative p-2 rounded-xl hover:bg-muted/40 transition-colors" aria-label="Reminders">
              <Bell className="w-[22px] h-[22px] text-primary" strokeWidth={2} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border-[1.5px] border-background" />
            </button>
          )}
          {showCaregiverExtras && (
            <button onClick={onReminderClick} className="touch-target relative p-2 rounded-xl hover:bg-muted/40 transition-colors" aria-label="Reminders">
              <Bell className="w-[22px] h-[22px] text-primary" strokeWidth={2} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border-[1.5px] border-background" />
            </button>
          )}
          {rightAction}
        </div>
      </div>
    </div>
  );
}
