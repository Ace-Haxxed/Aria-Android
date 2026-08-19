/**
 * The action log, sized for a phone.
 *
 * NOVA runs every tool call the model decides on without asking, so this list
 * is the only record of what it did to the device. The desktop panel is a
 * 240px column; here it is the whole screen, one row per action, newest first.
 */
import { AnimatePresence, motion } from 'framer-motion';
import { Ban, Check, Loader2, X } from 'lucide-react';
import type { ActionLogEntry } from '@/core/types';
import { useActions } from '@/store/actions';
import { formatTime } from '@/lib/utils';

function StatusMark({ status }: { status: ActionLogEntry['status'] }) {
  switch (status) {
    case 'ok':
      return <Check className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--success)' }} />;
    case 'error':
      return <X className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--danger)' }} />;
    case 'cancelled':
      return <Ban className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-dim)' }} />;
    default:
      return (
        <Loader2
          className="h-3.5 w-3.5 shrink-0 animate-spin"
          style={{ color: 'var(--nova-primary)' }}
        />
      );
  }
}

export function MobileActions() {
  const entries = useActions((s) => s.entries);

  if (entries.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Nothing yet.
        </p>
        <p className="mt-1.5 text-[11px]" style={{ color: 'var(--text-dim)' }}>
          Everything NOVA does on this device is recorded here as it happens.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div
        className="px-1 pb-2 text-[10px] uppercase tracking-[0.2em]"
        style={{ color: 'var(--text-dim)' }}
      >
        Action log
      </div>

      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-start gap-2.5 rounded-lg border-l-2 px-2.5 py-2"
              style={{
                background: 'var(--bg-glass)',
                // High risk gets the warning edge, a failure gets the danger
                // one — the two things worth finding by eye in a long list.
                borderLeftColor:
                  entry.status === 'error'
                    ? 'var(--danger)'
                    : entry.risk === 'high'
                      ? 'var(--warning)'
                      : 'transparent',
              }}
            >
              <div className="mt-0.5">
                <StatusMark status={entry.status} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-mono text-[11px]" style={{ color: 'var(--text-primary)' }}>
                  {entry.tool}
                </div>
                <div
                  className="mt-0.5 break-words text-[11px] leading-snug"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {entry.summary}
                </div>
                {entry.error && (
                  <div className="mt-1 break-words text-[11px]" style={{ color: 'var(--danger)' }}>
                    {entry.error}
                  </div>
                )}
              </div>

              <span className="shrink-0 font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>
                {formatTime(entry.startedAt)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
