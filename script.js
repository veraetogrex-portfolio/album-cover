// VECTOR Photos · album cover — zero dependencies.
// <section class="ac" data-assets="assets/"></section> becomes the whole app: the albums and one album.
// Drag a photo from "Highlights" onto the cover: the cover waits for the drop, the photo unfolds from its card
// into the full-width cover, and the family's copy of the album (sidebar, "What they see") follows.
;(() => {
  'use strict';

  const svg = (d, o = {}) => `<svg width="${o.s || 18}" height="${o.s || 18}" viewBox="0 0 24 24" fill="${o.fill || 'none'}" stroke="currentColor" stroke-width="${o.w || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const P = {
    library: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/>',
    memories: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    people: '<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.5a3 3 0 0 1 0 5.6M17.5 19a5 5 0 0 0-2-4"/>',
    places: '<path d="M12 21s-6-5.4-6-10a6 6 0 0 1 12 0c0 4.6-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>',
    favorites: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    albums: '<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M7 4h10"/>',
    shared: '<circle cx="7" cy="12" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="17" cy="18" r="2.5"/><path d="m9.2 10.8 5.6-3.4M9.2 13.2l5.6 3.4"/>',
    deleted: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    import: '<path d="M12 16V4m-5 5 5-5 5 5M4 20h16"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    share: '<path d="M12 15V3m-4 4 4-4 4 4M5 13v7h14v-7"/>',
    drop: '<path d="M12 4v12m-5-5 5 5 5-5M5 20h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    book: '<path d="M4 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-7"/><path d="M20 5v12h-7"/>',
  };
  const heart = '<svg width="13" height="13" viewBox="0 0 24 24" fill="#F08A6C" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
  const NAV = [['library', 'Library'], ['memories', 'Memories'], ['people', 'People'], ['places', 'Places'], ['favorites', 'Favorites'], ['albums', 'Albums'], ['shared', 'Shared'], ['deleted', 'Recently deleted']];
  const MINE = [['biscuit', 'Biscuit', 154], ['cake', 'Holt family', 312], ['beach', 'Summer at the sea', 57]];
  const ALBUMS = [   // [cover, title, meta, faces]
    ['biscuit', 'Biscuit', '154 photos · since 2023', []],
    ['cake', 'Holt family', '312 photos · 5 people', ['p-lea', 'p-oskar']],
    ['tram', 'Milan, one night', '23 photos · Nov 14', []],
    ['beach', 'Summer at the sea', '57 photos · Jul 3–12', []],
    ['snow', 'First snow', '18 photos · Nov 2', []],
  ];
  const SHARED = [['sunflowers', 'Provence, July', 'from Lea · 41 photos'], ['forest', 'Sunday hikes', 'from Oskar · 64 photos'], ['coffee', 'Café mornings', 'from Daria · 29 photos']];
  const HIGHLIGHTS = [['village', 'Pastel lane, Orta', 'Nov 15 · 4:10 pm', 3], ['dawn', 'Dawn on the pier', 'Nov 16 · 6:52 am', 7], ['boat', 'Boats at noon', 'Nov 16 · 12:24 pm', 4]];
  const ALL = ['trunk', 'coffee', 'village', 'ferry', 'dawn', 'boat', 'forest', 'hike'];
  const FAMILY = ['p-lea', 'p-oskar', 'p-daria'];
  // the cover the album opens with: the first photo of the trip until someone picks one
  const AUTO = { id: 'trunk', pos: [.5, .55], chip: 'Auto cover · first photo' };
  const COVER_POS = [.5, .62];
  const EASE = 'cubic-bezier(.16,1,.3,1)';   // the put-back of a photo dropped outside the cover

  class AlbumApp {
    constructor(root) {
      this.root = root;
      const A = this.A = root.dataset.assets || 'assets/';
      const img = (n, alt = '', at = '') => `<img src="${A}${n}.jpg" alt="${alt}"${at}>`;
      const faces = (list, cls = '') => `<span class="ac-faces">${list.map(p => `<span class="ac-pt ${cls}">${img(p)}</span>`).join('')}</span>`;
      root.innerHTML = `
<nav class="ac-side" aria-label="Main">
  <div class="ac-logo"><svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><rect x="2" y="7" width="15" height="15" rx="2.5" fill="none" stroke="#EDEAE3" stroke-width="2"/><rect x="9" y="3" width="15" height="15" rx="2.5" fill="#0B0C11" stroke="#F08A6C" stroke-width="2"/></svg><b>VECTOR</b><span>Photos</span></div>
  ${NAV.map(([k, t]) => `<a class="ac-nav${k === 'albums' ? ' is-on' : ''}" href="#" data-nav="${k}">${svg(P[k])}${t}${k === 'shared' ? '<span class="ac-count">2</span>' : ''}</a>`).join('')}
  <div class="ac-group">My albums</div>
  <a class="ac-mine" href="#" data-open="orta"><span class="ac-ph">${img('trunk', '', ' data-cover')}</span><span>Weekend at Lake Orta</span><span>86</span></a>
  ${MINE.map(([n, t, c]) => `<a class="ac-mine" href="#"><span class="ac-ph">${img(n)}</span><span>${t}</span><span>${c}</span></a>`).join('')}
  <div class="ac-side-foot">
    <div class="ac-store"><div class="ac-sub">Family storage</div><div style="font-size:14px;font-weight:600;margin-top:2px">182 GB of 200 GB</div><div class="ac-bar"><span style="width:91%"></span></div></div>
    <div class="ac-user"><span class="ac-me">MH</span><div><div style="font-size:13.5px;font-weight:600">Mira Holt</div><div style="font-size:12px;color:var(--ac-muted)">Family plan · 4 people</div></div></div>
  </div>
</nav>
<div class="ac-col">
  <header class="ac-top">
    <label class="ac-search">${svg(P.search, { s: 16, w: 2 })}<span class="ac-sr">Search</span><input type="search" placeholder="Search photos, people, places"></label>
    <div class="ac-top-r">
      <button class="ac-import" type="button">${svg(P.import, { s: 16, w: 2 })}Import</button>
      <button class="ac-ib" type="button" aria-label="Notifications">${svg(P.bell, { s: 19 })}<i></i></button>
      <span class="ac-me">MH</span>
    </div>
  </header>
  <div class="ac-views">
    <div class="ac-view" data-view="albums">
      <main class="ac-main">
        <div class="ac-lib-h">
          <div><h1>Albums</h1><div style="font-size:13px;color:var(--ac-muted);margin-top:4px">24 albums · 2,418 photos</div></div>
          <div class="ac-tabs"><button type="button" aria-pressed="true">Recent</button><button type="button" aria-pressed="false">Shared</button><button type="button" aria-pressed="false">A–Z</button></div>
          <button class="ac-new" type="button">${svg(P.plus, { s: 16, w: 2.2 })}New album</button>
        </div>
        <div class="ac-grid">
          <a class="ac-album" href="#" data-open="orta" aria-label="Weekend at Lake Orta, 86 photos">
            <span class="ac-ph">${img('trunk', 'Open car trunk with bags', ' data-cover')}<span class="ac-on-photo">${faces(FAMILY)}</span><span class="ac-auto">Auto cover</span></span>
            <span><span class="ac-album-t">Weekend at Lake Orta</span><span class="ac-album-m">86 photos · Nov 15–17 · shared</span></span>
          </a>
          ${ALBUMS.map(([n, t, m, f]) => `<a class="ac-album" href="#">
            <span class="ac-ph">${img(n)}${f.length ? `<span class="ac-on-photo">${faces(f)}</span>` : ''}</span>
            <span><span class="ac-album-t">${t}</span><span class="ac-album-m">${m}</span></span>
          </a>`).join('')}
        </div>
        <div class="ac-row-h" style="margin-top:26px"><h2 class="ac-h2">Shared with you</h2><a href="#" style="font-size:13px;color:var(--ac-dawn-soft)">See all 7</a></div>
        <div class="ac-shared">${SHARED.map(([n, t, m]) => `<a class="ac-card" href="#"><span class="ac-ph">${img(n)}</span><span><span style="display:block;font-size:13.5px;font-weight:600">${t}</span><span style="display:block;font-size:12px;color:var(--ac-muted);margin-top:2px">${m}</span></span></a>`).join('')}</div>
      </main>
      <aside class="ac-aside" aria-label="Memories and activity">
        <section class="ac-card ac-box ac-day" style="gap:12px">
          <div class="ac-sec-h"><h2 class="ac-h2">On this day</h2><span class="ac-sub">Nov 25, 2025</span></div>
          <span class="ac-ph">${img('lake', 'Lake at dawn with mountains')}</span>
          <div style="display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:14px;font-weight:600">Lake Como, a year ago</div><div class="ac-sub" style="margin-top:2px">12 photos · with Oskar</div></div><button class="ac-ob" type="button">Open</button></div>
        </section>
        <section class="ac-card ac-box">
          <div class="ac-sec-h"><h2 class="ac-h2">Family activity</h2><span class="ac-sub">today</span></div>
          <div class="ac-feed"><span class="ac-pt">${img('p-lea')}</span><div>Lea added 12 photos to <b>Weekend at Lake Orta</b></div><span>2 h</span></div>
          <div class="ac-feed"><span class="ac-pt">${img('p-oskar')}</span><div>Oskar liked <b>Dawn on the pier</b></div><span>5 h</span></div>
          <div class="ac-feed"><span class="ac-pt">${img('p-daria')}</span><div>Daria commented on <b>Weekend at Lake Orta</b></div><span>1 d</span></div>
        </section>
        <section class="ac-card ac-book"><i>${svg(P.book, { s: 22 })}</i><div style="flex:1"><div style="font-size:14px;font-weight:600">Photo book from Orta</div><div class="ac-sub" style="margin-top:2px">24 pages · ready to review</div></div></section>
      </aside>
    </div>

    <div class="ac-view ac-album-view" data-view="album">
      <main class="ac-main">
        <div class="ac-crumbs"><a href="#" data-back>Albums</a><span>/</span><span>Weekend at Lake Orta</span>
          <div><button class="ac-ob" type="button">Slideshow</button><button class="ac-ob" type="button">${svg(P.share, { s: 15, w: 2 })}Share</button></div></div>
        <section class="ac-cover" aria-label="Album cover" data-zone>
          <img class="ac-cover-img" src="${A}trunk.jpg" alt="Album cover: open car trunk with bags" data-cover data-hero>
          <div class="ac-shade"></div>
          <span class="ac-chip" data-chip>${AUTO.chip}</span>
          <div class="ac-title"><h1>Weekend at Lake Orta</h1><div>Nov 15–17 · Orta San Giulio, Italy · 86 photos · 4 videos</div></div>
          <div class="ac-cover-r">${faces(FAMILY)}<button class="ac-change" type="button">Change cover</button></div>
          <div class="ac-drop" aria-hidden="true"><span>${svg(P.drop, { s: 16, w: 2.2 })}Drop to make it the cover</span></div>
          <div class="ac-toast" role="status">New cover for the family<button type="button" data-undo>Undo</button></div>
        </section>
        <div class="ac-row-h"><h2 class="ac-h2">Highlights</h2><span class="ac-sub">3 favorites of 86</span></div>
        <div class="ac-hls">${HIGHLIGHTS.map(([n, t, m, l]) => `
          <div class="ac-hl" data-photo="${n}">
            <button class="ac-ph" type="button" aria-label="${t}. Drag onto the cover, or press Enter to make it the cover">${img(n)}<span class="ac-gap">Moving to cover</span><span class="ac-badge">${svg(P.check, { s: 13, w: 2.6 })}Cover</span></button>
            <div class="ac-hl-t"><div><b>${t}</b><div class="ac-sub">${m}</div></div><span class="ac-likes">${heart}${l}</span></div>
          </div>`).join('')}
        </div>
        <div class="ac-row-h"><h2 class="ac-h2">All photos</h2><span class="ac-sub">by date · first is Nov 15, 8:03 am</span></div>
        <div class="ac-all">${ALL.map(n => `<span class="ac-ph">${img(n)}</span>`).join('')}<span>+78</span></div>
      </main>
      <aside class="ac-aside" aria-label="Sharing and activity">
        <section class="ac-card ac-box">
          <div class="ac-sec-h"><h2 class="ac-h2">Shared with family</h2><span class="ac-sub">4 people</span></div>
          <div class="ac-fam">${faces(FAMILY)}<span class="ac-me" style="margin-left:-8px">MH</span><span class="ac-sub" style="margin-left:4px">everyone can add photos</span></div>
          <div style="font-size:12.5px;color:var(--ac-muted)">What they see in their albums</div>
          <div class="ac-preview"><span class="ac-ph">${img('trunk', '', ' data-cover')}</span><div style="flex:1"><div style="font-size:13.5px;font-weight:600">Weekend at Lake Orta</div><div class="ac-preview-m" data-preview>86 photos · updated 2 h ago</div></div></div>
        </section>
        <section class="ac-card ac-box">
          <div class="ac-sec-h"><h2 class="ac-h2">Activity</h2><span class="ac-sub">this album</span></div>
          <div class="ac-act" aria-live="polite"><div><div class="ac-feed"><span class="ac-me">MH</span><div>You set <b>Dawn on the pier</b> as the cover</div><span>now</span></div></div></div>
          <div class="ac-feed"><span class="ac-pt">${img('p-daria')}</span><div>Daria: “The pier at sunrise should be the cover”</div><span>1 d</span></div>
          <div class="ac-feed"><span class="ac-pt">${img('p-oskar')}</span><div>Oskar liked <b>Dawn on the pier</b></div><span>5 h</span></div>
          <div class="ac-feed"><span class="ac-pt">${img('p-lea')}</span><div>Lea added 12 photos</div><span>2 h</span></div>
        </section>
        <section class="ac-card ac-trip">
          <h2 class="ac-h2">Trip</h2>
          <div><span>Dates</span><span>Nov 15–17 · 3 days</span></div>
          <div><span>Place</span><span>Orta San Giulio</span></div>
          <div><span>Size</span><span>86 photos · 1.4 GB</span></div>
          <button type="button">Make a photo book</button>
        </section>
      </aside>
    </div>
  </div>
</div>`;
      this.views = [...root.querySelectorAll('.ac-view')];
      this.zone = root.querySelector('[data-zone]');
      this.hero = root.querySelector('[data-hero]');
      this.chip = root.querySelector('[data-chip]');
      this.preview = root.querySelector('[data-preview]');
      this.syncDelay = 600;   // ms after the cover lands before the family's copy shows it
      this.timers = new Set();
      root.querySelectorAll('[data-open]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); this.go('album'); }));
      root.querySelector('[data-back]').addEventListener('click', e => { e.preventDefault(); this.go('albums'); });
      root.querySelector('[data-nav="albums"]').addEventListener('click', e => { e.preventDefault(); this.go('albums'); });
      root.querySelector('[data-undo]').addEventListener('click', () => this.setCover(null));
      root.querySelectorAll('.ac-tabs button').forEach(b => b.addEventListener('click', () => {
        b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
      }));
      root.querySelectorAll('.ac-hl .ac-ph').forEach(b => b.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && !this.busy) { e.preventDefault(); this.setCover(b.parentElement.dataset.photo); }
      }));
      // one pointer drag: highlights → cover; the same handlers serve a real mouse, touch and the demo cursor
      root.addEventListener('pointerdown', e => this.press(e));
      root.addEventListener('pointermove', e => this.move(e));
      root.addEventListener('pointerup', e => this.release(e));
      root.addEventListener('pointercancel', () => this.cancel());
      this.reset();
    }

    later(fn, ms) { const id = setTimeout(() => { this.timers.delete(id); fn(); }, ms); this.timers.add(id); }

    go(view, quiet = false) {
      if (quiet) this.root.classList.add('is-instant');
      this.root.dataset.view = view;
      this.views.forEach(v => v.classList.toggle('is-on', v.dataset.view === view));
      if (quiet) requestAnimationFrame(() => requestAnimationFrame(() => this.root.classList.remove('is-instant')));
    }

    // stage px of the 1440×900 app, whatever scale the page shows it at
    local(e) {
      const r = this.root.getBoundingClientRect(), k = r.width / this.root.offsetWidth;
      return [(e.clientX - r.left) / k, (e.clientY - r.top) / k];
    }
    box(el) {
      const r = this.root.getBoundingClientRect(), k = r.width / this.root.offsetWidth, b = el.getBoundingClientRect();
      return { x: (b.left - r.left) / k, y: (b.top - r.top) / k, w: b.width / k, h: b.height / k };
    }

    press(e) {
      const ph = e.button === 0 && !this.drag && !this.busy && e.target.closest('.ac-hl .ac-ph');
      if (!ph) return;
      const [x, y] = this.local(e);
      this.drag = { hl: ph.parentElement, ph, x, y, live: false };
      try { ph.setPointerCapture(e.pointerId); } catch (_) { /* the demo cursor has no real pointer to capture */ }
    }

    move(e) {
      const d = this.drag;
      if (!d) return;
      const [x, y] = this.local(e), dx = x - d.x, dy = y - d.y;
      if (!d.live) {
        if (Math.hypot(dx, dy) < 5) return;
        this.lift(d);
      }
      d.ghost.style.transform = `translate(${dx}px,${dy}px)`;
      const z = this.box(this.zone), over = x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
      this.zone.classList.toggle('is-over', over);
      d.dx = dx; d.dy = dy; d.over = over;
    }

    // the photo leaves its slot: a dashed gap stays behind, the cover darkens and waits
    lift(d) {
      d.live = true;
      d.from = this.box(d.ph);
      const g = d.ghost = document.createElement('div');
      g.className = 'ac-ghost';
      Object.assign(g.style, { left: d.from.x + 'px', top: d.from.y + 'px', width: d.from.w + 'px', height: d.from.h + 'px' });
      g.innerHTML = `<div><img src="${this.A}${d.hl.dataset.photo}.jpg" alt=""></div>`;
      this.root.appendChild(g);
      g.offsetWidth;   // start the tilt from flat
      g.classList.add('is-lift');
      d.hl.classList.add('is-lifted');
      this.zone.classList.add('is-drop');
    }

    release() {
      const d = this.drag;
      if (!d) return;
      this.drag = null;
      if (!d.live) return;
      this.zone.classList.remove('is-drop', 'is-over');
      if (d.over) this.land(d); else this.putBack(d);
    }

    cancel() {
      const d = this.drag;
      this.drag = null;
      if (d && d.live) { this.zone.classList.remove('is-drop', 'is-over'); this.putBack(d); }
    }

    putBack(d) {
      d.ghost.style.transition = `transform .3s ${EASE}`;
      d.ghost.style.transform = 'none';
      d.ghost.classList.remove('is-lift');
      this.later(() => { d.ghost.remove(); d.hl.classList.remove('is-lifted'); }, 300);
    }

    // the card unfolds into the cover: one image, cropped by a growing clip, scaled without stretching
    land(d) {
      const id = d.hl.dataset.photo, z = this.box(this.zone), W = z.w, H = z.h;
      const src = d.ghost.querySelector('img'), iw = src.naturalWidth || 1200, ih = src.naturalHeight || 675;
      const from = { x: d.from.x + d.dx - z.x, y: d.from.y + d.dy - z.y, w: d.from.w, h: d.from.h };
      const to = { x: 0, y: 0, w: W, h: H };
      // cover-fit of the image into a rect: both ends cover their clip, and so does every step between
      const fit = (r, [px, py]) => { const k = Math.max(r.w / iw, r.h / ih); return [r.x + (r.w - iw * k) * px, r.y + (r.h - ih * k) * py, k]; };
      const a = fit(from, [.5, .5]), b = fit(to, COVER_POS), mix = (p, q, e) => p + (q - p) * e;
      const m = document.createElement('div');
      m.className = 'ac-morph';
      m.style.transformOrigin = `${from.x + from.w / 2}px ${from.y + from.h / 2}px`;
      m.innerHTML = `<img src="${this.A}${id}.jpg" alt="" width="${iw}" height="${ih}">`;
      const pic = m.firstChild;
      this.hero.after(m);
      const paint = e => {
        const r = { x: mix(from.x, 0, e), y: mix(from.y, 0, e), w: mix(from.w, W, e), h: mix(from.h, H, e) };
        m.style.clipPath = `inset(${r.y}px ${W - r.x - r.w}px ${H - r.y - r.h}px ${r.x}px round 12px)`;
        m.style.transform = `rotate(${mix(-3, 0, e)}deg) scale(${mix(1.12, 1, e)})`;
        pic.style.transform = `translate(${mix(a[0], b[0], e)}px,${mix(a[1], b[1], e)}px) scale(${mix(a[2], b[2], e)})`;
      };
      d.ghost.remove();   // the morph starts exactly where the lifted card was
      paint(0);
      this.busy = true;
      // driven by requestAnimationFrame, so a recorder with a virtual clock sees every step of it
      const DUR = 800, out = t => 1 - Math.pow(1 - t, 3), t0 = performance.now();   // ease-out: answers the drop at once, still readable
      const step = now => {
        const t = Math.min(DUR, now - t0);
        paint(out(t / DUR));
        if (t < DUR) { this.raf = requestAnimationFrame(step); return; }
        d.hl.classList.remove('is-lifted');
        this.setCover(id, { landed: true });
        m.remove();
        this.busy = false;
      };
      this.raf = requestAnimationFrame(step);
    }

    // id null puts the auto cover back
    setCover(id, { landed = false, quiet = false } = {}) {
      const on = !!id, file = on ? id : AUTO.id;
      if ((this.root.dataset.cover || '') === (id || '')) return;
      this.timers.forEach(clearTimeout); this.timers.clear();
      if (quiet) this.root.classList.add('is-instant');
      if (on) this.root.dataset.cover = id; else delete this.root.dataset.cover;
      this.hero.src = `${this.A}${file}.jpg`;
      this.hero.alt = on ? `Album cover: ${id === 'dawn' ? 'dawn on the pier' : id}` : 'Album cover: open car trunk with bags';
      if (on && !landed && !quiet) this.hero.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: EASE });
      this.root.querySelector('.ac-album [data-cover]').src = `${this.A}${file}.jpg`;
      this.chip.textContent = on ? 'Cover · chosen by you' : AUTO.chip;
      if (!quiet) this.chip.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
      this.root.querySelectorAll('.ac-hl').forEach(h => h.classList.toggle('is-cover', h.dataset.photo === id));
      const sync = () => {
        this.root.dataset.synced = on;
        this.preview.textContent = on ? 'New cover · updated just now' : '86 photos · updated 2 h ago';
        this.root.querySelectorAll('.ac-side [data-cover], .ac-preview [data-cover]').forEach(el => this.swap(el, file, quiet));
      };
      if (quiet || !on) sync(); else this.later(sync, this.syncDelay);
      if (quiet) requestAnimationFrame(() => requestAnimationFrame(() => this.root.classList.remove('is-instant')));
    }

    // the new picture fades in over the old one, then takes its place
    swap(el, file, quiet) {
      const src = `${this.A}${file}.jpg`;
      el.parentElement.querySelectorAll('.ac-swap').forEach(x => x.remove());
      if (quiet) { el.src = src; return; }
      const top = document.createElement('img');
      top.className = 'ac-swap';
      top.src = src; top.alt = '';
      top.style.objectPosition = getComputedStyle(el).objectPosition;
      el.after(top);
      this.later(() => { el.src = src; top.remove(); }, 460);
    }

    reset() {
      this.timers.forEach(clearTimeout); this.timers.clear();
      cancelAnimationFrame(this.raf);
      this.drag = null; this.busy = false;
      this.root.querySelectorAll('.ac-ghost, .ac-morph, .ac-swap').forEach(el => el.remove());
      this.root.querySelectorAll('.is-lifted').forEach(el => el.classList.remove('is-lifted'));
      this.zone.classList.remove('is-drop', 'is-over');
      this.root.dataset.cover = '_';   // force the auto cover back
      this.setCover(null, { quiet: true });
      this.go('albums', true);
    }
  }

  document.querySelectorAll('.ac').forEach(el => { el.albumApp = new AlbumApp(el); });
})();
