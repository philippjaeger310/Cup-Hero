"""Regenerate assets/*.png — the original Cup Hero app icon set.

Original, procedurally-drawn artwork (a simple trophy silhouette in the
brand pink/black) — no real logos, stadiums, or player likeness. Run from
the repo root:

    pip install Pillow
    python3 scripts/generate-icons.py
"""

from PIL import Image, ImageDraw

PINK = (247, 181, 205, 255)
BLACK = (10, 10, 10, 255)

def draw_cup(draw, cx, cy, scale, color):
    # Local design space is 100x100; cup spans roughly y=8..82, so center at y=45.
    def pt(x, y):
        return (cx + (x - 50) * scale, cy + (y - 45) * scale)

    # Bowl
    bowl = [pt(30, 8), pt(70, 8), pt(70, 34), pt(60, 52), pt(50, 56), pt(40, 52), pt(30, 34)]
    draw.polygon(bowl, fill=color)

    # Handles as thick arcs either side of the bowl
    handle_w = max(2, int(round(5 * scale)))
    left_box = [cx + (14 - 50) * scale, cy + (10 - 45) * scale, cx + (34 - 50) * scale, cy + (40 - 45) * scale]
    right_box = [cx + (66 - 50) * scale, cy + (10 - 45) * scale, cx + (86 - 50) * scale, cy + (40 - 45) * scale]
    draw.arc(left_box, start=60, end=300, fill=color, width=handle_w)
    draw.arc(right_box, start=240, end=120, fill=color, width=handle_w)

    # Stem, widening down into a foot, sitting on a rounded base bar.
    # All trapezoids widen top->bottom so there's no arrow-like point.
    stem = [pt(46, 56), pt(54, 56), pt(56, 66), pt(44, 66)]
    draw.polygon(stem, fill=color)
    foot = [pt(44, 66), pt(56, 66), pt(62, 74), pt(38, 74)]
    draw.polygon(foot, fill=color)
    base_box = [cx + (30 - 50) * scale, cy + (74 - 45) * scale, cx + (70 - 50) * scale, cy + (82 - 45) * scale]
    draw.rounded_rectangle(base_box, radius=4 * scale, fill=color)


def make_square_icon(size, bg=BLACK, fg=PINK, cup_scale_frac=0.60, transparent_bg=False):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0) if transparent_bg else bg)
    draw = ImageDraw.Draw(img)
    scale = size / 100 * cup_scale_frac
    draw_cup(draw, size / 2, size / 2, scale, fg)
    return img


# 1) Main app icon (1024x1024, opaque black bg, pink cup)
icon = make_square_icon(1024, bg=BLACK, fg=PINK, cup_scale_frac=0.62)
icon.convert('RGB').save('assets/icon.png')

# 2) Android adaptive icon foreground (transparent bg, cup sized to safe zone ~66%)
fg = make_square_icon(1024, fg=PINK, cup_scale_frac=0.46, transparent_bg=True)
fg.save('assets/android-icon-foreground.png')

# 3) Android adaptive icon background (solid brand black)
bg_img = Image.new('RGBA', (1024, 1024), BLACK)
bg_img.save('assets/android-icon-background.png')

# 4) Android monochrome icon (single-color silhouette, per Android themed-icon spec)
mono = make_square_icon(1024, fg=(255, 255, 255, 255), cup_scale_frac=0.46, transparent_bg=True)
mono.save('assets/android-icon-monochrome.png')

# 5) Splash icon (transparent bg, pink cup, centered on backgroundColor from app.json)
splash = make_square_icon(1024, fg=PINK, cup_scale_frac=0.42, transparent_bg=True)
splash.save('assets/splash-icon.png')

# 6) Favicon (48x48, opaque)
favicon = make_square_icon(48, bg=BLACK, fg=PINK, cup_scale_frac=0.62)
favicon.convert('RGB').save('assets/favicon.png')

print("done")
