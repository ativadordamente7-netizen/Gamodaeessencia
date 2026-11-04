/**
 * Som da abertura — 100% gerado por código (Web Audio). Nenhum arquivo de terceiros, sem licença a pagar.
 *
 * Camadas:
 *  - ambiente: "sala" escura (ruído filtrado) + grave contínuo com respiração lenta
 *  - tensão: zumbido que sobe de tom e volume conforme a rolagem, com pulsação que acelera
 *  - impacto: golpe grave + estalo no clímax (a pisada)
 *  - brilho: sinos agudos na revelação da marca
 *  - trilha: acordes suaves que crescem depois do clímax e ficam baixinhos no resto do site
 */

type Ctx = AudioContext;

function ruido(ctx: Ctx, seg: number, rosa = true) {
  const n = Math.floor(ctx.sampleRate * seg);
  const b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (!rosa) { d[i] = w; continue; }
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.963 * b1 + w * 0.2965164;
      b2 = 0.57 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18;
    }
  }
  return b;
}

function impulso(ctx: Ctx, seg: number, queda: number) {
  const n = Math.floor(ctx.sampleRate * seg);
  const b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, queda);
  }
  return b;
}

const ACORDES = [
  [220.0, 261.63, 329.63, 392.0], // Lá menor com sétima
  [174.61, 220.0, 261.63, 329.63], // Fá maior com sétima
  [130.81, 196.0, 261.63, 329.63], // Dó maior
  [196.0, 246.94, 293.66, 392.0], // Sol maior
];

export class SomAbertura {
  ctx: Ctx | null = null;
  private master!: GainNode;
  private saida!: GainNode;
  private reverb!: ConvolverNode;
  private ambGain!: GainNode;
  private tenGain!: GainNode;
  private tenOsc!: OscillatorNode;
  private tenOsc2!: OscillatorNode;
  private tenFiltro!: BiquadFilterNode;
  private trilhaGain!: GainNode;
  private ruidoBuf!: AudioBuffer;
  private ligado = true;
  private proxAcorde = 0;
  private acordeIdx = 0;
  private pulsoProx = 0;
  private tensao = 0;
  private timer: number | null = null;
  disparouImpacto = false;
  disparouBrilho = false;

  /** Prepara os sons enquanto a página abre (o navegador só deixa tocar depois do primeiro toque). */
  preparar() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    this.ruidoBuf = ruido(ctx, 3);

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.25;
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.1;
    const saida = ctx.createGain(); saida.gain.value = 0.9;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(comp).connect(lim).connect(saida).connect(ctx.destination);
    this.saida = saida;

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = impulso(ctx, 3.2, 2.6);
    const revGain = ctx.createGain(); revGain.gain.value = 0.35;
    this.reverb.connect(revGain).connect(this.master);

    // Ambiente: sala escura + grave que respira
    this.ambGain = ctx.createGain(); this.ambGain.gain.value = 0.5; this.ambGain.connect(this.master);
    const amb = ctx.createBufferSource(); amb.buffer = this.ruidoBuf; amb.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520;
    const ambNivel = ctx.createGain(); ambNivel.gain.value = 0.6;
    amb.connect(lp).connect(ambNivel).connect(this.ambGain); amb.start();
    const drone = ctx.createOscillator(); drone.type = 'sine'; drone.frequency.value = 55;
    const droneG = ctx.createGain(); droneG.gain.value = 0.12;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.03;
    lfo.connect(lfoG).connect(droneG.gain);
    drone.connect(droneG).connect(this.ambGain); drone.start(); lfo.start();

    // Tensão: zumbido que sobe com a rolagem
    this.tenGain = ctx.createGain(); this.tenGain.gain.value = 0; this.tenGain.connect(this.master); this.tenGain.connect(this.reverb);
    this.tenOsc = ctx.createOscillator(); this.tenOsc.type = 'sawtooth'; this.tenOsc.frequency.value = 70;
    const tenOsc2 = ctx.createOscillator(); tenOsc2.type = 'sawtooth'; tenOsc2.frequency.value = 70.7;
    this.tenFiltro = ctx.createBiquadFilter(); this.tenFiltro.type = 'lowpass'; this.tenFiltro.frequency.value = 200; this.tenFiltro.Q.value = 6;
    const tenNivel = ctx.createGain(); tenNivel.gain.value = 0.08;
    this.tenOsc.connect(this.tenFiltro); tenOsc2.connect(this.tenFiltro);
    this.tenOsc2 = tenOsc2;
    this.tenFiltro.connect(tenNivel).connect(this.tenGain);
    const tenRuido = ctx.createBufferSource(); tenRuido.buffer = this.ruidoBuf; tenRuido.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 2400; hp.Q.value = 0.8;
    const ruNivel = ctx.createGain(); ruNivel.gain.value = 0.25;
    tenRuido.connect(hp).connect(ruNivel).connect(this.tenGain);
    this.tenOsc.start(); tenOsc2.start(); tenRuido.start();

