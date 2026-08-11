// Script compartilhado pelas páginas de editoria (brasil.html, internacional.html,
// economia.html, comercio.html). Cada página informa sua categoria via
// <script src="category.js" data-cat="brasil"></script>

(function(){
  const CAT_KEY = document.currentScript.dataset.cat;
  window.addEventListener('itemsready', () => render(CAT_KEY));
})();

function render(CAT_KEY){
  const meta = CATS[CAT_KEY];
  const items = window.ITEMS.filter(i => i.cat === CAT_KEY).sort((a,b) => b.time - a.time);

  document.title = meta.label + ' · Despacho';
  document.getElementById('pageDesc').textContent = meta.desc;
  document.getElementById('fullDate').textContent = NOW.toLocaleDateString('pt-BR', {
    weekday:'long', day:'2-digit', month:'long', year:'numeric'
  });

  // Ticker: notícias de hoje desta editoria
  const tickerTrack = document.getElementById('tickerTrack');
  const todayItems = items.filter(i => dateKey(i.time) === dateKey(NOW)).sort((a,b) => a.time - b.time);
  tickerTrack.innerHTML = todayItems.map(i => `<span><b>${i.src}</b> — ${i.h}</span>`).join('');

  // Preenche filtros de fonte e data com base apenas nesta editoria
  const sourceSelect = document.getElementById('sourceSelect');
  [...new Set(items.map(i => i.src))].sort().forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    sourceSelect.appendChild(opt);
  });

  const dateSelect = document.getElementById('dateSelect');
  const datesSet = [...new Set(items.map(i => dateKey(i.time)))].sort().reverse();
  datesSet.forEach(k => {
    const sample = items.find(i => dateKey(i.time) === k).time;
    const opt = document.createElement('option');
    opt.value = k; opt.textContent = dateLabel(sample);
    dateSelect.appendChild(opt);
  });

  document.getElementById('totalCount').textContent = items.length + ' despachos';

  // Agrupa por data
  const byDate = new Map();
  items.forEach(i => {
    const k = dateKey(i.time);
    if (!byDate.has(k)) byDate.set(k, []);
    byDate.get(k).push(i);
  });

  const groupsRoot = document.getElementById('groupsRoot');
  groupsRoot.innerHTML = '';
  [...byDate.entries()].forEach(([k, dayItems]) => {
    const group = document.createElement('div');
    group.className = 'date-group';
    group.dataset.date = k;
    group.innerHTML = `
      <div class="date-subhead">${dateLabel(dayItems[0].time)} <span class="n">— ${dayItems.length}</span></div>
      <div class="grid"></div>
    `;
    const grid = group.querySelector('.grid');
    dayItems.forEach(i => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.src = i.src;
      card.dataset.date = k;
      const url = i.link || SOURCE_URLS[i.src] || '#';
      card.innerHTML = `
        <div class="card-top">
          <span class="tag ${meta.class}">${meta.label}</span>
          <time>${fmtTime(i.time)}</time>
        </div>
        <h4>${i.h}</h4>
        <p>${i.d}</p>
        <div class="card-foot">
          <span class="src">${i.src}</span>
          <a class="readlink" href="${url}" target="_blank" rel="noopener">ler no original →</a>
        </div>
      `;
      grid.appendChild(card);
    });
    groupsRoot.appendChild(group);
  });

  // Filtros de fonte e data
  function applyFilters(){
    const activeSrc = sourceSelect.value;
    const activeDate = dateSelect.value;
    let totalVisible = 0;
    document.querySelectorAll('.date-group').forEach(group => {
      const dateMatch = activeDate === 'todas' || group.dataset.date === activeDate;
      let groupVisible = 0;
      group.querySelectorAll('.card').forEach(card => {
        const srcMatch = activeSrc === 'todas' || card.dataset.src === activeSrc;
        const show = dateMatch && srcMatch;
        card.classList.toggle('hidden', !show);
        if (show) groupVisible++;
      });
      group.classList.toggle('hidden', groupVisible === 0);
      totalVisible += groupVisible;
    });
    document.getElementById('totalCount').textContent = totalVisible + ' despachos';
  }

  sourceSelect.addEventListener('change', applyFilters);
  dateSelect.addEventListener('change', applyFilters);
}
