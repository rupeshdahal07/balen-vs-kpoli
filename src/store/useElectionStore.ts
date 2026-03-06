import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Constituency, generateMockConstituencies } from '../data/mockData';

interface ElectionState {
  constituencies: Constituency[];
  darkMode: boolean;
  lastUpdated: Date;
  stateId: string;
  districtId: string;
  chetraId: string;
  toggleDarkMode: () => void;
  startLiveUpdates: () => void;
  stopLiveUpdates: () => void;
  setFilters: (stateId: string, districtId: string, chetraId: string) => void;
}

let intervalId: number | null = null;

export const useElectionStore = create<ElectionState>()(
  persist(
    (set, get) => ({
      constituencies: generateMockConstituencies(),
      darkMode: false,
      lastUpdated: new Date(),
      stateId: '4',
      districtId: '6',
      chetraId: '25',
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setFilters: (stateId: string, districtId: string, chetraId: string) => {
        set({ stateId, districtId, chetraId });
        // Trigger a fresh fetch immediately
        get().stopLiveUpdates();
        get().startLiveUpdates();
      },
  startLiveUpdates: () => {
    if (intervalId) return;

    const fetchLiveData = async () => {
      try {
        const { stateId, districtId, chetraId } = get();
        
        // Only call the API when all three filters are selected, or if none are selected (initial wide open state).
        // Actually, user says: "only call api when state id, destrict id chetra it is all three is selected". 
        if (!stateId || !districtId || !chetraId) {
           return; // Abort fetch if not comprehensively selected.
        }

        const queryParams = new URLSearchParams();
        queryParams.append('state_id', stateId);
        queryParams.append('district_id', districtId);
        queryParams.append('chetra_id', chetraId);
        
        const response = await fetch(`/api/election-data?${queryParams.toString()}`);
        const data = await response.json();
        const liveScrapedCandidates = data.candidates;

        set((state) => {
          const newConstituencies = state.constituencies.map((c, idx) => {
            if (idx === 0 && liveScrapedCandidates) {
              let updatedVotesCounted = 0;
              const updatedJhapaCandidates = liveScrapedCandidates.map((liveData: any, idx: number) => {
                const existingCandidate = c.candidates.find((oldCand) => oldCand.name === liveData.name);
                
                const lastHistoryVote = existingCandidate?.voteHistory?.[existingCandidate.voteHistory.length - 1] || 0;
                let newHistory = existingCandidate ? [...existingCandidate.voteHistory] : [liveData.votes];
                if (existingCandidate && liveData.votes !== lastHistoryVote) {
                   newHistory.push(liveData.votes);
                }

                updatedVotesCounted += liveData.votes;

                return {
                  id: existingCandidate ? existingCandidate.id : `cand_dynamic_${idx}`,
                  name: liveData.name,
                  party: liveData.party || existingCandidate?.party || "Independent",
                  partyNameOriginal: liveData.party || existingCandidate?.partyNameOriginal || "",
                  votes: liveData.votes,
                  voteHistory: newHistory,
                  image: liveData.image || existingCandidate?.image || "",
                  image_b64: liveData.image_b64 || existingCandidate?.image_b64 || ""
                };
              }).sort((a: any, b: any) => b.votes - a.votes);

              return {
                ...c,
                name: data.constituency || c.name,
                votesCounted: updatedVotesCounted,
                candidates: updatedJhapaCandidates
              };
            }

            return c;
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
    }, 120000); // 120 seconds simulate
  },
  stopLiveUpdates: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
    }),
    {
      name: 'election-theme-storage-v2', // bumped to clear old stale filter state
      partialize: (state) => ({ darkMode: state.darkMode }), // only persist dark mode state, not the live constituencies data
    }
  )
);
