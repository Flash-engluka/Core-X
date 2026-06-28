/* ============================================================
   sprites.js — 실제 PNG 스프라이트 로드 + 진영 컬러 틴트
   ──────────────────────────────────────────────────────────────
   24장 PNG (캐릭터 9 + 아이템 13 + Asriel 2)를 사전 로드.
   캐릭터/아이템은 흑백이라 진영 컬러로 틴트하는 헬퍼 제공.
   ============================================================ */
(() => {
  'use strict';

  const CHAR_FILES = {
    'toriel':              'Toriel.png',
    'papyrus':             'Papyrus.png',
    'undyne':              'Undyne.png',
    'pre-undying':         'Pre Undying.png',
    'undyne-the-undying':  'Undyne the Undying.png',
    'mettaton':            'Mettaton.png',
    'mettaton-ex':         'Mettaton EX.png',
    'mettaton-neo':        'Mettaton NEO.png',
    'alphys':              'Alphys.png',
  };

  const ITEM_FILES = {
    'Froggit':       'Froggit.png',
    'Final Froggit': 'Final Froggit.png',
    'Whimsun':       'Whimsun.png',
    'Whimsalot':     'Whimsalot.png',
    'Lesser Dog':    'Lesser Dog.png',
    'Greater Dog':   'Greater Dog.png',
    'Moldsmal':      'Moldsmal.png',
    'Moldbygg':      'Moldbygg.png',
    'Napstablook':   'Napstablook.png',
    'Sans':          'Sans.png',
    'Flowey':        'Flowey.png',
    'Asgore':        'Asgore.png',
    'Monster Kid':   'Kid.png',
  };

  const TINT = {
    'toriel': '#ff0000', 'papyrus': '#0099ff',
    'undyne': '#15ff00', 'pre-undying': '#15ff00', 'undyne-the-undying': '#15ff00',
    'mettaton': '#fbff00', 'mettaton-ex': '#fbff00', 'mettaton-neo': '#fbff00', 'alphys': '#fbff00',
    'Napstablook': '#ff0000',
    'Sans': '#0099ff', 'Flowey': '#0099ff',
    'Asgore': '#15ff00',
    'Monster Kid': '#fbff00',
    'Froggit': '#ff0000', 'Final Froggit': '#ff0000',
    'Whimsun': '#ff0000', 'Whimsalot': '#ff0000',
    'Lesser Dog': '#0099ff', 'Greater Dog': '#0099ff',
    'Moldsmal': '#15ff00', 'Moldbygg': '#15ff00',
  };

  const cache = {};
  const tintedCache = {};
  let loadedCount = 0;
  let totalAssets = 0;
  const loadedCallbacks = [];

  function loadImage(key, src) {
    totalAssets++;
    const img = new Image();
    img.onload = () => {
      cache[key] = img;
      loadedCount++;
      if (loadedCount === totalAssets) loadedCallbacks.forEach(cb => cb());
    };
    img.onerror = () => {
      console.warn('[sprites] failed to load:', src);
      loadedCount++;
      if (loadedCount === totalAssets) loadedCallbacks.forEach(cb => cb());
    };
    img.src = src;
  }

  function preload() {
    for (const [k, f] of Object.entries(CHAR_FILES))
      loadImage('char:' + k, 'assets/sprites/characters/' + f);
    for (const [k, f] of Object.entries(ITEM_FILES))
      loadImage('item:' + k, 'assets/sprites/items/' + f);
    loadImage('asriel:A', 'assets/sprites/asriel/Asriel_A.png');
  }

  function onLoaded(cb) {
    if (loadedCount === totalAssets && totalAssets > 0) cb();
    else loadedCallbacks.push(cb);
  }

  function getCharImage(key) { return cache['char:' + key] || null; }
  function getItemImage(name) { return cache['item:' + name] || null; }
  function getAsrielA() { return cache['asriel:A'] || null; }

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [255, 255, 255];
  }

  function tint(img, color) {
    if (!img) return null;
    const key = img.src + '|' + color;
    if (tintedCache[key]) return tintedCache[key];
    const cv = document.createElement('canvas');
    cv.width = img.naturalWidth;
    cv.height = img.naturalHeight;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, cv.width, cv.height);
    const px = data.data;
    const [tr, tg, tb] = hexToRgb(color);
    for (let i = 0; i < px.length; i += 4) {
      const brightness = (px[i] + px[i+1] + px[i+2]) / 3;
      if (brightness < 50) {
        px[i+3] = 0;
      } else {
        const r = brightness / 255;
        px[i] = Math.round(tr * r);
        px[i+1] = Math.round(tg * r);
        px[i+2] = Math.round(tb * r);
      }
    }
    ctx.putImageData(data, 0, 0);
    tintedCache[key] = cv;
    return cv;
  }

  function drawTo(ctx, kind, key, x, y, size) {
    const img = kind === 'char' ? getCharImage(key) : getItemImage(key);
    if (!img) return;
    const color = TINT[key];
    const src = color ? tint(img, color) : img;
    const ar = img.naturalWidth / img.naturalHeight;
    let w = size, h = size;
    if (ar > 1) h = size / ar; else w = size * ar;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, x - w/2, y - h/2, w, h);
  }

  function makeCanvasOf(kind, key, size = 96) {
    const cv = document.createElement('canvas');
    cv.width = size; cv.height = size;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const img = kind === 'char' ? getCharImage(key) : getItemImage(key);
    if (img) {
      const color = TINT[key];
      const src = color ? tint(img, color) : img;
      const ar = img.naturalWidth / img.naturalHeight;
      let w = size, h = size;
      if (ar > 1) h = size / ar; else w = size * ar;
      ctx.drawImage(src, (size - w) / 2, (size - h) / 2, w, h);
    } else {
      ctx.fillStyle = '#a070e8';
      ctx.font = `${Math.floor(size * 0.18)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(key.slice(0, 8), size / 2, size / 2);
    }
    return cv;
  }

  // 호환성 wrappers
  function drawCharacter(key) { return makeCanvasOf('char', key, 96); }
  function drawItemIcon(key, size = 48) { return makeCanvasOf('item', key, size); }

  preload();

  window.Sprites = {
    onLoaded, getCharImage, getItemImage, getAsrielA,
    tint, drawTo, makeCanvasOf,
    drawCharacter, drawItemIcon, TINT,
  };
})();
