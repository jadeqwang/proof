# blender -b -P half_barrel_prep.py -- in.gltf out.glb : join, cut the barrel at mid-height, keep the lower half (a half
# whisky barrel planter, open top), export. Then norm.py as usual. (mv10 mint barrel, 2026-11-27)
import bpy, sys, bmesh, mathutils
a = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=a[0])
ms = [o for o in bpy.data.objects if o.type == 'MESH']
for o in bpy.data.objects:
    if o.type != 'MESH': bpy.data.objects.remove(o)
bpy.ops.object.select_all(action='DESELECT')
for o in ms: o.select_set(True)
bpy.context.view_layer.objects.active = ms[0]
if len(ms) > 1: bpy.ops.object.join()
ob = bpy.context.view_layer.objects.active; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
zs = [v.co.z for v in ob.data.vertices]; zc = (min(zs) + max(zs)) / 2
bm = bmesh.new(); bm.from_mesh(ob.data)
bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, zc), plane_no=(0, 0, 1), clear_outer=True)
bm.to_mesh(ob.data); bm.free()
bpy.ops.export_scene.gltf(filepath=a[1], export_format='GLB', use_selection=False)
print('HALF', zc)
