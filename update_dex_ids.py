import json
import urllib.request
import re

print("Fetching PokeAPI data (Species and Mega Variations)...")

# Query species for general mapping
query_species = """
query {
  pokemon_v2_pokemonspecies {
    id
    pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 11}}) {
      name
    }
  }
}
"""

# Query varieties for Mega Variations
query_megas = """
query {
  pokemon_v2_pokemon(where: {pokemon_v2_pokemonforms: {is_mega: {_eq: true}}}) {
    id
    name
    pokemon_v2_pokemonspecy {
      pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 11}}) {
        name
      }
    }
  }
}
"""

def fetch_graphql(query):
    req = urllib.request.Request(
        'https://beta.pokeapi.co/graphql/v1beta',
        data=json.dumps({"query": query}).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "PoketyanSpeedChecker/1.0"}
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

try:
    species_data = fetch_graphql(query_species)
    mega_data = fetch_graphql(query_megas)
except Exception as e:
    print(f"Failed to fetch PokeAPI: {e}")
    exit(1)

# Map Japanese name to Dex ID
jp_to_dex_id = {}
for species in species_data["data"]["pokemon_v2_pokemonspecies"]:
    dex_id = species["id"]
    names = species["pokemon_v2_pokemonspeciesnames"]
    if names:
        jp_to_dex_id[names[0]["name"]] = dex_id

# Map Japanese name to Mega ID (10000+)
jp_to_megas = {}
for poke in mega_data["data"]["pokemon_v2_pokemon"]:
    m_id = poke["id"]
    m_name = poke["name"]
    base_jp = poke["pokemon_v2_pokemonspecy"]["pokemon_v2_pokemonspeciesnames"][0]["name"]
    
    if base_jp not in jp_to_megas:
        jp_to_megas[base_jp] = []
    jp_to_megas[base_jp].append({"id": m_id, "name": m_name})

# Manual Mapping for specific requested forms
manual_form_map = {
    "ケンタロス(パルデア単)": 10250,
    "ケンタロス(パルデア炎)": 10251,
    "ケンタロス(パルデア水)": 10252,
    "イルカマン(マイティ)": 10256,
    "ニャオニクス(メス)": 10025,
    "ロトム(ヒート)": 10008,
    "ロトム(ウォッシュ)": 10009,
    "ロトム(フロスト)": 10010,
    "ロトム(スピン)": 10011,
    "ロトム(カット)": 10012,
    "ルガルガン(まひる)": 745,
    "ルガルガン(まよなか)": 10126,
    "ルガルガン(たそがれ)": 10152,
    "キュウコン(アローラ)": 10104
}

print(f"Loaded {len(jp_to_dex_id)} species and {len(mega_data['data']['pokemon_v2_pokemon'])} mega varieties.")

print("Updating pokemon_data.json...")

with open('pokemon_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

updated_count = 0

for p in data:
    base_name = p.get("baseName", "")
    is_mega = p.get("isMega", False)
    
    # Identify search name for species mapping
    # 1. Strip "(XXXX)" formats
    clean_name = re.sub(r'\(.*?\)', '', base_name).strip()
    
    search_name = clean_name
    if search_name.startswith("メガ") and is_mega:
        search_name = search_name[2:]
    
    # Assign standard dexId
    dex_id = jp_to_dex_id.get(search_name, jp_to_dex_id.get(clean_name, 0))
    p["dexId"] = dex_id
    
    # varietyId Assignment
    p["varietyId"] = 0
    
    # 1. Check manual form map first
    if base_name in manual_form_map:
        p["varietyId"] = manual_form_map[base_name]
    
    # 2. Check mega mapping if it's a mega and not already mapped
    if p["varietyId"] == 0 and is_mega and search_name in jp_to_megas:
        varieties = jp_to_megas[search_name]
        if len(varieties) == 1:
            p["varietyId"] = varieties[0]["id"]
        else:
            # Handle X/Y cases
            if "X" in clean_name or "-x" in clean_name.lower():
                match = next((v for v in varieties if "-x" in v["name"]), None)
                if match: p["varietyId"] = match["id"]
            elif "Y" in clean_name or "-y" in clean_name.lower():
                match = next((v for v in varieties if "-y" in v["name"]), None)
                if match: p["varietyId"] = match["id"]
            else:
                p["varietyId"] = varieties[0]["id"]

    # Cleanup old field if exists
    if "megaId" in p:
        del p["megaId"]

    if p["dexId"] or p.get("varietyId"):
        updated_count += 1

with open('pokemon_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Update complete! Assigned IDs to {updated_count} / {len(data)} entries.")
