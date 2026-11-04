import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, ArrowDown, Volume2, VolumeX, ChevronsDown } from 'lucide-react';
import { createGeneralWhatsAppLink } from '../../utils/whatsapp';
import { somAbertura } from './introAudio';

/**
 * ABERTURA CINEMATOGRÁFICA CONTROLADA PELA ROLAGEM
 *
 * Como funciona, em linguagem simples:
 * - A seção é bem alta (480vh). Dentro dela há um "palco" grudado na tela (sticky) com um <canvas>.
 * - Quanto mais a pessoa rola, mais o vídeo avança. A rolagem vira um número de 0 a 1 (progresso).
 * - O vídeo não é um <video>: são quadros numerados em WebP. Assim cada posição da rolagem
 *   mostra exatamente o quadro certo, sem travar.
 * - Celular (tela em pé) baixa só os quadros 9:16. Computador (tela larga) baixa só os 16:9.
 */

type Perfil = 'm' | 'd';
interface Conjunto { n: number; chaves: [number, number][] }

// Pontos-chave: [progresso da rolagem, quadro]. A tensão (antes da pisada) ocupa mais rolagem = câmera lenta.
const CONJUNTOS: Record<Perfil, Conjunto> = {
  m: { n: 121, chaves: [[0, 0], [0.12, 30], [0.25, 51], [0.62, 78], [0.68, 82.5], [0.85, 112], [1, 120]] },
  d: { n: 103, chaves: [[0, 0], [0.25, 32], [0.3, 40], [0.62, 60], [0.68, 64.5], [0.85, 94], [1, 102]] },
};
const P_IMPACTO = 0.655;
const JANELA = 10; // quadros decodificados de cada lado da posição atual
const CHAVE_SESSAO = 'ga_abertura_entrou';
const CHAVE_SOM = 'ga_som';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const suave = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
/** 0→1→0: aparece entre a e b, some entre c e d */
const janela = (p: number, a: number, b: number, c: number, d: number) => Math.min(suave(a, b, p), 1 - suave(c, d, p));

function quadroDo(p: number, chaves: [number, number][]) {
  for (let i = 1; i < chaves.length; i++) {
    const [p1, f1] = chaves[i];
    const [p0, f0] = chaves[i - 1];
    if (p <= p1) return f0 + ((p - p0) / (p1 - p0)) * (f1 - f0);
  }
  return chaves[chaves.length - 1][1];
}

function lerSessao(k: string) { try { return sessionStorage.getItem(k); } catch { return null; } }
function gravarSessao(k: string, v: string) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } }
function lerLocal(k: string) { try { return localStorage.getItem(k); } catch { return null; } }
function gravarLocal(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* ignore */ } }

function conexaoLenta() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || /(^|-)2g|3g/.test(c.effectiveType || ''));
}

interface Particula { x: number; y: number; vx: number; vy: number; vida: number; max: number; r: number }

