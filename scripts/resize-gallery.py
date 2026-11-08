"""Right-size the homepage gallery images (shown ~300px wide). Originals go to art-masters/originals."""
import glob, os, shutil
from PIL import Image

targets = [(f, 640) for f in glob.glob('public/assets/kolkata/kolkata-diner-*.webp')]
targets += [('public/assets/kolkata/kolkata-photo-frame-v2.webp', 760), ('public/assets/kolkata/kolkata-tram-sticker-v2.webp', 620)]
for f, w in targets:
    f = f.replace(os.sep, '/')
    im = Image.open(f)
    im.load()
    if im.width <= w:
        continue
    dst = 'art-masters/originals/' + f[len('public/'):]
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if not os.path.exists(dst):
        shutil.copy2(f, dst)
    before = os.path.getsize(f)
    im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(f, 'WEBP', quality=76, method=6)
    print(f, before // 1024, '->', os.path.getsize(f) // 1024, 'K')
