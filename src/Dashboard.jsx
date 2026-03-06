import { useState, useMemo, useEffect } from "react";
import { useCloud } from "./useCloud";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from "recharts";

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const NOW = new Date();
const CUR_MONTH = NOW.getMonth();
const CUR_YEAR = NOW.getFullYear();

// Categorias de receita fixas
const CAT_RECEITA = [
  { id: "salario", nome: "Salário", emoji: "💼", cor: "#a855f7" },
  { id: "contrato", nome: "Contrato", emoji: "📄", cor: "#06b6d4" },
  { id: "extra", nome: "Extra", emoji: "⭐", cor: "#f59e0b" },
];

const DEFAULT_CATS_GASTO = [
  { id: "proteina", nome: "Proteína", emoji: "🥩", cor: "#ef4444" },
  { id: "fruta", nome: "Fruta", emoji: "🍎", cor: "#22c55e" },
  { id: "legumes", nome: "Legumes", emoji: "🥦", cor: "#84cc16" },
  { id: "carbo", nome: "Carboidratos", emoji: "🍞", cor: "#f59e0b" },
  { id: "limpeza", nome: "Sabão/Limpeza", emoji: "🧼", cor: "#3b82f6" },
  { id: "pet", nome: "Pet", emoji: "🐾", cor: "#f59e0b" },
  { id: "saude", nome: "Saúde/Remédio", emoji: "💊", cor: "#a855f7" },
  { id: "servico", nome: "Serviços", emoji: "📱", cor: "#06b6d4" },
  { id: "moradia", nome: "Moradia", emoji: "🏠", cor: "#ef4444" },
  { id: "imposto", nome: "Impostos/DAS", emoji: "📋", cor: "#6b7280" },
  { id: "outros", nome: "Outros", emoji: "📦", cor: "#9a8a6a" },
];

const DEFAULT_CONTAS = [
  { id: "nu_mariana",   nome: "Nubank Mariana",   usuario: "Mariana", cor: "#a855f7", emoji: "💳", tipo: "credito",  fechamento: 31, vencimento: 3  },
  { id: "nu_tiago",     nome: "Nubank Tiago",     usuario: "Tiago",   cor: "#7c3aed", emoji: "💳", tipo: "credito",  fechamento: 10, vencimento: 15 },
  { id: "nu_pj_mariana",nome: "Nubank PJ Mariana",usuario: "Mariana", cor: "#06b6d4", emoji: "🏢", tipo: "credito",  fechamento: 31, vencimento: 3  },
  { id: "digio_tiago",  nome: "Digio Tiago",      usuario: "Tiago",   cor: "#10b981", emoji: "💳", tipo: "credito",  fechamento: 10, vencimento: 15 },
];

const DEFAULT_ORCAMENTOS = [
  { id: "feira", nome: "Feira", cor: "#22c55e", emoji: "🛒", categorias: ["proteina","fruta","legumes","carbo","limpeza"], limitesCat: { proteina:300, fruta:80, legumes:80, carbo:80, limpeza:60 }, fixo: false },
  { id: "billy_oreo", nome: "Billy e Oreo", cor: "#f59e0b", emoji: "🐾", categorias: ["outros"], limitesCat: {}, fixo: true },
  { id: "servicos", nome: "Serviços", cor: "#3b82f6", emoji: "📱", categorias: ["outros"], limitesCat: {}, fixo: true },
  { id: "remedio", nome: "Remédio", cor: "#a855f7", emoji: "💊", categorias: ["outros"], limitesCat: {}, fixo: true },
  { id: "casa", nome: "Casa", cor: "#ef4444", emoji: "🏠", categorias: ["outros"], limitesCat: {}, fixo: true },
];

const DEFAULT_RECEITAS = [
  { id: 1, usuario: "Tiago", categoria: "salario", descricao: "Salário Tiago", previsto: 2500, recorrente: true, diaRecebimento: 10 },
  { id: 2, usuario: "Mariana", categoria: "salario", descricao: "Salário Mariana", previsto: 3000, recorrente: true, diaRecebimento: -1 },
  { id: 3, usuario: "Mariana", categoria: "contrato", descricao: "Contrato previsto", previsto: 1500, recorrente: false, mesPrevisto: (CUR_MONTH + 1) % 12 },
];

const PAD = (n) => String(n).padStart(2, "0");
const DEFAULT_DATA = `${CUR_YEAR}-${PAD(CUR_MONTH+1)}-05`;
const DEFAULT_REALIZADOS = {
  [`${CUR_YEAR}-${CUR_MONTH}-1`]: { valor: 2500, recebido: true, data: DEFAULT_DATA },
  [`${CUR_YEAR}-${CUR_MONTH}-2`]: { valor: 3000, recebido: true, data: DEFAULT_DATA },
};

// vigenciaInicio/vigenciaFim: "YYYY-MM" or null (forever)
const DEFAULT_GASTOS_FIXOS = [
  { id: "gf1", vigenciaInicio: "2026-01", vigenciaFim: "2026-12",  descricao: "Plano Billy e Oreo",     valor: 89.90,  usuario: "Tiago",   categoria: "pet",     orcamento: "billy_oreo", conta: "digio_tiago",   diaPagamento: 1,  debitoAuto: false },
  { id: "gf2", vigenciaInicio: "2026-01", vigenciaFim: "2026-12",  descricao: "Ração e Plano Billy/Oreo",valor: 70.00,  usuario: "Tiago",   categoria: "pet",     orcamento: "billy_oreo", conta: "",              diaPagamento: 1,  debitoAuto: true },
  { id: "gf3", vigenciaInicio: "2026-01", vigenciaFim: "2026-12",  descricao: "Google Storage",          valor: 4.50,   usuario: "Tiago",   categoria: "servico", orcamento: "servicos",   conta: "nu_tiago",      diaPagamento: 5,  debitoAuto: true },
  { id: "gf4", vigenciaInicio: "2026-01", vigenciaFim: "2026-12",  descricao: "Remédio TDAH",            valor: 206.00, usuario: "Tiago",   categoria: "saude",   orcamento: "remedio",    conta: "nu_pj_mariana", diaPagamento: 10, debitoAuto: false },
  { id: "gf5", vigenciaInicio: "2026-01", vigenciaFim: "2026-12",  descricao: "DAS",                     valor: 86.05,  usuario: "Mariana", categoria: "imposto", orcamento: "",           conta: "",              diaPagamento: 20, debitoAuto: true },
  { id: "gf6", vigenciaInicio: "2026-01", vigenciaFim: "2026-12",  descricao: "Streamings",              valor: 74.90,  usuario: "Mariana", categoria: "servico", orcamento: "servicos",   conta: "nu_mariana",    diaPagamento: 5,  debitoAuto: true },
  { id: "gf7", vigenciaInicio: "2026-01", vigenciaFim: "2026-12",  descricao: "Spotify Duo",             valor: 31.90,  usuario: "Mariana", categoria: "servico", orcamento: "servicos",   conta: "nu_mariana",    diaPagamento: 5,  debitoAuto: true },
  { id: "gf8", vigenciaInicio: "2026-01", vigenciaFim: "2026-12",  descricao: "Academia",                valor: 150.00, usuario: "Mariana", categoria: "servico", orcamento: "servicos",   conta: "nu_mariana",    diaPagamento: 1,  debitoAuto: false },
  { id: "gf9", vigenciaInicio: "2026-01", vigenciaFim: "2026-12",  descricao: "Energia",                 valor: 150.00, usuario: "Tiago",   categoria: "moradia", orcamento: "casa",       conta: "",              diaPagamento: 10, debitoAuto: true },
  { id: "gf10", vigenciaInicio: "2026-01", vigenciaFim: "2026-12", descricao: "Água",                    valor: 0.00,   usuario: "Tiago",   categoria: "moradia", orcamento: "casa",       conta: "",              diaPagamento: 10, debitoAuto: true },
  { id: "gf11", vigenciaInicio: "2026-01", vigenciaFim: "2026-12", descricao: "Internet",                valor: 99.90,  usuario: "Tiago",   categoria: "moradia", orcamento: "casa",       conta: "",              diaPagamento: 5,  debitoAuto: true },
  { id: "gf12", vigenciaInicio: "2026-01", vigenciaFim: "2026-12", descricao: "Condomínio",              valor: 250.00, usuario: "Tiago",   categoria: "moradia", orcamento: "casa",       conta: "",              diaPagamento: 10, debitoAuto: true },
  { id: "gf13", vigenciaInicio: "2024-12", vigenciaFim: "2059-11", descricao: "Financiamento 16/420",    valor: 650.00, usuario: "Tiago",   categoria: "moradia", orcamento: "casa",       conta: "",              diaPagamento: 15, debitoAuto: true },
];

// Compute vigenciaFim from start month "YYYY-MM" + number of parcelas (1-based, so 1 parcel = só aquele mês)
function calcVigenciaFim(inicio, parcelas) {
  if (!inicio || !parcelas) return null;
  const [y, m] = inicio.split("-").map(Number);
  const total = Number(parcelas) - 1;
  const endM = ((m - 1 + total) % 12) + 1;
  const endY = y + Math.floor((m - 1 + total) / 12);
  return `${endY}-${String(endM).padStart(2,"0")}`;
}

function fmt(v) { return `R$ ${Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}`; }
function pct(real, prev) { if (!prev) return 0; return Math.min(100, Math.round((real/prev)*100)); }
function fmtData(d) { if (!d) return "—"; const [y,m,day] = d.split("-"); return `${day}/${m}/${y}`; }
function dataPrevista(dia, m, a) {
  if (!dia) return null;
  if (dia === -1) {
    const ultimo = new Date(a, m + 1, 0).getDate();
    return `${PAD(ultimo)}/${PAD(m+1)}/${a}`;
  }
  return `${PAD(dia)}/${PAD(m+1)}/${a}`;
}

const S = {
  page: { fontFamily:"'Crimson Text',Georgia,serif", background:"#f7f4ef", minHeight:"100vh", color:"#1a1208" },
  header: { background:"#1a1208", padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 },
  title: { fontSize:24, fontWeight:"bold", color:"#e8d5a3", letterSpacing:1, margin:0 },
  subtitle: { color:"#7a6a4a", fontSize:12, margin:"2px 0 0" },
  nav: { display:"flex", gap:2, background:"#2a2010", borderRadius:10, padding:4, flexWrap:"wrap" },
  navBtn: (a, mob) => ({ padding: mob ? "5px 9px" : "6px 15px", borderRadius:8, border:"none", cursor:"pointer", fontSize: mob ? 11 : 12, fontWeight:600, background:a?"#e8d5a3":"transparent", color:a?"#1a1208":"#7a6a4a", transition:"all 0.2s" }),
  body: { padding:"14px 16px" },
  card: { background:"white", borderRadius:12, padding:18, boxShadow:"0 1px 4px #0001" },
  label: { fontSize:11, color:"#9a8a6a", fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:4 },
  val: (c) => ({ fontSize:26, fontWeight:"bold", color:c||"#1a1208" }),
  input: { background:"#f7f4ef", border:"1px solid #d4c8a8", borderRadius:8, padding:"8px 10px", fontSize:13, color:"#1a1208", outline:"none", width:"100%", boxSizing:"border-box" },
  select: { background:"#f7f4ef", border:"1px solid #d4c8a8", borderRadius:8, padding:"8px 10px", fontSize:13, color:"#1a1208", outline:"none", width:"100%", boxSizing:"border-box" },
  btn: (c) => ({ background:c||"#1a1208", border:"none", borderRadius:8, padding:"9px 18px", color:c?"white":"#e8d5a3", fontWeight:700, cursor:"pointer", fontSize:13, whiteSpace:"nowrap" }),
  tag: (cor) => ({ background:cor+"22", color:cor, borderRadius:20, padding:"2px 9px", fontSize:11, fontWeight:700, display:"inline-block" }),
  th: { padding:"9px 12px", textAlign:"left", color:"#9a8a6a", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1 },
  td: { padding:"10px 12px", fontSize:13, borderTop:"1px solid #f0ebe0" },
  prog: { height:8, borderRadius:4, background:"#ede8da", overflow:"hidden" },
  progBar: (p,c) => ({ height:"100%", width:`${p}%`, background:c||"#22c55e", borderRadius:4, transition:"width 0.5s" }),
  modal: { position:"fixed", inset:0, background:"#0008", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 },
  modalBox: { background:"white", borderRadius:16, padding:20, width:480, maxWidth:"95vw", boxShadow:"0 20px 60px #0003", maxHeight:"90vh", overflowY:"auto" },
};

