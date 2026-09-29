#!/usr/bin/env python3
import math
import os
from PIL import Image, ImageDraw, ImageFilter

W, H = 750, 280
OUT = os.path.join(os.path.dirname(__file__), '..', 'gameclub_atmosphere_750x280.jpg')

img = Image.new('RGB', (W, H), (52, 78, 96))
d = ImageDraw.Draw(img)
for y in range(H):
    t = y / H
    c = (int(44 + (66 - 44) * t), int(68 + (96 - 68) * t), int(88 + (112 - 88) * t))
    d.line([(0, y), (W, y)], fill=c)

_seed = 7
def rnd(n):
    global _seed
    _seed = (_seed * 1103515245 + 12345) % (2 ** 31)
    return (int(_seed) / 2 ** 31) * n

def plank(x1, y1, x2, y2, thickness, shade=1.0):
    ang = math.atan2(y2 - y1, x2 - x1)
    L = math.hypot(x2 - x1, y2 - y1)
    lay = Image.new('RGBA', (int(L) + 8, int(thickness) + 8), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lay)
    base = (int(178 * shade), int(136 * shade), int(92 * shade))
    darkc = (int(120 * shade), int(88 * shade), int(56 * shade))
    for i in range(int(thickness)):
        t = i / thickness
        col = (int(base[0] + (darkc[0] - base[0]) * t),
               int(base[1] + (darkc[1] - base[1]) * t),
               int(base[2] + (darkc[2] - base[2]) * t))
        ld.line([(4, i + 4), (int(L) + 4, i + 4)], fill=col + (255,))
    for gy in (0.35, 0.68):
        ld.line([(10, int(4 + thickness * gy)), (int(L), int(4 + thickness * gy))],
                fill=(int(90 * shade), int(64 * shade), int(40 * shade), 46), width=2)
    ld.rounded_rectangle([4, 4, int(L) + 3, int(thickness) + 3],
                         radius=int(thickness * 0.28),
                         outline=(int(96 * shade), int(68 * shade), int(42 * shade), 200), width=3)
    return lay.rotate(-math.degrees(ang), expand=True, resample=Image.BICUBIC)

COLORS = {
    'red': ((235, 110, 96), (200, 52, 40), (130, 36, 28)),
    'blue': ((110, 180, 230), (42, 130, 200), (26, 84, 130)),
    'yellow': ((245, 208, 80), (216, 170, 20), (140, 108, 12)),
    'green': ((110, 215, 150), (38, 165, 95), (24, 110, 64)),
}

def screw(im, cx, cy, r, name, shade=1.0):
    lite, main, dark = COLORS[name]
    lite = tuple(int(v * shade) for v in lite)
    main = tuple(int(v * shade) for v in main)
    dark = tuple(int(v * shade) for v in dark)
    sd = ImageDraw.Draw(im)
    sd.ellipse([cx - r, cy - r + 3, cx + r, cy + r + 3], fill=(20, 15, 10, 90))
    sd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=dark + (255,))
    sd.ellipse([cx - int(r * .86), cy - int(r * .86), cx + int(r * .86), cy + int(r * .86)], fill=main + (255,))
    sd.ellipse([cx - int(r * .52), cy - int(r * .52), cx + int(r * .52), cy + int(r * .52)], fill=lite + (255,))
    th, L = int(r * .26), int(r * .66)
    sd.rounded_rectangle([cx - L, cy - th, cx + L, cy + th], radius=th, fill=(70, 22, 16, 255))
    sd.rounded_rectangle([cx - th, cy - L, cx + th, cy + L], radius=th, fill=(70, 22, 16, 255))
    sd.ellipse([cx - int(r * .32), cy - int(r * .44), cx - int(r * .06), cy - int(r * .18)],
               fill=(255, 255, 255, 110))

ov = img.convert('RGBA')

far = plank(40, 92, 300, 74, 34, shade=0.62).filter(ImageFilter.GaussianBlur(1.2))
ov.paste(far, (20, 40), far)
for i, nm in enumerate(['blue', 'red']):
    screw(ov, 96 + i * 108, 72 - i * 4, 15, nm, shade=0.66)

