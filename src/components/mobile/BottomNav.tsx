import { motion } from 'framer-motion';
import { AudioLines, FolderOpen, ListChecks, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MobileTab = 'chat' | 'voice' | 'files' | 'actions';

const TABS: Array<{ id: MobileTab; label: string; icon: typeof MessageCircle }> = [
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'voice', label: 'Voice', icon: AudioLines },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'actions', label: 'Actions', icon: ListChecks },
];

interface BottomNavProps {
  active: MobileTab;
  onChange: (tab: MobileTab) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="flex shrink-0 items-stretch"
      style={{
        background: 'hsl(var(--background) / 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-subtle)',
        // Keep the bar clear of the home indicator on gesture-navigation phones.
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      {TABS.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex h-14 flex-1 flex-col items-center justify-center gap-1',
              'text-[10px] font-medium transition-colors duration-150 active:scale-95',
            )}
            style={{ color: selected ? 'var(--nova-primary)' : 'var(--text-dim)' }}
            aria-current={selected ? 'page' : undefined}
          >
            {selected && (
              <motion.span
                layoutId="mobile-tab-indicator"
                className="absolute inset-x-4 top-0 h-0.5 rounded-full"
                style={{ background: 'var(--nova-primary)' }}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              />
            )}
            <tab.icon className="h-5 w-5" />
            {/* Only the selected tab is labelled. Four labels at 10px on a
                phone is a row of grey noise; the icons carry the meaning and
                the active one names itself. */}
            {selected && tab.label}
          </button>
        );
      })}
    </nav>
  );
}
