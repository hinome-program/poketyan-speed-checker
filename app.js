// ポケチャン・スピードチェッカーコアロジック
// ファイルエンコーディング: UTF-8

const TYPE_COLORS = {
    "ノーマル": "var(--type-normal)",
    "ほのお": "var(--type-fire)",
    "みず": "var(--type-water)",
    "くさ": "var(--type-grass)",
    "でんき": "var(--type-electric)",
    "こおり": "var(--type-ice)",
    "かくとう": "var(--type-fighting)",
    "どく": "var(--type-poison)",
    "じめん": "var(--type-ground)",
    "ひこう": "var(--type-flying)",
    "エスパー": "var(--type-psychic)",
    "むし": "var(--type-bug)",
    "いわ": "var(--type-rock)",
    "ゴースト": "var(--type-ghost)",
    "ドラゴン": "var(--type-dragon)",
    "あく": "var(--type-dark)",
    "はがね": "var(--type-steel)",
    "フェアリー": "var(--type-fairy)"
};

let allPokemon = [];
let viewMode = 'normal'; // 'normal' or 'mega'

const ui = {
    listing: document.getElementById('listing-container'),
    search: document.getElementById('poke-search'),
    btnNormal: document.getElementById('btn-normal'),
    btnMega: document.getElementById('btn-mega'),
    ink: document.querySelector('.selector-ink'),
    overlay: document.getElementById('detail-overlay'),
    overlayContent: document.getElementById('overlay-content'),
    overlayClose: document.getElementById('overlay-close')
};

async function startup() {
    try {
        const res = await fetch('pokemon_data.json');
        allPokemon = await res.json();
        draw();
        wireEvents();
    } catch (e) {
        console.error('データの読み込みに失敗しました:', e);
    }
}

function draw() {
    const q = ui.search.value.toLowerCase().trim();
    
    // Filter by mode and search
    let list = allPokemon.filter(p => {
        const isMegaTarget = viewMode === 'mega';
        if (p.isMega !== isMegaTarget) return false;
        
        return p.baseName.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
    });

    // Sort by Real Speed Descending
    list.sort((a, b) => b.realSpe - a.realSpe);

    ui.listing.innerHTML = '';
    list.forEach((p, idx) => {
        const row = buildRow(p, idx);
        ui.listing.appendChild(row);
    });
}

