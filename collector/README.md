[README.md](https://github.com/user-attachments/files/30945569/README.md)
# Coletor de RSS — Despacho

Este é o "motor" que busca notícias reais nos feeds RSS públicos e alimenta o site
com dados atualizados, no lugar dos dados de exemplo.

## Como rodar

```bash
cd collector
npm install
node collect.js
```

Isso cria (ou atualiza) o arquivo `collector/output/items.json`. O site (`data.js`)
tenta carregar esse arquivo automaticamente ao abrir — se ele existir e tiver
itens, o site passa a mostrar as notícias reais em vez dos dados de exemplo.

## Importante: sirva o site por HTTP, não abra o arquivo direto

Por causa de uma restrição de segurança dos navegadores (CORS), o `fetch()` que
busca o `items.json` **não funciona** se você só der duplo-clique no `index.html`
(protocolo `file://`). É preciso servir a pasta por HTTP. Duas formas simples:

```bash
# Opção 1: Python (já vem instalado na maioria dos sistemas)
python3 -m http.server 8000

# Opção 2: Node
npx serve .
```

Depois é só acessar `http://localhost:8000` no navegador.

Sem um servidor HTTP, ou se o `items.json` ainda não existir, o site **continua
funcionando normalmente** — só que com os dados de exemplo (`MOCK_ITEMS`, dentro
de `data.js`). Nada quebra; é um fallback automático.

## ⚠️ Sobre as URLs dos feeds em `feeds.json`

As URLs que coloquei em `feeds.json` são os endereços de RSS mais conhecidos de
cada veículo, mas **eu não consegui testá-las agora** (este ambiente não tem
acesso à internet). Feeds RSS mudam de endereço com frequência, e alguns
veículos os desativam sem aviso — é o caso, por exemplo, da Reuters, que
descontinuou seus feeds RSS públicos há alguns anos (por isso não incluí a
Reuters aqui, mesmo aparecendo no site).

Antes de depender disso, rode `node collect.js` e confira o log: cada feed que
falhar aparece marcado com "✗" e a mensagem de erro. Se uma URL não funcionar
mais, é só:

1. Procurar o RSS atual do veículo (geralmente em `/feed`, `/rss`, ou numa
   página "RSS" no rodapé do site);
2. Atualizar a URL correspondente em `feeds.json`;
3. Rodar `node collect.js` de novo.

## Como funciona a classificação por editoria

Alguns feeds já são específicos de uma editoria (ex: o RSS de política do G1) —
esses têm `"category"` fixo no `feeds.json`. Outros veículos publicam tudo
misturado num único feed geral; para esses, uso `"category": "classify"`, que
aplica um filtro por palavras-chave (juros, tarifa, exportação, inflação etc.)
para decidir se a notícia é de Economia, Comércio Internacional, ou cai no
`"default"` informado (Brasil ou Internacional). Esse classificador é simples
de propósito — para ajustar a precisão, edite a lista `KEYWORDS` no topo de
`collect.js`.

## Manter atualizado automaticamente

Rodar `node collect.js` manualmente atualiza o `items.json` uma vez. Para manter
o site sempre com notícias recentes, agende essa execução periodicamente:

- **Cron (servidor próprio / Linux)**: `crontab -e` e adicione, por exemplo,
  para rodar a cada 30 minutos:
  ```
  */30 * * * * cd /caminho/para/collector && /usr/bin/node collect.js >> collect.log 2>&1
  ```
- **GitHub Actions** (se o site estiver hospedado no GitHub Pages, por exemplo):
  um workflow agendado (`schedule: cron`) que roda `node collect.js` e faz commit
  do `items.json` atualizado.
- **Serviços de hospedagem com jobs agendados** (Railway, Render, etc.): a
  maioria oferece "cron jobs" ou "scheduled tasks" prontos para isso.

## Formato de saída

Cada item em `items.json` segue este formato (usado também pelos `MOCK_ITEMS`
em `data.js`):

```json
{
  "cat": "economia",
  "src": "G1",
  "h": "Título da notícia",
  "d": "Resumo curto gerado a partir do resumo/trecho do feed.",
  "link": "https://... (URL real da matéria, usada no botão 'ler no original')",
  "time": "2026-08-11T14:32:00.000Z"
}
```
