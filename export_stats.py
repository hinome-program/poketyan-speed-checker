import json
import csv

def extract_unique_pokemon():
    # Load the current processed data
    try:
        with open('pokemon_data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("pokemon_data.json が見つかりません。")
        return

    # Use a dictionary to keep only unique species (one entry per baseName)
    unique_pokemon = {}
    
    for entry in data:
        base_name = entry.get('baseName')
        if not base_name:
            continue
            
        # Only take the first one we see (they all have the same base stats)
        if base_name not in unique_pokemon:
            # Clean up the entry for export
            stat_obj = entry.get('stats', {})
            clean_entry = {
                "name": base_name,
                "types": entry.get('types', []),
                "hp": stat_obj.get('hp'),
                "atk": stat_obj.get('atk'),
                "def": stat_obj.get('def'),
                "spa": stat_obj.get('spa'),
                "spd": stat_obj.get('spd'),
                "spe": entry.get('baseSpe'), # Original base speed
                "dexId": entry.get('dexId'),
                "varietyId": entry.get('varietyId'),
                "isMega": entry.get('isMega', False)
            }
            unique_pokemon[base_name] = clean_entry

    # Convert to list
    result_list = list(unique_pokemon.values())
    
    # Save as JSON
    with open('pokemon_unique_stats.json', 'w', encoding='utf-8') as f:
        json.dump(result_list, f, ensure_ascii=False, indent=2)
    
    # Save as CSV
    if result_list:
        keys = result_list[0].keys()
        with open('pokemon_unique_stats.csv', 'w', encoding='utf-8-sig', newline='') as f:
            dict_writer = csv.DictWriter(f, fieldnames=keys)
            dict_writer.writeheader()
            dict_writer.writerows(result_list)

    print(f"抽出完了: {len(result_list)} 件の種族データを以下のファイルに出力しました。")
    print("- pokemon_unique_stats.json")
    print("- pokemon_unique_stats.csv")

if __name__ == "__main__":
    extract_unique_pokemon()
