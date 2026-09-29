#!/usr/bin/env python3
import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 900, 500
HERE = os.path.dirname(__file__)
OUT = os.path.join(HERE, '..', 'gameclub_post_cover_900x500.jpg')
FP = '/System/Library/Fonts/PingFang.ttc'

def face(size, want=('Semibold', 'Medium', 'Regular')):
    for i in range(12):
        try:
            f = ImageFont.truetype(FP, size, index=i)
            if any(w in f.getname()[0] for w in want):
                return f
        except Exception:
            break
    return ImageFont.truetype(FP, size)

img = Image.new('RGB', (W, H), (48, 72, 90))
d = ImageDraw.Draw(img)
for y in range(H):
    t = y / H
    c = (int(40 + (62 - 40) * t), int(62 + (90 - 62) * t), int(82 + (106 - 82) * t))
    d.line([(0, y), (W, y)], fill=c)

_seed = 11
def rnd(n):
    global _seed
    _seed = (_seed * 1103515245 + 12345) % (2 ** 31)
    return (int(_seed) / 2 ** 31) * n

glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse([520, -160, 1000, 260], fill=(255, 255, 255, 70))
gd.ellipse([-120, 220, 300, 520], fill=(255, 226, 170, 50))
glow = glow.filter(ImageFilter.GaussianBlur(60))
ov = img.convert('RGBA')
ov = Image.alpha_composite(ov, glow)

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
    ld.rounded_rectangle([4, 4, int(L) + 3, int(thickness) + 3], radius=int(thickness * 0.28),
                         outline=(int(96 * shade), int(68 * shade), int(42 * shade), 200), width=3)
    return lay.rotate(-math.degrees(ang), expand=True, resample=Image.BICUBIC)

main_plank = plank(430, 430, 870, 408, 52)
sh = Image.new('RGBA', main_plank.size, (0, 0, 0, 0))
ImageDraw.Draw(sh).rounded_rectangle([8, 12, main_plank.size[0] - 8, main_plank.size[1] - 2],
                                     radius=14, fill=(15, 10, 6, 90))
sh = sh.filter(ImageFilter.GaussianBlur(6))
ov.paste(sh, (438, 392), sh)
ov.paste(main_plank, (432, 378), main_plank)
for i, nm in enumerate(['red', 'yellow', 'blue', 'green', 'red']):
    screw(ov, 492 + i * 88, int(410 + math.sin(i * 1.3) * 4), 21, nm)

far = plank(620, 120, 850, 106, 30, shade=0.62).filter(ImageFilter.GaussianBlur(1.2))
ov.paste(far, (610, 76), far)
for i, nm in enumerate(['blue', 'red']):
    screw(ov, 664 + i * 96, 96 - i * 3, 13, nm, shade=0.66)

arc = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(arc).arc([640, 150, 780, 280], start=150, end=300, fill=(255, 150, 40, 150), width=7)
ov = Image.alpha_composite(ov, arc)
screw(ov, 712, 208, 32, 'yellow')
d2 = ImageDraw.Draw(ov)
for k in range(10):
    a = k * math.pi / 5 + 0.3
    r1, r2 = 42, 55 + (k % 2) * 9
    d2.polygon([(int(712 + math.cos(a) * r1), int(208 + math.sin(a) * r1)),
                (int(712 + math.cos(a + 0.16) * r2), int(208 + math.sin(a + 0.16) * r2)),
                (int(712 + math.cos(a + 0.32) * r1), int(208 + math.sin(a + 0.32) * r1))],
               fill=(255, 205, 70, 140))

confetti = Image.new('RGBA', (W, H), (0, 0, 0, 0))
cd = ImageDraw.Draw(confetti)
palette = [(231, 76, 60), (52, 152, 219), (241, 196, 15), (46, 204, 113), (155, 89, 182), (255, 149, 0)]
for i in range(64):
    x, y = rnd(W), rnd(H * 0.9)
    w = int(4 + rnd(6))
    h = int(8 + rnd(10))
    rot = rnd(180) - 90
    col = palette[i % len(palette)] + (int(150 + rnd(90)),)
    piece = Image.new('RGBA', (24, 24), (0, 0, 0, 0))
    ImageDraw.Draw(piece).rectangle([12 - w // 2, 12 - h // 2, 12 + w // 2, 12 + h // 2], fill=col)
    piece = piece.rotate(rot)
    confetti.alpha_composite(piece, (int(x) - 12, int(y) - 12))
confetti = confetti.filter(ImageFilter.GaussianBlur(0.4))
ov = Image.alpha_composite(ov, confetti)

d3 = ImageDraw.Draw(ov)
d3.text((64, 108), '游戏圈开张啦', font=face(78), fill=(255, 255, 255, 255))

ft_tag = face(26)
tag = '《拧螺丝啦》官方入驻'
tb = d3.textbbox((0, 0), tag, font=ft_tag)
tw = tb[2] - tb[0]
thh = tb[3] - tb[1]
pill_h = thh + 26
pill_y = 226
d3.rounded_rectangle([66, pill_y, 66 + tw + 48, pill_y + pill_h],
                     radius=pill_h // 2, fill=(255, 149, 0, 255))
d3.text((66 + 24 - tb[0], pill_y + (pill_h - thh) // 2 - tb[1]), tag,
        font=ft_tag, fill=(255, 255, 255, 255))

d3.text((66, 306), '新关卡情报 · 卡关求助 · 创意采纳', font=face(30), fill=(220, 232, 240, 235))
d3.text((66, 366), '进圈先扣个「拧！」', font=face(26), fill=(255, 205, 70, 220))

out = ov.convert('RGB')
for q in (88, 82, 76):
    out.save(OUT, quality=q)
    if os.path.getsize(OUT) <= 200 * 1024:
        break
print(os.path.basename(OUT), out.size, os.path.getsize(OUT) // 1024, 'KB')
