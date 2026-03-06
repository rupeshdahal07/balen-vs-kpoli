import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Candidate } from '../data/mockData';
import AnimatedNumber from './AnimatedNumber';

interface RaceChartProps {
  candidates: Candidate[];
  totalVotes: number;
}

// Map Nepali party names → brand colors
const PARTY_COLOR_MAP: Record<string, string> = {
  "नेपाली कांग्रेस":             "#1a56db",
  "Nepali Congress":              "#1a56db",
  "नेकपा एमाले":                 "#e02424",
  "CPN UML":                      "#e02424",
  "नेपाली कम्युनिस्ट पार्टी":   "#dc2626",
  "Maoist":                       "#dc2626",
  "नेपाल कम्युनिस्ट पार्टी (माओवादी)": "#dc2626",
  "राष्ट्रिय स्वतन्त्र पार्टी": "#7c3aed",
  "RSP":                          "#7c3aed",
  "राष्ट्रिय प्रजातन्त्र पार्टी": "#059669",
  "RPP":                          "#059669",
  "जनमत पार्टी":                 "#d97706",
  "Janamat":                      "#d97706",
  "जनता समाजवादी पार्टी, नेपाल": "#db2777",
  "JSP":                          "#db2777",
  "स्वतन्त्र":                   "#6b7280",
  "Independent":                  "#6b7280",
};

// Fallback palette for unknown parties
const FALLBACK_COLORS = [
  "#0891b2", "#d97706", "#7c3aed", "#059669",
  "#db2777", "#16a34a", "#9333ea", "#ea580c",
  "#0284c7", "#ca8a04", "#be123c", "#0d9488",
];

let audioCtx: AudioContext | null = null;
export let isBellRigged = false;

export const rigTheBell = () => {
  isBellRigged = true;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
};

const playBellSound = () => {
  if (!isBellRigged) return;
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ctx = audioCtx;
    [880, 1760, 2637].forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4 / 3, ctx.currentTime + 0.02);
      gain.gain.setTargetAtTime(0, ctx.currentTime + 0.02, 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    });
  } catch (e) { /* silent */ }
};

function VoteSplash({ votes, color, isLeader }: { votes: number; color: string; isLeader: boolean }) {
  const prevRef = useRef(votes);
  const [diff, setDiff] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const prev = prevRef.current;
    if (votes > prev) {
      setDiff(votes - prev);
      setKey(Date.now());
      if (isLeader) playBellSound();
    }
    prevRef.current = votes;
  }, [votes, isLeader]);

  useEffect(() => {
    if (diff > 0) {
      const t = setTimeout(() => setDiff(0), 1800);
      return () => clearTimeout(t);
    }
  }, [diff, key]);

  if (!diff) return null;

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 8, scale: 0.6 }}
        animate={{ opacity: 1, y: -52, scale: isLeader ? 1.4 : 1.1 }}
        exit={{ opacity: 0, y: -80, scale: 0.7 }}
        transition={{ duration: 1.4, type: 'spring', stiffness: 90 }}
        className="absolute top-0 right-0 font-black text-lg md:text-2xl z-50 pointer-events-none whitespace-nowrap drop-shadow-lg"
        style={{ color }}
      >
        +{diff.toLocaleString()} {isLeader ? '🔔' : '🚀'}
      </motion.div>
    </AnimatePresence>
  );
}

