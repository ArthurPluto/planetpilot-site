"""Rebuild the site's optimised images, fonts and icons from the game repo.

    python tools/build_assets.py

Only needed when the key art, screenshots or fonts change. The output is
committed, so the site itself has no build step.

Screenshots: the pages use stable SLOT names (world-1, dogfight-2, ...). SLOTS
below maps each slot to a source PNG; the newest folder wins
(store/steam/screenshots_v2 when it holds PNGs, else store/steam/screenshots).
When the v2 shots land, point SLOTS (and SLOTS_V2) at the new file names and
rerun: no HTML changes. Each slot becomes shots/<slot>-640.webp, -1280.webp and
-1920.jpg (the last one is the press download).
"""
import os, shutil, zipfile
from PIL import Image
from fontTools import subset
from fontTools.ttLib import TTFont

GAME = r"C:\Users\arthu\skybound-godot"
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(GAME, "store", "steam", "assets")
SHOTS_V2 = os.path.join(GAME, "store", "steam", "screenshots_v2")
SHOTS_V1 = os.path.join(GAME, "store", "steam", "screenshots")
# slot -> source file name (v1 names; fill SLOTS_V2 when screenshots_v2 exists)
SLOTS = {
    "world-1": "01_fjord2.png", "world-2": "09_canyon.png", "world-3": "06_night2.png",
    "world-4": "03_alps2.png", "cockpit-1": "02_cockpit2.png", "career-1": "05_airport.png",
    "career-2": "10_map.png", "dogfight-1": "04_circus.png", "dogfight-2": "07_dogfight.png",
    "dogfight-3": "11_bolo.png", "legends-1": "08_legends_tab.png", "legends-2": "12_pearl.png",
}
SLOTS_V2 = {}
FONTS = os.path.join(GAME, "assets", "fonts")
OUT = os.path.join(SITE, "assets")


def save(img, path, q=82):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if path.endswith(".webp"):
        img.save(path, "WEBP", quality=q, method=6)
    elif path.endswith(".jpg"):
        img.convert("RGB").save(path, "JPEG", quality=q, optimize=True, progressive=True)
    else:
        img.save(path, "PNG", optimize=True)
    print("  %-48s %7.1f KB" % (os.path.relpath(path, SITE), os.path.getsize(path) / 1024))


def width(img, w):
    if img.width <= w:
        return img.copy()
    return img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)


def cover(img, w, h):
    s = max(w / img.width, h / img.height)
    r = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    x, y = (r.width - w) // 2, (r.height - h) // 2
    return r.crop((x, y, x + w, y + h))


def art():
    print("key art")
    cap = Image.open(os.path.join(ART, "main_capsule_1232x706.png")).convert("RGB")
    for w in (640, 1232):
        save(width(cap, w), os.path.join(OUT, "img", "key-%d.webp" % w))
    save(cover(cap, 1200, 630), os.path.join(OUT, "img", "og-1200x630.jpg"), 85)
    hero = Image.open(os.path.join(ART, "library_hero_3840x1240.png")).convert("RGB")
    for w in (960, 1920):
        save(width(hero, w), os.path.join(OUT, "img", "panorama-%d.webp" % w), 78)
    head = Image.open(os.path.join(ART, "header_capsule_920x430.png")).convert("RGB")
    save(head, os.path.join(OUT, "img", "header-920.webp"))
    logo = Image.open(os.path.join(ART, "library_logo_1280.png")).convert("RGBA")
    bbox = logo.getbbox()
    logo = logo.crop(bbox)
    for w in (480, 960):
        save(width(logo, w), os.path.join(OUT, "img", "logo-%d.webp" % w), 88)
    save(width(logo, 960), os.path.join(OUT, "img", "logo-960.png"))
    icon = Image.open(os.path.join(ART, "client_icon_512.png")).convert("RGBA")
    save(width(icon, 192), os.path.join(SITE, "icon-192.png"))
    save(width(icon, 512), os.path.join(SITE, "icon-512.png"))
    save(width(icon, 64), os.path.join(OUT, "img", "icon-64.png"))
    touch = Image.new("RGBA", (180, 180), (255, 214, 64, 255))
    i = width(icon, 156)
    touch.alpha_composite(i, (12, 12))
    save(touch.convert("RGB"), os.path.join(SITE, "apple-touch-icon.png"))
    icon.save(os.path.join(SITE, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
    print("  favicon.ico", os.path.getsize(os.path.join(SITE, "favicon.ico")) // 1024, "KB")


def shots():
    v2 = os.path.isdir(SHOTS_V2) and SLOTS_V2
    src, slots = (SHOTS_V2, SLOTS_V2) if v2 else (SHOTS_V1, SLOTS)
    print("screenshots from", src)
    d = os.path.join(OUT, "shots")
    shutil.rmtree(d, ignore_errors=True)
    for slot, f in slots.items():
        img = Image.open(os.path.join(src, f)).convert("RGB")
        save(width(img, 640), os.path.join(d, slot + "-640.webp"), 78)
        save(width(img, 1280), os.path.join(d, slot + "-1280.webp"), 80)
        save(width(img, 1920), os.path.join(d, slot + "-1920.jpg"), 86)


def press_zip():
    print("press kit zip")
    z = os.path.join(SITE, "press", "planet-pilot-press-kit.zip")
    os.makedirs(os.path.dirname(z), exist_ok=True)
    with zipfile.ZipFile(z, "w", zipfile.ZIP_STORED) as zf:
        for f in ("main_capsule_1232x706.png", "library_hero_3840x1240.png", "library_logo_1280.png",
                  "header_capsule_920x430.png", "library_capsule_600x900.png", "client_icon_512.png"):
            zf.write(os.path.join(ART, f), "art/" + f)
        for f in sorted(os.listdir(os.path.join(OUT, "shots"))):
            if f.endswith("-1920.jpg"):
                zf.write(os.path.join(OUT, "shots", f), "screenshots/" + f.replace("-1920", ""))
        zf.write(os.path.join(SITE, "press", "fact-sheet.txt"), "fact-sheet.txt")
    print("  %.1f MB" % (os.path.getsize(z) / 1048576))


def fonts():
    print("fonts")
    d = os.path.join(OUT, "fonts")
    os.makedirs(d, exist_ok=True)
    latin = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212"
    hebrew = "U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F"
    jobs = [("Fredoka.ttf", "fredoka-latin.woff2", latin), ("Fredoka.ttf", "fredoka-hebrew.woff2", hebrew),
            ("Nunito.ttf", "nunito-latin.woff2", latin), ("Rubik.ttf", "rubik-hebrew.woff2", hebrew)]
    for src, dst, rng in jobs:
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        font = TTFont(os.path.join(FONTS, src))
        s = subset.Subsetter(opts)
        s.populate(unicodes=subset.parse_unicodes(rng))
        s.subset(font)
        out = os.path.join(d, dst)
        font.flavor = "woff2"
        font.save(out)
        print("  %-48s %7.1f KB" % (os.path.relpath(out, SITE), os.path.getsize(out) / 1024))
    for f in ("OFL-Fredoka.txt", "OFL-Nunito.txt", "OFL-Rubik.txt"):
        shutil.copy(os.path.join(FONTS, f), os.path.join(d, f))


if __name__ == "__main__":
    art()
    shots()
    fonts()
    press_zip()