export const AberturaRolagem: React.FC<{ whatsappNumber: string }> = ({ whatsappNumber }) => {
  const secRef = useRef<HTMLElement>(null);
  const palcoRef = useRef<HTMLDivElement>(null);
  const fundoRef = useRef<HTMLCanvasElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const txt = useRef<Record<string, HTMLElement | null>>({});
  const [reduz] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const [portao, setPortao] = useState(() => !reduz && lerSessao(CHAVE_SESSAO) !== '1');
  const [carregado, setCarregado] = useState(0);
  const [somOn, setSomOn] = useState(() => lerLocal(CHAVE_SOM) !== '0');
  const pronto = carregado >= 0.3;
  const whatsappUrl = createGeneralWhatsAppLink(whatsappNumber);

  // ---------- trava a rolagem enquanto o portão de entrada está na tela ----------
  useEffect(() => {
    if (!portao) return;
    const h = document.documentElement;
    const antes = h.style.overflow;
    h.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    return () => { h.style.overflow = antes; };
  }, [portao]);

  useEffect(() => { somAbertura.preparar(); (window as unknown as { __gaSom?: unknown }).__gaSom = somAbertura; }, []);

  const entrar = useCallback(() => {
    gravarSessao(CHAVE_SESSAO, '1');
    setPortao(false);
    if (lerLocal(CHAVE_SOM) !== '0') somAbertura.entrar();
  }, []);

  // qualquer toque ou tecla também entra
  useEffect(() => {
    if (!portao) return;
    const ok = (e: Event) => {
      if (e instanceof KeyboardEvent && ['Tab', 'Shift', 'Alt', 'Meta', 'Control'].includes(e.key)) return;
      entrar();
    };
    window.addEventListener('pointerdown', ok, { once: true });
    window.addEventListener('keydown', ok, { once: true });
    return () => { window.removeEventListener('pointerdown', ok); window.removeEventListener('keydown', ok); };
  }, [portao, entrar]);

  // quem já entrou nesta visita: o som volta no primeiro toque
  useEffect(() => {
    if (portao || reduz) return;
    if (somAbertura.ctx?.state === 'running') return;
    const ok = () => { if (lerLocal(CHAVE_SOM) !== '0') somAbertura.entrar(); };
    window.addEventListener('pointerdown', ok, { once: true });
    window.addEventListener('keydown', ok, { once: true });
    return () => { window.removeEventListener('pointerdown', ok); window.removeEventListener('keydown', ok); };
  }, [portao, reduz]);

  const alternarSom = () => {
    const on = !somOn;
    setSomOn(on);
    gravarLocal(CHAVE_SOM, on ? '1' : '0');
    if (on) somAbertura.entrar();
    somAbertura.alternar(on);
  };

  const pularIntro = () => {
    const s = secRef.current;
    if (!s) return;
    (window as unknown as { __gaPulou?: number }).__gaPulou = performance.now();
    somAbertura.disparouImpacto = true;
    window.scrollTo({ top: s.offsetTop + s.offsetHeight - window.innerHeight * 0.999, behavior: 'auto' });
  };

  // ---------- motor da abertura (canvas) ----------
  useEffect(() => {
    const sec = secRef.current, palco = palcoRef.current, cv = cvRef.current, fundo = fundoRef.current;
    if (!sec || !palco || !cv || !fundo) return;
    const ctx = cv.getContext('2d', { alpha: false });
    const fctx = fundo.getContext('2d', { alpha: false });
    if (!ctx || !fctx) return;

    const perfil: Perfil = window.innerWidth / window.innerHeight < 1 ? 'm' : 'd';
    const conj = CONJUNTOS[perfil];
    const leve = conexaoLenta();
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const larguraPx = (perfil === 'm' ? Math.min(window.innerWidth, (window.innerHeight * 9) / 16) : window.innerWidth) * dpr;
    const hd = !leve && (perfil === 'm' ? larguraPx > 760 : larguraPx > 1400);
    const pasta = `/intro/${perfil}/${hd ? 'hd' : 'sd'}/`;
    const nome = (i: number) => `${pasta}${String(i + 1).padStart(3, '0')}.webp`;
    const usaveis = Array.from({ length: conj.n }, (_, i) => i).filter((i) => !leve || i % 2 === 0 || i === conj.n - 1);

    const blobs: (Blob | undefined)[] = new Array(conj.n);
    const bitmaps = new Map<number, ImageBitmap>();
    const decod = new Set<number>();
    let vivo = true;

    // ordem: 1º quadro → 1 a cada 4 → o resto
    const ordem = [0, ...usaveis.filter((i) => i % 4 === 0 && i !== 0), ...usaveis.filter((i) => i % 4 !== 0)];
    let carregados = 0;
    let fila = 0;
    const baixar = async () => {
      while (vivo && fila < ordem.length) {
        const i = ordem[fila++];
        try {
          const r = await fetch(nome(i));
          if (r.ok) blobs[i] = await r.blob();
        } catch { /* rede caiu: segue com os que vieram */ }
        carregados++;
        if (carregados % 4 === 0 || carregados === ordem.length) setCarregado(carregados / ordem.length);
        if (i === 0 || i === conj.n - 1) agendar();
      }
    };
    for (let k = 0; k < 6; k++) baixar();

    const decodificar = (i: number) => {
      const b = blobs[i];
      if (!b || bitmaps.has(i) || decod.has(i) || decod.size > 4) return;
      decod.add(i);
      createImageBitmap(b).then((bm) => {
        decod.delete(i);
        if (!vivo) { bm.close(); return; }
        bitmaps.set(i, bm);
        if (i === conj.n - 1 && !fundoPintado) pintarFundo(bm);
        agendar();
      }).catch(() => decod.delete(i));
    };
    const janelaDecod = (c: number) => {
      decodificar(Math.round(c));
      for (let d = 1; d <= JANELA; d++) { decodificar(Math.round(c) + d); decodificar(Math.round(c) - d); }
      for (const [i, bm] of bitmaps) {
        if (Math.abs(i - c) > JANELA * 2 && i !== conj.n - 1 && i !== 0) { bm.close(); bitmaps.delete(i); }
      }
    };
    const maisProximo = (i: number): ImageBitmap | undefined => {
      const r = Math.round(i);
      for (let d = 0; d < conj.n; d++) {
        const a = bitmaps.get(r - d) || bitmaps.get(r + d);
        if (a) return a;
      }
      return undefined;
    };

    // ---------- tamanhos ----------
    let W = 0, H = 0, topoSeguro = 0;
    const medir = () => {
      const r = palco.getBoundingClientRect();
      W = Math.round(r.width * dpr); H = Math.round(r.height * dpr);
      cv.width = W; cv.height = H; fundo.width = Math.round(W / 4); fundo.height = Math.round(H / 4);
      const header = document.querySelector('header');
      const hh = header ? header.getBoundingClientRect().height : 64;
      topoSeguro = hh * dpr;
      document.documentElement.style.setProperty('--ga-header', `${Math.round(hh)}px`);
      fundoPintado = false;
      const ult = bitmaps.get(conj.n - 1);
      if (ult) pintarFundo(ult);
      prerender();
      agendar();
    };

    // fundo desfocado pintado UMA vez numa camada estática (sem blur a cada quadro)
    let fundoPintado = false;
    const pintarFundo = (bm: ImageBitmap) => {
      const w = fundo.width, h = fundo.height;
      fctx.fillStyle = '#100C0A'; fctx.fillRect(0, 0, w, h);
      fctx.filter = 'blur(10px) brightness(0.45) saturate(1.2)';
      const s = Math.max(w / bm.width, h / bm.height) * 1.15;
      fctx.drawImage(bm, (w - bm.width * s) / 2, (h - bm.height * s) / 2, bm.width * s, bm.height * s);
      fctx.filter = 'none';
      fundoPintado = true;
    };

    // sprites pré-desenhados (vinheta, luz ambiente, ponto de luz) — desenhar imagem pronta é barato
    let vinheta: HTMLCanvasElement, luz: HTMLCanvasElement;
    const ponto = document.createElement('canvas');
    ponto.width = ponto.height = 32;
    { const g = ponto.getContext('2d')!; const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, 'rgba(255,236,190,1)'); gr.addColorStop(0.35, 'rgba(230,185,110,0.55)'); gr.addColorStop(1, 'rgba(214,182,128,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 32, 32); }
    const prerender = () => {
      vinheta = document.createElement('canvas'); vinheta.width = 256; vinheta.height = 256;
      const v = vinheta.getContext('2d')!; const g = v.createRadialGradient(128, 128, 60, 128, 128, 182);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(8,5,3,1)'); v.fillStyle = g; v.fillRect(0, 0, 256, 256);
      luz = document.createElement('canvas'); luz.width = 256; luz.height = 256;
      const l = luz.getContext('2d')!; const g2 = l.createRadialGradient(128, 160, 0, 128, 160, 150);
      g2.addColorStop(0, 'rgba(232,190,120,0.55)'); g2.addColorStop(1, 'rgba(232,190,120,0)'); l.fillStyle = g2; l.fillRect(0, 0, 256, 256);
    };

    const poeira: Particula[] = Array.from({ length: perfil === 'm' ? 26 : 42 }, () => ({
      x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.00012, vy: -0.00008 - Math.random() * 0.00018, vida: 0, max: 1, r: 0.6 + Math.random() * 1.6,
    }));
    const faiscas: Particula[] = [];
    const explodir = (cx: number, cy: number, n: number, forca: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = (0.4 + Math.random()) * forca;
        faiscas.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6 - forca * 0.4, vida: 0, max: 50 + Math.random() * 50, r: 1 + Math.random() * 2.2 });
      }
    };

    // ---------- rolagem → progresso suavizado ----------
    let alvo = 0, p = reduz ? 1 : 0, ultimo = performance.now(), visivel = true, raf = 0, explodiu = false, pAnterior = p, impactoEm = -1e9;
    const pulouEm = () => (window as unknown as { __gaPulou?: number }).__gaPulou || -1e9;
    const lerRolagem = () => {
      const r = sec.getBoundingClientRect();
      const total = sec.offsetHeight - window.innerHeight;
      alvo = reduz ? 1 : clamp(total > 0 ? -r.top / total : 1);
      const depois = r.bottom < window.innerHeight * 0.5;
      document.body.classList.toggle('ga-abertura-ativa', r.top < window.innerHeight && r.bottom > 0);
      return depois;
    };
    let depoisDaAbertura = false;
    const onScroll = () => { depoisDaAbertura = lerRolagem(); agendar(); if (depoisDaAbertura) somAbertura.atualizar(1, true); };

    const agendar = () => { if (!raf && visivel && vivo) raf = requestAnimationFrame(quadro); };

    // ---------- desenho de cada quadro ----------
    const medidas = { custo: 0, n: 0 };
    (window as unknown as { __gaAbertura?: unknown }).__gaAbertura = { medidas, perfil, hd, leve, get p() { return p; }, get carregado() { return carregados / ordem.length; } };

    const quadro = (agora: number) => {
      raf = 0;
      const t0 = performance.now();
      const dt = Math.min(64, agora - ultimo); ultimo = agora;
      p += (alvo - p) * (1 - Math.exp(-dt / 110));
      if (Math.abs(alvo - p) < 0.0004) p = alvo;

      const fi = quadroDo(p, conj.chaves);
      janelaDecod(fi);
      const a = maisProximo(Math.floor(fi));
      somAbertura.atualizar(p, depoisDaAbertura);

      // fundo estático (já desfocado) esticado
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(fundo, 0, 0, W, H);

      if (p >= P_IMPACTO && pAnterior < P_IMPACTO && agora - pulouEm() > 1500) impactoEm = agora;
      pAnterior = p;
      const desde = agora - impactoEm;
      const imp = desde < 0 ? 0 : Math.exp(-desde / 170);
      const tremor = desde < 0 ? 0 : Math.exp(-desde / 260);
      const sx = (Math.random() - 0.5) * 18 * dpr * tremor, sy = (Math.random() - 0.5) * 14 * dpr * tremor;
      const fim = suave(0.86, 0.97, p);

      let vx = 0, vy = 0, vw = W, vh = H, raio = 0;
      if (a) {
        if (perfil === 'm') {
          // vídeo inteiro (sem cortar a marca) entre o cabeçalho e a base; no fim sobe para abrir espaço à chamada
          const base = 16 * dpr, reservaFim = 300 * dpr * fim;
          const altDisp = H - topoSeguro - base - reservaFim;
          const s = Math.min(W / a.width, altDisp / a.height);
          vw = a.width * s; vh = a.height * s; vx = (W - vw) / 2; vy = topoSeguro + (altDisp - vh) / 2;
          raio = 18 * dpr * fim;
        } else {
          // tela cheia com leve movimento de câmera; no fim vira "pôster" arredondado com a chamada embaixo
          const cam = 1.02 + 0.05 * p;
          const s0 = Math.max(W / a.width, H / a.height) * cam;
          const s1 = Math.min((W * 0.62) / a.width, (H * 0.6) / a.height);
          const s = s0 + (s1 - s0) * fim;
          vw = a.width * s; vh = a.height * s;
          vx = (W - vw) / 2 + Math.sin(p * 3.1) * 10 * dpr * (1 - fim);
          vy = (H - vh) / 2 - H * 0.12 * fim;
          raio = 26 * dpr * fim;
        }
        vx += sx; vy += sy;
        ctx.save();
        if (raio > 0.5) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(vx, vy, vw, vh, raio); else ctx.rect(vx, vy, vw, vh); ctx.clip(); }
        ctx.drawImage(a, vx, vy, vw, vh);
        // mistura com o quadro vizinho só quando a diferença é visível (entre 20% e 80% do caminho)
        const frac = fi - Math.floor(fi);
        if (frac > 0.2 && frac < 0.8) {
          const b = bitmaps.get(Math.floor(fi) + 1);
          if (b && b !== a) { ctx.globalAlpha = frac; ctx.drawImage(b, vx, vy, vw, vh); ctx.globalAlpha = 1; }
        }
        ctx.restore();
      }

      // pulsação de luz ambiente + vinheta (fecha durante a tensão)
      const tensao = janela(p, 0.25, 0.4, 0.62, 0.66);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (0.1 + 0.06 * Math.sin(agora / 900)) * (0.6 + tensao * 0.6) + imp * 0.25;
      ctx.drawImage(luz, -W * 0.1, H * 0.25, W * 1.2, H * 0.9);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.55 + tensao * 0.35 - fim * 0.25;
      ctx.drawImage(vinheta, -W * 0.15, -H * 0.15, W * 1.3, H * 1.3);

      // flash do impacto
      if (imp > 0.01) { ctx.globalAlpha = imp * 0.85; ctx.fillStyle = '#FFF1D6'; ctx.fillRect(0, 0, W, H); }

      // partículas: poeira luminosa sempre; faíscas na pisada e saindo da marca no final
      ctx.globalCompositeOperation = 'lighter';
      for (const q of poeira) {
        q.x += q.vx * dt; q.y += q.vy * dt;
        if (q.y < -0.02) { q.y = 1.02; q.x = Math.random(); }
        ctx.globalAlpha = 0.35 + 0.25 * Math.sin(agora / 700 + q.x * 20);
        const r = q.r * 3 * dpr; ctx.drawImage(ponto, q.x * W - r, q.y * H - r, r * 2, r * 2);
      }
      if (!reduz && impactoEm === agora && !explodiu) { explodiu = true; explodir(W / 2, vy + vh * 0.78, perfil === 'm' ? 70 : 110, 5 * dpr); }
      if (p < P_IMPACTO - 0.05) explodiu = false;
      if (!reduz && fim > 0.6 && Math.random() < 0.35) explodir(W / 2 + (Math.random() - 0.5) * vw * 0.3, vy + vh + (perfil === 'm' ? 40 : 70) * dpr, 1, 1.2 * dpr);
      for (let i = faiscas.length - 1; i >= 0; i--) {
        const f = faiscas[i];
        f.vida += dt / 16.7; f.x += f.vx; f.y += f.vy; f.vy += 0.06 * dpr; f.vx *= 0.985;
        if (f.vida > f.max) { faiscas.splice(i, 1); continue; }
        ctx.globalAlpha = 1 - f.vida / f.max;
        const r = f.r * 3 * dpr; ctx.drawImage(ponto, f.x - r, f.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

      // textos sincronizados (só opacidade/transform: barato)
      const T = txt.current;
      const set = (k: string, o: number, dy = 0, extra = '') => {
        const el = T[k]; if (!el) return;
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0,${((1 - o) * dy).toFixed(1)}px,0) ${extra}`;
        el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      };
      set('dica', reduz ? 0 : 1 - suave(0.01, 0.05, p));
      set('t1', janela(p, 0.03, 0.08, 0.18, 0.23), 18);
      set('t2', janela(p, 0.27, 0.32, 0.56, 0.6), 18);
      set('medidor', tensao);
      if (T.barra) T.barra.style.transform = `scaleY(${clamp((p - 0.25) / 0.395).toFixed(3)})`;
      const pw = janela(p, 0.646, 0.656, 0.7, 0.74);
      set('impacto', pw, 0, `scale(${(1.25 - 0.25 * suave(0.646, 0.67, p)).toFixed(3)})`);
      set('t3', janela(p, 0.73, 0.77, 0.84, 0.87), 18);
      set('fim', suave(0.88, 0.96, p), 24);
      set('pular', reduz ? 0 : 1 - suave(0.86, 0.9, p));

      const c = performance.now() - t0; medidas.custo += c; medidas.n++;
      if (p !== alvo || faiscas.length || visivel || imp > 0.01) agendar();
    };

    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel) { ultimo = performance.now(); agendar(); }
      else { cancelAnimationFrame(raf); raf = 0; document.body.classList.remove('ga-abertura-ativa'); }
    });
    io.observe(sec);

    medir();
    lerRolagem();
    window.addEventListener('scroll', onScroll, { passive: true });
    let rt = 0;
    const onResize = () => { clearTimeout(rt); rt = window.setTimeout(medir, 150); };
    window.addEventListener('resize', onResize);

    return () => {
      vivo = false; io.disconnect(); cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize);
      for (const bm of bitmaps.values()) bm.close();
      document.body.classList.remove('ga-abertura-ativa');
    };
  }, [reduz]);

  const reg = (k: string) => (el: HTMLElement | null) => { txt.current[k] = el; };
  const textoClasse = 'absolute inset-x-0 px-6 text-center pointer-events-none will-change-transform';

  return (
    <>
      {portao && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-[#100C0A] text-[#F6F0E7] px-6 text-center" role="dialog" aria-modal="true" aria-labelledby="portao-titulo">
          <img src="/logo-ga-transparente.webp" alt="" width={160} height={160} className="w-32 h-32 sm:w-40 sm:h-40 ga-logo-in" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#D6B680]">Serra Gaúcha · Canela e Gramado</p>
            <h2 id="portao-titulo" className="mt-3 font-serif text-3xl sm:text-4xl">Uma experiência para ver e ouvir</h2>
            <p className="mt-3 text-sm text-[#C4B8A8]">Aumente o volume. Role a tela para conduzir a cena.</p>
          </div>
          <button type="button" onClick={entrar} autoFocus className="ga-press rounded-full bg-[#D6B680] hover:bg-[#E4C99E] px-9 py-4 text-sm font-bold tracking-[0.18em] text-[#100C0A]">
            {pronto ? 'ENTRAR NA EXPERIÊNCIA' : `PREPARANDO… ${Math.round(carregado * 100)}%`}
          </button>
          <p className="text-[11px] text-[#C4B8A8]/80">Toque em qualquer lugar ou aperte uma tecla para entrar</p>
        </div>
      )}

      <section ref={secRef} id="abertura" aria-label="Abertura GA Moda & Essência" className="relative bg-[#100C0A]" style={{ height: reduz ? '100svh' : '480vh' }}>
        <div ref={palcoRef} className="sticky top-0 h-[100svh] w-full overflow-hidden">
          <canvas ref={fundoRef} aria-hidden="true" className="hidden" />
          <canvas ref={cvRef} aria-hidden="true" className="absolute inset-0 w-full h-full" />

          <p ref={reg('dica')} className={`${textoClasse} bottom-8 flex flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#F6F0E7]/85`}>
            Role para entrar na Serra <ChevronsDown className="w-5 h-5 animate-bounce text-[#D6B680]" aria-hidden="true" />
          </p>
          <h2 ref={reg('t1')} className={`${textoClasse} bottom-[16%] font-serif text-3xl sm:text-5xl text-[#F6F0E7] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]`} style={{ opacity: 0 }}>
            Cada passo conta uma história.
          </h2>
          <div ref={reg('t2')} className={`${textoClasse} bottom-[16%]`} style={{ opacity: 0 }}>
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#D6B680]">Curadoria GA</p>
            <p className="mt-2 font-serif text-3xl sm:text-5xl text-[#F6F0E7] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">Escolhido a dedo<br /><em className="text-[#D6B680]">na Serra Gaúcha.</em></p>
          </div>
          <div ref={reg('medidor')} className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0 }} aria-hidden="true">
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#D6B680] [writing-mode:vertical-rl] rotate-180 mb-3 mx-auto">Tensão</p>
            <div className="w-1 h-40 sm:h-56 rounded-full bg-white/15 overflow-hidden mx-auto relative">
              <div ref={reg('barra')} className="absolute inset-0 bg-gradient-to-t from-[#A67037] to-[#FFE2A8]" style={{ transform: 'scaleY(0)', transformOrigin: 'bottom' }} />
            </div>
          </div>
          <p ref={reg('impacto')} className={`${textoClasse} top-1/2 -mt-10 font-serif italic text-6xl sm:text-8xl tracking-tight text-[#FFE9C2] drop-shadow-[0_0_24px_rgba(214,182,128,0.9)]`} style={{ opacity: 0 }} aria-hidden="true">
            Essência
          </p>
          <p ref={reg('t3')} className={`${textoClasse} bottom-[14%] font-serif text-2xl sm:text-4xl text-[#F6F0E7] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]`} style={{ opacity: 0 }}>
            Tênis, moda e perfumaria<br /><em className="text-[#D6B680]">com a curadoria da GA.</em>
          </p>

          <div ref={reg('fim')} className="absolute inset-x-0 bottom-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-10 flex flex-col items-center text-center" style={{ opacity: reduz ? 1 : 0 }}>
            <span className="ga-logo-brilho w-12 h-12 sm:w-20 sm:h-20" aria-hidden="true" />
            <p className="mt-2 text-[10px] uppercase tracking-[0.32em] text-[#D6B680]">Serra Gaúcha · Canela e Gramado</p>
            <p className="mt-2 font-serif text-2xl sm:text-4xl text-[#F6F0E7]">O seu próximo par começa aqui.</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 w-full max-w-md sm:max-w-none sm:w-auto">
              <a href="#vitrine" className="ga-press inline-flex items-center justify-center gap-2 rounded-full bg-[#D6B680] hover:bg-[#E4C99E] px-7 py-3.5 text-sm font-semibold text-[#100C0A]">
                Explorar a vitrine <ArrowDown className="w-4 h-4" aria-hidden="true" />
              </a>
              <a href={whatsappUrl} data-origem="abertura" target="_blank" rel="noopener noreferrer" className="ga-press inline-flex items-center justify-center gap-2 rounded-full border border-white/30 hover:border-white/70 px-7 py-3.5 text-sm font-semibold text-white">
                <MessageCircle className="w-5 h-5 text-[#25D366]" aria-hidden="true" /> Falar no WhatsApp
              </a>
            </div>
            <p className="mt-3 text-[11px] text-[#C4B8A8]">Atendimento direto · Troca em até 7 dias</p>
          </div>

          <div className="absolute right-3 sm:right-6 flex gap-2" style={{ top: 'calc(var(--ga-header, 64px) + 12px)' }}>
            <button type="button" onClick={alternarSom} aria-pressed={somOn} aria-label={somOn ? 'Desligar o som' : 'Ligar o som'} className="ga-press rounded-full bg-black/55 border border-white/20 p-2.5 text-[#F6F0E7]">
              {somOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button ref={reg('pular') as React.Ref<HTMLButtonElement>} type="button" onClick={pularIntro} className="ga-press rounded-full bg-black/55 border border-white/20 px-4 py-2 text-xs font-semibold tracking-wide text-[#F6F0E7]" style={{ opacity: reduz ? 0 : 1 }}>
              Pular intro
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
