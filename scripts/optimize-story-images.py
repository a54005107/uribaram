"""Create web delivery copies; keep the original Figma PNGs and dimensions."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'public/assets/figma'
groups = {
    'oct28': ['bd5cc', 'f5dd7', '087be', '2b00f', 'f7bbf', '4cad1', '4e3f7'],
    'story/oct23': ['f7bbf', 'f5287', '6635d', '181d1', '140b8'],
    'story/current': ['d16c4', '623b8'],
}
before = after = 0
for folder, names in groups.items():
    for name in names:
        source = root / folder / (name + '.png')
        target = source.with_suffix('.webp')
        with Image.open(source) as image:
            image.save(target, 'WEBP', quality=90, method=6)
        before += source.stat().st_size
        after += target.stat().st_size
print(f'{before:,} -> {after:,} bytes ({1-after/before:.1%} smaller)')