    // Trilha
    this.trilhaGain = ctx.createGain(); this.trilhaGain.gain.value = 0;
    const tf = ctx.createBiquadFilter(); tf.type = 'lowpass'; tf.frequency.value = 1800;
    this.trilhaGain.connect(tf); tf.connect(this.master); tf.connect(this.reverb);
  }

  /** Chamado dentro do toque em "Entrar": libera o som em todos os navegadores (inclusive iPhone). */
  async entrar() {
    this.preparar();
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      // Safari 17+: toca mesmo com o iPhone no modo silencioso
      const nav = navigator as Navigator & { audioSession?: { type: string } };
      if (nav.audioSession) nav.audioSession.type = 'playback';
    } catch { /* ignore */ }
    const s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(ctx.destination); s.start(0);
    if (ctx.state !== 'running') await ctx.resume().catch(() => {});
    this.aplicarVolume(0.8);
    if (this.timer == null) this.timer = window.setInterval(() => this.agendar(), 120);
    document.addEventListener('visibilitychange', this.visib);
  }

  private visib = () => {
    if (!this.ctx) return;
    if (document.hidden) this.ctx.suspend().catch(() => {});
    else if (this.ligado) this.ctx.resume().catch(() => {});
  };

  get ativo() { return this.ligado; }

  alternar(on: boolean) {
    this.ligado = on;
    if (!this.ctx) return;
    if (on) { this.ctx.resume().catch(() => {}); this.aplicarVolume(0.8); }
    else this.aplicarVolume(0);
  }

  private aplicarVolume(v: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(this.ligado ? v : 0, t, 0.25);
  }

  /** Recebe o progresso da abertura (0 a 1) e se ela já terminou. */
  atualizar(p: number, depois: boolean) {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    // tensão entre 25% e 64% da rolagem
    const ten = p < 0.25 ? 0 : p > 0.645 ? 0 : Math.pow((p - 0.25) / 0.395, 1.6);
    this.tensao = ten;
    this.tenGain.gain.setTargetAtTime(ten * 0.9, t, 0.08);
    this.tenOsc.frequency.setTargetAtTime(70 + ten * 150, t, 0.1);
    this.tenOsc2.frequency.setTargetAtTime(70.7 + ten * 152, t, 0.1);
    this.tenFiltro.frequency.setTargetAtTime(200 + ten * 2600, t, 0.1);
    this.ambGain.gain.setTargetAtTime(depois ? 0.12 : p > 0.66 ? 0.25 : 0.5, t, 0.4);
    const trilha = depois ? 0.22 : p < 0.66 ? 0 : Math.min(1, (p - 0.66) / 0.3) * 0.6;
    this.trilhaGain.gain.setTargetAtTime(trilha, t, 0.5);

    if (p >= 0.645 && !this.disparouImpacto) { this.disparouImpacto = true; this.impacto(); }
    if (p < 0.55) this.disparouImpacto = false;
    if (p >= 0.9 && !this.disparouBrilho) { this.disparouBrilho = true; this.brilho(); }
    if (p < 0.82) this.disparouBrilho = false;
  }

  /** Agenda pulsação da tensão e os acordes da trilha um pouco à frente (sem engasgos). */
  private agendar() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const agora = ctx.currentTime;
    if (this.tensao > 0.05) {
      if (this.pulsoProx < agora) this.pulsoProx = agora + 0.05;
      while (this.pulsoProx < agora + 0.3) {
        this.pulso(this.pulsoProx, this.tensao);
        this.pulsoProx += 0.85 - this.tensao * 0.55; // acelera com a tensão
      }
    }
    if (this.trilhaGain.gain.value > 0.005 || this.proxAcorde === 0) {
      if (this.proxAcorde < agora) this.proxAcorde = agora + 0.05;
      while (this.proxAcorde < agora + 0.5) {
        this.acorde(this.proxAcorde, ACORDES[this.acordeIdx % ACORDES.length]);
        this.acordeIdx++;
        this.proxAcorde += 3.2;
      }
    }
  }

  private pulso(t: number, forca: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2 + forca * 0.3, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.3);
  }

  private acorde(t: number, notas: number[]) {
    const ctx = this.ctx!;
    notas.forEach((f, i) => {
      [0, 4].forEach((det) => {
        const o = ctx.createOscillator(); o.type = i === 0 ? 'triangle' : 'sine';
        o.frequency.value = f * (i === 0 ? 0.5 : 1); o.detune.value = det;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + 1.2); g.gain.linearRampToValueAtTime(0.0001, t + 3.6);
        o.connect(g).connect(this.trilhaGain); o.start(t); o.stop(t + 3.7);
      });
    });
  }

  impacto() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime + 0.01;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(32, t + 0.9);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.75, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 1.7);
    const n = ctx.createBufferSource(); n.buffer = this.ruidoBuf;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(5000, t); f.frequency.exponentialRampToValueAtTime(300, t + 0.4);
    const ng = ctx.createGain(); ng.gain.setValueAtTime(0.5, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    n.connect(f).connect(ng); ng.connect(this.master); ng.connect(this.reverb); n.start(t); n.stop(t + 0.7);
    try { navigator.vibrate?.(60); } catch { /* ignore */ }
  }

  brilho() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const t0 = ctx.currentTime + 0.02;
    [1318.5, 1760, 2093, 2637].forEach((f, i) => {
      const t = t0 + i * 0.09;
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      o.connect(g); g.connect(this.master); g.connect(this.reverb); o.start(t); o.stop(t + 1.9);
    });
  }

  /** Saída de áudio para gravar a demonstração (só usada nos testes). */
  saidaParaGravacao(): MediaStream | null {
    if (!this.ctx) return null;
    const d = this.ctx.createMediaStreamDestination();
    this.saida.connect(d);
    return d.stream;
  }
}

export const somAbertura = new SomAbertura();
