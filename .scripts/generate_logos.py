from PIL import Image
import os

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
source_candidates = [
    os.path.join(root, 'Logo.png'),
    os.path.join(root, 'logo.png'),
    os.path.join(root, 'assets', 'source-logo.png'),
    os.path.join(root, 'assets', 'Logo.png'),
]
source = None
for p in source_candidates:
    if os.path.exists(p):
        source = p
        break

if not source:
    print('ERROR: No source logo found. Looked for:', source_candidates)
    raise SystemExit(1)

print('Using source:', source)
img = Image.open(source).convert('RGBA')
# pick background color as the top-left pixel (fallback)
small = img.resize((1,1))
bg = small.getpixel((0,0))

out_dir = os.path.join(root, 'assets')
os.makedirs(out_dir, exist_ok=True)

# helper to paste centered on a background of size (w,h)
def create_square(out_path, size, padding=4):
    canvas = Image.new('RGBA', (size, size), bg)
    # compute max inner size
    inner = size - padding*2
    im = img.copy()
    im.thumbnail((inner, inner), Image.LANCZOS)
    # center
    x = (size - im.width)//2
    y = (size - im.height)//2
    canvas.paste(im, (x,y), im)
    canvas.save(out_path, optimize=True)
    print('Saved', out_path)

# generate logo.png (recommended width 240)
out_logo = os.path.join(out_dir, 'logo.png')
logo_w = 240
wpercent = (logo_w / float(img.width))
logo_h = int((float(img.height) * float(wpercent)))
logo_img = img.copy()
logo_img = logo_img.resize((logo_w, logo_h), Image.LANCZOS)
logo_img.save(out_logo, optimize=True)
print('Saved', out_logo)

# generate @2x
out_logo2 = os.path.join(out_dir, 'logo@2x.png')
logo2 = logo_img.resize((logo_w*2, logo_h*2), Image.LANCZOS)
logo2.save(out_logo2, optimize=True)
print('Saved', out_logo2)

# generate square icons
create_square(os.path.join(out_dir, 'logo-32.png'), 32, padding=3)
create_square(os.path.join(out_dir, 'logo-180.png'), 180, padding=8)
create_square(os.path.join(out_dir, 'logo-192.png'), 192, padding=8)

# generate og-image.png 1200x630
og_w, og_h = 1200, 630
og_canvas = Image.new('RGBA', (og_w, og_h), bg)
# compute max size to fit with padding
pad = 80
inner_w = og_w - pad*2
inner_h = og_h - pad*2
og_im = img.copy()
og_im.thumbnail((inner_w, inner_h), Image.LANCZOS)
x = (og_w - og_im.width)//2
y = (og_h - og_im.height)//2
og_canvas.paste(og_im, (x,y), og_im)
out_og = os.path.join(out_dir, 'og-image.png')
og_canvas.save(out_og, optimize=True)
print('Saved', out_og)

print('All images generated in', out_dir)
