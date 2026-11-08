import sys, glob, os
from PIL import Image, ImageDraw
# usage: sheet.py <dir> <out> <cols> <start> <count> [thumbw]
d, out, cols, start, count = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
tw = int(sys.argv[6]) if len(sys.argv) > 6 else 260
fs = sorted(glob.glob(os.path.join(d, '*.jpg')))[start:start + count]
ims = [Image.open(f) for f in fs]
th = int(ims[0].height * tw / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw, rows * (th + 16)), 'white'); dr = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(fs, ims)):
    x, y = (i % cols) * tw, (i // cols) * (th + 16)
    sheet.paste(im.resize((tw, th)), (x, y + 16)); dr.text((x + 3, y + 2), os.path.basename(f)[2:5], fill='black')
sheet.save(out, quality=72)
