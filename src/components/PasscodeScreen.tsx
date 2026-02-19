import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete } from 'lucide-react';

interface PasscodeScreenProps {
  onUnlock: () => void;
}

const CORRECT_PASSCODE = '0827';

export default function PasscodeScreen({ onUnlock }: PasscodeScreenProps) {
  const [entered, setEntered] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = useCallback((digit: string) => {
    if (entered.length >= 4) return;
    const next = entered + digit;
    setEntered(next);
    setError(false);

    if (next.length === 4) {
      if (next === CORRECT_PASSCODE) {
        setTimeout(onUnlock, 300);
      } else {
        setTimeout(() => {
          setError(true);
          setTimeout(() => {
            setEntered('');
            setError(false);
          }, 600);
        }, 200);
      }
    }
  }, [entered, onUnlock]);

  const handleDelete = useCallback(() => {
    setEntered(prev => prev.slice(0, -1));
    setError(false);
  }, []);

  const dots = Array.from({ length: 4 }, (_, i) => (
    <motion.div
      key={i}
      className={`w-[14px] h-[14px] rounded-full border-2 transition-colors duration-150 ${
        i < entered.length
          ? 'bg-foreground border-foreground'
          : 'bg-transparent border-muted-foreground/40'
      }`}
      animate={error ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.5 }}
    />
  ));

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'del'],
  ];

  const subLabels: Record<string, string> = {
    '2': 'A B C', '3': 'D E F', '4': 'G H I', '5': 'J K L',
    '6': 'M N O', '7': 'P Q R S', '8': 'T U V', '9': 'W X Y Z',
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-between bg-background" style={{ paddingTop: 60, paddingBottom: 30 }}>
      {/* Title */}
      <div className="flex flex-col items-center gap-6">
        <p className="text-[20px] font-medium text-foreground tracking-tight">Enter Passcode</p>
        {/* Dots */}
        <div className="flex items-center gap-[18px]">
          {dots}
        </div>
      </div>

      {/* Keypad */}
      <div className="flex flex-col gap-[14px] items-center" style={{ marginBottom: 10 }}>
        {keys.map((row, ri) => (
          <div key={ri} className="flex items-center gap-[24px]">
            {row.map((k) => {
              if (k === '') return <div key="empty" style={{ width: 78, height: 78 }} />;
              if (k === 'del') {
                return (
                  <button
                    key="del"
                    onClick={handleDelete}
                    className="flex items-center justify-center active:opacity-50 transition-opacity"
                    style={{ width: 78, height: 78 }}
                  >
                    <Delete className="w-7 h-7 text-foreground" />
                  </button>
                );
              }
              return (
                <button
                  key={k}
                  onClick={() => handleDigit(k)}
                  className="flex flex-col items-center justify-center rounded-full bg-muted/60 active:bg-muted transition-colors"
                  style={{ width: 78, height: 78 }}
                >
                  <span className="text-[32px] font-light text-foreground leading-none">{k}</span>
                  {subLabels[k] && (
                    <span className="text-[10px] font-medium text-muted-foreground tracking-[3px] mt-0.5">{subLabels[k]}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Cancel / Emergency - cosmetic only */}
      <div className="flex items-center justify-between w-full px-16">
        <button className="text-[16px] text-primary">Emergency</button>
        <button onClick={() => setEntered('')} className="text-[16px] text-primary">Cancel</button>
      </div>
    </div>
  );
}
