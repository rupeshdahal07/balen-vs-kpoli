from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import base64
from bs4 import BeautifulSoup
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# Mapping of Nepali numbers to English for parsing vote counts
nepali_to_english = str.maketrans('०१२३४५६७८९', '0123456789')

def fetch_image_b64(url: str) -> str:
    """Fetch image and return as base64 data URI for CORS-free canvas use."""
    try:
        r = requests.get(url, headers=headers, timeout=6)
        if r.status_code == 200:
            ct = r.headers.get('Content-Type', 'image/jpeg').split(';')[0].strip()
            b64 = base64.b64encode(r.content).decode('utf-8')
            return f"data:{ct};base64,{b64}"
    except Exception:
        pass
    return ""

@app.get("/api/election-data")
def get_election_data(
    state_id: int = 0,
    district_id: int = 0,
    chetra_id: int = 0
):
    try:
        url = f"https://election.onlinekhabar.com/wp-admin/admin-ajax.php?cd_state_id={state_id}&cd_district_id={district_id}&cd_chetra_id={chetra_id}&cd_party_id=0&cd_gender=&action=get_home_candidate_directory_block"
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
            
            # Constituency
            constituency = ""
            chetra_col = tds[3].find("a")
            if chetra_col:
                constituency = chetra_col.text.strip()
            
            # Scrape real votes
            votes = 0
            if votes_str and votes_str != '-':
                # Translate nepali numbers to english digits if present
                english_str = votes_str.translate(nepali_to_english)
                digit_str = re.sub(r'[^\d]', '', english_str)
                if digit_str:
                    votes = int(digit_str)

            disp_name = f"{name} ({constituency})" if constituency else name

            # Embed image as base64 so frontend canvas can draw it without CORS
            image_b64 = fetch_image_b64(image) if image else ""

            candidates.append({
                "id": f"cand_{i}",
                "name": disp_name,
                "party": party,
                "image": image,
                "image_b64": image_b64,
                "votes": votes
            })
            
        candidates.sort(key=lambda x: x["votes"], reverse=True)
        top_candidates = candidates[:20]
            
        return {
            "constituency": "Nepal Election Live",
            "candidates": top_candidates
        }
    except Exception as e:
        print(f"Error scraping data: {e}")
        return {"error": str(e), "candidates": []}
