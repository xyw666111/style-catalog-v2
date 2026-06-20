from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PRODUCT_DIR = ROOT / "images" / "products"
MAX_SIDE = 360
QUALITY = 72


def is_source_image(path: Path) -> bool:
    name = path.name.lower()
    return path.is_file() and name.endswith((".jpg", ".jpeg")) and not name.endswith(("-thumb.jpg", "-thumb.jpeg"))


def thumb_path(path: Path) -> Path:
    return path.with_name(path.stem + "-thumb.jpg")


def should_regenerate(src: Path, dst: Path) -> bool:
    return not dst.exists() or src.stat().st_mtime > dst.stat().st_mtime


def generate_thumb(src: Path, dst: Path) -> None:
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst, "JPEG", quality=QUALITY, optimize=True, progressive=True)


def main() -> None:
    if not PRODUCT_DIR.exists():
        print("No product image directory found.")
        return

    count = 0
    for src in sorted(PRODUCT_DIR.glob("*.jp*g")):
        if not is_source_image(src):
            continue
        dst = thumb_path(src)
        if should_regenerate(src, dst):
            generate_thumb(src, dst)
            count += 1
            print(f"generated {dst.relative_to(ROOT)}")

    print(f"Generated/updated {count} thumbnail(s).")


if __name__ == "__main__":
    main()