// Legends Z-A 新規メガシンカ等の例外処理データ（本編・DLC補完）
const ZA_EXCEPTIONS = {
    "メガメガニウム": { dexId: 154, varietyId: 10282, hp: 80, atk: 92, def: 115, spa: 143, spd: 115, spe: 80, types: ["くさ", "フェアリー"] },
    "メガエンブオー": { dexId: 500, varietyId: 10286, hp: 110, atk: 148, def: 75, spa: 110, spd: 110, spe: 75, types: ["ほのお", "かくとう"] },
    "メガオーダイル": { dexId: 160, varietyId: 10283, hp: 85, atk: 160, def: 125, spa: 89, spd: 93, spe: 78, types: ["みず", "ドラゴン"] },
    "メガガメノデス": { dexId: 689, varietyId: 10298, hp: 72, atk: 140, def: 130, spa: 64, spd: 106, spe: 88, types: ["いわ", "かくとう"] },
    "メガスターミー": { dexId: 121, varietyId: 10280, hp: 60, atk: 140, def: 105, spa: 130, spd: 105, spe: 120, types: ["みず", "エスパー"] },
    "メガフラエッテ": { dexId: 670, varietyId: 10296, hp: 74, atk: 85, def: 87, spa: 155, spd: 148, spe: 102, types: ["フェアリー"] },
    "メガニャオニクス": { dexId: 678, varietyId: 10314, hp: 74, atk: 48, def: 76, spa: 143, spd: 101, spe: 124, types: ["エスパー"] },
    "メガカエンジシ": { dexId: 668, varietyId: 10295, hp: 86, atk: 88, def: 92, spa: 129, spd: 86, spe: 126, types: ["ほのお", "ノーマル"] },
    "メガライチュウX": { dexId: 26, varietyId: 10304, hp: 60, atk: 135, def: 95, spa: 90, spd: 95, spe: 110, types: ["でんき", "かくとう"] },
    "メガライチュウY": { dexId: 26, varietyId: 10305, hp: 60, atk: 100, def: 55, spa: 160, spd: 80, spe: 130, types: ["でんき", "エスパー"] },
    "メガピクシー": { dexId: 36, varietyId: 10278, hp: 95, atk: 80, def: 93, spa: 135, spd: 110, spe: 70, types: ["フェアリー", "ひこう"] },
    "メガペンドラー": { dexId: 545, varietyId: 10288, hp: 60, atk: 140, def: 149, spa: 75, spd: 99, spe: 62, types: ["むし", "どく"] },
    "メガウツボット": { dexId: 71, varietyId: 10279, hp: 80, atk: 125, def: 85, spa: 135, spd: 95, spe: 70, types: ["くさ", "どく"] },
    "メガドリュウズ": { dexId: 530, varietyId: 10289, hp: 110, atk: 165, def: 100, spa: 65, spd: 65, spe: 103, types: ["じめん", "はがね"] },
    "メガガブリアスZ": { dexId: 445, varietyId: 10309, hp: 108, atk: 130, def: 85, spa: 141, spd: 85, spe: 151, types: ["ドラゴン", "フェアリー"] },
    "メガアブソルZ": { dexId: 359, varietyId: 10307, hp: 65, atk: 154, def: 60, spa: 75, spd: 60, spe: 151, types: ["あく", "ゴースト"] },
    "メガルカリオZ": { dexId: 448, varietyId: 10310, hp: 70, atk: 100, def: 70, spa: 164, spd: 70, spe: 151, types: ["かくとう", "はがね"] },
    "メガシビルドン": { dexId: 604, varietyId: 10290, hp: 85, atk: 145, def: 80, spa: 135, spd: 90, spe: 80, types: ["でんき", "みず"] },
    "メガカイリュー": { dexId: 149, varietyId: 10281, hp: 91, atk: 124, def: 115, spa: 145, spd: 125, spe: 100, types: ["ドラゴン", "ひこう"] },
    "メガカラマネロ": { dexId: 687, varietyId: 10297, hp: 86, atk: 102, def: 88, spa: 98, spd: 120, spe: 88, types: ["あく", "エスパー"] },
    "メガドラミドロ": { dexId: 691, varietyId: 10299, hp: 65, atk: 85, def: 105, spa: 132, spd: 163, spe: 44, types: ["どく", "ドラゴン"] },
    "メガユキメノコ": { dexId: 478, varietyId: 10287, hp: 70, atk: 80, def: 70, spa: 140, spd: 100, spe: 120, types: ["こおり", "ゴースト"] },
    "メガルチャブル": { dexId: 701, varietyId: 10300, hp: 78, atk: 137, def: 100, spa: 74, spd: 93, spe: 118, types: ["かくとう", "ひこう"] },
    "メガズルズキン": { dexId: 560, varietyId: 10285, hp: 65, atk: 130, def: 135, spa: 55, spd: 135, spe: 68, types: ["あく", "かくとう"] },
    "メガシャンデラ": { dexId: 609, varietyId: 10291, hp: 60, atk: 75, def: 110, spa: 175, spd: 110, spe: 90, types: ["ゴースト", "ほのお"] },
    "メガゲッコウガ": { dexId: 658, varietyId: 10294, hp: 72, atk: 125, def: 77, spa: 133, spd: 81, spe: 142, types: ["みず", "あく"] },
    "メガタイレーツ": { dexId: 870, varietyId: 10303, hp: 65, atk: 135, def: 135, spa: 70, spd: 65, spe: 100, types: ["かくとう", "はがね"] },
    "メガブリガロン": { dexId: 652, varietyId: 10292, hp: 88, atk: 137, def: 172, spa: 74, spd: 115, spe: 44, types: ["くさ", "かくとう"] },
    "メガエアームド": { dexId: 227, varietyId: 10284, hp: 65, atk: 140, def: 110, spa: 40, spd: 100, spe: 110, types: ["はがね", "ひこう"] },
    "メガマフォクシー": { dexId: 655, varietyId: 10293, hp: 75, atk: 69, def: 72, spa: 159, spd: 125, spe: 134, types: ["ほのお", "エスパー"] },
    "メガジジーロン": { dexId: 780, varietyId: 10302, hp: 78, atk: 85, def: 110, spa: 160, spd: 116, spe: 36, types: ["ノーマル", "ドラゴン"] },
    "メガジガルデ": { dexId: 718, varietyId: 10301, hp: 216, atk: 70, def: 91, spa: 216, spd: 85, spe: 100, types: ["ドラゴン", "じめん"] },
    "メガスコヴィラン": { dexId: 951, varietyId: 10320, hp: 65, atk: 138, def: 85, spa: 138, spd: 85, spe: 75, types: ["くさ", "ほのお"] },
    "メガキラフロル": { dexId: 970, varietyId: 10321, hp: 83, atk: 90, def: 105, spa: 150, spd: 96, spe: 101, types: ["いわ", "どく"] },
    "メガシャリタツ": { dexId: 978, varietyId: 10322, hp: 68, atk: 65, def: 90, spa: 135, spd: 125, spe: 92, types: ["ドラゴン", "みず"] },
    "メガセグレイブ": { dexId: 998, varietyId: 10325, hp: 115, atk: 175, def: 117, spa: 105, spd: 101, spe: 87, types: ["ドラゴン", "こおり"] },
    "メガチリーン": { dexId: 358, varietyId: 10306, hp: 75, atk: 50, def: 110, spa: 135, spd: 120, spe: 65, types: ["エスパー", "はがね"] },
    "メガグソクムシャ": { dexId: 768, varietyId: 10316, hp: 75, atk: 150, def: 175, spa: 70, spd: 120, spe: 40, types: ["むし", "はがね"] },
    "メガゴルーグ": { dexId: 623, varietyId: 10313, hp: 89, atk: 159, def: 105, spa: 70, spd: 105, spe: 55, types: ["じめん", "ゴースト"] },
    "メガムクホーク": { dexId: 398, varietyId: 10308, hp: 85, atk: 120, def: 70, spa: 50, spd: 60, spe: 121, types: ["むし", "どく"] },
    "メガヒードラン": { dexId: 485, varietyId: 10311, hp: 91, atk: 90, def: 116, spa: 160, spd: 130, spe: 113, types: ["ほのお", "はがね"] },
    "メガダークライ": { dexId: 491, varietyId: 10312, hp: 70, atk: 90, def: 120, spa: 175, spd: 120, spe: 125, types: ["あく"] },
    "メガマギアナ": { dexId: 801, varietyId: 10317, hp: 80, atk: 115, def: 145, spa: 160, spd: 145, spe: 55, types: ["はがね", "フェアリー"] },
    "メガゼラオラ": { dexId: 807, varietyId: 10319, hp: 88, atk: 152, def: 105, spa: 102, spd: 105, spe: 148, types: ["でんき"] },
    "メガケケンカニ": { dexId: 740, varietyId: 10315, hp: 97, atk: 157, def: 122, spa: 62, spd: 107, spe: 33, types: ["こおり", "かくとう"] }
};

