export type Party = "Nepali Congress" | "CPN UML" | "Maoist" | "RSP" | "RPP" | "Janamat" | "JSP" | "Independent" | string;

export interface Candidate {
  id: string;
  name: string;
  party: Party;
  partyNameOriginal: string;
  votes: number;
  voteHistory: number[];
  image: string;
}

export interface Constituency {
  id: string;
  name: string;
  province: string;
  totalVoters: number;
  votesCounted: number;
  candidates: Candidate[];
}

const partyMapping: Record<string, Party> = {
  "नेपाली कांग्रेस": "Nepali Congress",
  "नेकपा एमाले": "CPN UML",
  "नेपाली कम्युनिस्ट पार्टी": "Maoist",
  "नेपाल कम्युनिस्ट पार्टी (माओवादी)": "Maoist",
  "राष्ट्रिय स्वतन्त्र पार्टी": "RSP",
  "राष्ट्रिय प्रजातन्त्र पार्टी": "RPP",
  "जनमत पार्टी": "Janamat",
  "जनता समाजवादी पार्टी, नेपाल": "JSP",
};


export const initialCandidatesData = [
  { name: "मन्धरा चिमरिया", party: "नेपाली कांग्रेस", image: "https://election.onlinekhabar.com/wp-content/uploads/2026/02/mandhara-chimariya-1-1.jpg" },
  { name: "केपी शर्मा ओली", party: "नेकपा एमाले", image: "https://election.onlinekhabar.com/wp-content/uploads/2026/02/kp-oli-.jpg" },
  { name: "रञ्जित तामाङ", party: "नेपाली कम्युनिस्ट पार्टी", image: "https://election.onlinekhabar.com/wp-content/uploads/2026/02/ranjit-tamang.jpg" },
  { name: "बालेन्द्र शाह (बालेन)", party: "राष्ट्रिय स्वतन्त्र पार्टी", image: "https://election.onlinekhabar.com/wp-content/uploads/2026/02/Balen-Shah.jpg" },
  { name: "लक्ष्मीप्रसाद संग्रौला", party: "राष्ट्रिय प्रजातन्त्र पार्टी", image: "https://election.onlinekhabar.com/wp-content/uploads/2026/02/laxmi-prasad-sangraula-jhapa-5.jpg" },
  { name: "अमृतलाल महतो", party: "जनमत पार्टी", image: "https://election.onlinekhabar.com/wp-content/uploads/2026/02/amrit-lal-mahato.jpg" },
  { name: "धीरेन सुब्बा", party: "जनता समाजवादी पार्टी, नेपाल", image: "https://election.onlinekhabar.com/wp-content/uploads/2026/02/dhiren-subba.jpg" },
  { name: "समीर तामाङ्ग", party: "श्रम संस्कृति पार्टी", image: "https://election.onlinekhabar.com/wp-content/uploads/2026/02/samir-tamang.jpg" },
  { name: "पदमबहादुर जवेगू", party: "नेपाल जनमुक्ति पार्टी", image: "https://election.onlinekhabar.com/wp-content/themes/election-2082/imgs/default-candidate-photo.jpg" },
  { name: "सविन राई", party: "राष्ट्रिय परिवर्तन पार्टी", image: "https://election.onlinekhabar.com/wp-content/themes/election-2082/imgs/default-candidate-photo.jpg" },
  { name: "अमृत रसाइली", party: "राष्ट्रिय मुक्ति पार्टी, नेपाल", image: "https://election.onlinekhabar.com/wp-content/themes/election-2082/imgs/default-candidate-photo.jpg" },
  { name: "संजय राई", party: "नेपाल कम्युनिस्ट पार्टी (माओवादी)", image: "https://election.onlinekhabar.com/wp-content/themes/election-2082/imgs/default-candidate-photo.jpg" },
  { name: "धर्मराज गुरागाई", party: "पिपुल फर्स्ट पार्टी", image: "https://election.onlinekhabar.com/wp-content/themes/election-2082/imgs/default-candidate-photo.jpg" },
  { name: "सुशान्त साम्पङ राई", party: "संघीय लोकतान्त्रिक राष्ट्रिय मञ्च", image: "https://election.onlinekhabar.com/wp-content/themes/election-2082/imgs/default-candidate-photo.jpg" },
  { name: "अर्जुन सापकोटा", party: "स्वतन्त्र", image: "https://election.onlinekhabar.com/wp-content/themes/election-2082/imgs/default-candidate-photo.jpg" },
  { name: "खेमनाथ शिवाकोटी", party: "स्वतन्त्र", image: "https://election.onlinekhabar.com/wp-content/themes/election-2082/imgs/default-candidate-photo.jpg" },
  { name: "डम्बर शाहु", party: "स्वतन्त्र", image: "https://election.onlinekhabar.com/wp-content/themes/election-2082/imgs/default-candidate-photo.jpg" },
  { name: "पुस्कर खतिवडा", party: "स्वतन्त्र", image: "https://election.onlinekhabar.com/wp-content/themes/election-2082/imgs/default-candidate-photo.jpg" },
  { name: "प्रकाश नेपाल", party: "स्वतन्त्र", image: "https://election.onlinekhabar.com/wp-content/themes/election-2082/imgs/default-candidate-photo.jpg" },
  { name: "मातृका भट्टराई", party: "स्वतन्त्र", image: "https://election.onlinekhabar.com/wp-content/themes/election-2082/imgs/default-candidate-photo.jpg" }
];

