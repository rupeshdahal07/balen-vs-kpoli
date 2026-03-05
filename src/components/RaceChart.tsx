import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGradientClass, getColorStyle } from '../data/mockData';
import type { Candidate } from '../data/mockData';
import AnimatedNumber from './AnimatedNumber';
interface RaceChartProps {
  candidates: Candidate[];
  totalVotes: number;
}

function VoteSplash({ votes }: { votes: number }) {
   const prevRef = useRef(votes);
   const [diff, setDiff] = useState(0);
   const [key, setKey] = useState(0);

   useEffect(() => {
      const prev = prevRef.current;
      if (votes > prev) {
         setDiff(votes - prev);
         setKey(Date.now());
      }
      prevRef.current = votes;
   }, [votes]);

   // Auto-clear diffusion after animation starts so it fades out gracefully
   useEffect(() => {
      if (diff > 0) {
         const timer = setTimeout(() => setDiff(0), 1500);
         return () => clearTimeout(timer);
      }
   }, [diff, key]);

   if (diff === 0) return null;

   return (
      <AnimatePresence mode="popLayout">
         <motion.div
            key={key}
            initial={{ opacity: 0, y: 10, x: -10, scale: 0.5, rotate: -15 }}
            animate={{ opacity: 1, y: -45, x: 15, scale: 1.3, rotate: 10 }}
            exit={{ opacity: 0, y: -60, scale: 0.8 }}
            transition={{ duration: 1.5, type: "spring", stiffness: 100 }}
            className="absolute top-0 right-0 text-green-400 dark:text-green-300 font-black text-xl md:text-2xl z-50 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] pointer-events-none whitespace-nowrap"
         >
            +{diff} 🚀
         </motion.div>
      </AnimatePresence>
   );
}

