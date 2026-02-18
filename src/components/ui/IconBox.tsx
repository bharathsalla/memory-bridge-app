import type { LucideIcon } from 'lucide-react';

interface IconBoxProps {
  Icon: LucideIcon;
  color: string;
  size?: number;
  iconSize?: number;
}

/**
 * iOS Health-style icon container: 44×44px rounded square with colored background
 * and white icon, matching Apple's multicolor icon system.
 */
export default function IconBox({ Icon, color, size = 44, iconSize = 20 }: IconBoxProps) {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        backgroundColor: color,
      }}
    >
      <Icon
        className="text-white"
        style={{ width: iconSize, height: iconSize, strokeWidth: 1.5 }}
      />
    </div>
  );
}

/** iOS system colors for cycling through list items */
export const iosColors = {
  orange: '#FF9500',
  blue: '#007AFF',
  green: '#34C759',
  purple: '#AF52DE',
  red: '#FF3B30',
  teal: '#5AC8FA',
  yellow: '#FFCC00',
} as const;

/** Cycle through colors ensuring no adjacent items share the same color */
export function getColor(index: number): string {
  const palette = [
    iosColors.orange,
    iosColors.blue,
    iosColors.green,
    iosColors.purple,
    iosColors.red,
    iosColors.teal,
    iosColors.yellow,
  ];
  return palette[index % palette.length];
}