export default function Dashboard({ userEmail, onLogout }) {

  const [tab, setTab] = useState("resumo");
  const [mes, setMes] = useState(CUR_MONTH);
  const [ano, setAno] = useState(CUR_YEAR);
  const [userFilter, setUserFilter] = useState("Todos");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useState(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  });

  const [catsGasto, setCatsGasto, _r1] = useCloud("catsGasto", DEFAULT_CATS_GASTO);
  const [contas, setContas, _r2] = useCloud("contas", DEFAULT_CONTAS);
  const [orcamentos, setOrcamentos] = useCloud("orcamentos", DEFAULT_ORCAMENTOS);
  const [receitas, setReceitas, _r3] = useCloud("receitas", DEFAULT_RECEITAS);
  const [realizados, setRealizados] = useCloud("realizados", DEFAULT_REALIZADOS);
  const [gastos, setGastos, _r4] = useCloud("gastos", []);
  const [gastosFixos, setGastosFixos, _r5] = useCloud("gastosFixos", DEFAULT_GASTOS_FIXOS);
  const [pagosFixos, setPagosFixos] = useCloud("pagosFixos", {});
  const [faturasPagas, setFaturasPagas] = useCloud("faturasPagas", {}); // key: "contaId-ano-mes" -> {paga, dataPagamento} // key: "ano-mes-gfId" -> { pago, data }

  const [formReceita, setFormReceita] = useState({ usuario:"Tiago", categoria:"salario", descricao:"", previsto:"", recorrente:true, diaRecebimento:"" });
  const [formGasto, setFormGasto] = useState({ usuario:"Tiago", categoria:"outros", orcamento:"", conta:"", descricao:"", valor:"", data: today() });
  const [formCat, setFormCat] = useState({ nome:"", emoji:"📦", cor:"#6b7280" });
  const [formConta, setFormConta] = useState({ nome:"", usuario:"Tiago", emoji:"💳", cor:"#6b7280", tipo:"credito", fechamento:"", vencimento:"" });
  const [formOrc, setFormOrc] = useState({ nome:"", emoji:"🛒", cor:"#22c55e", categorias:[], limitesCat:{}, fixo:false });
  const [formGastoFixo, setFormGastoFixo] = useState({ descricao:"", valor:"", usuario:"Tiago", categoria:"outros", conta:"", orcamento:"", diaPagamento:"", debitoAuto:false, vigenciaInicio:"", vigenciaFim:"", parcelas:"" });
  const [modalGastoFixo, setModalGastoFixo] = useState(false);

  const [modals, setModals] = useState({ cat:false, conta:false, orc:false });
  const [editando, setEditando] = useState(null);
  const [confirmando, setConfirmando] = useState(null);
  const [expandidos, setExpandidos] = useState({}); // contaId-fatMes-fatAno -> bool
  const toggleExpandido = (k) => setExpandidos(prev=>({...prev,[k]:!prev[k]}));
  const abrirEdicao = (tipo, item) => setEditando({ tipo, id: item.id, dados: {...item} });
  const fecharEdicao = () => setEditando(null);

  function salvarEdicao() {
    if (!editando) return;
    const { tipo, id, dados } = editando;
    if (tipo === "receita") setReceitas(prev => prev.map(r => r.id === id ? {...dados} : r));
    if (tipo === "gasto") setGastos(prev => prev.map(g => g.id === id ? {...dados, valor: Number(dados.valor)} : g));
    if (tipo === "gastoFixo") {
      const d2 = {...dados, valor: Number(dados.valor)};
      if (d2.parcelas && d2.vigenciaInicio) d2.vigenciaFim = calcVigenciaFim(d2.vigenciaInicio, d2.parcelas);
      setGastosFixos(prev => prev.map(g => g.id === id ? d2 : g));
    }
    if (tipo === "cat") setCatsGasto(prev => prev.map(c => c.id === id ? {...dados} : c));
    if (tipo === "conta") setContas(prev => prev.map(c => c.id === id ? {...dados} : c));
    if (tipo === "orc") setOrcamentos(prev => prev.map(o => o.id === id ? {...dados} : o));
    fecharEdicao();
  }

  function excluir(tipo, id, label) {
    setConfirmando({ tipo, id, label: label || "este item" });
  }
  function confirmarExclusao() {
    if (!confirmando) return;
    const { tipo, id } = confirmando;
    if (tipo === "receita") setReceitas(prev => prev.filter(r => r.id !== id));
    if (tipo === "gasto") setGastos(prev => prev.filter(g => g.id !== id));
    if (tipo === "gastoFixo") setGastosFixos(prev => prev.filter(g => g.id !== id));
    if (tipo === "cat") setCatsGasto(prev => prev.filter(c => c.id !== id));
    if (tipo === "conta") setContas(prev => prev.filter(c => c.id !== id));
    if (tipo === "orc") setOrcamentos(prev => prev.filter(o => o.id !== id));
    setConfirmando(null);
  }
  const [mesSelecionado, setMesSelecionado] = useState(null);
  const LINHAS_DEFAULT = { previsto:true, realizado:true, gastos:true, fixos:true };
  const [linhasAtivas, setLinhasAtivas] = useState(LINHAS_DEFAULT);
  const toggleLinha = (k) => setLinhasAtivas(prev=>({...prev,[k]:!prev[k]}));
  const [linhasOrc, setLinhasOrc] = useState({});
  const [linhasCat, setLinhasCat] = useState({});
  const toggleLinhaOrc = (id) => setLinhasOrc(prev=>({...prev,[id]:prev[id]===true?false:true}));
  const toggleLinhaCat = (id) => setLinhasCat(prev=>({...prev,[id]:prev[id]===true?false:true}));
  const modal = (k,v) => setModals(m=>({...m,[k]:v}));

  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  const mesKey = (m,a,id) => `${a}-${m}-${id}`;

  const receitasDoMes = useMemo(() => receitas.filter(r => {
    if (r.recorrente) return true;
    return r.mesPrevisto === mes;
  }).filter(r => userFilter==="Todos" || r.usuario===userFilter), [receitas,mes,userFilter]);

  const totalPrevisto = receitasDoMes.reduce((s,r)=>s+Number(r.previsto),0);
  const totalRealizado = receitasDoMes.reduce((s,r)=>{
    const k=mesKey(mes,ano,r.id);
    return s+(realizados[k]?.recebido ? Number(realizados[k].valor||r.previsto):0);
  },0);

  // vigencia: filter out fixed expenses not active in mes/ano
  const mesAnoStr = (m, a) => `${a}-${PAD(m+1)}`;
  const gfAtivo = (g, checkMes, checkAno) => {
    const cur = mesAnoStr(checkMes ?? mes, checkAno ?? ano);
    if (g.vigenciaInicio && cur < g.vigenciaInicio) return false;
    if (g.vigenciaFim && cur > g.vigenciaFim) return false;
    return true;
  };
  const gastosFixosDoMes = gastosFixos.filter(g =>
    (userFilter==="Todos" || g.usuario===userFilter) && gfAtivo(g)
  );
  const gfKey = (m,a,id) => `${a}-${m}-${id}`;
  const TODAY_DAY = NOW.getDate();
  const IS_CUR_MONTH = mes === CUR_MONTH && ano === CUR_YEAR;
  const gfPago = (id) => {
    // manual override always wins
    if (pagosFixos[gfKey(mes,ano,id)]?.pago !== undefined) return pagosFixos[gfKey(mes,ano,id)].pago;
    const gf = gastosFixos.find(g=>g.id===id);
    if (!gf) return false;
    // past months → always paid
    if (ano < CUR_YEAR || (ano === CUR_YEAR && mes < CUR_MONTH)) return true;
    // future months → never paid
    if (!IS_CUR_MONTH) return false;
    // current month logic
    const conta = gf.conta ? contas.find(ct=>ct.id===gf.conta) : null;
    if (conta?.tipo === "credito") {
      // credit: charged to card as soon as billing day passes (appears in fatura)
      return TODAY_DAY >= gf.diaPagamento;
    }
    if (conta?.tipo === "corrente" || (gf.debitoAuto && !gf.conta)) {
      // debit/corrente: auto when day passes
      return TODAY_DAY >= gf.diaPagamento;
    }
    return false;
  };
  const gfData = (id) => pagosFixos[gfKey(mes,ano,id)]?.data || "";
  const togglePagoFixo = (id) => {
    const k = gfKey(mes,ano,id);
    setPagosFixos(prev => ({...prev, [k]: { pago: !prev[k]?.pago, data: !prev[k]?.pago ? today() : "" }}));
  };
  const gastosDoMes = gastos.filter(g=>g.mes===mes && g.ano===ano && (userFilter==="Todos"||g.usuario===userFilter));
  const totalGastos = gastosDoMes.reduce((s,g)=>s+Number(g.valor),0) + gastosFixosDoMes.filter(g=>gfPago(g.id)).reduce((s,g)=>s+Number(g.valor),0);
  const faturaKey = (cid,m,a) => `${cid}-${a}-${m}`;
  const getFatura = (cid,m,a) => faturasPagas[faturaKey(cid,m,a)] || {};
  const isFaturaPaga = (cid,m,a) => !!getFatura(cid,m,a).paga;
  const pagarFatura = (cid) => {
    const k = faturaKey(cid,mes,ano);
    setFaturasPagas(prev=>({...prev,[k]:{paga:!prev[k]?.paga, dataPagamento: !prev[k]?.paga ? today() : ""}}));
  };
  // gastos variáveis por conta no mês
  const gastosContaMes = (cid,m,a) => {
    const m2 = m ?? mes; const a2 = a ?? ano;
    const variaveis = gastos.filter(g=>g.conta===cid&&g.mes===m2&&g.ano===a2).reduce((s,g)=>s+Number(g.valor),0);
    const fixos = gastosFixos.filter(g=>g.conta===cid&&gfPago(g.id)).reduce((s,g)=>s+Number(g.valor),0);
    return variaveis + fixos;
  };
  const totalFixosPrevisto = gastosFixosDoMes.reduce((s,g)=>s+Number(g.valor),0);
  const totalFixosPago = gastosFixosDoMes.filter(g=>gfPago(g.id)).reduce((s,g)=>s+Number(g.valor),0);
  // ── Ciclo de fatura real ──
  // Gasto com data D no cartão com fechamento F:
  //   se dia(D) <= F → ciclo fecha nesse F do mesmo mês → fatura vence no mês seguinte
  //   se dia(D) >  F → ciclo fecha no F do próximo mês → fatura vence em 2 meses
  // Retorna { fatMes, fatAno } = mês/ano em que a fatura desse gasto vence
  // cicloFatura: given a purchase date and card, return the {fatMes (0-based), fatAno} when the fatura is DUE
  // Rule: if purchase day <= fechamento → fatura closes this month → due next month
  //       if purchase day >  fechamento → fatura closes next month → due in 2 months
  // Special: fechamento >= 28 means "end of month" → all purchases in month M close at end of M → due in M+1
  const cicloFatura = (dataStr, ct) => {
    if (!dataStr || ct.tipo !== "credito") return null;
    const parts = dataStr.split("-").map(Number);
    const y = parts[0], mRaw = parts[1], d = parts[2]; // mRaw is 1-based
    const fech = ct.fechamento || 1;
    let cicloFechaMes, cicloFechaAno;
    if (fech >= 28 || d <= fech) {
      // cycle closes in the same calendar month as the purchase
      cicloFechaMes = mRaw; // 1-based
      cicloFechaAno = y;
    } else {
      // cycle closes next calendar month
      cicloFechaMes = mRaw === 12 ? 1 : mRaw + 1;
      cicloFechaAno = mRaw === 12 ? y + 1 : y;
    }
    // Fatura = the month the cycle CLOSES (same for both Tiago and Mariana)
    const fatMes = cicloFechaMes - 1; // convert 1-based to 0-based
    const fatAno = cicloFechaAno;
    return { fatMes, fatAno, cicloFechaMes, cicloFechaAno };
  };

  // Todos os gastos variáveis de crédito que vencem em mes/ano
  const gastosVariaveisNaFatura = (cid, fatM, fatA) =>
    gastos.filter(g => {
      if (g.conta !== cid) return false;
      const ct = contas.find(x=>x.id===cid);
      const cf = cicloFatura(g.data ? `${g.ano}-${PAD(g.mes+1)}-${PAD(g.data?.split("-")[2]||1)}` : null, ct||{});
      // rebuild full date
      const fullDate = g.data || `${g.ano}-${PAD(g.mes+1)}-01`;
      const cf2 = cicloFatura(fullDate, ct||{});
      return cf2 && cf2.fatMes === fatM && cf2.fatAno === fatA;
    });

  // Gastos fixos de crédito que vencem em mes/ano
  const gastosFixosNaFatura = (cid, fatM, fatA) =>
    gastosFixos.filter(g => {
      if (g.conta !== cid) return false;
      const ct = contas.find(x=>x.id===cid);
      if (!ct || ct.tipo !== "credito") return false;
      // fixed: use diaPagamento as day, reference current loop month
      // we check all months: for each month, what fatura does this fixed expense go to?
      // Since fixed repeats every month, check if THIS fatura month matches
      // A fixed on day D in any month M: goes to fatura of month M (same logic as above)
      // For the fatura at fatM/fatA, the originating month is fatM-1 (or fatM-2 if day > fechamento)
      // Simplification: fixed with diaPagamento <= fechamento → originated in fatM-1
      //                 fixed with diaPagamento >  fechamento → originated in fatM-2... complex
      // Practical: diaPagamento <= fechamento → fatura = same month (0-based) + 1
      const fech = ct.fechamento || 1;
      const origMes0 = g.diaPagamento <= fech
        ? (fatM - 1 + 12) % 12
        : (fatM - 2 + 12) % 12;
      const origAno = g.diaPagamento <= fech
        ? (fatM === 0 ? fatA - 1 : fatA)
        : (fatM <= 1 ? fatA - 1 : fatA);
      // it matches if origMes0 and origAno correspond to a real month
      return true; // include all fixed for this card in this fatura (simplified: 1 fatura per month)
    });

  // buildFatura: collect all purchases (variáveis + fixos) whose fatura is due in fatM/fatA for card ct
  const buildFatura = (ct, fatM, fatA) => {
    if (ct.tipo !== "credito") return null;
    // Variable expenses: use cicloFatura on actual date
    const varLancs = gastos.filter(g => {
      if (g.conta !== ct.id) return false;
      const fullDate = g.data || `${g.ano}-${PAD(g.mes+1)}-01`;
      const cf = cicloFatura(fullDate, ct);
      return cf && cf.fatMes === fatM && cf.fatAno === fatA;
    });
    // Fixed expenses: for each active fixed on this card,
    // check which originating calendar month feeds into fatM/fatA
    // by running cicloFatura on (origMonth, diaPagamento) and comparing result.
    // Check up to 2 prior months since day > fechamento pushes a purchase 2 months forward.
    const fixLancs = [];
    gastosFixos.filter(g => g.conta === ct.id).forEach(g => {
      for (let offset = 0; offset <= 2; offset++) {
        const absIdx = fatA * 12 + fatM - offset;
        const origM1 = (absIdx % 12) + 1;
        const origA  = Math.floor(absIdx / 12);
        const origM0 = origM1 - 1; // 0-based for gfAtivo
        const day    = Math.min(g.diaPagamento, 28);
        const testDate = `${origA}-${PAD(origM1)}-${PAD(day)}`;
        const cf = cicloFatura(testDate, ct);
        if (cf && cf.fatMes === fatM && cf.fatAno === fatA && gfAtivo(g, origM0, origA)) {
          const key = `${g.id}-${origM1}-${origA}`;
          if (!fixLancs.find(x => x._key === key)) {
            fixLancs.push({
              ...g, tipo: "fixo", _key: key,
              data: `${origA}-${PAD(origM1)}-${PAD(day)}`
            });
          }
          break; // found the right originating month, no need to check offset+1
        }
      }
    });
    const allLancs = [
      ...varLancs.map(g=>({...g,tipo:"variavel"})),
      ...fixLancs,
    ].sort((a,b)=>(a.data||"")>(b.data||"")?1:-1);
    const total = allLancs.reduce((s,g)=>s+Number(g.valor),0);
    const paga = isFaturaPaga(ct.id, fatM, fatA);
    const isPastDue = fatA < CUR_YEAR || (fatA === CUR_YEAR && fatM < CUR_MONTH);
    const isDueThisMonth = fatA === CUR_YEAR && fatM === CUR_MONTH;
    const endOfMonthCard = (ct.fechamento || 1) >= 28;
    // For end-of-month cards (Mariana): fatura fatM can only be paid after month fatM ends
    // i.e. current month must be > fatM, or it's the last day of fatM
    const faturaFechada = endOfMonthCard
      ? (ano > fatA || (ano === fatA && mes > fatM) || (ano === fatA && mes === fatM && TODAY_DAY >= 28))
      : isPastDue || (isDueThisMonth && TODAY_DAY >= (ct.vencimento || 1));
    const canPay = faturaFechada;
    return { fatM, fatA, total, paga, lancamentos: allLancs, canPay,
             dataPagamento: getFatura(ct.id, fatM, fatA).dataPagamento };
  };

  // Show: fatura atual (due this month) + próxima (due next month)
  const nextFatMes = (mes + 1) % 12;
  const nextFatAno = mes === 11 ? ano + 1 : ano;

  // Faturas de crédito que vencem NESTE mês (para cálculo de saldo)
  const faturasCreditoDoMes = contas.filter(ct =>
    ct.tipo === "credito" && (userFilter === "Todos" || ct.usuario === userFilter)
  ).map(ct => {
    const f = buildFatura(ct, mes, ano);
    return f ? { conta: ct, ...f } : null;
  }).filter(Boolean).filter(f => f.total > 0);

  const totalFaturasPagasNoMes = faturasCreditoDoMes.filter(f=>f.paga).reduce((s,f)=>s+f.total,0);
  const totalFaturasPendentesNoMes = faturasCreditoDoMes.filter(f=>!f.paga).reduce((s,f)=>s+f.total,0);

  // Débitos automáticos e corrente: saem direto no mês atual
  const totalDebitosNoMes = gastosFixosDoMes
    .filter(g => {
      const ct = g.conta ? contas.find(x=>x.id===g.conta) : null;
      return (ct?.tipo === "corrente" || (!g.conta && g.debitoAuto)) && gfPago(g.id);
    }).reduce((s,g) => s+Number(g.valor), 0)
    + gastosDoMes.filter(g => {
      const ct = g.conta ? contas.find(x=>x.id===g.conta) : null;
      return ct?.tipo === "corrente" || !g.conta;
    }).reduce((s,g) => s+Number(g.valor), 0);

  // Saldo real = receitas recebidas − faturas pagas − débitos diretos
  const saldo = totalRealizado - totalFaturasPagasNoMes - totalDebitosNoMes;
  // Saldo esperado = tudo previsto − todas as faturas pendentes − débitos pendentes
  const saldoEsperado = totalPrevisto - totalFaturasPendentesNoMes - totalFaturasPagasNoMes - totalDebitosNoMes;

  // Previsto = só o que ainda falta receber (pendente)
  const totalPendente = receitasDoMes.reduce((s,r)=>{
    const k=mesKey(mes,ano,r.id);
    const recebido=realizados[k]?.recebido;
    return s+(recebido?0:Number(r.previsto));
  },0);
  const tudo100 = totalPrevisto>0 && totalPendente===0;
  const gastosPorContaData = contas
    .filter(ct => userFilter==="Todos" || ct.usuario===userFilter)
    .map(ct => ({
      name: ct.nome.replace("Nubank PJ Mariana","Nu PJ").replace("Nubank Mariana","Nu Mari").replace("Nubank Tiago","Nu Tiago").replace("Digio Tiago","Digio"),
      valor: gastosContaMes(ct.id,mes,ano),
      cor: ct.cor,
      id: ct.id,
    })).filter(d=>d.valor>0);

  // Próximo mês previsto (para quando 100% realizado)
  const proxMes = (mes+1)%12;
  const proxAno = mes===11?ano+1:ano;
  const totalProxMes = receitas
    .filter(r=>r.recorrente||r.mesPrevisto===proxMes)
    .filter(r=>userFilter==="Todos"||r.usuario===userFilter)
    .reduce((s,r)=>s+Number(r.previsto),0);

  const timeline = Array.from({length:7},(_,i)=>{
    const offset=i-3;
    const m=(mes+offset%12+12)%12;
    const a=ano+Math.floor((mes+offset)/12);
    const rec=receitas.filter(r=>r.recorrente||r.mesPrevisto===m);
    const prev=rec.reduce((s,r)=>s+Number(r.previsto),0);
    const real=rec.reduce((s,r)=>{
      const k=mesKey(m,a,r.id);
      return s+(realizados[k]?.recebido?Number(realizados[k].valor||r.previsto):0);
    },0);
    const gstAll=gastos.filter(g=>g.mes===m&&g.ano===a);
    // Include gastos fixos ativos nesse mês
    const fixosAtivosM = gastosFixos.filter(g=>{
      const cur=`${a}-${PAD(m+1)}`;
      if(g.vigenciaInicio && cur<g.vigenciaInicio) return false;
      if(g.vigenciaFim && cur>g.vigenciaFim) return false;
      return userFilter==="Todos"||g.usuario===userFilter;
    });
    const gst=gstAll.reduce((s,g)=>s+Number(g.valor),0) + fixosAtivosM.reduce((s,g)=>s+Number(g.valor),0);
    const fixos=fixosAtivosM.filter(g=>!contas.find(ct=>ct.id===g.conta&&ct.tipo==="credito")).reduce((s,g)=>s+Number(g.valor),0);
    const byOrc={};
    orcamentos.forEach(o=>{
      const varVal=gstAll.filter(g=>g.orcamento===o.id).reduce((s,g)=>s+Number(g.valor),0);
      const fixVal=fixosAtivosM.filter(g=>g.orcamento===o.id).reduce((s,g)=>s+Number(g.valor),0);
      byOrc[o.id]=varVal+fixVal;
    });
    const byCat={};
    catsGasto.forEach(c=>{
      const varVal=gstAll.filter(g=>g.categoria===c.id).reduce((s,g)=>s+Number(g.valor),0);
      const fixVal=fixosAtivosM.filter(g=>g.categoria===c.id).reduce((s,g)=>s+Number(g.valor),0);
      byCat[c.id]=varVal+fixVal;
    });
    return {name:MONTHS[m],mes:m,ano:a,previsto:prev,realizado:real,gastos:gst,fixos,...byOrc,...byCat,isCurrent:m===mes&&a===ano};
  });

  function toggleRecebido(receitaId, dataRecebimento) {
    const k=mesKey(mes,ano,receitaId);
    const r=receitas.find(x=>x.id===receitaId);
    setRealizados(prev=>({
      ...prev,
      [k]:{ valor:r.previsto, recebido:!prev[k]?.recebido, data: dataRecebimento || today() }
    }));
  }

  function addGasto() {
    if (!formGasto.descricao||!formGasto.valor) return;
    setGastos(prev=>[...prev,{...formGasto,valor:Number(formGasto.valor),mes,ano,id:Date.now()}]);
    setFormGasto(f=>({...f,descricao:"",valor:"",data:today()}));
  }

  function addReceita() {
    if (!formReceita.descricao||!formReceita.previsto) return;
    setReceitas(prev=>[...prev,{...formReceita,id:Date.now(),previsto:Number(formReceita.previsto),mesPrevisto:mes}]);
    setFormReceita(f=>({...f,descricao:"",previsto:"",diaRecebimento:""}));
  }

  function addCat() {
    if (!formCat.nome) return;
    setCatsGasto(prev=>[...prev,{...formCat,id:formCat.nome.toLowerCase().replace(/\s/g,"_")+Date.now()}]);
    setFormCat({nome:"",emoji:"📦",cor:"#6b7280"});
    modal("cat",false);
  }

  function addConta() {
    if (!formConta.nome) return;
    setContas(prev=>[...prev,{...formConta,id:"conta_"+Date.now()}]);
    setFormConta({nome:"",usuario:"Tiago",emoji:"💳",cor:"#6b7280"});
    modal("conta",false);
  }

  function addGastoFixo() {
    if (!formGastoFixo.descricao || !formGastoFixo.valor) return;
    const inicio = formGastoFixo.vigenciaInicio || null;
    const parcelas = formGastoFixo.parcelas ? Number(formGastoFixo.parcelas) : null;
    const fim = parcelas && inicio ? calcVigenciaFim(inicio, parcelas) : (formGastoFixo.vigenciaFim || null);
    setGastosFixos(prev=>[...prev,{
      ...formGastoFixo,
      id:"gf_"+Date.now(),
      valor:Number(formGastoFixo.valor),
      diaPagamento:Number(formGastoFixo.diaPagamento)||1,
      vigenciaInicio: inicio,
      vigenciaFim: fim,
      parcelas: parcelas,
    }]);
    setFormGastoFixo({descricao:"",valor:"",usuario:"Tiago",categoria:"outros",conta:"",orcamento:"",diaPagamento:"",debitoAuto:false,vigenciaInicio:"",vigenciaFim:"",parcelas:""});
    setModalGastoFixo(false);
  }

  function addOrc() {
    if (!formOrc.nome) return;
    setOrcamentos(prev=>[...prev,{...formOrc,id:"orc_"+Date.now()}]);
    setFormOrc({nome:"",emoji:"🛒",cor:"#22c55e",categorias:[],limitesCat:{},fixo:false});
    modal("orc",false);
  }

  function navMes(dir) {
    let m=mes+dir, a=ano;
    if(m>11){m=0;a++;} if(m<0){m=11;a--;}
    setMes(m); setAno(a);
  }

  const catById = id => catsGasto.find(c=>c.id===id);
  const contaById = id => contas.find(c=>c.id===id);
  const gastosOrc = oid => {
    const variaveis = gastosDoMes.filter(g=>g.orcamento===oid).reduce((s,g)=>s+Number(g.valor),0);
    const fixos = gastosFixosDoMes.filter(g=>g.orcamento===oid&&gfPago(g.id)).reduce((s,g)=>s+Number(g.valor),0);
    return variaveis + fixos;
  };
  const gastosOrcCat = (oid,cid) => { const v=gastosDoMes.filter(g=>g.orcamento===oid&&g.categoria===cid).reduce((s,g)=>s+Number(g.valor),0); const f=gastosFixosDoMes.filter(g=>g.orcamento===oid&&g.categoria===cid&&gfPago(g.id)).reduce((s,g)=>s+Number(g.valor),0); return v+f; };
  const gastosCat = cid => gastosDoMes.filter(g=>g.categoria===cid).reduce((s,g)=>s+Number(g.valor),0);
  const limiteOrcTotal = o => Object.values(o.limitesCat||{}).reduce((s,v)=>s+Number(v||0),0) || o.limite || null;
  const gastosConta = cid => gastosDoMes.filter(g=>g.conta===cid).reduce((s,g)=>s+Number(g.valor),0);
  const catRecById = id => CAT_RECEITA.find(c=>c.id===id);

  const tabs = ["resumo","receitas","gastos","orçamentos","cartões","categorias"];

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>📊 Finanças Pessoal</h1>
          <p style={S.subtitle}>Planejado vs Realizado · {MONTHS[mes]}/{ano}</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <select value={userFilter} onChange={e=>setUserFilter(e.target.value)}
            style={{...S.select,background:"#2a2010",color:"#e8d5a3",border:"1px solid #3a3020",width:"auto"}}>
            <option>Todos</option><option>Tiago</option><option>Mariana</option>
          </select>
          <div style={S.nav}>
            {tabs.map(t=><button key={t} style={S.navBtn(tab===t,isMobile)} onClick={()=>setTab(t)}>{t}</button>)}
          </div>
        </div>
      </div>

      {/* Mês nav */}
      <div style={{background:"#2a2010",display:"flex",alignItems:"center",justifyContent:"center",gap:24,padding:"9px 0"}}>
        <button onClick={()=>navMes(-1)} style={{background:"none",border:"none",color:"#e8d5a3",fontSize:18,cursor:"pointer"}}>‹</button>
        <span style={{color:"#e8d5a3",fontSize:15,fontWeight:700,letterSpacing:1}}>{MONTHS[mes]} {ano}</span>
        <button onClick={()=>navMes(1)} style={{background:"none",border:"none",color:"#e8d5a3",fontSize:18,cursor:"pointer"}}>›</button>
      </div>

      <div style={S.body}>

        {/* ===== RESUMO ===== */}
        {tab==="resumo" && (
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:10}}>
              {/* Card Previsto / A receber */}
              <div style={S.card}>
                <div style={{fontSize:20,marginBottom:4}}>📋</div>
                <div style={S.label}>{tudo100?"A receber":"Falta receber"}</div>
                <div style={S.val(tudo100?"#9a8a6a":"#f59e0b")}>{fmt(tudo100?0:totalPendente)}</div>
                {!tudo100&&totalPrevisto>0&&<div style={{marginTop:8}}>
                  <div style={{...S.label,marginBottom:3}}>de {fmt(totalPrevisto)} previsto</div>
                  <div style={S.prog}><div style={S.progBar(pct(totalPendente,totalPrevisto),"#f59e0b")}/></div>
                </div>}
                {tudo100&&<div style={{marginTop:6,fontSize:11,color:"#22c55e",fontWeight:600}}>✅ 100% recebido!</div>}
              </div>

              {/* Card Realizado / Próximo mês */}
              <div style={{...S.card,background:tudo100?"#f0fdf4":"white",border:tudo100?"1px solid #bbf7d0":"none"}}>
                <div style={{fontSize:20,marginBottom:4}}>{tudo100?"🚀":"✅"}</div>
                <div style={S.label}>{tudo100?`Previsto ${MONTHS[proxMes]}`:"Realizado"}</div>
                <div style={S.val(tudo100?"#16a34a":"#22c55e")}>{fmt(tudo100?totalProxMes:totalRealizado)}</div>
                {!tudo100&&<div style={{marginTop:8}}>
                  <div style={{...S.label,marginBottom:3}}>{pct(totalRealizado,totalPrevisto)}% do previsto</div>
                  <div style={S.prog}><div style={S.progBar(pct(totalRealizado,totalPrevisto),"#22c55e")}/></div>
                </div>}
                {tudo100&&<div style={{marginTop:6,fontSize:11,color:"#9a8a6a"}}>próximo mês planejado</div>}
              </div>

              {/* Card Gastos */}
              <div style={S.card}>
                <div style={{fontSize:20,marginBottom:4}}>💸</div>
                <div style={S.label}>Gastos</div>
                <div style={S.val("#ef4444")}>{fmt(totalGastos)}</div>
                {totalRealizado>0&&<div style={{marginTop:8}}>
                  <div style={{...S.label,marginBottom:3}}>{pct(totalGastos,totalRealizado)}% da receita</div>
                  <div style={S.prog}><div style={S.progBar(pct(totalGastos,totalRealizado),"#ef4444")}/></div>
                </div>}
              </div>

              {/* Card Saldo */}
              <div style={{...S.card,background:saldo>=0?"white":"#fff5f5",border:saldo<0?"1px solid #fecaca":"none"}}>
                <div style={{fontSize:20,marginBottom:4}}>💰</div>
                <div style={S.label}>Saldo disponível</div>
                <div style={S.val(saldo>=0?"#3b82f6":"#ef4444")}>{fmt(saldo)}</div>
                <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
                  {totalFaturasPagasNoMes>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                    <span style={{color:"#9a8a6a"}}>✅ faturas pagas</span>
                    <span style={{color:"#ef4444"}}>−{fmt(totalFaturasPagasNoMes)}</span>
                  </div>}
                  {totalFaturasPendentesNoMes>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                    <span style={{color:"#f59e0b"}}>⏳ faturas pendentes</span>
                    <span style={{color:"#f59e0b"}}>−{fmt(totalFaturasPendentesNoMes)}</span>
                  </div>}
                  {totalDebitosNoMes>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                    <span style={{color:"#9a8a6a"}}>débitos diretos</span>
                    <span style={{color:"#ef4444"}}>−{fmt(totalDebitosNoMes)}</span>
                  </div>}
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,borderTop:"1px solid #f0ebe0",paddingTop:4,marginTop:2}}>
                    <span style={{color:"#9a8a6a"}}>saldo esperado</span>
                    <span style={{color:saldoEsperado>=0?"#3b82f6":"#ef4444",fontWeight:600}}>{fmt(saldoEsperado)}</span>
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              // ── helpers ──
              const drillM = mesSelecionado ? mesSelecionado.mes : null;
              const drillA = mesSelecionado ? mesSelecionado.ano : null;

              // Drill down: dados dia a dia do mês clicado
              if (mesSelecionado) {
                const diasNoMes = new Date(drillA, drillM+1, 0).getDate();
                const gstMes = gastos.filter(g=>g.mes===drillM&&g.ano===drillA);
                const recMes = receitas.filter(r=>r.recorrente||r.mesPrevisto===drillM);
                const totalPrevMes = recMes.reduce((s,r)=>s+Number(r.previsto),0);
                const totalRealMes = recMes.reduce((s,r)=>{
                  const k=mesKey(drillM,drillA,r.id);
                  return s+(realizados[k]?.recebido?Number(realizados[k].valor||r.previsto):0);
                },0);

                // Gastos fixos ativos no mês do drill
                const fixosAtivosDrill = gastosFixos.filter(g=>{
                  const cur=`${drillA}-${PAD(drillM+1)}`;
                  if(g.vigenciaInicio && cur<g.vigenciaInicio) return false;
                  if(g.vigenciaFim && cur>g.vigenciaFim) return false;
                  return true;
                });

                // build day-by-day cumulative data
                let saldoAcum = 0;
                let gastosAcum = 0;
                const dayData = Array.from({length:diasNoMes},(_,i)=>{
                  const dia = i+1;
                  // receitas do dia
                  const recDia = recMes.reduce((s,r)=>{
                    const k=mesKey(drillM,drillA,r.id);
                    const recInfo=realizados[k];
                    if(!recInfo?.recebido||!recInfo.data) return s;
                    const [ry,rm,rd]=recInfo.data.split("-");
                    if(Number(rd)===dia&&Number(rm)-1===drillM&&Number(ry)===drillA) return s+Number(recInfo.valor||r.previsto);
                    return s;
                  },0);
                  // gastos variáveis do dia
                  const gstVarDia = gstMes.filter(g=>{
                    if(!g.data) return false;
                    const [gy,gm,gd]=g.data.split("-");
                    return Number(gd)===dia&&Number(gm)-1===drillM&&Number(gy)===drillA;
                  }).reduce((s,g)=>s+Number(g.valor),0);
                  // gastos fixos do dia (usa diaPagamento)
                  const gstFixoDia = fixosAtivosDrill.filter(g=>Number(g.diaPagamento)===dia)
                    .reduce((s,g)=>s+Number(g.valor),0);
                  const gstDia = gstVarDia + gstFixoDia;

                  saldoAcum += recDia - gstDia;
                  gastosAcum += gstDia;

                  // por categoria (variáveis + fixos)
                  const byCat={};
                  catsGasto.forEach(cat=>{
                    const varVal=gstMes.filter(g=>{
                      if(!g.data) return false;
                      const [gy,gm,gd]=g.data.split("-");
                      return g.categoria===cat.id&&Number(gd)===dia&&Number(gm)-1===drillM&&Number(gy)===drillA;
                    }).reduce((s,g)=>s+Number(g.valor),0);
                    const fixVal=fixosAtivosDrill.filter(g=>g.categoria===cat.id&&Number(g.diaPagamento)===dia)
                      .reduce((s,g)=>s+Number(g.valor),0);
                    byCat[cat.id]=varVal+fixVal;
                  });

                  // por conta/cartão (variáveis + fixos no diaPagamento)
                  const byConta={};
                  contas.filter(ct=>ct.tipo==="credito").forEach(ct=>{
                    const varVal=gstMes.filter(g=>{
                      if(g.conta!==ct.id||!g.data) return false;
                      const [gy,gm,gd]=g.data.split("-");
                      return Number(gd)===dia&&Number(gm)-1===drillM&&Number(gy)===drillA;
                    }).reduce((s,g)=>s+Number(g.valor),0);
                    const fixVal=fixosAtivosDrill.filter(g=>g.conta===ct.id&&Number(g.diaPagamento)===dia)
                      .reduce((s,g)=>s+Number(g.valor),0);
                    byConta[ct.id]=varVal+fixVal;
                  });

                  // previsto do dia: receitas com diaRecebimento == dia
                  const previstoDia = recMes.reduce((s,r)=>{
                    const d = Number(r.diaRecebimento);
                    if(!d) return s;
                    if(d===-1){
                      const ultimo=new Date(drillA,drillM+1,0).getDate();
                      return dia===ultimo?s+Number(r.previsto):s;
                    }
                    return dia===d?s+Number(r.previsto):s;
                  },0);
                  return {name:`${dia}`,dia,recDia,gstDia,saldoAcum,gastosAcum,previstoDia,...byCat,...byConta};
                });

                const totalGstMes = gstMes.reduce((s,g)=>s+Number(g.valor),0)
                  + fixosAtivosDrill.reduce((s,g)=>s+Number(g.valor),0);

                return (
                  <div style={S.card}>
                    {/* Header drill */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <button onClick={()=>setMesSelecionado(null)}
                          style={{background:"none",border:"none",borderRadius:6,padding:"3px 8px",fontSize:11,color:"#b0a890",cursor:"pointer",letterSpacing:"0.5px",opacity:0.7}}>
                          ↑ visão geral
                        </button>
                        <span style={{fontWeight:700,fontSize:16}}>🔍 {MONTHS[drillM]} {drillA} — dia a dia</span>
                      </div>
                      <div style={{display:"flex",gap:8,fontSize:11,flexWrap:"wrap"}}>
                        <span style={{color:"#22c55e"}}>✅ Recebido: {fmt(totalRealMes)}</span>
                        <span style={{color:"#ef4444"}}>💸 Gastos: {fmt(totalGstMes)}</span>
                        <span style={{color:totalRealMes-totalGstMes>=0?"#3b82f6":"#ef4444"}}>💰 Saldo: {fmt(totalRealMes-totalGstMes)}</span>
                      </div>
                    </div>

                    {/* Toggles drill */}
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                      {[
                        {k:"saldoAcum",label:"Saldo acumulado",cor:"#3b82f6"},
                        {k:"gastosAcum",label:"Gastos acumulados",cor:"#ef4444"},
                        {k:"recDia",label:"Receitas do dia",cor:"#22c55e"},
                        {k:"gstDia",label:"Gastos do dia",cor:"#f97316"},
                        {k:"previstoDia",label:"Previsto do dia",cor:"#b8a888"},
                      ].map(l=>(
                        <button key={l.k} onClick={()=>toggleLinha(l.k)} style={{
                          background:linhasAtivas[l.k]!==false?l.cor+"22":"#f0ebe0",
                          color:linhasAtivas[l.k]!==false?l.cor:"#9a8a6a",
                          border:`1px solid ${linhasAtivas[l.k]!==false?l.cor:"#e0dbd0"}`,
                          borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,cursor:"pointer"
                        }}>{l.label}</button>
                      ))}
                      <span style={{fontSize:11,color:"#c0b8a0",margin:"4px 4px 0"}}>Categorias:</span>
                      {catsGasto.map(c=>(
                        <button key={c.id} onClick={()=>toggleLinhaCat(c.id)} style={{
                          background:linhasCat[c.id]===true?c.cor+"22":"#f0ebe0",
                          color:linhasCat[c.id]===true?c.cor:"#9a8a6a",
                          border:`1px solid ${linhasCat[c.id]===true?c.cor:"#e0dbd0"}`,
                          borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,cursor:"pointer"
                        }}>{c.emoji} {c.nome}</button>
                      ))}
                      <span style={{fontSize:11,color:"#c0b8a0",margin:"4px 4px 0"}}>Cartões:</span>
                      {contas.filter(ct=>ct.tipo==="credito").map(ct=>(
                        <button key={ct.id} onClick={()=>setLinhasOrc(prev=>({...prev,[ct.id]:!prev[ct.id]}))} style={{
                          background:linhasOrc[ct.id]?ct.cor+"22":"#f0ebe0",
                          color:linhasOrc[ct.id]?ct.cor:"#9a8a6a",
                          border:`1px solid ${linhasOrc[ct.id]?ct.cor:"#e0dbd0"}`,
                          borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,cursor:"pointer"
                        }}>{ct.emoji} {ct.nome.replace("Nubank PJ Mariana","Nu PJ").replace("Nubank Mariana","Nu Mari").replace("Nubank Tiago","Nu Tiago").replace("Digio Tiago","Digio")}</button>
                      ))}
                    </div>

                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={dayData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0"/>
                        <XAxis dataKey="name" tick={{fontSize:10,fill:"#9a8a6a"}} axisLine={false} tickLine={false} interval={1}/>
                        <YAxis tick={{fontSize:10,fill:"#9a8a6a"}} axisLine={false} tickLine={false}/>
                        <Tooltip formatter={(v,n)=>[fmt(v),n]} contentStyle={{background:"white",border:"1px solid #d4c8a8",borderRadius:8,fontSize:11}}
                          labelFormatter={l=>`Dia ${l}`}/>
                        {linhasAtivas["saldoAcum"]!==false&&<Line type="monotone" dataKey="saldoAcum" stroke="#3b82f6" strokeWidth={2} name="Saldo acumulado" dot={false}/>}
                        {linhasAtivas["gastosAcum"]!==false&&<Line type="monotone" dataKey="gastosAcum" stroke="#ef4444" strokeWidth={2} name="Gastos acumulados" dot={false}/>}
                        {linhasAtivas["recDia"]!==false&&<Line type="monotone" dataKey="recDia" stroke="#22c55e" strokeWidth={1.5} name="Receitas do dia" dot={{r:4}}/>}
                        {linhasAtivas["gstDia"]!==false&&<Line type="monotone" dataKey="gstDia" stroke="#f97316" strokeWidth={1.5} name="Gastos do dia" dot={{r:3}}/>}
                        {linhasAtivas["previstoDia"]!==false&&<Line type="monotone" dataKey="previstoDia" stroke="#d4c8a8" strokeWidth={1.5} strokeDasharray="5 3" name="Previsto do dia" dot={{r:3}}/>}
                        {catsGasto.filter(c=>linhasCat[c.id]===true).map(c=>(
                          <Line key={c.id} type="monotone" dataKey={c.id} stroke={c.cor} strokeWidth={1.5} strokeDasharray="4 2" name={c.nome} dot={{r:2}}/>
                        ))}
                        {contas.filter(ct=>ct.tipo==="credito"&&linhasOrc[ct.id]).map(ct=>(
                          <Line key={ct.id} type="monotone" dataKey={ct.id} stroke={ct.cor} strokeWidth={1.5} name={ct.nome.replace("Nubank PJ Mariana","Nu PJ").replace("Nubank Mariana","Nu Mari").replace("Nubank Tiago","Nu Tiago").replace("Digio Tiago","Digio")} dot={{r:3}}/>
                        ))}
                      </LineChart>
                    </ResponsiveContainer>

                    {/* Lançamentos do mês */}
                    {(gstMes.length>0||fixosAtivosDrill.length>0)&&<div style={{marginTop:14,borderTop:"1px solid #f0ebe0",paddingTop:12}}>
                      <div style={{...S.label,marginBottom:8}}>Todos os lançamentos</div>
                      <div style={{maxHeight:220,overflowY:"auto"}}>
                        {[
                          ...gstMes.map(g=>({...g,_dia:g.data?Number(g.data.split("-")[2]):1})),
                          ...fixosAtivosDrill.map(g=>({...g,_dia:Number(g.diaPagamento),_fixo:true}))
                        ].sort((a,b)=>a._dia-b._dia).map(g=>{
                          const cat=catById(g.categoria);
                          const conta=contaById(g.conta);
                          return <div key={(g._fixo?"f":"")+g.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,padding:"5px 0",borderBottom:"1px solid #f0ebe0"}}>
                            <div style={{display:"flex",gap:8,alignItems:"center"}}>
                              <span style={{background:"#f0ebe0",borderRadius:6,padding:"1px 7px",fontWeight:600,color:"#7a6a4a",fontSize:11}}>dia {g._dia}</span>
                              <span>{g.descricao}</span>
                              {g._fixo&&<span style={{fontSize:10,color:"#9a8a6a",background:"#f0ebe0",borderRadius:4,padding:"1px 5px"}}>fixo</span>}
                              {cat&&<span style={{...S.tag(cat.cor),fontSize:10}}>{cat.emoji} {cat.nome}</span>}
                              {conta&&<span style={{...S.tag(conta.cor),fontSize:10}}>{conta.emoji}</span>}
                            </div>
                            <span style={{color:"#ef4444",fontWeight:600}}>{fmt(g.valor)}</span>
                          </div>;
                        })}
                      </div>
                    </div>}
                  </div>
                );
              }

              // ── visão geral 6 meses ──
              return (
                <div style={S.card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div style={{...S.label}}>📅 Timeline — 3 meses antes e depois</div>
                    <div style={{fontSize:11,color:"#9a8a6a"}}>Clique num mês para ver o decorrer do mês</div>
                  </div>

                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                    {[
                      {k:"previsto",label:"Previsto",cor:"#d4c8a8"},
                      {k:"realizado",label:"Realizado",cor:"#22c55e"},
                      {k:"gastos",label:"Total Gastos",cor:"#ef4444"},
                      {k:"fixos",label:"Fixos/Débito",cor:"#6b7280"},
                    ].map(l=>(
                      <button key={l.k} onClick={()=>toggleLinha(l.k)} style={{
                        background:linhasAtivas[l.k]?l.cor+"22":"#f0ebe0",
                        color:linhasAtivas[l.k]?l.cor:"#9a8a6a",
                        border:`1px solid ${linhasAtivas[l.k]?l.cor:"#e0dbd0"}`,
                        borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,cursor:"pointer"
                      }}>{l.label}</button>
                    ))}
                    <span style={{fontSize:11,color:"#c0b8a0",margin:"4px 4px 0"}}>Orçamentos:</span>
                    {orcamentos.map(o=>(
                      <button key={o.id} onClick={()=>toggleLinhaOrc(o.id)} style={{
                        background:linhasOrc[o.id]===true?o.cor+"22":"#f0ebe0",
                        color:linhasOrc[o.id]===true?o.cor:"#9a8a6a",
                        border:`1px solid ${linhasOrc[o.id]===true?o.cor:"#e0dbd0"}`,
                        borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,cursor:"pointer"
                      }}>{o.emoji} {o.nome}</button>
                    ))}
                    <span style={{fontSize:11,color:"#c0b8a0",margin:"4px 4px 0"}}>Categorias:</span>
                    {catsGasto.map(c=>(
                      <button key={c.id} onClick={()=>toggleLinhaCat(c.id)} style={{
                        background:linhasCat[c.id]===true?c.cor+"22":"#f0ebe0",
                        color:linhasCat[c.id]===true?c.cor:"#9a8a6a",
                        border:`1px solid ${linhasCat[c.id]===true?c.cor:"#e0dbd0"}`,
                        borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,cursor:"pointer"
                      }}>{c.emoji} {c.nome}</button>
                    ))}
                  </div>

                  {/* Month label buttons for reliable drill-down */}
                  <div style={{display:"flex",justifyContent:"space-around",paddingLeft:40,paddingRight:10,marginBottom:4}}>
                    {timeline.map((t,i)=>(
                      <button key={i} onClick={()=>setMesSelecionado(t)} style={{
                        background:"none",border:"none",cursor:"pointer",
                        fontSize:11,fontWeight:700,
                        color: t.mes===mes&&t.ano===ano ? "#1a1208" : "#9a8a6a",
                        padding:"2px 4px",borderRadius:4,
                        borderBottom: t.mes===mes&&t.ano===ano ? "2px solid #1a1208" : "2px solid transparent",
                        transition:"all 0.15s"
                      }} title={`Ver ${t.name} dia a dia`}>
                        {t.name} 🔍
                      </button>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={timeline} style={{cursor:"pointer"}} onClick={(e)=>{
                      if(e&&e.activePayload){
                        const d=e.activePayload[0]?.payload;
                        if(d) setMesSelecionado(d);
                      }
                    }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0"/>
                      <XAxis dataKey="name" tick={{fontSize:12,fill:"#9a8a6a"}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:11,fill:"#9a8a6a"}} axisLine={false} tickLine={false}/>
                      <Tooltip formatter={(v,n)=>[fmt(v),n]} contentStyle={{background:"white",border:"1px solid #d4c8a8",borderRadius:8,fontSize:12}} labelFormatter={l=>`${l} — clique para detalhar`}/>
                      {linhasAtivas.previsto&&<Line type="monotone" dataKey="previsto" stroke="#d4c8a8" strokeWidth={2} strokeDasharray="5 5" name="Previsto" dot={{r:6,cursor:"pointer",fill:"#d4c8a8"}} activeDot={{r:8}}/>}
                      {linhasAtivas.realizado&&<Line type="monotone" dataKey="realizado" stroke="#22c55e" strokeWidth={2} name="Realizado" dot={{r:6,cursor:"pointer",fill:"#22c55e"}} activeDot={{r:8}}/>}
                      {linhasAtivas.gastos&&<Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} name="Total Gastos" dot={{r:6,cursor:"pointer",fill:"#ef4444"}} activeDot={{r:8}}/>}
                      {linhasAtivas.fixos&&<Line type="monotone" dataKey="fixos" stroke="#6b7280" strokeWidth={2} strokeDasharray="3 3" name="Fixos" dot={{r:5,cursor:"pointer",fill:"#6b7280"}} activeDot={{r:7}}/>}
                      {orcamentos.filter(o=>linhasOrc[o.id]===true).map(o=>(
                        <Line key={o.id} type="monotone" dataKey={o.id} stroke={o.cor} strokeWidth={1.5} name={o.nome} dot={{r:4,cursor:"pointer",fill:o.cor}} activeDot={{r:6}}/>
                      ))}
                      {catsGasto.filter(c=>linhasCat[c.id]===true).map(c=>(
                        <Line key={c.id} type="monotone" dataKey={c.id} stroke={c.cor} strokeWidth={1.5} strokeDasharray="4 2" name={c.nome} dot={{r:4,cursor:"pointer",fill:c.cor}} activeDot={{r:6}}/>
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}

            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14}}>
              <div style={S.card}>
                <div style={{...S.label,marginBottom:4}}>📊 {MONTHS[mes]}/{ano} — Previsto vs Realizado</div>
                <div style={{fontSize:11,color:"#9a8a6a",marginBottom:12}}>Falta receber: {fmt(totalPendente)} · Realizado: {fmt(totalRealizado)} · Gastos: {fmt(totalGastos)}</div>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={[{name:"Receita",Previsto:totalPrevisto,"Já recebido":totalRealizado,"Falta receber":totalPendente},{name:"Gastos",Gastos:totalGastos,"Saldo esperado":Math.max(0,totalPrevisto-totalGastos)}]} layout="vertical">
                    <XAxis type="number" tick={{fontSize:10,fill:"#9a8a6a"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(1)}k`:v}/>
                    <YAxis type="category" dataKey="name" tick={{fontSize:12,fill:"#9a8a6a"}} axisLine={false} tickLine={false} width={50}/>
                    <Tooltip formatter={v=>fmt(v)} contentStyle={{background:"white",border:"1px solid #d4c8a8",borderRadius:8,fontSize:12}}/>
                    <Legend iconType="circle" wrapperStyle={{fontSize:11}}/>
                    <Bar dataKey="Já recebido" fill="#22c55e" radius={[0,4,4,0]} stackId="r"/>
                    <Bar dataKey="Falta receber" fill="#fde68a" radius={[0,4,4,0]} stackId="r"/>
                    <Bar dataKey="Gastos" fill="#ef4444" radius={[0,4,4,0]} stackId="g"/>
                    <Bar dataKey="Saldo esperado" fill="#bfdbfe" radius={[0,4,4,0]} stackId="g"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={S.card}>
                <div style={{...S.label,marginBottom:14}}>🛒 Orçamentos</div>
                {orcamentos.map(o=>{
                  const g=gastosOrc(o.id), lim=limiteOrcTotal(o), p=lim?pct(g,lim):null;
                  return <div key={o.id} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:13,fontWeight:600}}>{o.emoji} {o.nome}{o.fixo&&<span style={{...S.tag("#6b7280"),marginLeft:6,fontSize:10}}>fixo</span>}</span>
                      <span style={{fontSize:13,color:"#9a8a6a"}}>{fmt(g)}{lim?` / ${fmt(lim)}`:""}</span>
                    </div>
                    {lim&&<><div style={S.prog}><div style={S.progBar(p,p>90?"#ef4444":p>70?"#f59e0b":"#22c55e")}/></div>
                    <div style={{fontSize:11,color:"#9a8a6a",marginTop:2}}>{p}% · {fmt(lim-g)} restante</div></>}
                  </div>;
                })}
              </div>
            </div>

            {/* Gastos por conta */}
            {gastosPorContaData.length > 0 && <div style={S.card}>
              <div style={{...S.label,marginBottom:14}}>💳 Gastos por conta — {MONTHS[mes]}/{ano}</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={gastosPorContaData} margin={{top:0,right:10,left:0,bottom:0}}>
                  <XAxis dataKey="name" tick={{fontSize:11,fill:"#9a8a6a"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:"#9a8a6a"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(1)}k`:v}/>
                  <Tooltip formatter={(v,_n,p)=>[fmt(v), p.payload.name]} contentStyle={{background:"white",border:"1px solid #d4c8a8",borderRadius:8,fontSize:12}}/>
                  <Bar dataKey="valor" radius={[6,6,0,0]} isAnimationActive={false}>
                    {gastosPorContaData.map((d)=>(
                      <Cell key={d.id} fill={d.cor}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
                {gastosPorContaData.map(d=>(
                  <span key={d.id} style={{...S.tag(d.cor),fontSize:11}}>{d.name}: {fmt(d.valor)}</span>
                ))}
              </div>
            </div>}
          </div>
        )}

        {/* ===== RECEITAS ===== */}
        {tab==="receitas" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={S.card}>
              <div style={{...S.label,marginBottom:12,color:"#22c55e"}}>+ Nova Receita Prevista</div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"2fr 1fr 1fr 1fr 1fr 1fr auto",gap:8}}>
                <input style={S.input} placeholder="Descrição" value={formReceita.descricao} onChange={e=>setFormReceita(f=>({...f,descricao:e.target.value}))}/>
                <input style={S.input} type="number" placeholder="Valor previsto" value={formReceita.previsto} onChange={e=>setFormReceita(f=>({...f,previsto:e.target.value}))}/>
                <select style={S.select} value={formReceita.usuario} onChange={e=>setFormReceita(f=>({...f,usuario:e.target.value}))}>
                  <option>Tiago</option><option>Mariana</option>
                </select>
                <select style={S.select} value={formReceita.categoria} onChange={e=>setFormReceita(f=>({...f,categoria:e.target.value}))}>
                  {CAT_RECEITA.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>)}
                </select>
                <select style={S.select} value={formReceita.recorrente?"sim":"nao"} onChange={e=>setFormReceita(f=>({...f,recorrente:e.target.value==="sim"}))}>
                  <option value="sim">Recorrente</option><option value="nao">Só esse mês</option>
                </select>
                <select style={S.select} value={formReceita.diaRecebimento} onChange={e=>setFormReceita(f=>({...f,diaRecebimento:e.target.value}))}>
                  <option value="">Dia previsto</option>
                  {Array.from({length:28},(_,i)=><option key={i+1} value={i+1}>Dia {i+1}</option>)}
                  <option value="-1">Último dia</option>
                </select>
                <button style={S.btn("#22c55e")} onClick={addReceita}>Adicionar</button>
              </div>
            </div>

            <div style={S.card}>
              <div style={{...S.label,marginBottom:14}}>Receitas de {MONTHS[mes]}/{ano}</div>
              <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                <thead><tr>{["Descrição","Usuário","Categoria","Previsto","Data Prevista","Realizado","Data entrada","Status","",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {receitasDoMes.length===0&&<tr><td colSpan={8} style={{...S.td,textAlign:"center",color:"#9a8a6a",padding:28}}>Nenhuma receita para esse mês</td></tr>}
                  {receitasDoMes.map(r=>{
                    const k=mesKey(mes,ano,r.id);
                    const recebido=realizados[k]?.recebido;
                    const valReal=realizados[k]?.valor||r.previsto;
                    const dataEntrada=realizados[k]?.data;
                    const cat=catRecById(r.categoria);
                    return <tr key={r.id}>
                      <td style={S.td}>
                        <span style={{fontWeight:600}}>{r.descricao}</span>
                        {r.recorrente&&<span style={{...S.tag("#a855f7"),marginLeft:6,fontSize:10}}>fixo</span>}
                      </td>
                      <td style={S.td}><span style={S.tag(r.usuario==="Tiago"?"#3b82f6":"#ec4899")}>{r.usuario}</span></td>
                      <td style={S.td}>{cat&&<span style={S.tag(cat.cor)}>{cat.emoji} {cat.nome}</span>}</td>
                      <td style={{...S.td,fontWeight:600}}>{fmt(r.previsto)}</td>
                      <td style={{...S.td,color:"#9a8a6a",fontSize:12}}>
                        {r.diaRecebimento ? <span style={{background:"#f0ebe0",borderRadius:6,padding:"2px 8px"}}>📅 {dataPrevista(Number(r.diaRecebimento),mes,ano)}</span> : "—"}
                      </td>
                      <td style={{...S.td,color:recebido?"#22c55e":"#9a8a6a"}}>{recebido?fmt(valReal):"—"}</td>
                      <td style={{...S.td,color:"#9a8a6a",fontSize:12}}>{recebido?fmtData(dataEntrada):"—"}</td>
                      <td style={S.td}>
                        <div style={{...S.prog,marginBottom:3}}><div style={S.progBar(recebido?100:0,"#22c55e")}/></div>
                        <span style={{fontSize:11,color:recebido?"#22c55e":"#9a8a6a"}}>{recebido?"Recebido":"Pendente"}</span>
                      </td>
                      <td style={S.td}>
                        {!recebido
                          ? <button onClick={()=>toggleRecebido(r.id,today())} style={{...S.btn("#22c55e"),padding:"5px 12px",fontSize:12}}>✓ Recebi</button>
                          : <button onClick={()=>toggleRecebido(r.id)} style={{...S.btn("#ef4444"),padding:"5px 12px",fontSize:12}}>Desfazer</button>
                        }
                      </td>
                      <td style={S.td}>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>abrirEdicao("receita",r)} style={{background:"#f0ebe0",border:"none",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:13}}>✏️</button>
                          <button onClick={()=>excluir("receita",r.id,r.descricao)} style={{background:"#fef2f2",border:"none",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:13}}>🗑️</button>
                        </div>
                      </td>
                    </tr>;
                  })}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== GASTOS ===== */}
        {tab==="gastos" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* RESUMO FIXOS */}
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)",gap:10}}>
              {[
                {label:"Fixos previstos",val:totalFixosPrevisto,cor:"#6b7280",icon:"🔄"},
                {label:"Fixos pagos",val:totalFixosPago,cor:"#22c55e",icon:"✅"},
                {label:"Falta pagar",val:totalFixosPrevisto-totalFixosPago,cor:"#f59e0b",icon:"⏳"},
              ].map(cc=>(
                <div key={cc.label} style={S.card}>
                  <div style={{fontSize:18,marginBottom:4}}>{cc.icon}</div>
                  <div style={S.label}>{cc.label}</div>
                  <div style={{fontSize:20,fontWeight:"bold",color:cc.cor}}>{fmt(cc.val)}</div>
                </div>
              ))}
            </div>

            {/* GASTOS FIXOS */}
            <div style={S.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{...S.label}}>🔄 Gastos Fixos — {MONTHS[mes]}/{ano}</div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{fontSize:11,color:"#9a8a6a"}}>{gastosFixosDoMes.filter(g=>gfPago(g.id)).length}/{gastosFixosDoMes.length} pagos</div>
                  <button style={{...S.btn("#6b7280"),padding:"5px 12px",fontSize:12}} onClick={()=>setModalGastoFixo(true)}>+ Novo</button>
                </div>
              </div>
              <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:650}}>
                <thead><tr>{["Dia","Descrição","Valor","Vigência","Conta","Orçamento","Usuário","Status",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {gastosFixosDoMes.sort((a,b)=>a.diaPagamento-b.diaPagamento).map(g=>{
                    const pago=gfPago(g.id);
                    const cat=catById(g.categoria);
                    const conta=contaById(g.conta);
                    const orc=orcamentos.find(o=>o.id===g.orcamento);
                    return <tr key={g.id} style={{opacity:pago?1:0.75}}>
                      <td style={{...S.td,color:"#9a8a6a",fontSize:12}}>
                        <span style={{background:"#f0ebe0",borderRadius:6,padding:"1px 7px",fontWeight:600}}>dia {g.diaPagamento}</span>
                        {g.debitoAuto&&<span style={{...S.tag("#6b7280"),marginLeft:4,fontSize:9}}>auto</span>}
                      </td>
                      <td style={S.td}><span style={{fontWeight:600}}>{g.descricao}</span></td>
                      <td style={{...S.td,color:"#ef4444",fontWeight:600}}>{fmt(g.valor)}</td>
                      <td style={S.td}>
    {g.parcelas
      ? <div style={{fontSize:11}}>
          <div style={{color:"#7a6a4a",fontWeight:600}}>🔢 {g.parcelas}x</div>
          <div style={{color:"#9a8a6a"}}>{g.vigenciaInicio||"?"} → {g.vigenciaFim||"?"}</div>
          {g.vigenciaInicio&&<div style={{color:(() => {
            const cur=`${ano}-${PAD(mes+1)}`;
            const ini=g.vigenciaInicio; const fim=g.vigenciaFim;
            const parcelasPassadas = ini ? (() => {
              const [iy,im]=ini.split("-").map(Number);
              return (ano-iy)*12+(mes+1-im)+1;
            })() : "?";
            return parcelasPassadas>g.parcelas?"#ef4444":"#22c55e";
          })(), fontSize:10}}>
            parcela {g.vigenciaInicio ? (() => {
              const [iy,im]=g.vigenciaInicio.split("-").map(Number);
              return Math.max(1,Math.min(g.parcelas,(ano-iy)*12+(mes+1-im)+1));
            })() : "?"}/{g.parcelas}
          </div>}
        </div>
      : <div style={{fontSize:11,color:"#9a8a6a"}}>{g.vigenciaInicio||"∞"} → {g.vigenciaFim||"∞"}</div>
    }
    {cat&&<span style={S.tag(cat.cor)}>{cat.emoji} {cat.nome}</span>}
  </td>
                      <td style={S.td}>{conta?<span style={S.tag(conta.cor)}>{conta.emoji} {conta.nome}</span>:<span style={{color:"#ccc",fontSize:11}}>débito</span>}</td>
                      <td style={S.td}>{orc?<span style={S.tag(orc.cor)}>{orc.emoji} {orc.nome}</span>:<span style={{color:"#ccc"}}>—</span>}</td>
                      <td style={S.td}><span style={S.tag(g.usuario==="Tiago"?"#3b82f6":"#ec4899")}>{g.usuario}</span></td>
                      <td style={S.td}>
                        <div style={{...S.prog,marginBottom:3,width:60}}><div style={S.progBar(pago?100:0,"#22c55e")}/></div>
                        <span style={{fontSize:11,color:pago?"#22c55e":"#9a8a6a"}}>{pago?`pago ${fmtData(gfData(g.id))}`:"pendente"}</span>
                      </td>
                      <td style={S.td}>
                        <div style={{display:"flex",gap:5}}>
                          <button onClick={()=>togglePagoFixo(g.id)} style={{...S.btn(pago?"#ef4444":"#22c55e"),padding:"5px 10px",fontSize:11}}>
                            {pago?"Desfazer":"✓ Pago"}
                          </button>
                          <button onClick={()=>abrirEdicao("gastoFixo",g)} style={{background:"#f0ebe0",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",fontSize:12}}>✏️</button>
                          <button onClick={()=>excluir("gastoFixo",g.id,g.descricao)} style={{background:"#fef2f2",border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",fontSize:12}}>🗑️</button>
                        </div>
                      </td>
                    </tr>;
                  })}
                </tbody>
              </table>
              </div>
            </div>

            {/* MODAL NOVO GASTO FIXO */}
            {modalGastoFixo&&<div style={S.modal}>
              <div style={{...S.modalBox,width:480}}>
                <h3 style={{margin:"0 0 16px",fontSize:17}}>🔄 Novo Gasto Fixo</h3>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <input style={S.input} placeholder="Descrição" value={formGastoFixo.descricao} onChange={e=>setFormGastoFixo(f=>({...f,descricao:e.target.value}))}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <input style={S.input} type="number" placeholder="Valor R$" value={formGastoFixo.valor} onChange={e=>setFormGastoFixo(f=>({...f,valor:e.target.value}))}/>
                    <input style={S.input} type="number" placeholder="Dia pagamento (1-31)" value={formGastoFixo.diaPagamento} onChange={e=>setFormGastoFixo(f=>({...f,diaPagamento:e.target.value}))}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <select style={S.select} value={formGastoFixo.usuario} onChange={e=>setFormGastoFixo(f=>({...f,usuario:e.target.value}))}>
                      <option>Tiago</option><option>Mariana</option>
                    </select>
                    <select style={S.select} value={formGastoFixo.categoria} onChange={e=>setFormGastoFixo(f=>({...f,categoria:e.target.value}))}>
                      {catsGasto.map(cat=><option key={cat.id} value={cat.id}>{cat.emoji} {cat.nome}</option>)}
                    </select>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <select style={S.select} value={formGastoFixo.conta} onChange={e=>setFormGastoFixo(f=>({...f,conta:e.target.value}))}>
                      <option value="">Sem conta / débito direto</option>
                      {contas.map(ct=><option key={ct.id} value={ct.id}>{ct.emoji} {ct.nome}</option>)}
                    </select>
                    <select style={S.select} value={formGastoFixo.orcamento} onChange={e=>setFormGastoFixo(f=>({...f,orcamento:e.target.value}))}>
                      <option value="">Sem orçamento</option>
                      {orcamentos.map(o=><option key={o.id} value={o.id}>{o.emoji} {o.nome}</option>)}
                    </select>
                  </div>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer"}}>
                    <input type="checkbox" checked={formGastoFixo.debitoAuto} onChange={e=>setFormGastoFixo(f=>({...f,debitoAuto:e.target.checked}))} style={{width:16,height:16}}/>
                    🔄 Débito automático
                  </label>
                  <div style={{borderTop:"1px solid #e8e0d0",paddingTop:10}}>
                    <div style={{...S.label,marginBottom:8}}>⏳ Vigência (opcional)</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <button onClick={()=>setFormGastoFixo(f=>({...f,parcelas:""}))}
                        style={{...S.btn(formGastoFixo.parcelas===""?"#1a1208":undefined),background:formGastoFixo.parcelas===""?"#1a1208":"#f0ebe0",color:formGastoFixo.parcelas===""?"#e8d5a3":"#7a6a4a",border:"none",borderRadius:8,padding:"7px",fontSize:12,cursor:"pointer"}}>
                        📅 Período (mês a mês)
                      </button>
                      <button onClick={()=>setFormGastoFixo(f=>({...f,vigenciaFim:"",parcelas:f.parcelas||"1"}))}
                        style={{background:formGastoFixo.parcelas!==""?"#1a1208":"#f0ebe0",color:formGastoFixo.parcelas!==""?"#e8d5a3":"#7a6a4a",border:"none",borderRadius:8,padding:"7px",fontSize:12,cursor:"pointer"}}>
                        🔢 Parcelado
                      </button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:formGastoFixo.parcelas!==""?"1fr 1fr":"1fr 1fr",gap:10}}>
                      <div>
                        <div style={{fontSize:11,color:"#9a8a6a",marginBottom:4}}>Início</div>
                        <input style={S.input} type="month" value={formGastoFixo.vigenciaInicio} onChange={e=>setFormGastoFixo(f=>({...f,vigenciaInicio:e.target.value}))}/>
                      </div>
                      {formGastoFixo.parcelas===""
                        ? <div>
                            <div style={{fontSize:11,color:"#9a8a6a",marginBottom:4}}>Fim (vazio = indefinido)</div>
                            <input style={S.input} type="month" value={formGastoFixo.vigenciaFim} onChange={e=>setFormGastoFixo(f=>({...f,vigenciaFim:e.target.value}))}/>
                          </div>
                        : <div>
                            <div style={{fontSize:11,color:"#9a8a6a",marginBottom:4}}>Nº de parcelas</div>
                            <input style={S.input} type="number" min="1" placeholder="ex: 420" value={formGastoFixo.parcelas} onChange={e=>setFormGastoFixo(f=>({...f,parcelas:e.target.value}))}/>
                          </div>
                      }
                    </div>
                    {formGastoFixo.parcelas&&formGastoFixo.vigenciaInicio&&<div style={{marginTop:6,fontSize:11,color:"#16a34a",fontWeight:600}}>
                      Vai até: {calcVigenciaFim(formGastoFixo.vigenciaInicio,formGastoFixo.parcelas)} ({formGastoFixo.parcelas}x de {fmt(formGastoFixo.valor||0)})
                    </div>}
                    {!formGastoFixo.vigenciaInicio&&<div style={{fontSize:11,color:"#9a8a6a",marginTop:6}}>Deixe em branco para repetir desde sempre / indefinidamente.</div>}
                  </div>
                  <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}>
                    <button style={{...S.btn(),background:"#f7f4ef",color:"#7a6a4a"}} onClick={()=>setModalGastoFixo(false)}>Cancelar</button>
                    <button style={S.btn("#6b7280")} onClick={addGastoFixo}>Criar</button>
                  </div>
                </div>
              </div>
            </div>}

            {/* GASTOS VARIÁVEIS */}
            <div style={S.card}>
              <div style={{...S.label,marginBottom:12,color:"#ef4444"}}>+ Registrar Gasto Variável</div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"2fr 1fr 1fr 1fr 1fr 1fr 1fr auto",gap:8}}>
                <input style={S.input} placeholder="Descrição" value={formGasto.descricao} onChange={e=>setFormGasto(f=>({...f,descricao:e.target.value}))}/>
                <input style={S.input} type="number" placeholder="Valor (R$)" value={formGasto.valor} onChange={e=>setFormGasto(f=>({...f,valor:e.target.value}))}/>
                <input style={S.input} type="date" value={formGasto.data} onChange={e=>setFormGasto(f=>({...f,data:e.target.value}))}/>
                <select style={S.select} value={formGasto.categoria} onChange={e=>setFormGasto(f=>({...f,categoria:e.target.value}))}>
                  {catsGasto.map(cat=><option key={cat.id} value={cat.id}>{cat.emoji} {cat.nome}</option>)}
                </select>
                <select style={S.select} value={formGasto.conta} onChange={e=>setFormGasto(f=>({...f,conta:e.target.value}))}>
                  <option value="">Conta/Cartão</option>
                  {contas.map(ct=><option key={ct.id} value={ct.id}>{ct.emoji} {ct.nome}</option>)}
                </select>
                <select style={S.select} value={formGasto.orcamento} onChange={e=>setFormGasto(f=>({...f,orcamento:e.target.value}))}>
                  <option value="">Sem orçamento</option>
                  {orcamentos.map(o=><option key={o.id} value={o.id}>{o.emoji} {o.nome}</option>)}
                </select>
                <select style={S.select} value={formGasto.usuario} onChange={e=>setFormGasto(f=>({...f,usuario:e.target.value}))}>
                  <option>Tiago</option><option>Mariana</option>
                </select>
                <button style={S.btn("#ef4444")} onClick={addGasto}>Adicionar</button>
              </div>
            </div>

            <div style={S.card}>
              <div style={{...S.label,marginBottom:14}}>Gastos Variáveis de {MONTHS[mes]}/{ano}</div>
              <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                <thead><tr>{["Data","Descrição","Valor","Categoria","Conta/Cartão","Orçamento","Usuário",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {gastosDoMes.length===0&&<tr><td colSpan={8} style={{...S.td,textAlign:"center",color:"#9a8a6a",padding:28}}>Nenhum gasto variável registrado</td></tr>}
                  {[...gastosDoMes].sort((a,b)=>a.data>b.data?-1:1).map(g=>{
                    const cat=catById(g.categoria);
                    const conta=contaById(g.conta);
                    const orc=orcamentos.find(o=>o.id===g.orcamento);
                    return <tr key={g.id}>
                      <td style={{...S.td,color:"#9a8a6a",fontSize:12}}>{fmtData(g.data)}</td>
                      <td style={S.td}>{g.descricao}</td>
                      <td style={{...S.td,color:"#ef4444",fontWeight:600}}>{fmt(g.valor)}</td>
                      <td style={S.td}>
    {g.parcelas
      ? <div style={{fontSize:11}}>
          <div style={{color:"#7a6a4a",fontWeight:600}}>🔢 {g.parcelas}x</div>
          <div style={{color:"#9a8a6a"}}>{g.vigenciaInicio||"?"} → {g.vigenciaFim||"?"}</div>
          {g.vigenciaInicio&&<div style={{color:(() => {
            const cur=`${ano}-${PAD(mes+1)}`;
            const ini=g.vigenciaInicio; const fim=g.vigenciaFim;
            const parcelasPassadas = ini ? (() => {
              const [iy,im]=ini.split("-").map(Number);
              return (ano-iy)*12+(mes+1-im)+1;
            })() : "?";
            return parcelasPassadas>g.parcelas?"#ef4444":"#22c55e";
          })(), fontSize:10}}>
            parcela {g.vigenciaInicio ? (() => {
              const [iy,im]=g.vigenciaInicio.split("-").map(Number);
              return Math.max(1,Math.min(g.parcelas,(ano-iy)*12+(mes+1-im)+1));
            })() : "?"}/{g.parcelas}
          </div>}
        </div>
      : <div style={{fontSize:11,color:"#9a8a6a"}}>{g.vigenciaInicio||"∞"} → {g.vigenciaFim||"∞"}</div>
    }
    {cat&&<span style={S.tag(cat.cor)}>{cat.emoji} {cat.nome}</span>}
  </td>
                      <td style={S.td}>{conta?<span style={S.tag(conta.cor)}>{conta.emoji} {conta.nome}</span>:<span style={{color:"#ccc"}}>—</span>}</td>
                      <td style={S.td}>{orc?<span style={S.tag(orc.cor)}>{orc.emoji} {orc.nome}</span>:<span style={{color:"#ccc"}}>—</span>}</td>
                      <td style={S.td}><span style={S.tag(g.usuario==="Tiago"?"#3b82f6":"#ec4899")}>{g.usuario}</span></td>
                      <td style={S.td}>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>abrirEdicao("gasto",g)} style={{background:"#f0ebe0",border:"none",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:13}}>✏️</button>
                          <button onClick={()=>excluir("gasto",g.id,g.descricao)} style={{background:"#fef2f2",border:"none",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:13}}>🗑️</button>
                        </div>
                      </td>
                    </tr>;
                  })}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== ORÇAMENTOS ===== */}
        {tab==="orçamentos" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <button style={S.btn()} onClick={()=>modal("orc",true)}>+ Novo Orçamento</button>
            </div>
            {orcamentos.map(o=>{
              const g=gastosOrc(o.id), lim=limiteOrcTotal(o), p=lim?pct(g,lim):null;
              const catsDeste=o.categorias||[];
              const limCats=o.limitesCat||{};
              return <div key={o.id} style={S.card}>
                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:24}}>{o.emoji}</span>
                    <div>
                      <span style={{fontSize:17,fontWeight:700}}>{o.nome}</span>
                      {o.fixo&&<span style={{...S.tag("#6b7280"),marginLeft:8,fontSize:11}}>🔄 débito automático</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:20,fontWeight:"bold",color:p>90?"#ef4444":p>70?"#f59e0b":"#22c55e"}}>{fmt(g)}</div>
                      {lim&&<div style={{fontSize:11,color:"#9a8a6a"}}>de {fmt(lim)} planejados</div>}
                    </div>
                    <button onClick={()=>abrirEdicao("orc",{...o})} style={{background:"#f0ebe0",border:"none",borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:14}}>✏️</button>
                    <button onClick={()=>excluir("orc",o.id,o.nome)} style={{background:"#fef2f2",border:"none",borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:14}}>🗑️</button>
                  </div>
                </div>

                {/* Barra total */}
                {lim&&<><div style={{...S.prog,height:10,marginBottom:4}}><div style={S.progBar(p,p>90?"#ef4444":p>70?"#f59e0b":"#22c55e")}/></div>
                <div style={{fontSize:11,color:"#9a8a6a",marginBottom:14}}>{p}% utilizado · {fmt(lim-g)} restante</div></>}

                {/* Categorias com limite individual */}
                {catsDeste.length>0&&<>
                  <div style={{...S.label,marginBottom:10}}>Por categoria</div>
                  <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
                    {catsDeste.map(cid=>{
                      const cat=catById(cid); if(!cat) return null;
                      const gc=gastosOrcCat(o.id,cid);
                      const limCat=Number(limCats[cid]||0);
                      const pCat=limCat?pct(gc,limCat):null;
                      return <div key={cid} style={{background:"#f7f4ef",borderRadius:10,padding:"12px 14px",borderLeft:`3px solid ${cat.cor}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                          <div>
                            <span style={{fontSize:18}}>{cat.emoji}</span>
                            <div style={{fontSize:11,color:"#7a6a4a",fontWeight:600,marginTop:2}}>{cat.nome}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:14,fontWeight:"bold",color:pCat>90?"#ef4444":pCat>70?"#f59e0b":cat.cor}}>{fmt(gc)}</div>
                            {limCat>0&&<div style={{fontSize:10,color:"#9a8a6a"}}>de {fmt(limCat)}</div>}
                          </div>
                        </div>
                        {limCat>0&&<>
                          <div style={S.prog}><div style={S.progBar(pCat,pCat>90?"#ef4444":pCat>70?"#f59e0b":cat.cor)}/></div>
                          <div style={{fontSize:10,color:"#9a8a6a",marginTop:3}}>{pCat}% · {fmt(limCat-gc)} restante</div>
                        </>}
                        {!limCat&&<div style={{fontSize:10,color:"#c0b8a0",marginTop:4}}>sem limite definido</div>}
                      </div>;
                    })}
                  </div>
                </>}
              </div>;
            })}
            {orcamentos.length===0&&<div style={{...S.card,textAlign:"center",color:"#9a8a6a",padding:40}}>Nenhum orçamento cadastrado</div>}

            {modals.orc&&<div style={S.modal}>
              <div style={S.modalBox}>
                <h3 style={{margin:"0 0 18px",fontSize:17}}>Novo Orçamento</h3>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <input style={S.input} placeholder="Nome (ex: Feira, Netflix, Aluguel...)" value={formOrc.nome} onChange={e=>setFormOrc(f=>({...f,nome:e.target.value}))}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <input style={S.input} placeholder="Emoji" value={formOrc.emoji} onChange={e=>setFormOrc(f=>({...f,emoji:e.target.value}))}/>
                    <input style={S.input} type="color" value={formOrc.cor} onChange={e=>setFormOrc(f=>({...f,cor:e.target.value}))}/>
                  </div>
                  <label style={{display:"flex",alignItems:"center",gap:10,fontSize:13,cursor:"pointer"}}>
                    <input type="checkbox" checked={formOrc.fixo} onChange={e=>setFormOrc(f=>({...f,fixo:e.target.checked}))} style={{width:16,height:16}}/>
                    🔄 Débito automático / gasto fixo recorrente
                  </label>
                  <div>
                    <div style={{...S.label,marginBottom:8}}>Categorias e limites</div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {catsGasto.map(cat=>{
                        const sel=formOrc.categorias.includes(cat.id);
                        const limVal=formOrc.limitesCat[cat.id]||"";
                        return <div key={cat.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:sel?cat.cor+"11":"#f7f4ef",border:`1px solid ${sel?cat.cor:"#e8e0d0"}`}}>
                          <button onClick={()=>setFormOrc(f=>({...f,categorias:sel?f.categorias.filter(x=>x!==cat.id):[...f.categorias,cat.id],limitesCat:sel?Object.fromEntries(Object.entries(f.limitesCat).filter(([k])=>k!==cat.id)):f.limitesCat}))}
                            style={{background:sel?cat.cor:"#e8e0d0",border:"none",borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:14,color:sel?"white":"#9a8a6a",flexShrink:0}}>
                            {sel?"✓":"+"}</button>
                          <span style={{fontSize:14}}>{cat.emoji}</span>
                          <span style={{fontSize:13,fontWeight:600,flex:1,color:sel?"#1a1208":"#9a8a6a"}}>{cat.nome}</span>
                          {sel&&<input type="number" placeholder="Limite R$" value={limVal}
                            onChange={e=>setFormOrc(f=>({...f,limitesCat:{...f.limitesCat,[cat.id]:e.target.value}}))}
                            style={{...S.input,width:100,padding:"5px 8px",fontSize:12}}/>}
                          {!sel&&<span style={{fontSize:11,color:"#c0b8a0"}}>sem limite</span>}
                        </div>;
                      })}
                    </div>
                    {formOrc.categorias.length>0&&<div style={{marginTop:10,padding:"8px 12px",background:"#f0fdf4",borderRadius:8,fontSize:13,color:"#16a34a",fontWeight:600}}>
                      Total planejado: {fmt(Object.values(formOrc.limitesCat).reduce((s,v)=>s+Number(v||0),0))}
                    </div>}
                  </div>
                  <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}>
                    <button style={{...S.btn(),background:"#f7f4ef",color:"#7a6a4a"}} onClick={()=>modal("orc",false)}>Cancelar</button>
                    <button style={S.btn()} onClick={addOrc}>Criar</button>
                  </div>
                </div>
              </div>
            </div>}
          </div>
        )}

        {/* ===== CARTÕES / FATURAS ===== */}
        {tab==="cartões" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <button style={S.btn()} onClick={()=>modal("conta",true)}>+ Nova Conta/Cartão</button>
            </div>

            {contas.filter(ct=>userFilter==="Todos"||ct.usuario===userFilter).map(ct=>{
              const isCred = ct.tipo==="credito";
              // Mariana (fech>=28): show prev+current (comprou fev→paga mar, comprou mar→paga abr)
              // Tiago   (fech<28):  show current+next (ciclo 11/fev→10/mar = fatura mar)
              const isEndOfMonth = isCred && (ct.fechamento || 1) >= 28;
              const prevFatMes = (mes - 1 + 12) % 12;
              const prevFatAno = mes === 0 ? ano - 1 : ano;
              const fatAtual  = isCred ? buildFatura(ct, isEndOfMonth ? prevFatMes : mes,         isEndOfMonth ? prevFatAno : ano)  : null;
              const fatProxima = isCred ? buildFatura(ct, isEndOfMonth ? mes        : nextFatMes,  isEndOfMonth ? ano        : nextFatAno) : null;
              // Corrente/débito: just show monthly lancamentos
              const lancamentosCorrente = !isCred ? [
                ...gastosDoMes.filter(g=>g.conta===ct.id).map(g=>({...g,tipo:"variavel"})),
                ...gastosFixosDoMes.filter(g=>g.conta===ct.id&&gfPago(g.id)).map(g=>({...g,tipo:"fixo"})),
              ].sort((a,b)=>(a.data||"")>(b.data||"")?1:-1) : [];

              return <div key={ct.id} style={{...S.card,borderTop:`4px solid ${ct.cor}`}}>
                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:26}}>{ct.emoji}</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:15}}>{ct.nome}</div>
                      <div style={{display:"flex",gap:6,marginTop:3,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={S.tag(ct.usuario==="Tiago"?"#3b82f6":"#ec4899")}>{ct.usuario}</span>
                        <span style={S.tag(isCred?"#f59e0b":"#22c55e")}>{isCred?"💳 crédito":"🏦 corrente/débito"}</span>
                        {isCred&&ct.fechamento&&<span style={{fontSize:11,color:"#9a8a6a",background:"#f0ebe0",borderRadius:6,padding:"2px 7px"}}>fecha {ct.fechamento>=28?"último dia":`dia ${ct.fechamento}`}</span>}
                        {ct.vencimento&&<span style={{fontSize:11,color:"#ef4444",background:"#fef2f2",borderRadius:6,padding:"2px 7px"}}>vence dia {ct.vencimento}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>abrirEdicao("conta",ct)} style={{background:"#f0ebe0",border:"none",borderRadius:6,padding:"5px 9px",cursor:"pointer",fontSize:13}}>✏️</button>
                    <button onClick={()=>excluir("conta",ct.id,ct.nome)} style={{background:"#fef2f2",border:"none",borderRadius:6,padding:"5px 9px",cursor:"pointer",fontSize:13}}>🗑️</button>
                  </div>
                </div>

                {/* CRÉDITO: duas faturas */}
                {isCred&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {f:fatAtual,   label:isEndOfMonth?`Fatura ${MONTHS[prevFatMes]}/${prevFatAno} (pagar em ${MONTHS[mes]})`:`Fatura ${MONTHS[mes]}/${ano} (pagar em ${MONTHS[mes]})`,   fatM:isEndOfMonth?prevFatMes:mes,    fatA:isEndOfMonth?prevFatAno:ano},
                    {f:fatProxima, label:isEndOfMonth?`Fatura ${MONTHS[mes]}/${ano} (pagar em ${MONTHS[nextFatMes]})`:`Fatura ${MONTHS[nextFatMes]}/${nextFatAno} (pagar em ${MONTHS[nextFatMes]})`, fatM:isEndOfMonth?mes:nextFatMes, fatA:isEndOfMonth?ano:nextFatAno},
                  ].map(({f, label, fatM, fatA})=>{
                    if (!f || f.total===0) return <div key={label} style={{padding:"10px 14px",background:"#f7f4ef",borderRadius:10,fontSize:12,color:"#c0b8a0"}}>{label} — sem lançamentos</div>;
                    const expKey = `${ct.id}-${fatM}-${fatA}`;
                    const expandido = expandidos[expKey] !== false; // default expanded for current, collapsed for prev
                    const isAtual = fatM===mes && fatA===ano;
                    return <div key={label} style={{border:`1px solid ${f.paga?"#bbf7d0":f.canPay?"#fde68a":"#e8e0d0"}`,borderRadius:10,overflow:"hidden"}}>
                      {/* Fatura header */}
                      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:f.paga?"#f0fdf4":f.canPay?"#fffbeb":"#f7f4ef"}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:12,fontWeight:700,color:f.paga?"#16a34a":f.canPay?"#92400e":"#7a6a4a"}}>{label}</span>
                            <span style={{fontSize:13,fontWeight:"bold",color:f.paga?"#16a34a":"#1a1208"}}>{fmt(f.total)}</span>
                            {f.paga&&<span style={{...S.tag("#22c55e"),fontSize:10}}>✅ paga</span>}
                            {!f.paga&&f.canPay&&<span style={{...S.tag("#f59e0b"),fontSize:10}}>⏳ vence dia {ct.vencimento}</span>}
                            {!f.paga&&!f.canPay&&<span style={{...S.tag("#9a8a6a"),fontSize:10}}>🔒 fatura aberta</span>}
                          </div>
                          {f.paga&&<div style={{fontSize:11,color:"#9a8a6a",marginTop:2}}>Pago em {fmtData(f.dataPagamento)}</div>}
                          {!f.paga&&<div style={{fontSize:11,color:"#9a8a6a",marginTop:2}}>{f.lancamentos.length} lançamento{f.lancamentos.length!==1?"s":""} · fecha dia {ct.fechamento}</div>}
                        </div>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          {/* Pagar só se canPay */}
                          {f.canPay&&<button onClick={()=>setFaturasPagas(prev=>{const k=faturaKey(ct.id,fatM,fatA);return {...prev,[k]:{paga:!prev[k]?.paga,dataPagamento:!prev[k]?.paga?today():""}}})}
                            style={{...S.btn(f.paga?"#9a8a6a":"#22c55e"),padding:"6px 14px",fontSize:12}}>
                            {f.paga?"Desfazer":"✓ Pagar"}
                          </button>}
                          <button onClick={()=>toggleExpandido(expKey)}
                            style={{background:"#f0ebe0",border:"none",borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:13,color:"#7a6a4a"}}>
                            {expandido?"▲":"▼"}
                          </button>
                        </div>
                      </div>
                      {/* Lançamentos expansíveis */}
                      {expandido&&f.lancamentos.length>0&&<div style={{maxHeight:200,overflowY:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse"}}>
                          <tbody>
                            {f.lancamentos.map((g,i)=>{
                              const cat=catById(g.categoria);
                              const orc=orcamentos.find(o=>o.id===g.orcamento);
                              return <tr key={g.id||i} style={{background:i%2===0?"#fafafa":"white"}}>
                                <td style={{...S.td,fontSize:11,color:"#9a8a6a",padding:"6px 14px",width:80}}>{fmtData(g.data)}</td>
                                <td style={{...S.td,fontSize:12,padding:"6px 8px"}}>
                                  {g.descricao}
                                  {g.tipo==="fixo"&&<span style={{...S.tag("#6b7280"),marginLeft:5,fontSize:9}}>fixo</span>}
                                  {cat&&<span style={{...S.tag(cat.cor),marginLeft:4,fontSize:9}}>{cat.emoji}</span>}
                                </td>
                                <td style={{...S.td,padding:"6px 8px"}}>{orc&&<span style={S.tag(orc.cor)}>{orc.emoji}</span>}</td>
                                <td style={{...S.td,color:"#ef4444",fontWeight:600,fontSize:12,padding:"6px 14px",textAlign:"right"}}>{fmt(g.valor)}</td>
                              </tr>;
                            })}
                          </tbody>
                        </table>
                      </div>}
                    </div>;
                  })}
                </div>}

                {/* CORRENTE: lançamentos simples */}
                {!isCred&&<>
                  <div style={{...S.label,marginBottom:6}}>{MONTHS[mes]}/{ano} — {fmt(lancamentosCorrente.reduce((s,g)=>s+Number(g.valor),0))}</div>
                  {lancamentosCorrente.length>0&&(()=>{
                    const expKey=`${ct.id}-corrente`;
                    const expandido=expandidos[expKey]!==false;
                    return <div style={{border:"1px solid #e8e0d0",borderRadius:10,overflow:"hidden"}}>
                      <button onClick={()=>toggleExpandido(expKey)} style={{width:"100%",background:"#f7f4ef",border:"none",padding:"8px 14px",cursor:"pointer",textAlign:"left",fontSize:12,color:"#7a6a4a",display:"flex",justifyContent:"space-between"}}>
                        <span>{lancamentosCorrente.length} lançamento{lancamentosCorrente.length!==1?"s":""}</span>
                        <span>{expandido?"▲":"▼"}</span>
                      </button>
                      {expandido&&<table style={{width:"100%",borderCollapse:"collapse"}}>
                        <tbody>
                          {lancamentosCorrente.map((g,i)=>{
                            const cat=catById(g.categoria);
                            return <tr key={g.id||i} style={{background:i%2===0?"#fafafa":"white"}}>
                              <td style={{...S.td,fontSize:11,color:"#9a8a6a",padding:"6px 14px",width:80}}>{fmtData(g.data)}</td>
                              <td style={{...S.td,fontSize:12,padding:"6px 8px"}}>{g.descricao}{cat&&<span style={{...S.tag(cat.cor),marginLeft:5,fontSize:9}}>{cat.emoji}</span>}</td>
                              <td style={{...S.td,color:"#ef4444",fontWeight:600,fontSize:12,padding:"6px 14px",textAlign:"right"}}>{fmt(g.valor)}</td>
                            </tr>;
                          })}
                        </tbody>
                      </table>}
                    </div>;
                  })()}
                  {lancamentosCorrente.length===0&&<div style={{color:"#c0b8a0",fontSize:12,textAlign:"center",padding:"12px 0"}}>Sem lançamentos em {MONTHS[mes]}</div>}
                </>}
              </div>;
            })}

            {modals.conta&&<div style={S.modal}>
              <div style={{...S.modalBox,width:420}}>
                <h3 style={{margin:"0 0 18px",fontSize:17}}>Nova Conta / Cartão</h3>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <input style={S.input} placeholder="Nome (ex: Nubank Tiago)" value={formConta.nome} onChange={e=>setFormConta(f=>({...f,nome:e.target.value}))}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <input style={S.input} placeholder="Emoji" value={formConta.emoji} onChange={e=>setFormConta(f=>({...f,emoji:e.target.value}))}/>
                    <input style={S.input} type="color" value={formConta.cor} onChange={e=>setFormConta(f=>({...f,cor:e.target.value}))}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <select style={S.select} value={formConta.usuario} onChange={e=>setFormConta(f=>({...f,usuario:e.target.value}))}>
                      <option>Tiago</option><option>Mariana</option>
                    </select>
                    <select style={S.select} value={formConta.tipo} onChange={e=>setFormConta(f=>({...f,tipo:e.target.value,vencimento:e.target.value==="corrente"?"":f.vencimento}))}>
                      <option value="credito">💳 Crédito</option>
                      <option value="corrente">🏦 Corrente/Débito</option>
                    </select>
                  </div>
                  {formConta.tipo==="credito"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <input style={S.input} type="number" placeholder="Dia de fechamento" value={formConta.fechamento||""} onChange={e=>setFormConta(f=>({...f,fechamento:Number(e.target.value)}))}/>
                    <input style={S.input} type="number" placeholder="Dia de vencimento" value={formConta.vencimento||""} onChange={e=>setFormConta(f=>({...f,vencimento:Number(e.target.value)}))}/>
                  </div>}
                  {formConta.tipo==="corrente"&&<input style={S.input} type="number" placeholder="Dia de vencimento (débito)" value={formConta.vencimento||""} onChange={e=>setFormConta(f=>({...f,vencimento:Number(e.target.value)}))}/>}
                  <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}>
                    <button style={{...S.btn(),background:"#f7f4ef",color:"#7a6a4a"}} onClick={()=>modal("conta",false)}>Cancelar</button>
                    <button style={S.btn()} onClick={addConta}>Criar</button>
                  </div>
                </div>
              </div>
            </div>}
          </div>
        )}

        {/* ===== CATEGORIAS ===== */}
        {tab==="categorias" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <button style={S.btn()} onClick={()=>modal("cat",true)}>+ Nova Categoria</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
              {catsGasto.map(c=>(
                <div key={c.id} style={{...S.card,borderTop:`4px solid ${c.cor}`,textAlign:"center"}}>
                  <div style={{display:"flex",justifyContent:"flex-end",gap:4,marginBottom:4}}>
                    <button onClick={()=>abrirEdicao("cat",c)} style={{background:"#f0ebe0",border:"none",borderRadius:6,padding:"3px 7px",cursor:"pointer",fontSize:12}}>✏️</button>
                    <button onClick={()=>excluir("cat",c.id,c.nome)} style={{background:"#fef2f2",border:"none",borderRadius:6,padding:"3px 7px",cursor:"pointer",fontSize:12}}>🗑️</button>
                  </div>
                  <div style={{fontSize:30,marginBottom:6}}>{c.emoji}</div>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{c.nome}</div>
                  <div style={{fontSize:14,color:"#ef4444",fontWeight:600}}>{fmt(gastosCat(c.id))}</div>
                  <div style={{fontSize:11,color:"#9a8a6a",marginTop:2}}>{MONTHS[mes]}/{ano}</div>
                </div>
              ))}
            </div>

            {modals.cat&&<div style={S.modal}>
              <div style={{...S.modalBox,width:340}}>
                <h3 style={{margin:"0 0 18px",fontSize:17}}>Nova Categoria de Gasto</h3>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <input style={S.input} placeholder="Nome" value={formCat.nome} onChange={e=>setFormCat(f=>({...f,nome:e.target.value}))}/>
                  <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10}}>
                    <input style={S.input} placeholder="Emoji" value={formCat.emoji} onChange={e=>setFormCat(f=>({...f,emoji:e.target.value}))}/>
                    <input style={S.input} type="color" value={formCat.cor} onChange={e=>setFormCat(f=>({...f,cor:e.target.value}))}/>
                  </div>
                  <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}>
                    <button style={{...S.btn(),background:"#f7f4ef",color:"#7a6a4a"}} onClick={()=>modal("cat",false)}>Cancelar</button>
                    <button style={S.btn()} onClick={addCat}>Criar</button>
                  </div>
                </div>
              </div>
            </div>}
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {confirmando&&<div style={S.modal}>
        <div style={{...S.modalBox,width:340,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:12}}>🗑️</div>
          <h3 style={{margin:"0 0 8px",fontSize:17}}>Confirmar exclusão</h3>
          <p style={{color:"#7a6a4a",fontSize:14,margin:"0 0 20px"}}>Excluir <strong>{confirmando.label}</strong>?</p>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <button style={{...S.btn(),background:"#f7f4ef",color:"#7a6a4a"}} onClick={()=>setConfirmando(null)}>Cancelar</button>
            <button style={S.btn("#ef4444")} onClick={confirmarExclusao}>Excluir</button>
          </div>
        </div>
      </div>}

      {/* ===== MODAL DE EDIÇÃO UNIVERSAL ===== */}
      {editando && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <h3 style={{margin:"0 0 18px",fontSize:17}}>
              ✏️ Editar {editando.tipo==="receita"?"Receita":editando.tipo==="gasto"?"Gasto":editando.tipo==="cat"?"Categoria":editando.tipo==="conta"?"Conta/Cartão":"Orçamento"}
            </h3>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* RECEITA */}
              {editando.tipo==="receita" && <>
                <input style={S.input} placeholder="Descrição" value={editando.dados.descricao} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,descricao:e.target.value}}))}/>
                <input style={S.input} type="number" placeholder="Valor previsto" value={editando.dados.previsto} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,previsto:e.target.value}}))}/>
                <select style={S.select} value={editando.dados.usuario} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,usuario:e.target.value}}))}>
                  <option>Tiago</option><option>Mariana</option>
                </select>
                <select style={S.select} value={editando.dados.categoria} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,categoria:e.target.value}}))}>
                  {CAT_RECEITA.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>)}
                </select>
                <select style={S.select} value={editando.dados.recorrente?"sim":"nao"} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,recorrente:e.target.value==="sim"}}))}>
                  <option value="sim">Recorrente</option><option value="nao">Só esse mês</option>
                </select>
                <select style={S.select} value={editando.dados.diaRecebimento||""} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,diaRecebimento:e.target.value}}))}>
                  <option value="">Dia previsto</option>
                  {Array.from({length:28},(_,i)=><option key={i+1} value={i+1}>Dia {i+1}</option>)}
                  <option value="-1">Último dia</option>
                </select>
              </>}

              {/* GASTO */}
              {editando.tipo==="gasto" && <>
                <input style={S.input} placeholder="Descrição" value={editando.dados.descricao} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,descricao:e.target.value}}))}/>
                <input style={S.input} type="number" placeholder="Valor" value={editando.dados.valor} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,valor:e.target.value}}))}/>
                <input style={S.input} type="date" value={editando.dados.data||""} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,data:e.target.value}}))}/>
                <select style={S.select} value={editando.dados.categoria} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,categoria:e.target.value}}))}>
                  {catsGasto.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>)}
                </select>
                <select style={S.select} value={editando.dados.conta||""} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,conta:e.target.value}}))}>
                  <option value="">Sem conta</option>
                  {contas.map(ct=><option key={ct.id} value={ct.id}>{ct.emoji} {ct.nome}</option>)}
                </select>
                <select style={S.select} value={editando.dados.orcamento||""} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,orcamento:e.target.value}}))}>
                  <option value="">Sem orçamento</option>
                  {orcamentos.map(o=><option key={o.id} value={o.id}>{o.emoji} {o.nome}</option>)}
                </select>
                <select style={S.select} value={editando.dados.usuario} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,usuario:e.target.value}}))}>
                  <option>Tiago</option><option>Mariana</option>
                </select>
              </>}

              {/* GASTO FIXO */}
              {editando.tipo==="gastoFixo" && <>
                <input style={S.input} placeholder="Descrição" value={editando.dados.descricao} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,descricao:e.target.value}}))}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <input style={S.input} type="number" placeholder="Valor" value={editando.dados.valor} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,valor:e.target.value}}))}/>
                  <input style={S.input} type="number" placeholder="Dia pagamento" value={editando.dados.diaPagamento||""} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,diaPagamento:Number(e.target.value)}}))}/>
                </div>
                <select style={S.select} value={editando.dados.categoria} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,categoria:e.target.value}}))}>
                  {catsGasto.map(cat=><option key={cat.id} value={cat.id}>{cat.emoji} {cat.nome}</option>)}
                </select>
                <select style={S.select} value={editando.dados.conta||""} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,conta:e.target.value}}))}>
                  <option value="">Sem conta / débito automático</option>
                  {contas.map(ct=><option key={ct.id} value={ct.id}>{ct.emoji} {ct.nome}</option>)}
                </select>
                <select style={S.select} value={editando.dados.orcamento||""} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,orcamento:e.target.value}}))}>
                  <option value="">Sem orçamento</option>
                  {orcamentos.map(o=><option key={o.id} value={o.id}>{o.emoji} {o.nome}</option>)}
                </select>
                <select style={S.select} value={editando.dados.usuario} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,usuario:e.target.value}}))}>
                  <option>Tiago</option><option>Mariana</option>
                </select>
                <label style={{display:"flex",alignItems:"center",gap:10,fontSize:13,cursor:"pointer"}}>
                  <input type="checkbox" checked={editando.dados.debitoAuto||false} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,debitoAuto:e.target.checked}}))} style={{width:16,height:16}}/>
                  🔄 Débito automático
                </label>
                <div style={{borderTop:"1px solid #e8e0d0",paddingTop:10}}>
                  <div style={{...S.label,marginBottom:8}}>⏳ Vigência</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <button onClick={()=>setEditando(ed=>({...ed,dados:{...ed.dados,parcelas:null,vigenciaFim:ed.dados.vigenciaFim||""}}))}
                      style={{background:!editando.dados.parcelas?"#1a1208":"#f0ebe0",color:!editando.dados.parcelas?"#e8d5a3":"#7a6a4a",border:"none",borderRadius:8,padding:"7px",fontSize:12,cursor:"pointer"}}>
                      📅 Período
                    </button>
                    <button onClick={()=>setEditando(ed=>({...ed,dados:{...ed.dados,parcelas:ed.dados.parcelas||1}}))}
                      style={{background:editando.dados.parcelas?"#1a1208":"#f0ebe0",color:editando.dados.parcelas?"#e8d5a3":"#7a6a4a",border:"none",borderRadius:8,padding:"7px",fontSize:12,cursor:"pointer"}}>
                      🔢 Parcelado
                    </button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <div style={{fontSize:11,color:"#9a8a6a",marginBottom:4}}>Início</div>
                      <input style={S.input} type="month" value={editando.dados.vigenciaInicio||""} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,vigenciaInicio:e.target.value||null}}))}/>
                    </div>
                    {!editando.dados.parcelas
                      ? <div>
                          <div style={{fontSize:11,color:"#9a8a6a",marginBottom:4}}>Fim (vazio = indefinido)</div>
                          <input style={S.input} type="month" value={editando.dados.vigenciaFim||""} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,vigenciaFim:e.target.value||null}}))}/>
                        </div>
                      : <div>
                          <div style={{fontSize:11,color:"#9a8a6a",marginBottom:4}}>Nº de parcelas</div>
                          <input style={S.input} type="number" min="1" value={editando.dados.parcelas||""} onChange={e=>setEditando(ed=>{
                            const p=Number(e.target.value);
                            const fim=p&&ed.dados.vigenciaInicio?calcVigenciaFim(ed.dados.vigenciaInicio,p):ed.dados.vigenciaFim;
                            return {...ed,dados:{...ed.dados,parcelas:p,vigenciaFim:fim}};
                          })}/>
                        </div>
                    }
                  </div>
                  {editando.dados.parcelas&&editando.dados.vigenciaInicio&&<div style={{marginTop:6,fontSize:11,color:"#16a34a",fontWeight:600}}>
                    Vai até: {calcVigenciaFim(editando.dados.vigenciaInicio,editando.dados.parcelas)} ({editando.dados.parcelas}x de {fmt(editando.dados.valor||0)})
                  </div>}
                </div>
              </>}

              {/* CATEGORIA */}
              {editando.tipo==="cat" && <>
                <input style={S.input} placeholder="Nome" value={editando.dados.nome} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,nome:e.target.value}}))}/>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10}}>
                  <input style={S.input} placeholder="Emoji" value={editando.dados.emoji} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,emoji:e.target.value}}))}/>
                  <input style={S.input} type="color" value={editando.dados.cor} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,cor:e.target.value}}))}/>
                </div>
              </>}

              {/* CONTA */}
              {editando.tipo==="conta" && <>
                <input style={S.input} placeholder="Nome" value={editando.dados.nome} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,nome:e.target.value}}))}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <input style={S.input} placeholder="Emoji" value={editando.dados.emoji} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,emoji:e.target.value}}))}/>
                  <input style={S.input} type="color" value={editando.dados.cor} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,cor:e.target.value}}))}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <select style={S.select} value={editando.dados.usuario} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,usuario:e.target.value}}))}>
                    <option>Tiago</option><option>Mariana</option>
                  </select>
                  <select style={S.select} value={editando.dados.tipo||"credito"} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,tipo:e.target.value}}))}>
                    <option value="credito">💳 Crédito</option>
                    <option value="corrente">🏦 Corrente/Débito</option>
                  </select>
                </div>
                {(editando.dados.tipo||"credito")==="credito"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <input style={S.input} type="number" placeholder="Dia de fechamento" value={editando.dados.fechamento||""} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,fechamento:Number(e.target.value)}}))}/>
                  <input style={S.input} type="number" placeholder="Dia de vencimento" value={editando.dados.vencimento||""} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,vencimento:Number(e.target.value)}}))}/>
                </div>}
                {(editando.dados.tipo||"credito")==="corrente"&&<input style={S.input} type="number" placeholder="Dia de vencimento (débito)" value={editando.dados.vencimento||""} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,vencimento:Number(e.target.value)}}))}/>}
              </>}

              {/* ORÇAMENTO */}
              {editando.tipo==="orc" && <>
                <input style={S.input} placeholder="Nome" value={editando.dados.nome} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,nome:e.target.value}}))}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <input style={S.input} placeholder="Emoji" value={editando.dados.emoji} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,emoji:e.target.value}}))}/>
                  <input style={S.input} type="color" value={editando.dados.cor} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,cor:e.target.value}}))}/>
                </div>
                <label style={{display:"flex",alignItems:"center",gap:10,fontSize:13,cursor:"pointer"}}>
                  <input type="checkbox" checked={editando.dados.fixo||false} onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,fixo:e.target.checked}}))} style={{width:16,height:16}}/>
                  🔄 Débito automático / gasto fixo recorrente
                </label>
                <div>
                  <div style={{...S.label,marginBottom:8}}>Categorias e limites</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {catsGasto.map(cat=>{
                      const cats=editando.dados.categorias||[];
                      const sel=cats.includes(cat.id);
                      const limCats=editando.dados.limitesCat||{};
                      const limVal=limCats[cat.id]||"";
                      return <div key={cat.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:sel?cat.cor+"11":"#f7f4ef",border:`1px solid ${sel?cat.cor:"#e8e0d0"}`}}>
                        <button onClick={()=>setEditando(ed=>{
                          const cs=ed.dados.categorias||[];
                          const lcs=ed.dados.limitesCat||{};
                          const isSel=cs.includes(cat.id);
                          return {...ed,dados:{...ed.dados,
                            categorias:isSel?cs.filter(x=>x!==cat.id):[...cs,cat.id],
                            limitesCat:isSel?Object.fromEntries(Object.entries(lcs).filter(([k])=>k!==cat.id)):lcs
                          }};
                        })} style={{background:sel?cat.cor:"#e8e0d0",border:"none",borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:14,color:sel?"white":"#9a8a6a",flexShrink:0}}>
                          {sel?"✓":"+"}</button>
                        <span style={{fontSize:14}}>{cat.emoji}</span>
                        <span style={{fontSize:13,fontWeight:600,flex:1,color:sel?"#1a1208":"#9a8a6a"}}>{cat.nome}</span>
                        {sel&&<input type="number" placeholder="Limite R$" value={limVal}
                          onChange={e=>setEditando(ed=>({...ed,dados:{...ed.dados,limitesCat:{...(ed.dados.limitesCat||{}),[cat.id]:e.target.value}}}))}
                          style={{...S.input,width:100,padding:"5px 8px",fontSize:12}}/>}
                        {!sel&&<span style={{fontSize:11,color:"#c0b8a0"}}>sem limite</span>}
                      </div>;
                    })}
                  </div>
                  {(editando.dados.categorias||[]).length>0&&<div style={{marginTop:10,padding:"8px 12px",background:"#f0fdf4",borderRadius:8,fontSize:13,color:"#16a34a",fontWeight:600}}>
                    Total planejado: {fmt(Object.values(editando.dados.limitesCat||{}).reduce((s,v)=>s+Number(v||0),0))}
                  </div>}
                </div>
              </>}

              <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
                <button style={{...S.btn(),background:"#f7f4ef",color:"#7a6a4a"}} onClick={fecharEdicao}>Cancelar</button>
                <button style={S.btn("#22c55e")} onClick={salvarEdicao}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
