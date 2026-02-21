import CrisisPreventionEngine from '@/components/CrisisPreventionEngine';
import { AppProvider } from '@/contexts/AppContext';
import { VoiceOverProvider } from '@/contexts/VoiceOverContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

export default function TabletVitals() {
  return (
    <div className="h-screen w-screen overflow-hidden" style={{ backgroundColor: '#F2F2F7' }}>
      {/* Tablet header */}
      <div
        className="flex items-center justify-between px-6 shrink-0"
        style={{
          height: 56,
          backgroundColor: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '0.5px solid #C6C6C8',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #5856D6, #AF52DE)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#000', letterSpacing: -0.3 }}>
            CrisisGuard — Vitals Monitor
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759' }} />
            <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>Live</span>
          </div>
          <span style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Full-screen crisis prevention engine */}
      <div style={{ height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
        <CrisisPreventionEngine />
      </div>

      <Toaster />
      <Sonner position="top-center" />
    </div>
  );
}
