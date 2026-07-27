/* <route-map> — pale London street map with a dotted walking route.
   Real geometry: Leaflet + OpenStreetMap tiles (pinned per skill), desaturated with a CSS filter. */
(function () {
  const CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  const CSS_HASH = 'sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H';
  const JS_HASH = 'sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH';

  let leafletPromise = null;
  function loadLeaflet() {
    if (leafletPromise) return leafletPromise;
    leafletPromise = new Promise((resolve, reject) => {
      if (!document.querySelector('link[data-leaflet]')) {
        const l = document.createElement('link');
        l.rel = 'stylesheet'; l.href = CSS_URL; l.integrity = CSS_HASH; l.crossOrigin = 'anonymous';
        l.setAttribute('data-leaflet', '');
        document.head.appendChild(l);
      }
      if (window.L) return resolve(window.L);
      let s = document.querySelector('script[data-leaflet]');
      if (!s) {
        s = document.createElement('script');
        s.src = JS_URL; s.integrity = JS_HASH; s.crossOrigin = 'anonymous';
        s.setAttribute('data-leaflet', '');
        document.head.appendChild(s);
      }
      s.addEventListener('load', () => resolve(window.L));
      s.addEventListener('error', reject);
    });
    return leafletPromise;
  }

  const ICONS = {
    money: '<circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9.6 16.2h5M9.6 12.4h3.4M13.9 16.2c-1.5-.6-2-1.7-1.8-3.3l.3-2.5c.2-1.6 1.2-2.5 2.6-2.3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    power: '<path d="M5 19h14M6.5 19V9M11 19V9M17.5 19V9M4 9h16L12 4 4 9z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>',
    trade: '<path d="M4 18h16M6 18V7l9 3.5M15 18V9M9 7.5V5.5h3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>',
    glass: '<path d="M6 4h12l-5 8v6h3M13 18h-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>',
    stone: '<path d="M12 3.5 19 8v8l-7 4.5L5 16V8l7-4.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>'
  };

  // Stops that have a photo in images/ — add ids here after dropping new files in.
  const STOP_PHOTOS = new Set(['city-0','city-1','city-2','city-3','city-4','city-5']);

  const ROUTES = [
    {
      id: 'city',
      name: { en: 'Dirty Money', ru: 'Грязные деньги' },
      blurb: { en: 'The City: a history of dirty money — seven stops, 2.5 hours.', ru: 'Сити: история грязных денег — семь остановок, 2,5 часа.' },
      stops: [
        { ll: [51.5138, -0.0984], icon: 'stone', t: { en: "St Paul's Cathedral", ru: 'Собор Святого Павла' }, d: { en: 'A cathedral rebuilt as a statement of credit: who paid, and what they bought with it.', ru: 'Собор, отстроенный как заявление о кредите: кто платил и что на этом купил.' } },
        { ll: [51.5157, -0.0918], icon: 'power', t: { en: 'Guildhall', ru: 'Гилдхолл' }, d: { en: 'The City governed itself before Parliament existed — and still does, quietly.', ru: 'Сити управлял собой раньше, чем появился парламент — и до сих пор управляет, тихо.' } },
        { ll: [51.5142, -0.0886], icon: 'money', t: { en: 'Bank of England', ru: 'Банк Англии' }, d: { en: 'A windowless wall around the country\'s money. The architecture is the policy.', ru: 'Глухая стена вокруг денег страны. Архитектура здесь и есть политика.' } },
        { ll: [51.5138, -0.0876], icon: 'trade', t: { en: 'Royal Exchange', ru: 'Королевская биржа' }, d: { en: 'Where London learned to trade paper instead of goods.', ru: 'Здесь Лондон научился торговать бумагой вместо товара.' } },
        { ll: [51.5128, -0.0834], icon: 'trade', t: { en: 'Leadenhall Market', ru: 'Рынок Лиденхолл' }, d: { en: 'A Roman forum, a meat market, now a lunch spot for insurers. Same footprint.', ru: 'Римский форум, мясной рынок, теперь обед для страховщиков. Тот же контур.' } },
        { ll: [51.5133, -0.0824], icon: 'money', t: { en: "Lloyd's of London", ru: 'Ллойд’с' }, d: { en: 'Insurance turned inside out: pipes outside, risk inside.', ru: 'Страхование наизнанку: трубы снаружи, риск внутри.' } },
        { ll: [51.5145, -0.0803], icon: 'stone', t: { en: '30 St Mary Axe', ru: '30 Сент-Мэри-Экс' }, d: { en: 'The tower stands on a bomb site. Every skyline is a ledger of what happened.', ru: 'Башня стоит на месте взрыва. Любой силуэт города — это бухгалтерия событий.' } }
      ]
    },
    {
      id: 'bars',
      name: { en: 'Bars', ru: 'Бары' },
      blurb: { en: 'The bar as a mirror of the city — six stops, 2.5 hours.', ru: 'Бар как зеркало города — шесть остановок, 2,5 часа.' },
      stops: [
        { ll: [51.5057, -0.1400], icon: 'glass', t: { en: "Dukes, St James's", ru: 'Dukes, Сент-Джеймс' }, d: { en: 'Old money drinks quietly, behind a courtyard, at a price that filters the room.', ru: 'Старые деньги пьют тихо, во дворе, по цене, которая фильтрует зал.' } },
        { ll: [51.5100, -0.1490], icon: 'money', t: { en: 'Connaught Bar, Mayfair', ru: 'Connaught Bar, Мэйфер' }, d: { en: 'What a global city sells when it sells luxury: choreography, not liquid.', ru: 'Что глобальный город продаёт, продавая роскошь: хореографию, а не напиток.' } },
        { ll: [51.5103, -0.1205], icon: 'stone', t: { en: 'American Bar, Savoy', ru: 'American Bar, Savoy' }, d: { en: 'The room where London decided cocktails were respectable — and profitable.', ru: 'Зал, где Лондон решил, что коктейли — это прилично. И прибыльно.' } },
        { ll: [51.5133, -0.1320], icon: 'power', t: { en: 'Coach & Horses, Soho', ru: 'Coach & Horses, Сохо' }, d: { en: 'Soho\'s press-and-poets bar: rent, bohemia, and who gets pushed out.', ru: 'Бар прессы и поэтов: аренда, богема и вопрос, кого вытесняют.' } },
        { ll: [51.5127, -0.1315], icon: 'trade', t: { en: 'Bar Termini', ru: 'Bar Termini' }, d: { en: 'Twelve seats, one negroni: how scarcity became a business model.', ru: 'Двенадцать мест, один негрони: как дефицит стал бизнес-моделью.' } },
        { ll: [51.5136, -0.1330], icon: 'glass', t: { en: 'Swift, Soho', ru: 'Swift, Сохо' }, d: { en: 'Upstairs and downstairs in one building — the class system, in floor plan.', ru: 'Верх и низ в одном здании — классовая система в планировке.' } }
      ]
    },
    {
      id: 'pubs',
      name: { en: 'Pubs', ru: 'Пабы' },
      blurb: { en: 'The pub tour — six stops, 3 hours.', ru: 'Паб-тур — шесть остановок, 3 часа.' },
      stops: [
        { ll: [51.5142, -0.1075], icon: 'stone', t: { en: 'Ye Olde Cheshire Cheese', ru: 'Ye Olde Cheshire Cheese' }, d: { en: 'Rebuilt in 1667 and barely changed since: a pub as a survival strategy.', ru: 'Отстроен в 1667-м и почти не менялся: паб как стратегия выживания.' } },
        { ll: [51.5185, -0.1078], icon: 'power', t: { en: 'Ye Olde Mitre', ru: 'Ye Olde Mitre' }, d: { en: 'A pub that legally belonged to Cambridgeshire. Jurisdiction is a business.', ru: 'Паб, юридически принадлежавший другому графству. Юрисдикция — это бизнес.' } },
        { ll: [51.5218, -0.1023], icon: 'trade', t: { en: 'The Jerusalem Tavern', ru: 'The Jerusalem Tavern' }, d: { en: 'Clerkenwell: watchmakers, radicals, and beer as an industrial wage.', ru: 'Кларкенуэлл: часовщики, радикалы и пиво как часть заработка.' } },
        { ll: [51.5120, -0.1035], icon: 'stone', t: { en: 'The Blackfriar', ru: 'The Blackfriar' }, d: { en: 'A brewery\'s advertisement built in marble, saved from demolition by a poet.', ru: 'Реклама пивоварни в мраморе, спасённая от сноса поэтом.' } },
        { ll: [51.5195, -0.1195], icon: 'glass', t: { en: 'The Lamb, Bloomsbury', ru: 'The Lamb, Блумсбери' }, d: { en: 'Snob screens above the bar: the Victorians engineered who could see whom.', ru: 'Ширмы над стойкой: викторианцы конструировали, кто кого видит.' } },
        { ll: [51.5148, -0.1210], icon: 'money', t: { en: 'The Princess Louise', ru: 'The Princess Louise' }, d: { en: 'A gin palace cut into compartments — one room, several classes of customer.', ru: 'Джин-дворец, разрезанный на отсеки: один зал, несколько классов гостей.' } }
      ]
    },
    {
      id: 'hearts',
      name: { en: 'Two Hearts', ru: 'Два сердца' },
      blurb: { en: 'Two hearts of London: the City and Westminster — six stops, 3 hours.', ru: 'Два сердца Лондона: Сити и Вестминстер — шесть остановок, 3 часа.' },
      stops: [
        { ll: [51.5138, -0.0984], icon: 'stone', t: { en: "St Paul's Cathedral", ru: 'Собор Святого Павла' }, d: { en: 'Start in the money city: the skyline the merchants paid for.', ru: 'Начинаем в городе денег: силуэт, за который платили купцы.' } },
        { ll: [51.5142, -0.0886], icon: 'money', t: { en: 'Bank Junction', ru: 'Перекрёсток Банка' }, d: { en: 'Eight streets, one bank, no windows. The centre of the older power.', ru: 'Восемь улиц, один банк, ни одного окна. Центр старой власти.' } },
        { ll: [51.5115, -0.1110], icon: 'power', t: { en: 'Temple', ru: 'Темпл' }, d: { en: 'The lawyers between the two cities — the hinge that makes both work.', ru: 'Юристы между двумя городами — шарнир, на котором держится всё.' } },
        { ll: [51.5080, -0.1281], icon: 'trade', t: { en: 'Trafalgar Square', ru: 'Трафальгарская площадь' }, d: { en: 'An empire builds a living room and puts an admiral in the middle of it.', ru: 'Империя строит гостиную и ставит адмирала посередине.' } },
        { ll: [51.5007, -0.1273], icon: 'power', t: { en: 'Parliament Square', ru: 'Парламентская площадь' }, d: { en: 'Who gets a statue here, and who had to fight for one.', ru: 'Кому здесь ставят памятник, а кому пришлось за него бороться.' } },
        { ll: [51.4995, -0.1248], icon: 'stone', t: { en: 'Palace of Westminster', ru: 'Вестминстерский дворец' }, d: { en: 'Victorian iron dressed as the Middle Ages. A deliberate story.', ru: 'Викторианское железо, одетое Средневековьем. Умышленная история.' } }
      ]
    }
  ];

  const T = {
    kicker: { en: 'The route, drawn', ru: 'Маршрут, нарисованный' },
    title: { en: 'Where we actually walk', ru: 'Куда мы на самом деле идём' },
    lede: { en: 'Real streets, dotted line, one stop at a time. Tap a stop to see why it is on the list.', ru: 'Настоящие улицы, пунктир, остановка за остановкой. Нажмите на точку, чтобы узнать, зачем она в списке.' },
    legend: { en: 'Money · Power · Trade · Stone · Glass', ru: 'Деньги · Власть · Торговля · Камень · Бокал' },
    attribution: { en: 'Map data © OpenStreetMap contributors · tiles © CARTO', ru: 'Данные карты © OpenStreetMap contributors · тайлы © CARTO' }
  };

  function injectStyles() {
    if (document.getElementById('route-map-styles')) return;
    const st = document.createElement('style');
    st.id = 'route-map-styles';
    st.textContent = '@media (max-width:900px){' +
      'route-map [data-body]{grid-template-columns:minmax(0,1fr) !important}' +
      'route-map [data-map]{height:360px !important}' +
      'route-map [data-list]{border-left:none !important;border-top:1px solid #E6E2D9 !important;max-height:none !important;overflow:visible !important}' +
      '}';
    document.head.appendChild(st);
  }

  class RouteMap extends HTMLElement {
    static get observedAttributes() { return ['lang']; }

    connectedCallback() {
      if (this._built) return;
      this._lang = this.getAttribute('lang') === 'ru' ? 'ru' : 'en';
      this.routeIndex = 0;
      this.activeStop = 0;
      injectStyles();
      this.build();
      this._built = true;
      loadLeaflet().then((L) => { this.L = L; this.initMap(); }).catch(() => {
        this.mapEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#6E6A61;font-size:14px">Map could not load</div>';
      });
    }

    attributeChangedCallback(n, o, v) {
      if (n !== 'lang' || !this._built) return;
      this._lang = v === 'ru' ? 'ru' : 'en';
      this.renderText();
      this.renderRoute();
    }

    get route() { return ROUTES[this.routeIndex]; }

    build() {
      this.style.display = 'block';
      this.innerHTML = `
        <div style="background:#F3EFE7;border:1px solid #E6E2D9;border-radius:8px;overflow:hidden">
          <div style="display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:flex-end;padding:34px 34px 24px">
            <div>
              <p data-k="kicker" style="margin:0 0 12px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9A3A16"></p>
              <h2 data-k="title" style="margin:0 0 10px;font-family:'Instrument Serif','Playfair Display',Georgia,serif;font-weight:400;font-size:clamp(28px,3.2vw,46px);letter-spacing:-0.02em;color:#121110"></h2>
              <p data-k="lede" style="margin:0;max-width:52ch;font-size:15px;line-height:1.6;color:#3A3833"></p>
            </div>
            <div data-tabs style="display:flex;gap:8px;flex-wrap:wrap"></div>
          </div>
          <div data-body style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,320px);gap:0;border-top:1px solid #E6E2D9">
            <div data-map style="height:520px;min-width:0;background:#EFE9DE"></div>
            <div data-list style="border-left:1px solid #E6E2D9;background:#FBF9F5;max-height:520px;overflow-y:auto"></div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;padding:14px 34px;border-top:1px solid #E6E2D9;font-size:11.5px;letter-spacing:0.06em;color:#6E6A61">
            <span data-k="legend"></span>
            <span data-k="attribution"></span>
          </div>
        </div>`;
      this.mapEl = this.querySelector('[data-map]');
      this.listEl = this.querySelector('[data-list]');
      this.tabsEl = this.querySelector('[data-tabs]');
      this.renderText();
      this.renderTabs();
      this.renderList();
    }

    renderText() {
      if (!this.tabsEl) return;
      this.querySelectorAll('[data-k]').forEach(el => { el.textContent = T[el.getAttribute('data-k')][this._lang]; });
      this.renderTabs();
      this.renderList();
    }

    renderTabs() {
      if (!this.tabsEl) return;
      this.tabsEl.innerHTML = '';
      ROUTES.forEach((r, i) => {
        const b = document.createElement('button');
        const on = i === this.routeIndex;
        b.textContent = r.name[this._lang];
        b.style.cssText = `padding:9px 18px;border-radius:999px;cursor:pointer;font-size:13px;font-family:inherit;border:1px solid ${on ? '#121110' : '#DCD7CC'};background:${on ? '#121110' : 'transparent'};color:${on ? '#FBF9F5' : '#3A3833'}`;
        b.addEventListener('click', () => { this.routeIndex = i; this.activeStop = 0; this.renderTabs(); this.renderList(); this.renderRoute(); });
        this.tabsEl.appendChild(b);
      });
    }

    renderList() {
      if (!this.listEl) return;
      const r = this.route;
      this.listEl.innerHTML = `<div style="padding:18px 22px 12px;font-size:12.5px;line-height:1.5;color:#6E6A61;border-bottom:1px solid #EDE9E1">${r.blurb[this._lang]}</div>`;
      r.stops.forEach((s, i) => {
        const on = i === this.activeStop;
        const row = document.createElement('button');
        row.style.cssText = `display:grid;grid-template-columns:84px 1fr;gap:14px;align-items:start;width:100%;text-align:left;padding:16px 22px;border:none;border-bottom:1px solid #EDE9E1;cursor:pointer;font-family:inherit;background:${on ? '#F3EFE7' : 'transparent'}`;
        row.innerHTML = `
          <span style="position:relative;display:block;width:84px;height:84px">
            <image-slot id="stop-${r.id}-${i}" style="width:84px;height:84px" shape="rounded" radius="4" ${STOP_PHOTOS.has(r.id + '-' + i) ? `src="images/stop-${r.id}-${i}.webp"` : ''} placeholder=""></image-slot>
            <span style="position:absolute;top:-6px;left:-6px;display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:999px;background:${on ? '#9A3A16' : '#FBF9F5'};border:1px solid ${on ? '#9A3A16' : '#CFC9BC'};color:${on ? '#FBF9F5' : '#6E6A61'};font-size:11px">${i + 1}</span>
          </span>
          <span style="min-width:0">
            <span style="display:flex;align-items:center;gap:8px;color:#121110;font-size:14.5px;font-weight:500">
              <svg viewBox="0 0 24 24" width="16" height="16" style="color:#9A3A16;flex:none">${ICONS[s.icon]}</svg>${s.t[this._lang]}
            </span>
            <span style="display:block;margin-top:5px;font-size:13px;line-height:1.55;color:#6E6A61">${s.d[this._lang]}</span>
          </span>`;
        row.addEventListener('click', () => { this.activeStop = i; this.renderList(); this.focusStop(i); });
        this.listEl.appendChild(row);
      });
    }

    initMap() {
      const L = this.L;
      this.map = L.map(this.mapEl, { scrollWheelZoom: false, zoomControl: true, attributionControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd', attribution: '© OpenStreetMap contributors © CARTO' }).addTo(this.map);
      const pane = this.mapEl.querySelector('.leaflet-tile-pane');
      if (pane) pane.style.filter = 'sepia(0.34) saturate(0.72) brightness(1.04) contrast(0.94)';
      this.layer = L.layerGroup().addTo(this.map);
      this.renderRoute();
    }

    renderRoute() {
      if (!this.map) return;
      const L = this.L, r = this.route;
      this.layer.clearLayers();
      const pts = r.stops.map(s => s.ll);
      L.polyline(pts, { color: '#FBF9F5', weight: 7, opacity: 0.85, lineCap: 'round' }).addTo(this.layer);
      L.polyline(pts, { color: '#9A3A16', weight: 3, opacity: 0.95, dashArray: '1 11', lineCap: 'round' }).addTo(this.layer);
      this.markers = r.stops.map((s, i) => {
        const icon = L.divIcon({
          className: '',
          iconSize: [34, 34], iconAnchor: [17, 17],
          html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:999px;background:#FBF9F5;border:1.5px solid #9A3A16;box-shadow:0 2px 8px rgba(18,17,16,0.18);color:#9A3A16;font:500 13px/1 'Instrument Sans','Manrope',system-ui,sans-serif">${i + 1}</div>`
        });
        const m = L.marker(s.ll, { icon }).addTo(this.layer);
        m.bindTooltip(`${s.t[this._lang]}`, { direction: 'top', offset: [0, -18], opacity: 1 });
        m.on('click', () => { this.activeStop = i; this.renderList(); this.focusStop(i); });
        return m;
      });
      this.map.fitBounds(L.latLngBounds(pts).pad(0.22));
    }

    focusStop(i) {
      if (!this.map) return;
      this.map.panTo(this.route.stops[i].ll, { animate: true });
      const m = this.markers && this.markers[i];
      if (m) m.openTooltip();
    }
  }

  if (!customElements.get('route-map')) customElements.define('route-map', RouteMap);
})();
