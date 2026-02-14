import { useApp } from '@/contexts/AppContext';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export default function NavBar({ title, showBack, onBack, rightAction }: NavBarProps) {
  const { mode } = useApp();

  if (mode === 'essential') return null;

  return (
    <div className="z-30 bg-background/90 backdrop-blur-xl border-b border-border shrink-0">
      <div className="flex items-center justify-between px-4 h-11">
        <div className="w-20 flex items-start">
          {showBack && (
            <button onClick={onBack} className="touch-target flex items-center gap-0.5 text-primary -ml-2">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-ios-body">Back</span>
            </button>
          )}
        </div>
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-ios-headline text-foreground truncate"
        >
          {title}
        </motion.h1>
        <div className="w-20 flex justify-end">{rightAction}</div>
      </div>
    </div>
  );
}
