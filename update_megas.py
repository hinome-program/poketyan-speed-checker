import json
import math

raw_data = """メガメガニウム くさ フェアリー 80 92 115 143 115 80
メガエンブオー ほのお かくとう 110 148 75 110 110 75
メガオーダイル みず ドラゴン 85 160 125 89 93 78
メガガメノデス いわ かくとう 72 140 130 64 106 88
メガスターミー みず エスパー 60 140 105 130 105 120
メガフラエッテ フェアリー - 74 85 87 155 148 102
メガニャオニクス エスパー - 74 48 76 143 101 124
メガカエンジシ ほのお ノーマル 86 88 92 129 86 126
メガライチュウX でんき かくとう 60 135 95 90 95 110
メガライチュウY でんき エスパー 60 100 55 160 80 130
メガピクシー フェアリー ひこう 95 80 93 135 110 70
メガペンドラー むし どく 60 140 149 75 99 62
メガウツボット くさ どく 80 125 85 135 95 70
メガドリュウズ じめん はがね 110 165 100 65 65 103
メガガブリアスZ ドラゴン フェアリー 108 130 85 141 85 151
メガアブソルZ あく ゴースト 65 154 60 75 60 151
メガルカリオZ かくとう はがね 70 100 70 164 70 151
メガシビルドン でんき みず 85 145 80 135 90 80
メガカイリュー ドラゴン ひこう 91 124 115 145 125 100
メガカラマネロ あく エスパー 86 102 88 98 120 88
メガドラミドロ どく ドラゴン 65 85 105 132 163 44
メガユキメノコ こおり ゴースト 70 80 70 140 100 120
メガルチャブル かくとう ひこう 78 137 100 74 93 118
メガズルズキン あく かくとう 65 130 135 55 135 68
メガシャンデラ ゴースト ほのお 60 75 110 175 110 90
メガゲッコウガ みず あく 72 125 77 133 81 142
メガタイレーツ かくとう はがね 65 135 135 70 65 100
メガブリガロン くさ かくとう 88 137 172 74 115 44
メガエアームド はがね ひこう 65 140 110 40 100 110
メガマフォクシー ほのお エスパー 75 69 72 159 125 134
メガジジーロン ノーマル ドラゴン 78 85 110 160 116 36
メガジガルデ ドラゴン じめん 216 70 91 216 85 100
メガスコヴィラン くさ ほのお 65 138 85 138 85 75
メガキラフロル いわ どく 83 90 105 150 96 101
メガシャリタツ ドラゴン みず 68 65 90 135 125 92
メガセグレイブ ドラゴン こおり 115 175 117 105 101 87
メガチリーン エスパー はがね 75 50 110 135 120 65
メガグソクムシャ むし はがね 75 150 175 70 120 40
メガゴルーグ じめん ゴースト 89 159 105 70 105 55
メガムクホーク むし どく 85 120 70 50 60 121
メガヒードラン ほのお はがね 91 90 116 160 130 113
メガダークライ あく - 70 90 120 175 120 125
メガマギアナ はがね フェアリー 80 115 145 160 145 55
メガゼラオラ でんき - 88 152 105 102 105 148
メガケケンカニ こおり かくとう 97 157 122 62 107 33"""

def make_tiers(base_name, types, hp, atk, df, spa, spd, spe):
    result = []
    
    # 計算式 (Lv.50, 個体値31固定)
    noev_real = spe + 20        # 無振り
    quasi_real = spe + 52       # 準速
    max_real = math.floor(quasi_real * 1.1)  # 最速
    
    stats = {
        "hp": hp,
        "atk": atk,
        "def": df,
        "spa": spa,
        "spd": spd,
        "spe": spe
    }
    
    for tag, real_val in [("無振り", noev_real), ("準速", quasi_real), ("最速", max_real)]:
        entry = {
            "name": f"{base_name} ({tag})",
            "baseName": base_name,
            "types": types,
            "baseSpe": spe,
            "realSpe": real_val,
            "stats": stats,
            "typeTag": tag,
            "isMega": True
        }
        result.append(entry)
    return result

with open('pokemon_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Filter out previously added ones if we run this multiple times by mistake
new_base_names = [line.split()[0] for line in raw_data.strip().split("\n")]
data = [p for p in data if p["baseName"] not in new_base_names]

new_entries = []
for line in raw_data.strip().split("\n"):
    parts = line.split()
    name = parts[0]
    type1 = parts[1]
    type2 = parts[2]
    hp = int(parts[3])
    atk = int(parts[4])
    df = int(parts[5])
    spa = int(parts[6])
    spd = int(parts[7])
    spe = int(parts[8])
    
    types = [type1] if type2 == "-" else [type1, type2]
    
    tiers = make_tiers(name, types, hp, atk, df, spa, spd, spe)
    new_entries.extend(tiers)

data.extend(new_entries)

# 実数値の降順でソート
data.sort(key=lambda x: -x["realSpe"])

with open('pokemon_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Added {len(new_entries)} mega forms. Total entries now are: {len(data)}")
