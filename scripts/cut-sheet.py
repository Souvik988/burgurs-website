"""Cut a generated sticker sheet on a white background into transparent WebP pieces.

usage: python -I scripts/cut-sheet.py <sheet.png> <out_dir> <cols> <rows> <name1,name2,...|-> [--mode ink|paper] [--pad N]

ink   : single-colour line art -> alpha from distance to white, colour forced to the ink.
paper : full-colour art -> white background flood-filled from the edges and removed.
Names may be '-' to skip a cell.
"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter
from collections import deque

args = sys.argv[1:]
mode = 'ink'
pad = 12
if '--mode' in args:
    i = args.index('--mode'); mode = args[i + 1]; del args[i:i + 2]
if '--pad' in args:
    i = args.index('--pad'); pad = int(args[i + 1]); del args[i:i + 2]
sheet, out, cols, rows, names = args[0], args[1], int(args[2]), int(args[3]), args[4].split(',')
os.makedirs(out, exist_ok=True)
im = Image.open(sheet).convert('RGB')
W, H = im.size
arr = np.asarray(im).astype(np.int16)


def flood_background(a, tol=28):
    """Mask of near-white pixels connected to the cell border."""
    h, w, _ = a.shape
    white = (a.min(axis=2) > 255 - tol) & ((a.max(axis=2) - a.min(axis=2)) < 24)
    bg = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if white[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if white[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and white[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True; q.append((ny, nx))
    return bg


for idx, name in enumerate(names):
    if name == '-' or idx >= cols * rows:
        continue
    c, r = idx % cols, idx // cols
    x0, x1 = int(c * W / cols), int((c + 1) * W / cols)
    y0, y1 = int(r * H / rows), int((r + 1) * H / rows)
    cell = arr[y0:y1, x0:x1]
    if mode == 'ink':
        darkness = 255 - cell.min(axis=2)  # how far from white
        alpha = np.clip((darkness - 18) * 255 / 150, 0, 255).astype(np.uint8)
        rgba = np.zeros(cell.shape[:2] + (4,), np.uint8)
        rgba[..., 0], rgba[..., 1], rgba[..., 2] = 249, 24, 20
        rgba[..., 3] = alpha
    else:
        bg = flood_background(cell)
        alpha = np.where(bg, 0, 255).astype(np.uint8)
        a_img = Image.fromarray(alpha).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.7))
        rgba = np.dstack([cell.astype(np.uint8), np.asarray(a_img)])
    piece = Image.fromarray(rgba, 'RGBA')
    bbox = piece.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    if not bbox:
        print('empty', name); continue
    bx0, by0, bx1, by1 = bbox
    piece = piece.crop((max(bx0 - pad, 0), max(by0 - pad, 0), min(bx1 + pad, piece.width), min(by1 + pad, piece.height)))
    piece.save(os.path.join(out, name + '.webp'), 'WEBP', quality=88, method=6)
    print(name, piece.size)
