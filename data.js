// ---------- DADOS COMPARTILHADOS ----------
// Conteúdo fictício (mock) apenas para demonstrar layout, categorização e navegação.
// Numa versão real, cada item viria de um feed RSS com sua própria URL de matéria.

const NOW = new Date();
function hoursAgo(h){ return new Date(NOW.getTime() - h*3600*1000); }
function fmtTime(d){
  return d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) + ' · há ' +
    Math.max(1, Math.round((NOW-d)/3600000)) + 'h';
}
function dateKey(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function dateLabel(d){
  const today = dateKey(NOW);
  const yestKey = dateKey(new Date(NOW.getTime()-24*3600*1000));
  const k = dateKey(d);
  if(k===today) return 'Hoje';
  if(k===yestKey) return 'Ontem';
  return d.toLocaleDateString('pt-BR', {weekday:'long', day:'2-digit', month:'long'});
}

// Editorias: cada uma aponta para sua própria página
const CATS = {
  brasil: {label:'Brasil — Política', class:'c-brasil', page:'brasil.html', desc:'Congresso, Executivo, Judiciário, eleições e política estadual.'},
  internacional: {label:'Internacional', class:'c-internacional', page:'internacional.html', desc:'Diplomacia, conflitos, eleições e organismos multilaterais ao redor do mundo.'},
  economia: {label:'Economia', class:'c-economia', page:'economia.html', desc:'Juros, inflação, mercados e indicadores do Brasil e do mundo.'},
  comercio: {label:'Comércio Internacional', class:'c-comercio', page:'comercio.html', desc:'Acordos comerciais, tarifas, exportação e cadeias de fornecimento globais.'},
};

// URL real do portal de cada fonte (home ou seção geral).
// Em produção, isso seria substituído pela URL exata da matéria, vinda do RSS.
const SOURCE_URLS = {
  'G1': 'https://g1.globo.com/',
  'CNN Brasil': 'https://www.cnnbrasil.com.br/',
  'BBC News Brasil': 'https://www.bbc.com/portuguese',
  'BBC News': 'https://www.bbc.com/news',
  'The Guardian': 'https://www.theguardian.com/international',
  'El País': 'https://elpais.com/',
  'CNN': 'https://edition.cnn.com/',
  'Le Monde Diplomatique': 'https://diplomatique.org.br/',
  'Reuters': 'https://www.reuters.com/',
};

const MOCK_ITEMS = [
  // ---- HOJE ----
  {cat:'brasil', src:'G1', time:hoursAgo(1), h:'Congresso retoma pauta de reformas na volta do recesso', d:'Líderes da Câmara e do Senado sinalizam prioridade para projetos de tramitação urgente nas próximas semanas.'},
  {cat:'brasil', src:'CNN Brasil', time:hoursAgo(2), h:'Governo anuncia pacote de medidas para infraestrutura regional', d:'Investimentos previstos devem ser distribuídos entre estados do Norte e Nordeste ao longo do próximo ano fiscal.'},
  {cat:'brasil', src:'BBC News Brasil', time:hoursAgo(3), h:'Ministros debatem calendário eleitoral em reunião reservada', d:'Encontro discutiu prazos e diretrizes para o próximo pleito, segundo fontes ouvidas pela reportagem.'},
  {cat:'brasil', src:'G1', time:hoursAgo(5), h:'STF marca julgamento sobre competência tributária estadual', d:'Decisão pode afetar arrecadação de vários estados e é acompanhada de perto por governadores.'},
  {cat:'internacional', src:'The Guardian', time:hoursAgo(1), h:'Cúpula europeia discute resposta coordenada a crise energética', d:'Líderes buscam consenso sobre reservas estratégicas antes do início do inverno no hemisfério norte.'},
  {cat:'internacional', src:'El País', time:hoursAgo(2), h:'Eleições regionais na Espanha reconfiguram mapa de alianças', d:'Resultados parciais indicam fragmentação parlamentar e negociações mais longas para formação de governo.'},
  {cat:'internacional', src:'BBC News', time:hoursAgo(4), h:'Tensão diplomática cresce após rodada de sanções cruzadas', d:'Chancelarias trocam notas formais enquanto organismos multilaterais pedem moderação às partes envolvidas.'},
  {cat:'internacional', src:'CNN', time:hoursAgo(6), h:'ONU convoca sessão extraordinária sobre crise humanitária', d:'Reunião do Conselho de Segurança deve discutir corredores humanitários e acesso de ajuda internacional.'},
  {cat:'economia', src:'G1', time:hoursAgo(1), h:'Banco Central mantém taxa básica de juros na reunião do Copom', d:'Comunicado cita cautela diante do cenário fiscal e da inflação de serviços ainda pressionada.'},
  {cat:'economia', src:'Reuters', time:hoursAgo(3), h:'Mercados globais reagem a dados de emprego nos EUA', d:'Bolsas asiáticas e europeias ajustam expectativas sobre o ritmo de cortes de juros pelo Federal Reserve.'},
  {cat:'economia', src:'CNN Brasil', time:hoursAgo(4), h:'Inflação de alimentos desacelera pelo terceiro mês seguido', d:'Índice oficial mostra recuo em itens da cesta básica, mas serviços seguem pressionando o índice geral.'},
  {cat:'comercio', src:'Reuters', time:hoursAgo(2), h:'Bloco econômico anuncia nova rodada de negociação tarifária', d:'Reunião ministerial deve discutir barreiras não tarifárias e cotas para produtos agrícolas e industriais.'},
  {cat:'comercio', src:'The Guardian', time:hoursAgo(5), h:'Disputa comercial entre potências afeta cadeia de semicondutores', d:'Fabricantes revisam rotas de fornecimento diante de novas restrições à exportação de componentes.'},
  {cat:'comercio', src:'G1', time:hoursAgo(6), h:'Exportações brasileiras do agronegócio atingem novo recorde mensal', d:'Alta é puxada por soja e carne bovina, com destino principal para mercados asiáticos.'},

  // ---- ONTEM (24-47h) ----
  {cat:'brasil', src:'CNN Brasil', time:hoursAgo(27), h:'Comissão aprova texto-base de projeto sobre gestão fiscal', d:'Relatório segue agora para votação em plenário, com previsão de debate ainda nesta semana.'},
  {cat:'brasil', src:'BBC News Brasil', time:hoursAgo(31), h:'Governadores se reúnem para discutir partilha de recursos federais', d:'Encontro busca alinhamento antes do envio da proposta orçamentária ao Congresso.'},
  {cat:'brasil', src:'G1', time:hoursAgo(38), h:'TSE define regras para propaganda eleitoral no próximo pleito', d:'Norma estabelece limites de gastos e prazos para registro de candidaturas.'},
  {cat:'internacional', src:'El País', time:hoursAgo(26), h:'Governo francês enfrenta moção de desconfiança no parlamento', d:'Oposição articula votação após impasse sobre pacote de ajuste orçamentário.'},
  {cat:'internacional', src:'Le Monde Diplomatique', time:hoursAgo(33), h:'Análise: o papel de organismos multilaterais em conflitos regionais', d:'Artigo discute os limites da mediação internacional diante de crises prolongadas.'},
  {cat:'internacional', src:'BBC News', time:hoursAgo(40), h:'Novo ciclo de negociações busca cessar-fogo em zona de conflito', d:'Delegações retomam conversas mediadas por representantes de organismos internacionais.'},
  {cat:'economia', src:'El País', time:hoursAgo(29), h:'Zona do euro evita recessão técnica em dado revisado', d:'Crescimento marginal no trimestre surpreende analistas que projetavam retração da atividade industrial.'},
  {cat:'economia', src:'Reuters', time:hoursAgo(35), h:'Preço do petróleo recua após dados de estoque nos EUA', d:'Movimento reflete expectativa de menor demanda global no curto prazo.'},
  {cat:'comercio', src:'CNN', time:hoursAgo(30), h:'Acordo de livre comércio entra em fase final de ratificação', d:'Parlamentos dos países signatários devem votar o texto nas próximas sessões legislativas.'},
  {cat:'comercio', src:'G1', time:hoursAgo(36), h:'Brasil amplia lista de parceiros para exportação de carne suína', d:'Novos mercados abertos após inspeções sanitárias concluídas no último trimestre.'},

  // ---- ANTEONTEM (48-71h) ----
  {cat:'brasil', src:'G1', time:hoursAgo(50), h:'Câmara instala comissão especial para discutir reforma administrativa', d:'Grupo de trabalho terá prazo de 90 dias para apresentar relatório preliminar.'},
  {cat:'brasil', src:'CNN Brasil', time:hoursAgo(58), h:'Ministério discute plano de expansão de saneamento básico', d:'Proposta prevê parcerias com estados para acelerar obras em regiões metropolitanas.'},
  {cat:'internacional', src:'The Guardian', time:hoursAgo(52), h:'Reino Unido anuncia revisão de política migratória', d:'Mudanças nas regras de vistos devem afetar setores que dependem de mão de obra estrangeira.'},
  {cat:'internacional', src:'CNN', time:hoursAgo(63), h:'Cúpula regional discute resposta conjunta a desastres climáticos', d:'Países vizinhos avaliam fundo comum para reconstrução após eventos extremos recentes.'},
  {cat:'economia', src:'CNN Brasil', time:hoursAgo(49), h:'Indústria registra terceiro mês seguido de queda na produção', d:'Setor automotivo puxa retração, segundo levantamento de entidade patronal.'},
  {cat:'economia', src:'G1', time:hoursAgo(61), h:'Dólar fecha em leve alta com investidores cautelosos', d:'Mercado aguarda sinalizações do Banco Central sobre próximos passos da política monetária.'},
  {cat:'comercio', src:'Reuters', time:hoursAgo(55), h:'Exportadores pedem revisão de tarifas em bloco regional', d:'Setor produtivo argumenta perda de competitividade frente a concorrentes asiáticos.'},

  // ---- 3 DIAS ATRÁS (72-95h) ----
  {cat:'brasil', src:'BBC News Brasil', time:hoursAgo(75), h:'Senado aprova em primeiro turno mudança em regra previdenciária', d:'Texto segue para segundo turno de votação com previsão de debate acirrado.'},
  {cat:'internacional', src:'El País', time:hoursAgo(80), h:'Bloco latino-americano discute integração energética regional', d:'Ministros avaliam interligação de redes elétricas entre países vizinhos.'},
  {cat:'economia', src:'Reuters', time:hoursAgo(78), h:'Banco central europeu sinaliza pausa em ciclo de ajuste de juros', d:'Comunicado cita necessidade de avaliar efeitos das últimas decisões sobre a atividade econômica.'},
  {cat:'comercio', src:'The Guardian', time:hoursAgo(84), h:'Porto europeu registra recorde de movimentação de contêineres', d:'Alta é atribuída à recomposição de estoques após período de instabilidade logística.'},

  // ---- 4 DIAS ATRÁS (96-119h) ----
  {cat:'brasil', src:'G1', time:hoursAgo(100), h:'Governo federal libera novo lote de recursos para educação básica', d:'Repasse será destinado a estados com menor índice de desenvolvimento educacional.'},
  {cat:'internacional', src:'Le Monde Diplomatique', time:hoursAgo(105), h:'Análise: disputas por recursos hídricos ganham espaço na agenda diplomática', d:'Artigo mapeia bacias hidrográficas compartilhadas como novo foco de tensão entre países.'},
  {cat:'economia', src:'El País', time:hoursAgo(110), h:'Desemprego na zona do euro atinge menor patamar em uma década', d:'Dado positivo é acompanhado de alerta sobre pressão salarial em setores de serviços.'},
  {cat:'comercio', src:'G1', time:hoursAgo(115), h:'Setor de biocombustíveis brasileiro amplia exportações para a Ásia', d:'Novos contratos firmados devem elevar volume embarcado no próximo semestre.'},
];

// ---------- CARREGAMENTO DE DADOS REAIS ----------
// O coletor (collector/collect.js) escreve collector/output/items.json com notícias
// reais vindas dos feeds RSS. Se o arquivo existir e o site estiver sendo servido por
// um servidor HTTP (não aberto direto como file://), ele substitui os dados de exemplo.
// Caso contrário (arquivo ausente, ainda não rodou, ou aberto localmente via file://),
// o site continua funcionando normalmente com os dados de exemplo (MOCK_ITEMS).
window.ITEMS = MOCK_ITEMS;
window.ITEMS_ARE_LIVE = false;

async function loadItems(){
  try{
    const res = await fetch('collector/output/items.json', {cache:'no-store'});
    if(!res.ok) throw new Error('items.json indisponível (' + res.status + ')');
    const raw = await res.json();
    if(!Array.isArray(raw) || raw.length === 0) throw new Error('items.json vazio');
    window.ITEMS = raw.map(i => ({...i, time: new Date(i.time)}));
    window.ITEMS_ARE_LIVE = true;
  }catch(e){
    // Sem servidor HTTP, sem coletor rodado ainda, ou feed indisponível: usa os dados de exemplo.
    window.ITEMS = MOCK_ITEMS;
    window.ITEMS_ARE_LIVE = false;
  }
  window.dispatchEvent(new Event('itemsready'));
}
loadItems();
