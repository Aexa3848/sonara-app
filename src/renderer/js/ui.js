export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value);
    else if (key === 'dataset' && typeof value === 'object') Object.assign(node.dataset, value);
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key in node) {
      node[key] = value;
    } else {
      node.setAttribute(key, value);
    }
  }
  const arr = Array.isArray(children) ? children : [children];
  for (const child of arr) {
    if (child == null || child === false) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      node.appendChild(document.createTextNode(String(child)));
    } else {
      node.appendChild(child);
    }
  }
  return node;
}

export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

export function fmtDuration(seconds) {
  const s = Math.max(0, Math.round(seconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}:${String(mm).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  }
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function trackUrl(track) {
  if (!track || !track.path) return '';
  // Use sonara-track://x/<encoded full path> so Windows drive letters survive URL parsing.
  const normalized = track.path.replace(/\\/g, '/');
  return `sonara-track://x/${encodeURIComponent(normalized)}`;
}

export function coverEl(track, size = null) {
  const wrap = el('div', { class: 'cover' });
  if (track && track.cover) {
    const img = el('img', { src: track.cover, alt: '', loading: 'lazy' });
    wrap.appendChild(img);
  } else {
    wrap.appendChild(el('div', { class: 'empty', html: '♪', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: size ? `${Math.floor(size * 0.5)}px` : '32px', color: 'rgba(255,255,255,0.2)' } }));
  }
  return wrap;
}

let toastTimer = null;
export function toast(message, ms = 2200) {
  const node = document.getElementById('toast');
  if (!node) return;
  node.textContent = message;
  node.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.hidden = true; }, ms);
}

export function debounce(fn, wait = 200) {
  let t = null;
  return (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function chooseWeighted(items, weightFn) {
  const weights = items.map((it) => Math.max(0, weightFn(it)));
  const total = weights.reduce((s, w) => s + w, 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)] || null;
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}