main_plank = plank(60, 214, 690, 196, 58)
sh = Image.new('RGBA', main_plank.size, (0, 0, 0, 0))
ImageDraw.Draw(sh).rounded_rectangle([8, 14, main_plank.size[0] - 8, main_plank.size[1] - 2],
                                     radius=16, fill=(15, 10, 6, 90))
sh = sh.filter(ImageFilter.GaussianBlur(7))
ov.paste(sh, (52, 172), sh)
ov.paste(main_plank, (56, 162), main_plank)
for i, nm in enumerate(['red', 'green', 'yellow', 'blue', 'red', 'green']):
    screw(ov, 120 + i * 100, int(196 + math.sin(i * 1.2) * 5), 23, nm)

def draw_screwdriver():
    dw, dh = 220, 48
    lay = Image.new('RGBA', (dw, dh), (0, 0, 0, 0))
    ld = ImageDraw.Draw(lay)
    cy = dh // 2
    ld.polygon([(2, cy - 2), (12, cy - 4), (12, cy + 4), (2, cy + 2)],
               fill=(196, 204, 212, 255))
    ld.rectangle([12, cy - 4, 104, cy + 4], fill=(168, 178, 190, 255))
    ld.line([(12, cy - 3), (104, cy - 3)], fill=(222, 228, 235, 255), width=1)
    ld.line([(12, cy + 3), (104, cy + 3)], fill=(110, 120, 132, 255), width=1)
    ld.rounded_rectangle([102, cy - 8, 116, cy + 8], radius=3, fill=(120, 130, 142, 255))
    ld.rounded_rectangle([114, cy - 13, 214, cy + 13], radius=12, fill=(216, 122, 38, 255))
    ld.rounded_rectangle([114, cy - 13, 214, cy - 2], radius=8, fill=(240, 150, 60, 255))
    for gx in (136, 154, 172):
        ld.line([(gx, cy - 10), (gx, cy + 10)], fill=(168, 88, 24, 255), width=3)
    ld.ellipse([200, cy - 9, 214, cy + 9], fill=(190, 100, 30, 255))
    return lay

drv = draw_screwdriver().rotate(28, expand=True, resample=Image.BICUBIC)
dshadow = Image.new('RGBA', drv.size, (0, 0, 0, 0))
dshadow.paste((15, 12, 8, 80), (0, 0), drv.split()[3])
dshadow = dshadow.filter(ImageFilter.GaussianBlur(4))
dx, dy = 560, 26
tool = Image.new('RGBA', (W, H), (0, 0, 0, 0))
tool.paste(dshadow, (dx + 4, dy + 7), dshadow)
tool.paste(drv, (dx, dy), drv)
ov = Image.alpha_composite(ov, tool)

arc = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(arc).arc([330, 26, 470, 150], start=150, end=300, fill=(255, 150, 40, 150), width=7)
ov = Image.alpha_composite(ov, arc)
screw(ov, 405, 82, 34, 'yellow')
d2 = ImageDraw.Draw(ov)
for k in range(10):
    a = k * math.pi / 5 + 0.3
    r1, r2 = 44, 58 + (k % 2) * 10
    d2.polygon([(int(405 + math.cos(a) * r1), int(82 + math.sin(a) * r1)),
                (int(405 + math.cos(a + 0.16) * r2), int(82 + math.sin(a + 0.16) * r2)),
                (int(405 + math.cos(a + 0.32) * r1), int(82 + math.sin(a + 0.32) * r1))],
               fill=(255, 205, 70, 140))

dust = Image.new('RGBA', (W, H), (0, 0, 0, 0))
dd = ImageDraw.Draw(dust)
for _ in range(46):
    x, y = int(rnd(W)), int(rnd(H * 0.75))
    r = int(1 + rnd(2.6))
    al = int(26 + rnd(50))
    col = (255, 224, 170, al) if rnd(1) > 0.5 else (200, 225, 245, al)
    dd.ellipse([x - r, y - r, x + r, y + r], fill=col)
ov = Image.alpha_composite(ov, dust)

out = ov.convert('RGB')
for q in (88, 82, 76):
    out.save(OUT, quality=q)
    if os.path.getsize(OUT) <= 80 * 1024:
        break
print(os.path.basename(OUT), out.size, os.path.getsize(OUT) // 1024, 'KB')
