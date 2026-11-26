# remove the bench (loose parts entirely in front of the keyboard, Blender y < -1.03) and report
import bpy, sys, bmesh
a = sys.argv[sys.argv.index('--') + 1:]; src, dst = a[0], a[1]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=src)
removed = 0
for o in [o for o in bpy.data.objects if o.type == 'MESH']:
    mw = o.matrix_world
    bm = bmesh.new(); bm.from_mesh(o.data); bm.verts.ensure_lookup_table()
    seen = set(); kill = []
    for v in bm.verts:
        if v.index in seen: continue
        st = [v]; seen.add(v.index); comp = []
        while st:
            x = st.pop(); comp.append(x)
            for e in x.link_edges:
                y = e.other_vert(x)
                if y.index not in seen: seen.add(y.index); st.append(y)
        if max((mw @ x.co).y for x in comp) < -1.03: kill += comp
    removed += len(kill)
    bmesh.ops.delete(bm, geom=kill, context='VERTS'); bm.to_mesh(o.data); bm.free()
print('PREP removed verts', removed)
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_yup=True)
