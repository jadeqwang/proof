# blender -b -P grip.py -- file.glb '<python filter on x,y,z (glTF) and obj, mat>'  -> centroid, principal axis, radius
import bpy, sys, numpy as np
a = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=a[0])
P = []
for o in bpy.data.objects:
    if o.type != 'MESH': continue
    M = o.matrix_world
    for poly in o.data.polygons:
        mat = o.data.materials[poly.material_index].name if o.data.materials else ''
        for vi in poly.vertices:
            w = M @ o.data.vertices[vi].co; x, y, z = w.x, w.z, -w.y
            if eval(a[1], {}, dict(x=x, y=y, z=z, obj=o.name, mat=mat)): P.append((x, y, z))
P = np.unique(np.round(np.array(P), 5), axis=0)
c = P.mean(0); u, s, vt = np.linalg.svd(P - c); ax = vt[0]
d = P - c; perp = d - np.outer(d @ ax, ax); r = np.linalg.norm(perp, axis=1)
ext = d @ ax
print('GRIP n=%d centre=%s axis=%s r_mean=%.4f r_max=%.4f along=[%.3f,%.3f] bbox=%s..%s' % (len(P), np.round(c, 4).tolist(), np.round(ax, 3).tolist(), r.mean(), r.max(), ext.min(), ext.max(), np.round(P.min(0), 3).tolist(), np.round(P.max(0), 3).tolist()))
