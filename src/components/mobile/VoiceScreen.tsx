/**
 * The full-screen voice view.
 *
 * One large orb, a waveform, and whatever was last heard. Everything moving
 * here is driven by real audio: the orb's ripple and the bars below it both
 * read the `mic-level` and `mic-chunk` events the Rust recorder emits, so a
 * silent room produces a still screen rather than a decorative animation.
 */
import { Orb, STATE_LABEL } from '@/components/shared/Orb';
import type { AgentState } from '@/core/types';

interface VoiceScreenProps {
  state: AgentState;
  /** 0-1 input level. */
  level: number;
  /** Frequency bins while recording. */
  spectrum: number[];
  listening: boolean;
  onToggle: () => void;
  /** The last thing transcribed, shown so the user can see it landed. */
  transcript?: string;
}

/** Bars drawn from the live spectrum, or a flat line when there is nothing. */
function Waveform({ spectrum, active }: { spectrum: number[]; active: boolean }) {
  // A fixed bar count keeps the layout stable whatever the analyser returns.
  const bars = 32;
  const values = Array.from({ length: bars }, (_, i) => {
    if (!active || spectrum.length === 0) return 0.04;
    // Spread whatever bins we have across the fixed bar count.
    const v = spectrum[Math.floor((i / bars) * spectrum.length)] ?? 0;
    return Math.max(0.04, Math.min(1, v));
  });

  return (
    <div className="flex h-14 items-center justify-center gap-[3px]" aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full transition-[height] duration-75"
          style={{
            height: `${Math.round(v * 100)}%`,
            background: active ? 'var(--nova-primary)' : 'var(--text-dim)',
            opacity: active ? 0.4 + v * 0.6 : 1,
          }}
        />
      ))}
    </div>
  );
}

export function VoiceScreen({
  state,
  level,
  spectrum,
  listening,
  onToggle,
  transcript,
}: VoiceScreenProps) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-7 px-8"
      style={{ background: 'var(--bg-void)' }}
    >
      <Orb state={state} level={level} spectrum={spectrum} size={120} onClick={onToggle} />

      <div className="text-center">
        <div
          className="text-[13px] uppercase tracking-[0.28em]"
          style={{ color: listening ? 'var(--nova-primary)' : 'var(--text-secondary)' }}
        >
          {listening ? 'Listening…' : STATE_LABEL[state]}
        </div>
        <p className="mt-1.5 text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {listening ? 'Tap the orb to stop' : 'Tap the orb to speak'}
        </p>
      </div>

      <Waveform spectrum={spectrum} active={listening} />

      {/* Reserved whether or not there is a transcript, so the layout does not
          jump the moment one arrives. */}
      <div className="min-h-[3.5rem] w-full max-w-sm text-center">
        {transcript && (
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            “{transcript}”
          </p>
        )}
      </div>
    </div>
  );
}
