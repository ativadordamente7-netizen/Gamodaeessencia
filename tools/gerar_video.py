"""Vídeo vertical (Reels/Status) da GA Moda & Essência — versão 1, com fotos reais da loja.
Gera quadros com Pillow e codifica com ffmpeg (1080x1920, 30 fps, H.264).
"""
import subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
PUB = '/home/claude/ga/work/public'
ORIG = '/home/claude/ga/work/fotos-originais'
OUT = '/home/claude/ga/video/ga-novidades-v1.mp4'

CREME = (250, 247, 242)
PRETO = (24, 24, 24)
DOURADO = (212, 163, 115)
MARROM = (122, 92, 64)

f = lambda n, s: ImageFont.truetype(f'/home/claude/ga/video/fonts/{n}.woff', s)
PF = lambda s: f('pf800', s)
PFI = lambda s: f('pf700i', s)
PJ = lambda s: f('pj700', s)
PJ5 = lambda s: f('pj500', s)

logo = Image.open(f'{PUB}/logo-ga.webp').convert('RGBA')
dono = Image.open(f'{ORIG}/dono.jpg').convert('RGB')

PRODUTOS = [
    ('nike-dunk-low-panda-preto-branco', 'NIKE', 'Dunk Low', '4 cores · Nº 34 ao 43'),
    ('new-balance-9060-off-white-castor', 'NEW BALANCE', '9060', '5 cores · Nº 34 ao 41'),
    ('adidas-samba-branco-preto', 'ADIDAS', 'Samba', 'Nº 34 ao 39'),
    ('tommy-hilfiger-caramelo', 'TOMMY HILFIGER', 'Tênis Tommy', '3 cores · Nº 38 ao 43'),
    ('hugo-boss-sapatenis-caramelo', 'HUGO BOSS', 'Sapatênis', '2 cores · Nº 38 ao 43'),
    ('nike-air-force-1-preto-trancado', 'NIKE', 'Air Force 1', '3 cores · Nº 34 ao 43'),
    ('vans-knu-preto-branco', 'VANS', 'Knu', '2 cores · Nº 34 ao 43'),
    ('puma-180-xl-off-white-azul-claro', 'PUMA', '180 XL', 'Nº 34 ao 39'),
    ('nike-mind-bolha-preto-laranja', 'NIKE', 'Mind Bolha', '3 cores · Nº 34 ao 43'),
]
fotos = {p[0]: Image.open(f'{PUB}/produtos/{p[0]}.webp').convert('RGB') for p in PRODUTOS}

ease = lambda t: 1 - (1 - max(0, min(1, t))) ** 3


def centro(d, y, txt, font, fill, alpha=255):
    w = d.textlength(txt, font=font)
    d.text(((W - w) / 2, y), txt, font=font, fill=fill + (alpha,) if len(fill) == 3 else fill)


def texto(img, y, txt, font, fill, a=1.0, dy=0):
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    centro(d, y + dy, txt, font, fill, int(255 * a))
    img.alpha_composite(layer)


def cover(im, w, h, zoom=1.0):
    r = max(w / im.width, h / im.height) * zoom
    im2 = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    x, y = (im2.width - w) // 2, (im2.height - h) // 3
    return im2.crop((x, y, x + w, y + h))


