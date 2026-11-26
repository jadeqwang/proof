# install processed GLBs into layout/assets/props/<name>/ with SOURCE.txt; build props.json (size from the GLB accessor bounds)
import json, os, shutil, struct, sys
S = '/tmp/claude-1000/-home-jade-Documents-proof/e9bc714e-9ed3-4b48-a75b-73b69da086c0/scratchpad'
DST = '/home/jade/Documents/proof/layout/assets/props'
picks = json.load(open(f'{S}/obj/picks.json'))
spec = json.load(open(f'{S}/spec.json'))   # name -> {label, grips, template, origin, real, note}
def glb_bounds(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n])
    import math
    mn = [math.inf] * 3; mx = [-math.inf] * 3
    # node transforms are identity after the Blender export (one object, applied)
    for m in j['meshes']:
        for pr in m['primitives']:
            a = j['accessors'][pr['attributes']['POSITION']]
            for i in range(3): mn[i] = min(mn[i], a['min'][i]); mx[i] = max(mx[i], a['max'][i])
    return mn, mx
index = {}
for name, sp in spec.items():
    src = f'{S}/out/{name}.glb'
    if not os.path.exists(src): print('missing', name); continue
    d = f'{DST}/{name}'; os.makedirs(d, exist_ok=True); shutil.copy(src, f'{d}/{name}.glb')
    mn, mx = glb_bounds(src); size = [round(mx[i] - mn[i], 4) for i in range(3)]
    if name in picks or sp.get('obj'):
        p = picks[sp.get('obj', name)]
        lic = {'by': 'CC BY 4.0 (Creative Commons Attribution 4.0 International)', 'cc0': 'CC0 1.0 (public domain dedication)'}[p['lic']]
        src_txt = (f"Model: \"{p['name']}\" by {p['user']} on Sketchfab\nURL: {p['url']}\nLicence: {lic}\n"
                   f"Licence check: the Sketchfab licence recorded in Objaverse 1.0 metadata (allenai/objaverse, metadata shard), checked 2026-11-26\n"
                   f"Downloaded from: Objaverse 1.0 mirror on Hugging Face, {p['path']} (uid {p['uid']})\n")
        credit = f"\"{p['name']}\" by {p['user']} ({p['url']}), {('CC BY 4.0' if p['lic']=='by' else 'CC0')}"
        source = f"Sketchfab/{p['user']} ({'CC BY 4.0' if p['lic']=='by' else 'CC0'})"
    else:
        ph = json.load(open(f'{S}/raw/{name}/ph_info.json'))
        aid = sp['ph']; authors = ', '.join(ph.get('authors', {}).keys())
        src_txt = (f"Model: \"{ph.get('name')}\" ({aid}) by {authors} on Poly Haven\nURL: https://polyhaven.com/a/{aid}\n"
                   f"Licence: CC0 1.0 (public domain dedication; https://polyhaven.com/license)\nDownloaded: Poly Haven API, glTF 1k, 2026-11-26\n")
        credit = f"\"{ph.get('name')}\" by {authors}, Poly Haven (CC0)"
        source = f"Poly Haven/{authors} (CC0)"
    changes = ("Changes (for this film's layout guides): " + sp.get('changes', 'joined into one mesh, scaled to metres, origin moved to the bottom centre, textures cut to 1024 px JPEG base colour only') + ".\n")
    open(f'{d}/SOURCE.txt', 'w').write(src_txt + changes + f"Real-world size here (x, y up, z): {size[0]} x {size[1]} x {size[2]} m\nUsed for: {sp.get('use','')}\n")
    if 'BY' in src_txt.split('Licence:')[1].split('\n')[0]:
        open(f'{d}/LICENSE.txt', 'w').write('This model is licensed under Creative Commons Attribution 4.0 International (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/\nAttribution: ' + credit + '\nChanged: see SOURCE.txt.\n')
    else:
        open(f'{d}/LICENSE.txt', 'w').write('CC0 1.0 Universal (public domain dedication): https://creativecommons.org/publicdomain/zero/1.0/\nSource: ' + credit + '\n')
    index[name] = {k: v for k, v in dict(label=sp.get('label', name), size_m=size, origin=sp.get('origin', 'bottom centre'), grips=sp.get('grips', {}), defaults=sp.get('defaults', {}), source=source, credit=credit, use=sp.get('use', '')).items()}
json.dump(index, open(f'{DST}/props.json', 'w'), indent=1)
print(len(index), 'props;', sum(os.path.getsize(f'{DST}/{n}/{n}.glb') for n in index) // 1024, 'KB')
