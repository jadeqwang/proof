import bpy, sys, bmesh
src = sys.argv[sys.argv.index('--') + 1]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=src)
for o in bpy.data.objects:
    if o.type != 'MESH': continue
    me = o.data; from collections import Counter
    c = Counter(p.material_index for p in me.polygons)
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    # loose parts
    seen = set(); parts = []
    for v in bm.verts:
        if v.index in seen: continue
        st = [v]; seen.add(v.index); n = 0; mn = [9e9]*3; mx = [-9e9]*3
        while st:
            x = st.pop(); n += 1
            for i in range(3): mn[i] = min(mn[i], x.co[i]); mx[i] = max(mx[i], x.co[i])
            for e in x.link_edges:
                y = e.other_vert(x)
                if y.index not in seen: seen.add(y.index); st.append(y)
        parts.append((n, [round(a, 3) for a in mn], [round(a, 3) for a in mx]))
    parts.sort(key=lambda p: -p[0])
    print('OBJ', o.name, 'mats', [(me.materials[i].name if me.materials[i] else None, k, tuple(round(x,2) for x in (me.materials[i].diffuse_color if me.materials[i] else ()))) for i, k in c.items()], 'parts', len(parts))
    for p in parts[:8]: print('   part', p)
