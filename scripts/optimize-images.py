"""Production image pass: re-encode heavy, referenced images at the size they are actually shown.

Originals are copied to art-masters/originals/<same path> before anything is overwritten, and a file
is only replaced when the new encode is smaller. Run from the project root:  python scripts/optimize-images.py
"""
import os, glob, shutil
from PIL import Image

ROOT = 'public'
BACKUP = 'art-masters/originals'
src = ''
for f in glob.glob('src/**/*.*', recursive=True):
    if f.endswith(('.jsx', '.js', '.css')):
        src += open(f, encoding='utf8', errors='ignore').read()

# Longest side to keep, by how the image is used on the page.
special = {
    '/assets/kolkata/doodle-stickers-v4.webp': (800, 400),   # 4x2 sprite, cells shown <= 120px
    '/assets/kolkata/burger-eyes-v4.webp': (640, None),      # shown <= 26% of a burger photo
}
def max_side(rel):
    if '/menu/edited/' in rel: return 820          # cards <= 440px, detail dialog ~600px
    if '/menu/source/' in rel: return 1200         # original-photo comparison
    if '/founder/' in rel or '/media/' in rel: return 1100
    if '/menu/motion/' in rel: return 900
    return 1600

saved = 0
for f in glob.glob(f'{ROOT}/assets/**/*.*', recursive=True):
    if not f.lower().endswith(('.webp', '.jpg', '.jpeg')):
        continue
    if '/src/' in f.replace(os.sep, '/'):
        continue
    size = os.path.getsize(f)
    if size < 110 * 1024:
        continue
    rel = f.replace(os.sep, '/')[len(ROOT):]
    name = os.path.basename(f)
    if not (rel in src or name in src or name.replace('.webp', '.png') in src):
        continue
    im = Image.open(f)
    im.load()
    if rel in special:
        tw, th = special[rel]
        new = im.resize((tw, th if th else round(im.height * tw / im.width)), Image.LANCZOS)
    else:
        m = max_side(rel)
        scale = min(1, m / max(im.size))
        new = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS) if scale < 1 else im
    tmp = f + '.tmp'
    if f.lower().endswith('.webp'):
        new.save(tmp, 'WEBP', quality=74, method=6)
    else:
        new.convert('RGB').save(tmp, 'JPEG', quality=80, optimize=True, progressive=True)
    nsize = os.path.getsize(tmp)
    if nsize < size * .95:
        dst = os.path.join(BACKUP, rel.lstrip('/'))
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.exists(dst):
            shutil.copy2(f, dst)
        os.replace(tmp, f)
        saved += size - nsize
        print(f'{rel}: {size // 1024}K -> {nsize // 1024}K  {im.size} -> {new.size}')
    else:
        os.remove(tmp)
print(f'saved {saved / 1048576:.2f} MB')
