// collector/collect.js
//
// Lê collector/feeds.json, busca cada feed RSS, classifica por editoria
// (Brasil / Internacional / Economia / Comércio Internacional) e grava o
// resultado em collector/output/items.json — o mesmo formato que o site lê.
//
// Uso:
//   cd collector
//   npm install
//   node collect.js
//
// Para manter o site sempre atualizado, agende esse comando para rodar
// periodicamente (cron, GitHub Actions, etc.) — veja o README.md desta pasta.

const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DespachoBot/1.0)' },
});

const FEEDS_PATH = path.join(__dirname, 'feeds.json');
const OUTPUT_DIR = path.join(__dirname, 'output');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'items.json');

// Quantos dias de notícias manter no arquivo final.
const MAX_DAYS = 5;
// Limite de itens por feed (evita que um feed muito ativo domine tudo).
const MAX_PER_FEED = 12;

// ---------- Classificação por palavra-chave ----------
// Usada só quando o feed não é exclusivo de uma editoria (category: "classify"
// no feeds.json) — por exemplo, um feed geral que mistura política e economia.
const KEYWORDS = {
  comercio: [
    'tarifa', 'tarifas', 'exportaç', 'importaç', 'comércio exterior', 'comercio exterior',
    'balança comercial', 'acordo comercial', 'livre comércio', 'omc', 'wto',
    'trade', 'tariff', 'tariffs', 'export', 'import', 'supply chain',
    'cadeia de suprimentos', 'cadeia de fornecimento',
  ],
  economia: [
    'inflação', 'inflacao', 'juros', 'copom', 'selic', 'pib', 'câmbio', 'cambio',
    'dólar', 'dolar', 'bolsa', 'mercado financeiro', 'banco central',
    'economy', 'inflation', 'interest rate', 'gdp', 'stock market', 'markets',
    'federal reserve', 'central bank', 'recession', 'recessão',
  ],
};

function classify(text, fallback){
  const t = text.toLowerCase();
  if (KEYWORDS.comercio.some(k => t.includes(k))) return 'comercio';
  if (KEYWORDS.economia.some(k => t.includes(k))) return 'economia';
  return fallback;
}

function cleanSnippet(item){
  const raw = item.contentSnippet || item.summary || item.content || '';
  const flat = raw.replace(/\s+/g, ' ').trim();
  return flat.length > 220 ? flat.slice(0, 217).trimEnd() + '…' : flat;
}

async function collectFeed(feedConfig){
  const results = [];
  try{
    const feed = await parser.parseURL(feedConfig.url);
    const items = (feed.items || []).slice(0, MAX_PER_FEED);

    for (const item of items){
      const title = (item.title || '').trim();
      const link = item.link || '';
      const pubDate = item.isoDate || item.pubDate;
      if (!title || !link || !pubDate) continue;

      const snippet = cleanSnippet(item);
      const cat = feedConfig.category === 'classify'
        ? classify(title + ' ' + snippet, feedConfig.default || 'internacional')
        : feedConfig.category;

      results.push({
        cat,
        src: feedConfig.source,
        h: title,
        d: snippet,
        link,
        time: new Date(pubDate).toISOString(),
      });
    }
    console.log(`✓ ${feedConfig.source} (${feedConfig.category}) — ${results.length} itens`);
  }catch(err){
    console.warn(`✗ ${feedConfig.source} (${feedConfig.url}) falhou: ${err.message}`);
  }
  return results;
}

async function main(){
  if (!fs.existsSync(FEEDS_PATH)){
    console.error('feeds.json não encontrado em ' + FEEDS_PATH);
    process.exit(1);
  }
  const feeds = JSON.parse(fs.readFileSync(FEEDS_PATH, 'utf-8'));

  const batches = await Promise.all(feeds.map(collectFeed));
  let allItems = batches.flat();

  // Remove itens muito antigos
  const cutoff = Date.now() - MAX_DAYS * 24 * 3600 * 1000;
  allItems = allItems.filter(i => new Date(i.time).getTime() >= cutoff);

  // Remove duplicados (mesmo link)
  const seen = new Set();
  allItems = allItems.filter(i => {
    if (seen.has(i.link)) return false;
    seen.add(i.link);
    return true;
  });

  // Mais recentes primeiro
  allItems.sort((a, b) => new Date(b.time) - new Date(a.time));

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allItems, null, 2), 'utf-8');

  console.log(`\nTotal: ${allItems.length} notícias gravadas em ${path.relative(process.cwd(), OUTPUT_PATH)}`);

  if (allItems.length === 0){
    console.warn('\nAtenção: nenhum item coletado. Verifique se as URLs em feeds.json ainda são válidas — feeds RSS mudam de endereço com frequência.');
  }

  // Encerra o processo explicitamente. Sem isso, conexões de rede que a
  // biblioteca de RSS mantém em aberto (keep-alive) podem impedir o Node de
  // finalizar sozinho, deixando o job do GitHub Actions "pendurado" mesmo
  // depois do trabalho já ter terminado.
  process.exit(0);
}

main().catch(err => {
  console.error('Erro inesperado no coletor:', err);
  process.exit(1);
});
