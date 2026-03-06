import { useEffect } from 'react';
import { useElectionStore } from '../../store/useElectionStore';
import { Moon, Sun } from 'lucide-react';
import RaceChart from '../RaceChart';
import { format } from 'date-fns';
import AnimatedNumber from '../AnimatedNumber';
import locationsData from '../../data/locations.json';

const Topbar = () => {
  const { 
    darkMode, toggleDarkMode, lastUpdated,
    stateId, districtId, chetraId, setFilters
  } = useElectionStore();

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(e.target.value, '', '');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(stateId, e.target.value, '');
  };

  const handleChetraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(stateId, districtId, e.target.value);
  };

  const districts = locationsData.districts.filter(d => !stateId || d.state_id === stateId);
  const chetras = locationsData.chetras.filter(c => !districtId || c.district_id === districtId);

  return (
    <header className="py-2 md:py-3 bg-white dark:bg-darkcard border-b border-gray-200 dark:border-slate-700 flex flex-col items-center justify-between px-6 sticky top-0 z-20 transition-colors shadow-sm gap-3 md:flex-row">
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full md:w-auto">
        <div className="inline-block relative min-w-fit">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-red-600 dark:from-blue-400 dark:via-purple-400 dark:to-red-400 mb-1 drop-shadow-sm whitespace-nowrap">
            Nepal Election Live
          </h2>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-red-600 blur opacity-20 dark:opacity-30 rounded-lg -z-10"></div>
        </div>
      
        <div className="flex items-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-semibold mr-auto">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse mr-2"></span>
          LIVE
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto justify-end">
        <div className="flex gap-2 text-sm w-full md:w-auto flex-wrap md:flex-nowrap">
          <select 
            value={stateId} 
            onChange={handleStateChange}
            className="px-2 py-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 min-w-[100px] flex-1 md:flex-none text-xs md:text-sm"
          >
            <option value="">सबै प्रदेश</option>
            {locationsData.states.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          
          <select 
            value={districtId} 
            onChange={handleDistrictChange}
            className="px-2 py-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 min-w-[100px] flex-1 md:flex-none text-xs md:text-sm"
          >
            <option value="">सबै जिल्ला</option>
            {districts.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>

          <select 
             value={chetraId} 
             onChange={handleChetraChange}
             className="px-2 py-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 min-w-[100px] flex-1 md:flex-none text-xs md:text-sm"
          >
            <option value="">सबै क्षेत्र</option>
            {chetras.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {/* Hidden label for canvas image generation */}
          <span
            data-chetra-label
            className="sr-only"
          >
            {chetras.find(c => c.value === chetraId)?.label?.toUpperCase() || 'NEPAL ELECTION LIVE'}
          </span>
        </div>

        <div className="hidden sm:block text-xs md:text-sm text-slate-500 dark:text-slate-400 ml-2 whitespace-nowrap">
          Last updated: {format(lastUpdated, 'HH:mm')}
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};


const Layout = () => {
  const { 
    darkMode, startLiveUpdates, stopLiveUpdates, constituencies,
    stateId, districtId, chetraId
  } = useElectionStore();
  
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

  const targetConstituency = constituencies[0];

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
            {(!stateId || !districtId || !chetraId) ? (
              <div className="z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-6 md:p-10 max-w-lg w-[90%] mx-auto mt-20 text-center animate-fade-in">
                 <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                 </div>
                 <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">Select a Constituency</h3>
                 <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm md:text-base">
                    Please select a Province, District, and Constituency from the dropdowns above to view live election results.
                 </p>
                 <div className="flex justify-center gap-2">
                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${stateId ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>Province</span>
                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${districtId ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>District</span>
                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${chetraId ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>Constituency</span>
                 </div>
              </div>
            ) : (
              <>
                <div className="mb-3 md:mb-5 flex flex-col items-center text-center gap-1">
                   <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl px-4 md:px-6 py-2 flex items-center gap-2 md:gap-3">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                      <p className="text-xs md:text-base text-slate-600 dark:text-slate-300 font-medium">
                        Total Votes Counted: <span className="font-bold text-sm md:text-lg text-slate-900 dark:text-white"><AnimatedNumber value={targetConstituency.votesCounted} /></span>
                      </p>
                   </div>
                   {targetConstituency.name && (
                     <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{targetConstituency.name}</p>
                   )}
                </div>
                {targetConstituency.candidates.length > 0 ? (
                    <RaceChart 
                       candidates={targetConstituency.candidates} 
                       totalVotes={targetConstituency.votesCounted}
                    />
                ) : (
                    <div className="mt-16 flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400">
                      <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                      <p className="text-sm font-medium">Fetching live data...</p>
                    </div>
                )}
              </>
            )}
          </div>
        </main>

      </div>
    </div>
  );
};

export default Layout;
