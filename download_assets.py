import os
import urllib.request
import urllib.parse
import re
import time
import shutil

# 新規メガシンカポケモンのリストと英語名のマッピング
# PokeOS等の外部ソースで一般的に使用される命名規則
ZA_DATA = {
    "メガメガニウム": "meganium-mega",
    "メガエンブオー": "emboar-mega",
    "メガオーダイル": "feraligatr-mega",
    "メガガメノデス": "barbaracle-mega",
    "メガスターミー": "starmie-mega",
    "メガフラエッテ": "floette-mega",
    "メガニャオニクス": "meowstic-mega",
    "メガカエンジシ": "pyroar-mega",
    "メガライチュウX": "raichu-mega-x",
    "メガライチュウY": "raichu-mega-y",
    "メガピクシー": "clefable-mega",
    "メガペンドラー": "scolipede-mega",
    "メガウツボット": "victreebel-mega",
    "メガドリュウズ": "excadrill-mega",
    "メガガブリアスZ": "garchomp-mega-z",
    "メガアブソルZ": "absol-mega-z",
    "メガルカリオZ": "lucario-mega-z",
    "メガシビルドン": "eelektross-mega",
    "メガカイリュー": "dragonite-mega",
    "メガカラマネロ": "malamar-mega",
    "メガドラミドロ": "dragalge-mega",
    "メガユキメノコ": "froslass-mega",
    "メガルチャブル": "hawlucha-mega",
    "メガズルズキン": "scrafty-mega",
    "メガシャンデラ": "chandelure-mega",
    "メガゲッコウガ": "greninja-mega",
    "メガタイレーツ": "falinks-mega",
    "メガブリガロン": "chesnaught-mega",
    "メガエアームド": "skarmory-mega",
    "メガマフォクシー": "delphox-mega",
    "メガジジーロン": "drampa-mega",
    "メガジガルデ": "zygarde-mega",
    "メガスコヴィラン": "scovillain-mega",
    "メガキラフロル": "glimmora-mega",
    "メガシャリタツ": "tatsugiri-mega",
    "メガセグレイブ": "baxcalibur-mega",
    "メガチリーン": "chimecho-mega",
    "メガグソクムシャ": "golisopod-mega",
    "メガゴルーグ": "golurk-mega",
    "メガムクホーク": "staraptor-mega",
    "メガヒードラン": "heatran-mega",
    "メガダークライ": "darkrai-mega",
    "メガマギアナ": "magearna-mega",
    "メガゼラオラ": "zeraora-mega",
    "メガケケンカニ": "crabominable-mega"
}

IMAGE_DIR = "assets/images"

def purge_images():
    if os.path.exists(IMAGE_DIR):
        print(f"Purging existing images in {IMAGE_DIR}...")
        for filename in os.listdir(IMAGE_DIR):
            file_path = os.path.join(IMAGE_DIR, filename)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(f'Failed to delete {file_path}. Reason: {e}')
    os.makedirs(IMAGE_DIR, exist_ok=True)

def search_bing_image(pokemon_name):
    """Bing Images を使用した画像検索ロジック (Fallback)"""
    query = f"{pokemon_name} Mega Evolution icon png"
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}&form=HDRSC2"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]*\.(?:png|jpg|webp))&quot;', html)
            if murls:
                return murls[0]
    except Exception as e:
        print(f"Search error for {pokemon_name}: {e}")
    return None

def download_image(name, url):
    path = os.path.join(IMAGE_DIR, f"{name}.png")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        # URLを安全にエンコード
        parsed_url = urllib.parse.urlparse(url)
        safe_url = f"{parsed_url.scheme}://{parsed_url.netloc}{urllib.parse.quote(parsed_url.path)}"
        if parsed_url.query:
            safe_url += f"?{parsed_url.query}"
            
        req = urllib.request.Request(safe_url, headers=headers)
        with urllib.request.urlopen(req) as response:
            with open(path, 'wb') as f:
                f.write(response.read())
        print(f"Downloaded: {name}")
        return True
    except Exception as e:
        print(f"Download failed for {name} from {url}: {e}")
    return False

def main():
    purge_images()
    print("Starting Mega Evolution image acquisition...")
    
    for jp_name, en_name in ZA_DATA.items():
        # 1. PokeOS のアセットサーバーを第一候補にする (確実性が高い)
        primary_url = f"https://assets.pokeos.com/pokemon/{en_name}.png"
        print(f"Trying primary source for {jp_name} ({en_name})...")
        
        if download_image(jp_name, primary_url):
            # 成功したら次へ
            time.sleep(0.5)
            continue
            
        # 2. 失敗した場合は画像検索による自動取得を試みる (Fallback)
        print(f"Falling back to image search for {jp_name}...")
        search_url = search_bing_image(jp_name)
        if search_url:
            download_image(jp_name, search_url)
            time.sleep(1)
        else:
            print(f"CRITICAL: Could not find image for {jp_name}")

if __name__ == "__main__":
    main()