function buildRow(p, idx) {
    const el = document.createElement('div');
    const tierClass = p.typeTag === '最速' ? 'is-fastest' : p.typeTag === '準速' ? 'is-semi' : 'is-noev';
    el.className = `poke-row ${tierClass}`;
    
    // 例外処理：ハードコードされたデータの適用
    if (ZA_EXCEPTIONS[p.baseName]) {
        const ex = ZA_EXCEPTIONS[p.baseName];
        if (!p.dexId || p.dexId === 0) p.dexId = ex.dexId;
        if (ex.types) p.types = ex.types; // タイプの上書き
        // 実数値計算済みのデータに対しても種族値を保証
        if (p.stats) {
            p.stats.spe = ex.spe;
            p.stats.hp = ex.hp;
            p.stats.atk = ex.atk;
            p.stats.def = ex.def;
            p.stats.spa = ex.spa;
            p.stats.spd = ex.spd;
        }
    }

    const t1 = p.types[0];
    const t2 = p.types[1] || t1;
    
    // Name with Sprite
    const name = document.createElement('div');
    name.className = 'poke-name-box';
    
    const pokeBall = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
    const baseSprite = p.dexId ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.dexId}.png` : pokeBall;
    const varietySprite = (p.varietyId && p.varietyId !== 0) ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.varietyId}.png` : baseSprite;

    // ZA_EXCEPTIONS の場合はローカル画像を最優先
    const localSprite = `assets/images/${p.baseName}.png`;
    const finalSprite = ZA_EXCEPTIONS[p.baseName] ? localSprite : varietySprite;

    // 画像エラー時のフォールバック処理
    const handleImgError = (img) => {
        const localSrc = `assets/images/${p.baseName}.png`;
        // まずローカルアセットを試す
        if (img.src.includes('PokeAPI') && !img.dataset.triedLocal) {
            img.dataset.triedLocal = "true";
            img.src = localSrc;
        } else if (img.src !== baseSprite) {
            img.src = baseSprite;
        } else {
            // 全ての画像に失敗した場合、CSSプレースホルダーを表示
            const container = img.parentElement;
            if (container) {
                const initial = p.baseName.charAt(0);
                container.innerHTML = `<div class="poke-icon-placeholder">${initial}</div>`;
            }
        }
    };

    // HTML構築
    name.innerHTML = `
        <div class="name-inner-wrapper">
            <div class="poke-icon-container">
                <img class="poke-icon" 
                     src="${finalSprite}" 
                     alt="${p.baseName}" 
                     loading="lazy">
            </div>
            <div class="name-text-area">
                <span class="poke-text">${p.baseName}</span> 
                <span class="mode-tag">(${p.typeTag})</span>
            </div>
        </div>
    `;

    // 実行時にエラーハンドラをアタッチ
    const img = name.querySelector('.poke-icon');
    img.onerror = () => handleImgError(img);
    
    // Base Speed
    const base = document.createElement('div');
    base.className = 'poke-base-box';
    base.textContent = p.baseSpe;

    // Real Speed
    const real = document.createElement('div');
    real.className = 'poke-real-box';
    real.textContent = p.realSpe;
    
    el.append(name, base, real);
    el.onclick = () => openPop(p);
    
    return el;
}