export const generateMockConstituencies = (): Constituency[] => {
  const provinces = ["Province 1", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"];
  const constituencies: Constituency[] = [];

  // Special "Jhapa-5" constituency with ALL the scrapped candidates competing
  let jhapaVotesCounted = 0;
  const jhapaCandidates: Candidate[] = initialCandidatesData.map((c, index) => {
    const initialVotes = 0;
    jhapaVotesCounted += initialVotes;
    return {
      id: `jhapa_5_${index}`,
      name: c.name,
      party: partyMapping[c.party] || "Independent",
      partyNameOriginal: c.party,
      votes: initialVotes,
      voteHistory: [initialVotes],
      image: c.image
    };
  });

  constituencies.push({
    id: `const_jhapa_5`,
    name: `Jhapa - 5 (Scraped)`,
    province: "Province 1",
    totalVoters: 150000,
    votesCounted: jhapaVotesCounted,
    candidates: jhapaCandidates
  });

  // Generate a few other random mock constituencies
  for (let i = 2; i <= 6; i++) {
    const totalVoters = Math.floor(Math.random() * 50000) + 50000;
    let selectedCandidates = [...initialCandidatesData].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    let votesCounted = 0;
    const candidatesStr: Candidate[] = selectedCandidates.map((c, index) => {
      const initialVotes = Math.floor(Math.random() * (totalVoters / 5)) + 1000;
      votesCounted += initialVotes;
      return {
        id: `c_${i}_${index}`,
        name: c.name,
        party: partyMapping[c.party] || "Independent",
        partyNameOriginal: c.party,
        votes: initialVotes,
        voteHistory: [initialVotes],
        image: c.image
      };
    });

    constituencies.push({
      id: `const_${i}`,
      name: `Mock Constituency ${i}`,
      province: provinces[i % provinces.length],
      totalVoters: totalVoters + votesCounted,
      votesCounted,
      candidates: candidatesStr
    });
  }

  return constituencies;
};

export const getColorClass = (party: string) => {
  switch (party) {
    case "Nepali Congress": return "bg-[#0033A0]";
    case "CPN UML": return "bg-[#E3000F]";
    case "Maoist": return "bg-[#E3000F]";
    case "RSP": return "bg-[#002E5D]";
    case "RPP": return "bg-[#0A7A3B]";
    case "Janamat": return "bg-[#E92428]";
    case "JSP": return "bg-[#ED1B24]";
    default: return "bg-slate-500";
  }
};

export const getGradientClass = (party: string) => {
  switch (party) {
    case "Nepali Congress": return "bg-gradient-to-r from-[#0033A0] to-[#0033A0]/20";
    case "CPN UML": return "bg-gradient-to-r from-[#E3000F] to-[#E3000F]/20";
    case "Maoist": return "bg-gradient-to-r from-[#E3000F] to-[#E3000F]/20";
    case "RSP": return "bg-gradient-to-r from-[#002E5D] to-[#002E5D]/20";
    case "RPP": return "bg-gradient-to-r from-[#0A7A3B] to-[#0A7A3B]/20";
    case "Janamat": return "bg-gradient-to-r from-[#E92428] to-[#E92428]/20";
    case "JSP": return "bg-gradient-to-r from-[#ED1B24] to-[#ED1B24]/20";
    default: return "bg-gradient-to-r from-slate-500 to-slate-200 dark:to-slate-800";
  }
};

export const getColorStyle = (party: string) => {
  switch (party) {
    case "Nepali Congress": return "#0033A0";
    case "CPN UML": return "#E3000F";
    case "Maoist": return "#E3000F";
    case "RSP": return "#002E5D";
    case "RPP": return "#0A7A3B";
    case "Janamat": return "#E92428";
    case "JSP": return "#ED1B24";
    default: return "#64748b";
  }
};
