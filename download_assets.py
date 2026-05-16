import os
import urllib.request
import json

# app.js から ZA_EXCEPTIONS を（簡易的に）抽出するか、手動で定義
# ここでは確実にダウンロードするためにリストを定義
ZA_DOWNLOADS = {
    "メガメガニウム": 10291, "メガエンブオー": 10296, "メガオーダイル": 10295,
    "メガガメノデス": 10299, "メガスターミー": 10301, "メガフラエッテ": 10304,
    "メガニャオニクス": 10314, "メガカエンジシ": 10300, "メガライチュウX": 10302,
    "メガライチュウY": 10303, "メガピクシー": 10305, "メガペンドラー": 10308,
    "メガウツボット": 10311, "メガドリュウズ": 10312, "メガガブリアスZ": 10309,
    "メガアブソルZ": 10307, "メガルカリオZ": 10310, "メガシビルドン": 10317,
    "メガカイリュー": 10318, "メガカラマネロ": 10319, "メガドラミドロ": 10320,
    "メガユキメノコ": 10321, "メガルチャブル": 10322, "メガズルズキン": 10323,
    "メガシャンデラ": 10324, "メガゲッコウガ": 10294, "メガタイレーツ": 10325,
    "メガブリガロン": 10292, "メガエアームド": 10326, "メガマフォクシー": 10293,
    "メガジジーロン": 10327, "メガジガルデ": 10328, "メガスコヴィラン": 10329,
    "メガキラフロル": 10330, "メガシャリタツ": 10331, "メガセグレイブ": 10332,
    "メガチリーン": 10306, "メガグソクムシャ": 10316, "メガゴルーグ": 10313,
    "メガムクホーク": 10333, "メガヒードラン": 10334, "メガダークライ": 10335,
    "メガマギアナ": 10336, "メガゼラオラ": 10337, "メガケケンカニ": 10315
}

IMAGE_DIR = "assets/images"
os.makedirs(IMAGE_DIR, exist_ok=True)

def download_sprites():
    print("Starting sprite downloads from PokeAPI (Home 3D sprites)...")
    for name, vid in ZA_DOWNLOADS.items():
        # PokeAPI の Home 3D スプライトを使用（高品質）
        url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/{vid}.png"
        path = os.path.join(IMAGE_DIR, f"{name}.png")
        
        if os.path.exists(path):
            print(f"Skipping {name}, already exists.")
            continue
            
        try:
            with urllib.request.urlopen(url) as response:
                if response.status == 200:
                    with open(path, 'wb') as f:
                        f.write(response.read())
                    print(f"Downloaded: {name} (ID: {vid})")
                else:
                    print(f"Failed: {name} (Status: {response.status})")
        except Exception as e:
            print(f"Error downloading {name}: {e}")

if __name__ == "__main__":
    download_sprites()
