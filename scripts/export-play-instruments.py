"""Build camera-play SVGs from existing Figma parts, omitting illustrated sticks."""
import json
from pathlib import Path
import xml.etree.ElementTree as ET
from copy import deepcopy

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'public/assets/figma/instruments'
OUT = ROOT / 'public/assets/figma/play-instruments'
OUT.mkdir(exist_ok=True)
ET.register_namespace('', 'http://www.w3.org/2000/svg')
# One-based part indexes from each screen manifest; these are the static beaters.
REMOVE = {'janggu': [43, 44], 'jing': [12, 13, 14], 'sogo': [15], 'kkwaenggwari': [11, 12, 13], 'buk': [25]}
SURFACES = {'janggu': [1, 16], 'jing': [1], 'sogo': [1], 'kkwaenggwari': [1], 'buk': [20]}
metadata = {}
layers = {}
for name, removed in REMOVE.items():
    folder = BASE / name / 'screen'
    manifest = json.loads((folder / 'manifest.json').read_text(encoding='utf-8'))
    parts = [p for i, p in enumerate(manifest['parts'], 1) if i not in removed]
    bounds = [p['bounds'] for p in parts]
    x, y = min(b['x'] for b in bounds), min(b['y'] for b in bounds)
    width = max(b['x'] + b['width'] for b in bounds) - x
    height = max(b['y'] + b['height'] for b in bounds) - y
    layers[name] = {'x': x, 'y': y, 'viewBox': [float(value) for value in manifest['viewBox'].split()],
                    'parts': [{'id': p['id'], 'file': f"/assets/figma/instruments/{name}/screen/{p['file']}",
                               'ring': p['category'] == 'ring', 'bounds': p['bounds']} for p in parts]}
    root = ET.Element('{http://www.w3.org/2000/svg}svg', {'viewBox': f'{x} {y} {width} {height}', 'width': str(width), 'height': str(height)})
    for part in parts:
        for child in ET.parse(folder / part['file']).getroot():
            root.append(deepcopy(child))
    ET.ElementTree(root).write(OUT / f'{name}.svg', encoding='utf-8', xml_declaration=True)
    zones = []
    for number in SURFACES[name]:
        b = manifest['parts'][number - 1]['bounds']
        zones.append({'x': (b['x'] + b['width'] / 2 - x) / width, 'y': (b['y'] + b['height'] / 2 - y) / height,
                      'radiusX': b['width'] * .43 / width, 'radiusY': b['height'] * .43 / height})
    zones.sort(key=lambda z: z['x'])
    metadata[name] = {'width': width, 'height': height, 'zones': dict(zip(['left', 'right'] if len(zones) == 2 else ['center'], zones))}
(ROOT / 'src/config/playInstrumentGeometry.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
print('Exported', ', '.join(metadata))
(ROOT / 'src/config/playInstrumentLayers.json').write_text(json.dumps(layers, indent=2) + '\n', encoding='utf-8')
