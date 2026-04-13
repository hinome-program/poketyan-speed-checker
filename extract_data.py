import json
import re
import math

# Source file path
CONTENT_PATH = '/Users/takeuchiatomu/.gemini/antigravity/brain/99185fa2-d2ee-477c-b5b4-71e0a1a93ffe/.system_generated/steps/27/content.md'

def get_base_pokemon():
    """Extract base Pokemon data from the content file."""
    with open(CONTENT_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    header_line = "ポケモン名,タイプ1,タイプ2,HP,こうげき,ぼうぎょ,とくこう,とくぼう,すばやさ,特性1,特性2,隠れ特性,フォルム,メガシンカ"
    match = re.search(header_line, content)
    start_pos = match.end() if match else 0

    data_text = content[start_pos:]
    entries = re.split(r'(?<=否|可)\s+', data_text)

    pokemon_dict = {}
    for entry in entries:
        parts = entry.strip().replace('\n', ' ').split(',')
        if len(parts) < 9: continue
        
        name = parts[0]
        form = parts[12] if len(parts) > 12 else "通常"
        # We handle normal forms here
        if "メガ" in name or (len(parts) > 13 and parts[13] == "可" and "メガ" not in name):
            # Normal form of a mega-capable pokemon
            is_mega = False
        else:
            is_mega = False

        try:
            p = {
                "name": name,
                "types": [parts[1]],
                "stats": {
                    "hp": int(parts[3]),
                    "atk": int(parts[4]),
                    "def": int(parts[5]),
                    "spa": int(parts[6]),
                    "spd": int(parts[7]),
                    "spe": int(parts[8])
                },
                "isMega": False, # Base data is marked as non-mega unless specified
                "form": form
            }
            if parts[2] and parts[2] != "なし":
                p["types"].append(parts[2])
            pokemon_dict[(name, form)] = p
        except:
            continue
    return pokemon_dict

# --- MANUAL DATA SECTION ---
# Add or modify data here easily
manual_overrides = [
    {"name": "イッカネズミ", "types": ["ノーマル"], "spe": 111},
    {"name": "カミツオロチ", "types": ["くさ", "ドラゴン"], "spe": 44},
    {"name": "ブリムオン", "types": ["エスパー", "フェアリー"], "spe": 29},
    {"name": "タルップル", "types": ["くさ", "ドラゴン"], "spe": 30},
    {"name": "ヤバソチャ", "types": ["くさ", "ゴースト"], "spe": 70}
]

# Sample Megas (User can add more here)
manual_megas = [
    {
        "name": "メガリザードンY",
        "types": ["ほのお", "ひこう"],
        "stats": {"hp": 78, "atk": 104, "def": 78, "spa": 159, "spd": 115, "spe": 100},
        "isMega": True
    },
    {
        "name": "メガゲンガー",
        "types": ["ゴースト", "どく"],
        "stats": {"hp": 60, "atk": 65, "def": 80, "spa": 170, "spd": 95, "spe": 130},
        "isMega": True
    },
    {
        "name": "メガフーディン",
        "types": ["エスパー"],
        "stats": {"hp": 55, "atk": 50, "def": 65, "spa": 175, "spd": 105, "spe": 150},
        "isMega": True
    },
    {
        "name": "メガルカリオ",
        "types": ["かくとう", "はがね"],
        "stats": {"hp": 70, "atk": 145, "def": 88, "spa": 140, "spd": 70, "spe": 112},
        "isMega": True
    }
]

def generate_app_data():
    base_data = get_base_pokemon()
    
    # Apply overrides
    for ov in manual_overrides:
        key = (ov["name"], "通常")
        if key in base_data:
            base_data[key]["stats"]["spe"] = ov["spe"]
            if "types" in ov: base_data[key]["types"] = ov["types"]

    all_species = list(base_data.values()) + manual_megas
    
    final_rows = []
    for p in all_species:
        base_spe = p["stats"]["spe"]
        
        # Real Values (Lv.50 / IV31)
        no_ev = base_spe + 20       # 無振り
        quasi = base_spe + 52       # 準速
        max_s = math.floor(quasi * 1.1)  # 最速
        
        # 無振り Entry
        final_rows.append({
            "name": f"{p['name']} (無振り)",
            "baseName": p["name"],
            "types": p["types"],
            "baseSpe": base_spe,
            "realSpe": no_ev,
            "stats": p["stats"],
            "typeTag": "無振り",
            "isMega": p.get("isMega", False)
        })
        
        # 準速 Entry
        final_rows.append({
            "name": f"{p['name']} (準速)",
            "baseName": p["name"],
            "types": p["types"],
            "baseSpe": base_spe,
            "realSpe": quasi,
            "stats": p["stats"],
            "typeTag": "準速",
            "isMega": p.get("isMega", False)
        })
        
        # 最速 Entry
        final_rows.append({
            "name": f"{p['name']} (最速)",
            "baseName": p["name"],
            "types": p["types"],
            "baseSpe": base_spe,
            "realSpe": max_s,
            "stats": p["stats"],
            "typeTag": "最速",
            "isMega": p.get("isMega", False)
        })
        
    return final_rows

if __name__ == "__main__":
    app_data = generate_app_data()
    with open('pokemon_data.json', 'w', encoding='utf-8') as f:
        json.dump(app_data, f, ensure_ascii=False, indent=2)
    print(f"Project Updated: {len(app_data)} entries generated.")
