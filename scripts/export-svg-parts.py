"""Split the locally exported Figma SVGs without changing their geometry."""
import copy
import hashlib
import json
import re
from pathlib import Path
import xml.etree.ElementTree as ET

BASE = Path(__file__).resolve().parents[1] / 'public/assets/figma'
ET.register_namespace('', 'http://www.w3.org/2000/svg')
SHAPES = {'path', 'rect', 'ellipse', 'circle', 'polygon', 'polyline', 'line', 'use'}
RESOURCES = {'defs', 'mask', 'clipPath', 'filter', 'linearGradient', 'radialGradient', 'pattern', 'symbol'}
COLORS = {'#FF3364': 'red', '#FF0060': 'red', '#FF6CF1': 'pink', '#FFEB36': 'yellow', '#FFE900': 'yellow', '#3373ED': 'blue', '#0775F4': 'blue', '#50E6FF': 'cyan', '#13BA14': 'green', 'white': 'white', '#FFFFFF': 'white', '#4F0A00': 'brown', '#481100': 'brown'}

def tag(e):
    return e.tag.rsplit('}', 1)[-1]

def shapes(e):
    if tag(e) in RESOURCES:
        return
    if tag(e) in SHAPES:
        yield e
    for c in e:
        yield from shapes(c)

def prune(e, wanted):
    for c in list(e):
        if tag(c) in RESOURCES:
            continue
        if tag(c) in SHAPES:
            if c.get('data-part-id') != wanted:
                e.remove(c)
        else:
            prune(c, wanted)

def role(asset, i, e):
    name = Path(asset).stem
    color = e.get('fill', e.get('stroke', 'none'))
    if name == 'flag-input':
        return 'cloth' if i == 0 else 'red-trim' if i <= 24 else 'top-band'
    if name == 'flag-logo':
        return 'cloth' if i == 0 else 'lettering' if i <= 6 else 'top-band' if i <= 9 else 'red-trim'
    if name.startswith('pole-'):
        return 'pole-segment'
    if name == 'lettering-vertical' or asset.startswith('brand/'):
        return 'lettering'
    if name == 'janggu':
        return 'ring' if i < 30 else 'body-line' if i < 42 else 'stick'
    if name == 'trumpet':
        return 'ribbon' if i == 37 else 'tube' if i == 12 else 'ring'
    if asset.startswith('instruments/'):
        return 'ring' if len(re.findall('[Mm]', e.get('d', ''))) >= 2 else 'detail'
    return 'decoration'

def graphic_role(folder, i, e, count):
    if folder.startswith('flag/logo/') or folder.startswith('flag/waving/'):
        return 'cloth' if i == 0 else 'lettering' if i <= 6 else 'top-band' if i <= 9 else 'trim'
    if folder.startswith('flag/input/'):
        return 'cloth' if i == 0 else 'trim' if i <= 24 else 'top-band'
    if folder.startswith('flag/pole/'):
        return 'pole-segment'
    if folder.startswith('brand/'):
        return 'lettering'
    if folder.startswith('headwear/sangmo/') and i == 0:
        return 'ribbon'
    if folder.startswith('instruments/janggu/') and count == 44:
        return 'ring' if i < 30 else 'body-line' if i < 42 else 'stick'
    if folder.startswith('instruments/trumpet/') and count == 38:
        return 'ribbon' if i == 37 else 'tube' if i == 12 else 'ring'
    if folder.startswith(('instruments/', 'headwear/')):
        return 'ring' if len(re.findall('[Mm]', e.get('d', ''))) >= 2 else 'detail'
    return 'ui-shape' if folder.startswith('ui/') else 'decoration'

def main():
    sources = json.loads((BASE / 'manifest.json').read_text(encoding='utf-8'))
    for asset in sources['assets']:
        source = BASE / asset['path']
        root = ET.parse(source).getroot()
        folder = BASE / asset['folder']
        (folder / 'parts').mkdir(parents=True, exist_ok=True)
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        previous_path = folder / 'manifest.json'
        previous = json.loads(previous_path.read_text(encoding='utf-8')) if previous_path.exists() else {}
        # Preserve browser-measured bounds/pivots when the original geometry has not changed.
        measured = {p['id']: p for p in previous.get('parts', [])} if previous.get('sourceSha256') == digest else {}
        elements = list(shapes(root))
        entries = []
        for i, e in enumerate(elements):
            kind = role(asset['classificationKey'], i, e) if 'classificationKey' in asset else graphic_role(asset['folder'], i, e, len(elements))
            paint = e.get('fill', e.get('stroke', 'none'))
            color = COLORS.get(paint, paint.lstrip('#').lower() if re.fullmatch('#[0-9a-fA-F]{6}', paint) else 'original')
            part_id = f'{kind}-{i + 1:03d}-{color}'
            e.set('data-part-id', part_id)
            e.set('id', part_id)
            entry = {'id': part_id, 'file': 'parts/' + part_id + '.svg', 'category': kind, 'zIndex': i, 'svgElementIndex': i, 'fill': e.get('fill'), 'stroke': e.get('stroke'), 'transform': e.get('transform'), 'viewBox': root.get('viewBox')}
            entry.update({key: measured[part_id][key] for key in ('bounds', 'pivot') if part_id in measured and key in measured[part_id]})
            entries.append(entry)
        for entry in entries:
            single = copy.deepcopy(root)
            prune(single, entry['id'])
            ET.ElementTree(single).write(folder / entry['file'], encoding='utf-8', xml_declaration=True)
        ET.ElementTree(root).write(folder / 'assembled.svg', encoding='utf-8', xml_declaration=True)
        record = {'source': asset['path'], 'sourceNodeId': asset['nodeId'], 'sourcePageId': asset['pageNodeId'], 'sourceName': asset['name'], 'sourceSha256': digest, 'viewBox': root.get('viewBox'), 'parts': entries}
        (folder / 'manifest.json').write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        asset.update(partCount=len(entries), viewBox=root.get('viewBox'), bytes=source.stat().st_size)
    (BASE / 'manifest.json').write_text(json.dumps(sources, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    catalog = []
    for asset in sources['assets']:
        record = json.loads((BASE / asset['folder'] / 'manifest.json').read_text(encoding='utf-8'))
        catalog.append({**asset, 'parts': record['parts']})
    template = Path(__file__).with_name('asset-preview.template.html').read_text(encoding='utf-8')
    (BASE / 'index.html').write_text(template.replace('__ASSETS__', json.dumps(catalog, ensure_ascii=False).replace('</', '<\\/')), encoding='utf-8')
    print(f"{len(sources['assets'])} variants / {sum(a['partCount'] for a in sources['assets'])} parts")

if __name__ == '__main__':
    main()
