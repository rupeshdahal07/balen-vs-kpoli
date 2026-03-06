import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  const chartRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [shareError, setShareError] = useState('');

  const sorted = useMemo(
    () => [...candidates].sort((a, b) => b.votes - a.votes),
    [candidates]
  );

  const handleShare = useCallback(async () => {
    setSharing(true);
    setShareError('');
    try {
      const topN = sorted.filter(c => c.votes > 0).slice(0, 5);
      if (topN.length === 0) { setShareError('No vote data yet'); setSharing(false); return; }

      // ── Canvas dimensions ──
      const W = 600;
      const CARD_H = 110;
      const CARD_GAP = 16;
      const PAD = 28;
      const HEADER_H = 130;
      const FOOTER_H = 54;
      const H = HEADER_H + topN.length * (CARD_H + CARD_GAP) - CARD_GAP + FOOTER_H + PAD;

      const canvas = document.createElement('canvas');
      canvas.width = W * 2;      // 2× for retina
      canvas.height = H * 2;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      const ctx = canvas.getContext('2d')!;
      ctx.scale(2, 2);

      // ── White background ──
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      // ── Decorative red corner blobs (top-right & bottom-left) ──
      const drawCornerBlob = (cx: number, cy: number, r: number) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 38, 38, 0.12)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 38, 38, 0.18)';
        ctx.fill();
      };
      drawCornerBlob(W + 10, -20, 100);
      drawCornerBlob(-20, H + 10, 100);

      // ── Header: Constituency name ──
      // Get constituency label from the first candidate name context or just "Nepal Election"
      const chetraLabel = document.querySelector('[data-chetra-label]')?.textContent || '';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 26px "Arial", sans-serif';
      ctx.fillText(chetraLabel || 'NEPAL ELECTION LIVE', W / 2, 52);

      ctx.fillStyle = '#374151';
      ctx.font = '14px "Arial", sans-serif';
      ctx.fillText('DIRECT ELECTION – 2082', W / 2, 78);

      // LIVE badge
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(W / 2 - 26, 104, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 12px "Arial", sans-serif';
      ctx.fillText('LIVE', W / 2 - 18, 108);

      // ── Candidate cards ──
      // ── Load candidate images from base64 data URIs embedded in API response ──
      const loadImage = (src: string): Promise<HTMLImageElement | null> =>
        new Promise(resolve => {
          if (!src) return resolve(null);
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src; // data URI — same-origin, no CORS problem
          setTimeout(() => resolve(null), 5000);
        });

      // Prefer base64 (CORS-safe), fall back to external URL as last resort
      const images = await Promise.all(
        topN.map(c => loadImage(c.image_b64 || c.image))
      );

      topN.forEach((cand, i) => {
        const partyKey = cand.party || cand.partyNameOriginal || 'Unknown';
        const partyColor = PARTY_COLOR_MAP[partyKey] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
        const cardX = PAD;
        const cardY = HEADER_H + i * (CARD_H + CARD_GAP);
        const cardW = W - PAD * 2;
        const RADIUS = 14;

        // Card shadow + white bg
        ctx.shadowColor = 'rgba(0,0,0,0.10)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = '#ffffff';
        roundRectFill(ctx, cardX, cardY, cardW, CARD_H, RADIUS);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Card border
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1.5;
        roundRectStroke(ctx, cardX, cardY, cardW, CARD_H, RADIUS);

        // Left color accent bar
        ctx.fillStyle = partyColor;
        roundRectFill(ctx, cardX, cardY, 5, CARD_H, RADIUS);
        ctx.fillRect(cardX + RADIUS / 2, cardY, 5, CARD_H);

        // Circular candidate photo
        const AVATAR_R = 38;
        const AVATAR_CX = cardX + 28 + AVATAR_R;
        const AVATAR_CY = cardY + CARD_H / 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(AVATAR_CX, AVATAR_CY, AVATAR_R, 0, Math.PI * 2);
        ctx.clip();
        const img = images[i];
        if (img) {
          // "cover" crop: fill circle without stretching, cropping from center
          const D = AVATAR_R * 2; // diameter
          const iw = img.naturalWidth || img.width;
          const ih = img.naturalHeight || img.height;
          const scale = Math.max(D / iw, D / ih);
          const sw = D / scale; // source crop width
          const sh = D / scale; // source crop height
          const sx = (iw - sw) / 2; // center-crop x offset
          const sy = (ih - sh) / 2; // center-crop y offset
          ctx.drawImage(
            img,
            sx, sy, sw, sh,           // source rect (natural pixels, centered)
            AVATAR_CX - AVATAR_R, AVATAR_CY - AVATAR_R, D, D  // dest rect
          );

        } else {
          // Fallback: initials circle
          ctx.fillStyle = partyColor + '22';
          ctx.fillRect(AVATAR_CX - AVATAR_R, AVATAR_CY - AVATAR_R, AVATAR_R * 2, AVATAR_R * 2);
          ctx.fillStyle = partyColor;
          ctx.font = 'bold 22px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((cand.name[0] || '?'), AVATAR_CX, AVATAR_CY);
          ctx.textBaseline = 'alphabetic';
        }
        ctx.restore();

        // Avatar ring
        ctx.beginPath();
        ctx.arc(AVATAR_CX, AVATAR_CY, AVATAR_R, 0, Math.PI * 2);
        ctx.strokeStyle = partyColor + '88';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Rank badge (top-left corner of avatar)
        if (i === 0) {
          ctx.beginPath();
          ctx.arc(AVATAR_CX - AVATAR_R + 12, AVATAR_CY - AVATAR_R + 12, 14, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 11px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('1st', AVATAR_CX - AVATAR_R + 12, AVATAR_CY - AVATAR_R + 12);
          ctx.textBaseline = 'alphabetic';
        }

        // Candidate name (black, uppercase)
        const textX = AVATAR_CX + AVATAR_R + 18;
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 16px "Arial", sans-serif';
        ctx.textAlign = 'left';
        let displayName = cand.name.toUpperCase();
        while (ctx.measureText(displayName).width > cardW - textX + cardX - 70 && displayName.length > 4)
          displayName = displayName.slice(0, -1);
        if (displayName !== cand.name.toUpperCase()) displayName += '…';
        ctx.fillText(displayName, textX, cardY + CARD_H / 2 - 8);

        // Vote count (bold red)
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 20px "Arial", sans-serif';
        ctx.fillText(`Vote Count : ${cand.votes.toLocaleString()}`, textX, cardY + CARD_H / 2 + 18);

        // Party badge pill (right side)
        const pctOfTotal = totalVotes > 0 ? ((cand.votes / totalVotes) * 100).toFixed(1) : '—';
        const pillX = cardX + cardW - PAD - 56;
        roundRectFill2(ctx, pillX, cardY + CARD_H / 2 - 16, 60, 32, 8, partyColor + '18');
        ctx.fillStyle = partyColor;
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${pctOfTotal}%`, pillX + 30, cardY + CARD_H / 2 + 5);
        ctx.textAlign = 'left';
      });

      // ── Footer ──
      const now = new Date();
      const timeStr = now.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      ctx.fillStyle = '#9ca3af';
      ctx.font = '13px "Arial", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Update Time: ${timeStr}`, W - PAD, H - 16);
      ctx.fillStyle = '#d1d5db';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('election.onlinekhabar.com', W / 2, H - 16);
      ctx.textAlign = 'left';

      // ── Export / Share ──
      const filename = `nepal-election-${now.toISOString().slice(0, 10)}.png`;
      const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/png'));

      if (typeof navigator.canShare === 'function') {
        try {
          const file = new File([blob], filename, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Nepal Election Live Results' });
            setShared(true); setTimeout(() => setShared(false), 3000); return;
          }
        } catch { /* fallthrough */ }
      }
      const a = document.createElement('a');
      a.download = filename;
      a.href = URL.createObjectURL(blob);
      a.click();
      URL.revokeObjectURL(a.href);
      setShared(true);
      setTimeout(() => setShared(false), 3000);

    } catch (e: any) {
      console.error('Share failed:', e);
      setShareError('Failed to generate');
      setTimeout(() => setShareError(''), 4000);
    } finally {
      setSharing(false);
    }
  }, [sorted, totalVotes]);

  function roundRectFill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath(); ctx.fill();
  }
  function roundRectStroke(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath(); ctx.stroke();
  }
  function roundRectFill2(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }


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
        {/* Share / Download button */}
        <motion.button
          onClick={handleShare}
          disabled={sharing}
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.05 }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md border transition-all duration-200 ${
            shared
              ? 'bg-green-500 text-white border-green-400'
              : shareError
              ? 'bg-red-500 text-white border-red-400'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          {sharing ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Generating...
            </>
          ) : shared ? (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Saved!
            </>
          ) : shareError ? (
            <>⚠️ {shareError}</>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V3m0 0L8 7m4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Share
            </>
          )}
        </motion.button>
      </div>

      <div ref={chartRef} className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700/60 overflow-hidden">
        {displayCandidates.map((cand, index) => {
          const partyKey = cand.party || cand.partyNameOriginal || 'Unknown';
          const color = partyColorCache[partyKey] ?? '#6b7280';
          const pct = maxVotes > 0 ? (cand.votes / maxVotes) * 100 : 0;
          const isLeader = index === 0 && cand.votes > 0;
          // Bell only rings if the leader is from RSP (Balen's party)
          const isRSPLeader = isLeader && (
            cand.party === 'राष्ट्रिय स्वतन्त्र पार्टी' ||
            cand.party === 'RSP' ||
            cand.partyNameOriginal === 'राष्ट्रिय स्वतन्त्र पार्टी'
          );
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
                {isRSPLeader && (
                  <div className="absolute -top-2 -right-2 pointer-events-none">
                    {/* Ripple rings */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-yellow-400"
                      animate={{ scale: [1, 2.2, 2.5], opacity: [0.8, 0.2, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.6 }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-yellow-300"
                      animate={{ scale: [1, 1.8, 2.2], opacity: [0.6, 0.15, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.6, delay: 0.2 }}
                    />
                    {/* Bell */}
                    <motion.div
                      className="relative text-lg md:text-2xl drop-shadow-[0_0_12px_rgba(250,204,21,1)]"
                      style={{ transformOrigin: 'top center', display: 'block' }}
                      animate={{
                        rotate: [0, -30, 30, -25, 25, -15, 15, -8, 8, 0],
                        y: [0, -2, 0, -1, 0]
                      }}
                      transition={{
                        duration: 1.0,
                        repeat: Infinity,
                        repeatDelay: 1.2,
                        ease: 'easeInOut'
                      }}
                    >
                      🔔
                    </motion.div>
                  </div>
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
