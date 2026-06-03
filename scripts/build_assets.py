"""Generate brand assets: OG image, favicon set, apple-touch-icon, manifest icons.

Run:  python3 scripts/build_assets.py
Output:
  img/og-cover.jpg
  img/favicon-16x16.png
  img/favicon-32x32.png
  img/favicon-180x180.png  (Apple touch icon)
  img/favicon-192x192.png  (Android home)
  img/favicon-512x512.png  (Android splash)
  img/favicon.ico          (multi-size)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "img"
IMG.mkdir(exist_ok=True)

BG_TOP    = (10, 10, 15)         # deep near-black
BG_BOTTOM = (15, 23, 42)         # slate
ACCENT_A  = (99, 102, 241)       # indigo-500
ACCENT_B  = (6, 182, 212)        # cyan-500
WHITE     = (255, 255, 255)
MUTED     = (203, 213, 225)      # slate-300


def gradient_bg(w, h, c1=BG_TOP, c2=BG_BOTTOM):
    """Vertical gradient."""
    img = Image.new("RGB", (w, h), c1)
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return img


def gradient_rect(draw, xy, c1, c2, radius=0):
    """Diagonal linear gradient inside a rounded rect (xy=(x0,y0,x1,y1))."""
    x0, y0, x1, y1 = xy
    w, h = x1 - x0, y1 - y0
    if w <= 0 or h <= 0:
        return
    mask = Image.new("L", (w, h), 0)
    mdraw = ImageDraw.Draw(mask)
    if radius:
        mdraw.rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=255)
    else:
        mdraw.rectangle((0, 0, w - 1, h - 1), fill=255)
    grad = Image.new("RGB", (w, h), c1)
    px = grad.load()
    for y in range(h):
        t = (x0 + y) / max((x1 - 0 + y1 - 0), 1)
        t = min(max(t, 0), 1)
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    Image.Image.paste(Image.alpha_composite(Image.new("RGBA", (1, 1), (0, 0, 0, 0)), Image.new("RGBA", (1, 1), (0, 0, 0, 0))).copy() if False else out, ())
    return out


def draw_gradient_square(size, radius_ratio=0.22):
    """Return RGBA square with brand gradient and optional rounded corners."""
    radius = int(size * radius_ratio)
    base = gradient_bg(size, size, ACCENT_A, ACCENT_B).convert("RGBA")
    mask = Image.new("L", (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(base, (0, 0), mask)
    return out


def draw_m_mark(size, mark_size_ratio=0.62):
    """Return RGBA image of the letter M inside the given canvas size."""
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    ms = int(size * mark_size_ratio)
    x0 = (size - ms) // 2
    y0 = (size - ms) // 2
    # Use a heavy sans font
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(ms * 0.95))
    except OSError:
        try:
            font = ImageFont.truetype("arial.ttf", int(ms * 0.95))
        except OSError:
            font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), "M", font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (size - tw) // 2 - bbox[0]
    ty = (size - th) // 2 - bbox[1]
    draw.text((tx, ty), "M", fill=WHITE, font=font)
    return canvas


def make_favicon_master():
    """1024x1024 RGBA master for favicons and touch icons."""
    sq = draw_gradient_square(1024, 0.22)
    m = draw_m_mark(1024, 0.62)
    out = Image.alpha_composite(sq, m)
    return out


def make_og_image():
    """1200x630 Open Graph cover."""
    W, H = 1200, 630
    bg = gradient_bg(W, H, BG_TOP, BG_BOTTOM).convert("RGBA")
    draw = ImageDraw.Draw(bg)

    # Subtle radial accent
    for r in range(420, 0, -8):
        a = int(60 * (1 - r / 420))
        if a <= 0:
            break
        overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.ellipse((W - r - 100, -r // 2, W + 100, H + r // 2), fill=ACCENT_A + (a,))
        bg = Image.alpha_composite(bg, overlay)
    draw = ImageDraw.Draw(bg)

    # Logo mark on the left
    mark_size = 280
    mark = draw_m_mark(mark_size, 0.62)
    sq = draw_gradient_square(mark_size, 0.22)
    logo = Image.alpha_composite(sq, mark)
    bg.paste(logo, (80, (H - mark_size) // 2), logo)

    # Text
    try:
        font_brand = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 92)
        font_tag = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
    except OSError:
        font_brand = ImageFont.load_default()
        font_tag = ImageFont.load_default()

    text_x = 80 + mark_size + 40
    draw.text((text_x, 220), "MilindWeb", fill=WHITE, font=font_brand)
    draw.text((text_x, 330), "Web \u2022 Marketing \u2022 Photography", fill=MUTED, font=font_tag)
    draw.text((text_x, 380), "Photography \u2022 Graphics \u2022 Electrical", fill=MUTED, font=font_tag)
    draw.text((text_x, 430), "Automation \u2022 Automotive \u2022 Workshops", fill=MUTED, font=font_tag)

    # Convert to RGB for JPG
    out = bg.convert("RGB")
    out.save(IMG / "og-cover.jpg", "JPEG", quality=88, optimize=True, progressive=True)
    print(f"  og-cover.jpg  ({W}x{H})  {(IMG/'og-cover.jpg').stat().st_size//1024} KB")


def make_favicon_set():
    master = make_favicon_master()
    for size, name in [(16, "favicon-16x16.png"), (32, "favicon-32x32.png"),
                       (180, "favicon-180x180.png"), (192, "favicon-192x192.png"),
                       (512, "favicon-512x512.png")]:
        out = master.resize((size, size), Image.LANCZOS)
        out.save(IMG / name, "PNG", optimize=True)
        print(f"  {name}  ({size}x{size})  {(IMG/name).stat().st_size//1024} KB")
    # ICO (multi-size)
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico = master.resize((48, 48), Image.LANCZOS)
    ico.save(IMG / "favicon.ico", format="ICO", sizes=ico_sizes)
    print(f"  favicon.ico  (16,32,48)  {(IMG/'favicon.ico').stat().st_size} B")


if __name__ == "__main__":
    print("Building brand assets...")
    make_og_image()
    make_favicon_set()
    print("Done.")
