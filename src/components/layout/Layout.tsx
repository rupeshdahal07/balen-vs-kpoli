import { useEffect } from 'react';
import { useElectionStore } from '../../store/useElectionStore';
import { Moon, Sun } from 'lucide-react';
import RaceChart from '../RaceChart';
import { format } from 'date-fns';
import AnimatedNumber from '../AnimatedNumber';
const Topbar = () => {
  const { darkMode, toggleDarkMode, lastUpdated } = useElectionStore();

  return (
    <header className="py-2 md:py-3 bg-white dark:bg-darkcard border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-20 transition-colors shadow-sm">
      <div className="flex items-center gap-4 md:mr-5">
        <div className="inline-block relative">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-red-600 dark:from-blue-400 dark:via-purple-400 dark:to-red-400 mb-3 drop-shadow-sm">
            Jhapa - 5 (Balen vs KP Oli)
          </h2>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-red-600 blur opacity-20 dark:opacity-30 rounded-lg -z-10"></div>
        </div>
      
        <div className="flex items-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse mr-2"></span>
          LIVE
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: {format(lastUpdated, 'HH:mm:ss')}
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};


const Layout = () => {
  const { darkMode, startLiveUpdates, stopLiveUpdates, constituencies } = useElectionStore();
  
  useEffect(() => {
    startLiveUpdates();
    return () => stopLiveUpdates();
  }, [startLiveUpdates, stopLiveUpdates]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const targetConstituency = constituencies.find(c => c.id === 'const_jhapa_5') || constituencies[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-darkbg text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      <Topbar />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
         {/* Main Viewing Area */}
        <main className="flex-1 overflow-y-auto p-2 md:p-4 bg-slate-50/50 dark:bg-darkbg flex flex-col relative justify-center">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }}></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/10 dark:bg-red-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }}></div>
          </div>

          <div className="max-w-6xl w-full mx-auto pb-4 z-10">
             <div className="mb-2 flex flex-col items-center text-center">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl px-6 py-2 flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                   <p className="text-slate-600 dark:text-slate-300 font-medium">
                     Total Votes Counted: <span className="font-bold text-lg text-slate-900 dark:text-white"><AnimatedNumber value={targetConstituency.votesCounted} /></span>
                   </p>
                </div>
             </div>
             <RaceChart 
                candidates={targetConstituency.candidates} 
                totalVotes={targetConstituency.votesCounted}
             />
          </div>
        </main>

      </div>
    </div>
  );
};

export default Layout;
