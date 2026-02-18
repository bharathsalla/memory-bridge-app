import type { ReactNode } from 'react';

interface SegmentItem {
  value: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

interface SegmentedControlProps {
  items: SegmentItem[];
  value: string;
  onChange: (value: string) => void;
  /** Allow horizontal scroll for many items */
  scrollable?: boolean;
}

/**
 * iOS 17-style segmented control.
 * Matches UISegmentedControl: light gray track, white selected segment with subtle shadow.
 * No brand color on the control itself — selected text is foreground, unselected is muted.
 */
export default function SegmentedControl({ items, value, onChange, scrollable }: SegmentedControlProps) {
  const wrapper = scrollable ? 'overflow-x-auto -mx-1 px-1' : '';

  return (
    <div className={wrapper}>
      <div
        className={`flex rounded-[9px] p-[2px] ${scrollable ? 'min-w-max' : ''}`}
        style={{ backgroundColor: 'rgba(118,118,128,0.12)' }}
      >
        {items.map(item => {
          const active = value === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 h-[36px] rounded-[7px] text-[13px] font-semibold transition-all relative whitespace-nowrap ${
                scrollable ? 'px-3 flex-none' : ''
              } ${
                active
                  ? 'bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]'
                  : 'text-muted-foreground'
              }`}
            >
              {item.icon}
              {item.label}
              {item.badge}
            </button>
          );
        })}
      </div>
    </div>
  );
}
