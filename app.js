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

function buildRow(p, idx) {
    const el = document.createElement('div');
    const tierClass = p.typeTag === '最速' ? 'is-fastest' : p.typeTag === '準速' ? 'is-semi' : 'is-noev';
    el.className = `poke-row ${tierClass}`;
    
    const t1 = p.types[0];
    const t2 = p.types[1] || t1;
    
    // Name with Sprite
    const name = document.createElement('div');
    name.className = 'poke-name-box';
    
    const pokeBall = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
    const baseSprite = p.dexId ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.dexId}.png` : pokeBall;
    const megaSprite = (p.megaId && p.megaId !== 0) ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.megaId}.png` : baseSprite;

    name.innerHTML = `
        <div class="name-inner-wrapper">
            <img class="poke-icon" 
                 src="${megaSprite}" 
                 onerror="if(this.src !== '${baseSprite}') { this.src='${baseSprite}'; } else { this.src='${pokeBall}'; this.onerror=null; }" 
                 alt="icon" loading="lazy">
            <div class="name-text-area">
                <span class="poke-text">${p.baseName}</span> 
                <span class="mode-tag">(${p.typeTag})</span>
            </div>
        </div>
    `;
    
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
            <div class="stat-item"><span class="stat-lbl">素早さ(種族値)</span><span class="stat-num highlight">${s.spe}</span></div>
            <div class="stat-item" style="border:1px solid var(--cyan); margin-top:10px;">
                <span class="stat-lbl">実数値 (${p.typeTag})</span>
                <span class="stat-num highlight" style="font-size:1.5rem;">${p.realSpe}</span>
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
            ui.ink.style.transform = 'translateX(87px)';
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
