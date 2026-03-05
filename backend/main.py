from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from bs4 import BeautifulSoup
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

url = "https://election.onlinekhabar.com/wp-admin/admin-ajax.php?cd_state_id=4&cd_district_id=6&cd_chetra_id=25&cd_party_id=0&cd_gender=&action=get_home_candidate_directory_block"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# Mapping of Nepali numbers to English for parsing vote counts
nepali_to_english = str.maketrans('०१२३४५६७८९', '0123456789')

@app.get("/api/election-data")
def get_election_data():
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        
        candidates = []
        rows = soup.find_all("tr")
        for i, row in enumerate(rows):
            tds = row.find_all("td")
            if len(tds) < 6:
                continue
                
            # Candidate Info
            name_col = row.find("div", class_="candidate-name-col")
            if not name_col:
                continue
            name_a = name_col.find("a")
            name = name_a.text.strip() if name_a else "Unknown"
            
            # Party Info
            party_col = row.find("div", class_="candidate-party-col")
            if party_col:
                party_a = party_col.find("a")
                party = party_a.text.strip() if party_a else "Unknown"
            else:
                party = "Unknown"
            
            # Extract Image link safely
            img_tag = None
            if len(tds) > 1:
                img_tag = tds[1].find("img")
            
            image = img_tag["src"] if img_tag else f"https://api.dicebear.com/7.x/notionists/svg?seed={name}&backgroundColor=b6e3f4,c0aede,d1d4f9"
            
            # Votes
            votes_str = tds[4].text.strip()
            
            # Scrape real votes
            votes = 0
            if votes_str and votes_str != '-':
                # Translate nepali numbers to english digits if present
                english_str = votes_str.translate(nepali_to_english)
                digit_str = re.sub(r'[^\d]', '', english_str)
                if digit_str:
                    votes = int(digit_str)

            candidates.append({
                "id": f"jhapa_5_{i}",
                "name": name,
                "party": party,
                "image": image,
                "votes": votes
            })
            
        return {
            "constituency": "Jhapa - 5 (Live)",
            "candidates": candidates
        }
    except Exception as e:
        print(f"Error scraping data: {e}")
        return {"error": str(e), "candidates": []}
