"""List referenced images over 120 KB with their pixel size (for the production weight pass)."""
import os, glob
from PIL import Image

src = ''
for f in glob.glob('src/**/*.*', recursive=True):
    if f.endswith(('.jsx', '.js', '.css')):
        src += open(f, encoding='utf8', errors='ignore').read()
rows = []
for f in glob.glob('public/assets/**/*.webp', recursive=True) + glob.glob('public/assets/**/*.jp*g', recursive=True):
    size = os.path.getsize(f)
    if size < 120 * 1024:
        continue
    rel = f.replace(os.sep, '/')[len('public'):]
    name = os.path.basename(f)
    if not (rel in src or name in src or name.replace('.webp', '.png') in src):
        continue
    w, h = Image.open(f).size
    rows.append((size // 1024, w, h, rel))
for r in sorted(rows, reverse=True):
    print(*r)
