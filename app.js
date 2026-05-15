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

// Legends Z-A 新規メガシンカ等の例外処理データ
const ZA_EXCEPTIONS = {
    "メガゲッコウガ": { dexId: 658, spe: 142, hp: 72, atk: 125, def: 77, spa: 133, spd: 81 },
    "メガマフォクシー": { dexId: 655, spe: 134, hp: 75, atk: 69, def: 72, spa: 159, spd: 125 },
    "メガブリガロン": { dexId: 652, spe: 44, hp: 88, atk: 137, def: 172, spa: 74, spd: 115 },
    "メガガブリアスZ": { dexId: 445, spe: 151, hp: 108, atk: 130, def: 85, spa: 141, spd: 85 },
    "メガルカリオZ": { dexId: 448, spe: 151, hp: 70, atk: 100, def: 70, spa: 164, spd: 70 },
    "メガアブソルZ": { dexId: 359, spe: 151, hp: 65, atk: 154, def: 60, spa: 75, spd: 60 },
    "メガチリーン": { dexId: 358, spe: 65, hp: 75, atk: 50, def: 110, spa: 135, spd: 120, types: ["エスパー", "はがね"] },
    "メガケケンカニ": { dexId: 740, spe: 33, hp: 97, atk: 157, def: 122, spa: 62, spd: 107 },
    "メガゴルーグ": { dexId: 623, spe: 55, hp: 89, atk: 159, def: 105, spa: 70, spd: 105 },
    "メガグソクムシャ": { dexId: 768, spe: 40, hp: 75, atk: 150, def: 175, spa: 70, spd: 120, types: ["むし", "はがね"] },
    "メガニャオニクス": { dexId: 678, spe: 124, hp: 74, atk: 48, def: 76, spa: 143, spd: 101 }
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

    // 画像エラー時のフォールバック処理
    const handleImgError = (img) => {
        if (img.src !== baseSprite) {
            img.src = baseSprite;
        } else {
            // 全ての画像に失敗した場合、CSSプレースホルダーを表示
            const container = img.parentElement;
            const initial = p.baseName.charAt(0);
            container.innerHTML = `<div class="poke-icon-placeholder">${initial}</div>`;
        }
    };

    // HTML構築
    name.innerHTML = `
        <div class="name-inner-wrapper">
            <div class="poke-icon-container">
                <img class="poke-icon" 
                     src="${varietySprite}" 
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
    const s = p.stats;
    const totalBase = s.hp + s.atk + s.def + s.spa + s.spd + s.spe;
    ui.overlayContent.innerHTML = `
        <div class="overlay-header">
            <h2>${p.baseName}</h2>
            <div style="font-size:0.8rem; color:var(--slate);">${p.types.join(' / ')}</div>
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
