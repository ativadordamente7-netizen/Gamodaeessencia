"""Tratamento padrão das fotos da vitrine GA Moda & Essência.

O que faz (sem alterar o produto em si):
- aumenta a resolução com super-resolução (FSRCNN x2)
- corrige contraste e luz de forma suave (CLAHE no canal de luminância)
- realça nitidez levemente
- padroniza em 4:5 (960x1200); fotos muito largas ficam centralizadas sobre fundo creme da marca
- exporta WebP em 3 tamanhos: 960 (tela grande), 720 (celular) e 480 (miniaturas)

Uso: python3 tratar_fotos.py <pasta_entrada> <pasta_saida>
"""
import sys, os, glob
import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

W, H = 960, 1200
RATIO = H / W
HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = os.path.join(HERE, '..', 'models', 'FSRCNN_x2.pb')

sr = cv2.dnn_superres.DnnSuperResImpl_create()
sr.readModel(MODEL)
sr.setModel('fsrcnn', 2)


def upscale(bgr):
    return sr.upsample(bgr)


def tone(bgr):
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=1.3, tileGridSize=(8, 8))
    l = clahe.apply(l)
    out = cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)
    return out


def to_pil(bgr):
    return Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))


def cover(im, w, h):
    r = max(w / im.width, h / im.height)
    im2 = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    x = (im2.width - w) // 2
    y = (im2.height - h) // 2
    return im2.crop((x, y, x + w, y + h))


def contain_on_blur(im, w, h):
    # fundo creme da identidade da loja, com leve degradê
    bg = Image.new('RGB', (w, h), (243, 238, 230))
    grad = Image.linear_gradient('L').resize((w, h))
    bg = Image.composite(Image.new('RGB', (w, h), (233, 225, 212)), bg, grad.point(lambda v: v * 0.6))
    r = min(w / im.width, h / im.height) * 0.94
    fg = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    # sombra suave
    shadow = Image.new('RGBA', (fg.width + 60, fg.height + 60), (0, 0, 0, 0))
    sh = Image.new('RGBA', fg.size, (0, 0, 0, 90))
    shadow.paste(sh, (30, 40))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    canvas = bg.convert('RGBA')
    x = (w - fg.width) // 2
    y = (h - fg.height) // 2
    canvas.alpha_composite(shadow, (x - 30, y - 30))
    mask = Image.new('L', fg.size, 0)
    from PIL import ImageDraw
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, fg.width, fg.height), radius=22, fill=255)
    canvas.paste(fg, (x, y), mask)
    return canvas.convert('RGB')


def process(path, outdir):
    name = os.path.splitext(os.path.basename(path))[0]
    bgr = cv2.imread(path)
    bgr = upscale(bgr)
    bgr = tone(bgr)
    im = to_pil(bgr)
    im = ImageEnhance.Color(im).enhance(1.05)
    ratio = im.height / im.width
    if 0.97 <= ratio <= 1.40:
        out = cover(im, W, H)
    else:
        out = contain_on_blur(im, W, H)
    out = out.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))
    out.save(os.path.join(outdir, name + '.webp'), 'WEBP', quality=84, method=6)
    out.resize((720, 900), Image.LANCZOS).save(os.path.join(outdir, name + '-720.webp'), 'WEBP', quality=80, method=6)
    thumb = out.resize((480, 600), Image.LANCZOS)
    thumb.save(os.path.join(outdir, name + '-480.webp'), 'WEBP', quality=80, method=6)
    return name


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    os.makedirs(dst, exist_ok=True)
    files = sorted(glob.glob(os.path.join(src, '*.jpg')) + glob.glob(os.path.join(src, '*.jpeg')) + glob.glob(os.path.join(src, '*.png')))
    only = set(sys.argv[3:])
    for f in files:
        n = os.path.splitext(os.path.basename(f))[0]
        if only and n not in only:
            continue
        print('ok', process(f, dst), flush=True)
