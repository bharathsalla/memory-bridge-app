import { useApp } from '@/contexts/AppContext';

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
  // NavBar is now fully removed — all screens use inline iOS large titles.
  // This component returns null to prevent duplicate navigation titles.
  return null;
}
