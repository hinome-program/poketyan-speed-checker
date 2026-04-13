import json
import urllib.request
import re

print("Fetching PokeAPI data via GraphQL...")

query = """
query {
  pokemon_v2_pokemonspecies {
    id
    pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 11}}) {
      name
    }
  }
}
"""

req = urllib.request.Request(
    'https://beta.pokeapi.co/graphql/v1beta',
    data=json.dumps({"query": query}).encode("utf-8"),
    headers={"Content-Type": "application/json", "User-Agent": "PoketyanSpeedChecker/1.0"}
)

try:
    with urllib.request.urlopen(req) as response:
        resp_data = json.loads(response.read().decode())
except Exception as e:
    print(f"Failed to fetch PokeAPI: {e}")
    exit(1)

species_list = resp_data["data"]["pokemon_v2_pokemonspecies"]

jp_to_id = {}
for species in species_list:
    dex_id = species["id"]
    names = species["pokemon_v2_pokemonspeciesnames"]
    if names:
        jp_name = names[0]["name"]
        jp_to_id[jp_name] = dex_id

print(f"Loaded {len(jp_to_id)} Japanese pokemon names from PokeAPI.")

# Specific manual mapping for custom names or missed matches
jp_to_id["マフォクシー"] = 655  # For メガマフォクシー base
jp_to_id["ルカリオZ"] = 448    # Base lucario
jp_to_id["アブソルZ"] = 359
jp_to_id["ガブリアスZ"] = 445

print("Updating pokemon_data.json...")

with open('pokemon_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

updated_count = 0

for p in data:
    base_name = p.get("baseName", "")
    
    # Heuristics to find the base name inside string
    search_name = base_name
    
    # 1. Strip "(XXXX)" formats
    search_name = re.sub(r'\(.*?\)', '', search_name)
    
    # 2. Strip "メガ" if present at start
    if search_name.startswith("メガ"):
        search_name = search_name[2:]
        
    search_name = search_name.strip()
    
    dex_id = None
    if search_name in jp_to_id:
        dex_id = jp_to_id[search_name]
    elif base_name in jp_to_id:
        dex_id = jp_to_id[base_name]

    if dex_id:
        p["dexId"] = dex_id
        updated_count += 1
    else:
        # We leave it as None or missing, UI will handle fallback
        p["dexId"] = 0

with open('pokemon_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Update complete! Assigned dexId to {updated_count} / {len(data)} entries.")