export default function RaceChart({ candidates, totalVotes }: RaceChartProps) {
  const sorted = useMemo(
    () => [...candidates].sort((a, b) => b.votes - a.votes),
    [candidates]
  );

  // Assign colors per party, reusing same color for same party
  const partyColorCache = useMemo(() => {
    const cache: Record<string, string> = {};
    let fallbackIdx = 0;
    for (const c of sorted) {
      const key = c.party || c.partyNameOriginal || 'Unknown';
      if (!cache[key]) {
        cache[key] = PARTY_COLOR_MAP[key] || FALLBACK_COLORS[fallbackIdx++ % FALLBACK_COLORS.length];
      }
    }
    return cache;
  }, [sorted]);

  const maxVotes = sorted[0]?.votes ?? 1;
  // Show top candidates with votes, then rest
  const withVotes = sorted.filter(c => c.votes > 0);
  const withoutVotes = sorted.filter(c => c.votes === 0);
  const displayCandidates = [...withVotes, ...withoutVotes.slice(0, Math.max(0, 15 - withVotes.length))];

  return (
    <div className="w-full space-y-3 md:space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 md:mb-4">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent flex-1" />
        <h3 className="text-base md:text-xl font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block" />
          Live Race
        </h3>
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent flex-1" />
      </div>

      <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700/60 overflow-hidden">
        {displayCandidates.map((cand, index) => {
          const partyKey = cand.party || cand.partyNameOriginal || 'Unknown';
          const color = partyColorCache[partyKey] ?? '#6b7280';
          const pct = maxVotes > 0 ? (cand.votes / maxVotes) * 100 : 0;
          const isLeader = index === 0 && cand.votes > 0;
          const totalPct = totalVotes > 0 ? ((cand.votes / totalVotes) * 100).toFixed(1) : '0.0';

          return (
            <motion.div
              key={cand.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className={`relative flex items-center gap-2 md:gap-4 px-3 md:px-5 py-2.5 md:py-3 border-b border-slate-100 dark:border-slate-700/40 last:border-b-0 ${isLeader ? 'bg-gradient-to-r from-yellow-50/60 to-transparent dark:from-yellow-900/10 dark:to-transparent' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'} transition-colors`}
            >
              {/* Rank Badge */}
              <div
                className={`shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-black text-[10px] md:text-sm shadow-sm ${isLeader ? 'text-yellow-900' : 'text-white'}`}
                style={{ backgroundColor: isLeader ? '#fbbf24' : color }}
              >
                {isLeader ? '🏆' : index + 1}
              </div>

              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={cand.image}
                  alt={cand.name}
                  className="w-9 h-9 md:w-12 md:h-12 rounded-full object-cover border-2 shadow"
                  style={{ borderColor: color }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cand.name)}&backgroundColor=${color.replace('#', '')}`;
                  }}
                />
                {isLeader && (
                  <motion.div
                    className="absolute -top-1 -right-1 text-base md:text-lg"
                    animate={{ rotate: [-15, 15, -15, 15, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
                  >
                    🔔
                  </motion.div>
                )}
              </div>

              {/* Name + Party */}
              <div className="min-w-0 w-[90px] md:w-[180px] shrink-0">
                <div className="font-bold text-[11px] md:text-sm text-slate-800 dark:text-slate-100 truncate leading-tight">
                  {cand.name}
                </div>
                <div
                  className="text-[9px] md:text-xs font-semibold truncate mt-0.5"
                  style={{ color }}
                >
                  {cand.partyNameOriginal || cand.party}
                </div>
              </div>

              {/* Bar + Votes */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {/* Bar track */}
                  <div className="flex-1 h-5 md:h-7 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(pct, cand.votes > 0 ? 1 : 0)}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut', type: 'spring', damping: 22 }}
                      className="h-full rounded-full relative overflow-hidden"
                      style={{ background: `linear-gradient(90deg, ${color}cc, ${color})` }}
                    >
                      {/* Shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
                    </motion.div>
                    {/* Vote count inside or beside bar */}
                    {cand.votes > 0 && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-black text-slate-600 dark:text-slate-300 tabular-nums">
                        <AnimatedNumber value={cand.votes} />
                      </div>
                    )}
                    {cand.votes === 0 && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
                        No votes yet
                      </div>
                    )}
                  </div>

                  {/* % of total */}
                  <div
                    className="shrink-0 w-[38px] md:w-[52px] text-right font-black text-[10px] md:text-sm tabular-nums"
                    style={{ color }}
                  >
                    {totalPct}%
                  </div>
                </div>
              </div>

              {/* Vote splash animation */}
              <div className="relative shrink-0 w-0 h-0 overflow-visible">
                <VoteSplash votes={cand.votes} color={color} isLeader={isLeader} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
