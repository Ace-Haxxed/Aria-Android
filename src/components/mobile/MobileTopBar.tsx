/**
 * The mobile top bar.
 *
 * There was no top bar at all before this: the layout began at the safe-area
 * inset and went straight into the transcript, so on a phone the app never
 * said its own name and there was nowhere to put a persistent control.
 *
 * It carries the settings button as well as the mark and the clock. The tab
 * bar below has four slots and the design gives them to Chat, Voice, Files and
 * Actions — which leaves settings, and therefore the API key page, with no
 * route to it at all. One icon here is cheaper than losing that.
 */
import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Wall clock, ticking once a minute — seconds are noise on a phone. */
function useClock(): string {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Align to the next minute, so the display changes when the phone's own
    // clock does rather than up to 59 seconds late.
    const toNextMinute = (60 - new Date().getSeconds()) * 1000;
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      setNow(new Date());
      interval = window.setInterval(() => setNow(new Date()), 60_000);
    }, toNextMinute);

    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MobileTopBar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const time = useClock();

  return (
    <header
      className="flex h-[52px] shrink-0 items-center gap-2.5 px-4"
      style={{
        background: 'hsl(var(--background) / 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <span
        className="nova-hex flex h-5 w-5 shrink-0 items-center justify-center"
        style={{
          background:
            'linear-gradient(140deg, hsl(var(--accent-h) var(--accent-s) 72%), hsl(var(--accent-h) var(--accent-s) 46%))',
        }}
      >
        <span className="text-[9px] font-bold text-white">N</span>
      </span>

      <span className="text-[13px] font-bold uppercase tracking-[0.3em] text-primary">
        NOVA
      </span>

      <span className="ml-auto font-mono text-[12px]" style={{ color: 'var(--text-secondary)' }}>
        {time}
      </span>

      <button
        onClick={onOpenSettings}
        aria-label="Settings"
        className="-mr-1 flex h-8 w-8 items-center justify-center rounded-lg
          transition-colors duration-150 active:scale-95"
        style={{ color: 'var(--text-dim)' }}
      >
        <Settings className="h-4 w-4" />
      </button>
    </header>
  );
}
