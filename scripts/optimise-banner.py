#!/usr/bin/env python3
"""Generate display-sized WebP copies; preserve the original PNG. Requires Pillow."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
original = root / 'assets/hole-control-banner.png'
with Image.open(original) as image:
    for width in (640, 1280, 1920):
        height = round(image.height * width / image.width)
        output = root / f'assets/hole-control-banner-{width}.webp'
        image.resize((width, height), Image.Resampling.LANCZOS).save(output, 'WEBP', quality=88, method=6)
        print(f'{output.name}: {output.stat().st_size:,} bytes ({100 * (1-output.stat().st_size/original.stat().st_size):.1f}% smaller)')