function openPop(p) {
    let s = p.stats;
    let baseName = p.baseName;
    let types = p.types;

    // バイパス処理：新規メガシンカ等の例外データがある場合はハードコード値を優先使用
    if (ZA_EXCEPTIONS[baseName]) {
        const ex = ZA_EXCEPTIONS[baseName];
        s = {
            hp: ex.hp,
            atk: ex.atk,
            def: ex.def,
            spa: ex.spa,
            spd: ex.spd,
            spe: ex.spe
        };
        if (ex.types) types = ex.types;
    }

    const totalBase = s.hp + s.atk + s.def + s.spa + s.spd + s.spe;
    ui.overlayContent.innerHTML = `
        <div class="overlay-header">
            <h2>${baseName}</h2>
            <div style="font-size:0.8rem; color:var(--slate);">${types.join(' / ')}</div>
        </div>
        <div class="overlay-stats">
            <div class="stat-item"><span class="stat-lbl">HP</span><span class="stat-num">${s.hp}</span></div>
            <div class="stat-item"><span class="stat-lbl">攻撃</span><span class="stat-num">${s.atk}</span></div>
            <div class="stat-item"><span class="stat-lbl">防御</span><span class="stat-num">${s.def}</span></div>
            <div class="stat-item"><span class="stat-lbl">特攻</span><span class="stat-num">${s.spa}</span></div>
            <div class="stat-item"><span class="stat-lbl">特防</span><span class="stat-num">${s.spd}</span></div>
            <div class="stat-item"><span class="stat-lbl yellow-highlight">素早さ</span><span class="stat-num highlight yellow-highlight">${s.spe}</span></div>
            <div class="stat-item" style="border:1px solid var(--cyan); margin-top:10px;">
                <span class="stat-lbl">合計種族値</span>
                <span class="stat-num highlight" style="font-size:1.5rem;">${totalBase}</span>
            </div>
        </div>
    `;
    ui.overlay.style.display = 'block';
}

function wireEvents() {
    ui.search.oninput = draw;

    const switchMode = (m) => {
        viewMode = m;
        if (m === 'normal') {
            ui.btnNormal.classList.add('active');
            ui.btnMega.classList.remove('active');
            ui.ink.style.transform = 'translateX(0)';
        } else {
            ui.btnNormal.classList.remove('active');
            ui.btnMega.classList.add('active');
            ui.ink.style.transform = 'translateX(100%)';
        }
        draw();
    };

    ui.btnNormal.onclick = () => switchMode('normal');
    ui.btnMega.onclick = () => switchMode('mega');

    ui.overlayClose.onclick = () => ui.overlay.style.display = 'none';
    window.onclick = (e) => {
        if (e.target == ui.overlay) ui.overlay.style.display = 'none';
    };
}

startup();