def cena_abertura(t, dur):
    img = Image.new('RGBA', (W, H), PRETO + (255,))
    a = ease(t / 0.6)
    lg = logo.copy(); lg.thumbnail((360, 360))
    lg.putalpha(lg.getchannel('A').point(lambda v: int(v * a)))
    img.alpha_composite(lg, ((W - lg.width) // 2, 520))
    texto(img, 960, 'Toda semana', PF(104), CREME, ease((t - 0.4) / 0.5), 30 * (1 - ease((t - 0.4) / 0.5)))
    texto(img, 1080, 'chega novidade.', PFI(104), DOURADO, ease((t - 0.8) / 0.5), 30 * (1 - ease((t - 0.8) / 0.5)))
    return img


def cena_dono(t, dur):
    z = 1.0 + 0.08 * (t / dur)
    img = cover(dono, W, H, z).convert('RGBA')
    grad = Image.linear_gradient('L').resize((W, H)).point(lambda v: int(max(0, v - 90) * 1.5))
    sombra = Image.new('RGBA', (W, H), (0, 0, 0, 255)); sombra.putalpha(grad)
    img.alpha_composite(sombra)
    texto(img, 1180, 'Loja de verdade.', PF(96), CREME, ease(t / 0.5), 24 * (1 - ease(t / 0.5)))
    texto(img, 1300, 'Gente de verdade.', PFI(96), DOURADO, ease((t - 0.4) / 0.5), 24 * (1 - ease((t - 0.4) / 0.5)))
    texto(img, 1440, 'SERRA GAÚCHA', PJ(34), (230, 225, 215), ease((t - 0.8) / 0.5))
    return img


def cena_produto(t, dur, idx):
    pid, marca, nome, info = PRODUTOS[idx]
    img = Image.new('RGBA', (W, H), CREME + (255,))
    d = ImageDraw.Draw(img)
    centro(d, 250, 'NOVIDADES DA SEMANA', PJ(32), MARROM)
    centro(d, 300, f'{idx + 1:02d} / {len(PRODUTOS):02d}', PJ5(26), (150, 130, 110))
    # foto entra deslizando
    k = ease(t / 0.35)
    cw, ch = 880, 1100
    z = 1.0 + 0.05 * (t / dur)
    foto = cover(fotos[pid], cw, ch, z)
    m = Image.new('L', (cw, ch), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, cw, ch), 36, fill=255)
    x = int((W - cw) / 2 + (1 - k) * 260)
    sh = Image.new('RGBA', (cw + 80, ch + 80), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((40, 60, cw + 40, ch + 40), 36, fill=(80, 60, 40, int(70 * k)))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(24)), (x - 40, 370 - 40))
    fl = foto.convert('RGBA'); fl.putalpha(m.point(lambda v: int(v * k)))
    img.alpha_composite(fl, (x, 370))
    a = ease((t - 0.2) / 0.4)
    texto(img, 1505, marca, PJ(34), MARROM, a)
    texto(img, 1550, nome, PF(92), PRETO, a, 16 * (1 - a))
    texto(img, 1670, info, PJ5(34), (90, 80, 70), ease((t - 0.35) / 0.4))
    return img


def cena_final(t, dur):
    img = Image.new('RGBA', (W, H), PRETO + (255,))
    a = ease(t / 0.5)
    lg = logo.copy(); lg.thumbnail((300, 300))
    lg.putalpha(lg.getchannel('A').point(lambda v: int(v * a)))
    img.alpha_composite(lg, ((W - lg.width) // 2, 380))
    texto(img, 780, 'Escolha na vitrine', PF(88), CREME, ease((t - 0.3) / 0.5))
    texto(img, 900, 'gamodaeessencia.com.br', PJ(50), DOURADO, ease((t - 0.6) / 0.5))
    # botão WhatsApp
    b = ease((t - 1.0) / 0.5)
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    bw, bh = 760, 130; bx, by = (W - bw) // 2, 1080
    d.rounded_rectangle((bx, by, bx + bw, by + bh), 65, fill=(15, 122, 64, int(255 * b)))
    txt = 'Consulte pelo WhatsApp'; fnt = PJ(46)
    d.text(((W - d.textlength(txt, font=fnt)) / 2, by + 38), txt, font=fnt, fill=(255, 255, 255, int(255 * b)))
    img.alpha_composite(layer)
    texto(img, 1260, '@g.a_moda_e_essencia_reserva', PJ5(36), (200, 190, 175), ease((t - 1.3) / 0.5))
    return img


CENAS = [(cena_abertura, 2.6), (cena_dono, 3.0)] + [((lambda i: lambda t, d: cena_produto(t, d, i))(i), 1.6) for i in range(len(PRODUTOS))] + [(cena_final, 4.0)]

ff = subprocess.Popen([
    'ffmpeg', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
    '-shortest', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', OUT,
], stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

FADE = 0.2
prev_last = None
for cena, dur in CENAS:
    n = int(dur * FPS)
    for i in range(n):
        t = i / FPS
        fr = cena(t, dur).convert('RGB')
        if prev_last is not None and t < FADE:
            fr = Image.blend(prev_last, fr, t / FADE)
        ff.stdin.write(fr.tobytes())
    prev_last = cena(dur, dur).convert('RGB')
ff.stdin.close(); ff.wait()
print('ok', OUT)