export default function RaceChart({ candidates, totalVotes }: RaceChartProps) {
  // Sort candidates by votes (descending for race ranking)
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes).slice(0, 6);
  
  // To avoid overflowing layout out of the screen, we need an inner wrapper 
  // with x-axis lines extending properly.
  
  return (
    <div className="w-full bg-white/70 dark:bg-darkcard/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/50 dark:border-slate-700/50 p-4 md:p-6 overflow-x-hidden relative">
       <div className="flex items-center justify-center gap-3 mb-4 md:mb-6">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent flex-1"></div>
          <h3 className="text-xl md:text-2xl font-black text-center dark:text-white uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <span className="text-red-500">Live</span> Competition
          </h3>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent flex-1"></div>
       </div>

       {/* X-axis structure */}
       <div className="absolute top-0 bottom-0 left-[90px] sm:left-[120px] md:left-[220px] right-8 md:right-24 pointer-events-none mt-16 mb-6 border-b-2 border-slate-300 dark:border-slate-600">
          {[0, 20, 40, 60, 80, 100].map((tick) => (
             <div key={tick} className="absolute top-0 bottom-0 flex flex-col justify-end border-l border-slate-200 dark:border-slate-700/50" style={{ left: `${tick}%` }}>
                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-400 absolute bottom-[-24px] md:bottom-[-30px] -translate-x-1/2">{tick}%</span>
             </div>
          ))}
          <div className="absolute right-[-16px] md:right-[-40px] bottom-[-20px] md:bottom-[-32px] text-slate-400">
             <svg width="20" height="20" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
       </div>
       
       <div className="relative z-10 mt-6 mb-6 border-l-2 border-slate-400 dark:border-slate-500 ml-[90px] sm:ml-[120px] md:ml-[220px]">
         <AnimatePresence>
            {sorted.map((cand, index) => {
               // Percentage calculated against max votes (lead) to 90% or total votes? 
               // Standard race chart is relative to total votes. If total votes = 0, percentage is 0.
               // We will scale it so 100% of the bar width = 100% of votes. Since no one ever gets 100% with multiple people,
               // the bar won't hit the very right normally.
               const maxScaleVotes = totalVotes > 0 ? totalVotes : 1; 
               const percentage = (cand.votes / maxScaleVotes) * 100;
               
               const gradClass = getGradientClass(cand.party);
               const textShadowColor = getColorStyle(cand.party);
               
               return (
                 <motion.div
                   key={cand.id}
                   layout
                   initial={{ opacity: 0, x: -50 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.6, type: "spring", stiffness: 50 }}
                   className="flex items-center relative h-14 md:h-16 mb-4 md:mb-5"
                 >
                   {/* Name label on left */}
                   <div className="absolute left-[-90px] sm:left-[-120px] md:left-[-220px] w-[85px] sm:w-[110px] md:w-[200px] text-right pr-2 md:pr-4 top-1/2 -translate-y-1/2 flex flex-col justify-center">
                      <div className="font-bold text-slate-800 dark:text-slate-100 truncate text-[11px] sm:text-xs md:text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                         {cand.name}
                      </div>
                      <div className="text-[9px] sm:text-[10px] md:text-sm text-slate-500 truncate font-medium mt-0.5 opacity-80">
                         {cand.party}
                      </div>
                      <div className="text-[9px] sm:text-[10px] md:text-xs text-slate-700 dark:text-slate-300 font-extrabold mt-0.5 md:mt-1 tracking-wide">
                         <AnimatedNumber value={cand.votes} /> <span className="text-slate-400 font-semibold opacity-70 hidden sm:inline">VOTES</span>
                      </div>
                   </div>
                   
                   {/* Progress Bar Container relative to 0-100% space (which spans the rest of the flex parent) */}
                   <div className="w-full h-full relative pl-[2px] pr-8 sm:pr-12 md:pr-24">
                      {/* Using percentage * 0.9 to reserve space for the image sticking out */}
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${percentage}%` }}
                         transition={{ duration: 1, ease: 'easeOut', type: 'spring', damping: 20 }}
                         className={`h-10 md:h-12 mt-1 md:mt-2 relative ${gradClass} rounded-r-full shadow-lg overflow-visible ${index === 0 ? "shadow-[0_0_20px_rgba(59,130,246,0.5)] border-b-2 border-white/20" : ""}`}
                      >
                         {/* Animated overlay for the bar for extra shine */}
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent slant-shine" />

                         {/* Avatar at the right end of the bar */}
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 md:w-14 md:h-14 z-20 group relative">
                            <VoteSplash votes={cand.votes} />
                            <motion.div
                               whileHover={{ scale: 1.1, rotate: 5 }}
                               className="w-full h-full"
                            >
                               <img 
                                  src={cand.image} 
                                  alt={cand.name}
                                  className={`w-full h-full rounded-full object-cover border-2 md:border-[3px] border-white dark:border-slate-800 shadow-xl bg-white transition-all duration-300 ${index === 0 && cand.votes > 0 ? "ring-4 ring-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)]" : "group-hover:ring-2 ring-slate-300"}`}
                               />
                            </motion.div>
                         </div>
                         
                         {/* Percentage Under Avatar */}
                         <div 
                            className="absolute right-0 top-full translate-x-1/2 translate-y-1 md:translate-y-2 font-black text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
                            style={{ color: textShadowColor }}
                         >
                            {percentage.toFixed(2)}%
                         </div>
                      </motion.div>
                   </div>
                   
                   {/* Winner Trophy placed strictly at 100% position on the right */}
                   <div className="absolute right-0 sm:right-2 md:right-8 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 flex items-center justify-center pointer-events-none z-30">
                       {index === 0 && cand.votes > 0 && (
                          <div className="relative animate-bounce drop-shadow-xl text-xl sm:text-3xl md:text-5xl" style={{ animationDuration: '2s' }}>
                             🏆
                          </div>
                       )}
                   </div>
                 </motion.div>
               );
            })}
         </AnimatePresence>
       </div>
    </div>
  );
}
