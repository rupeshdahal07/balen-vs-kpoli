import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Constituency, generateMockConstituencies } from '../data/mockData';

interface ElectionState {
  constituencies: Constituency[];
  darkMode: boolean;
  lastUpdated: Date;
  toggleDarkMode: () => void;
  startLiveUpdates: () => void;
  stopLiveUpdates: () => void;
}

let intervalId: number | null = null;

export const useElectionStore = create<ElectionState>()(
  persist(
    (set) => ({
      constituencies: generateMockConstituencies(),
      darkMode: false,
      lastUpdated: new Date(),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  startLiveUpdates: () => {
    if (intervalId) return;

    const fetchLiveData = async () => {
      try {
        const response = await fetch('/api/election-data');
        const data = await response.json();
        const liveScrapedCandidates = data.candidates;

        set((state) => {
          const newConstituencies = state.constituencies.map((c) => {
            if (c.id === 'const_jhapa_5' && liveScrapedCandidates) {
              let updatedVotesCounted = 0;
              const updatedJhapaCandidates = c.candidates.map((candidate) => {
                const liveData = liveScrapedCandidates.find((sc: any) => sc.name === candidate.name);
                const newVotes = liveData ? liveData.votes : candidate.votes;
                updatedVotesCounted += newVotes;
                
                // Only push to history if it changed
                const lastHistoryVote = candidate.voteHistory[candidate.voteHistory.length - 1] || 0;
                let newHistory = [...candidate.voteHistory];
                if (newVotes !== lastHistoryVote) {
                   newHistory.push(newVotes);
                }

                return {
                  ...candidate,
                  votes: newVotes,
                  voteHistory: newHistory,
                  image: liveData && liveData.image ? liveData.image : candidate.image
                };
              }).sort((a, b) => b.votes - a.votes);

              return {
                ...c,
                votesCounted: updatedVotesCounted,
                candidates: updatedJhapaCandidates
              };
            }

            return c; // other constituencies remain unmodified since we exclusively rely on scraped data now.
          });
          
          return {
            constituencies: newConstituencies,
            lastUpdated: new Date()
          };
        });
      } catch (err) {
        console.error("Failed to fetch live election data", err);
      }
    };

    // run initially
    fetchLiveData();

    intervalId = window.setInterval(() => {
      fetchLiveData();
    }, 60000); // 60 seconds simulate
  },
  stopLiveUpdates: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
    }),
    {
      name: 'election-theme-storage', // key in localStorage
      partialize: (state) => ({ darkMode: state.darkMode }), // only persist dark mode state, not the live constituencies data
    }
  )
);
