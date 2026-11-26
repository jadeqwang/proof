# blender -b -P norm.py -- in out '{"size":["h",0.1],"rot":[0,0,0],"tris":20000,"tex":1024,"origin":"bottom"}'
import bpy, sys, json, math, mathutils, os
a = sys.argv[sys.argv.index('--') + 1:]
src, dst, opt = a[0], a[1], json.loads(a[2] if len(a) > 2 else '{}')
bpy.ops.wm.read_factory_settings(use_empty=True)
if src.endswith('.gltf') or src.endswith('.glb'): bpy.ops.import_scene.gltf(filepath=src)
else: bpy.ops.wm.obj_import(filepath=src)
# drop non-mesh, bake transforms
for o in list(bpy.data.objects):
    if o.type != 'MESH': continue
    mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
for o in list(bpy.data.objects):
    if o.type != 'MESH': bpy.data.objects.remove(o)
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
for o in meshes:   # drop shape keys / armature mods
    o.modifiers.clear()
    if o.data.shape_keys: o.shape_key_clear()
bpy.ops.object.select_all(action='DESELECT')
for o in meshes: o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1: bpy.ops.object.join()
ob = bpy.context.view_layer.objects.active
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
r = opt.get('rot', [0, 0, 0])   # degrees, in glTF axes (x, y up, z): Blender (x, -z, y)
R = mathutils.Euler((math.radians(r[0]), math.radians(-r[2]), math.radians(r[1])), 'XYZ').to_matrix().to_4x4()
ob.data.transform(R)
# remove loose / degenerate, decimate
n0 = sum(len(p.vertices) - 2 for p in ob.data.polygons)
T = opt.get('tris', 20000)
if n0 > T:
    m = ob.modifiers.new('dec', 'DECIMATE'); m.ratio = T / n0; m.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier='dec')
n1 = sum(len(p.vertices) - 2 for p in ob.data.polygons)
# size + origin (Blender Z up; glTF Y up)
vs = [v.co for v in ob.data.vertices]
mn = mathutils.Vector([min(v[i] for v in vs) for i in range(3)]); mx = mathutils.Vector([max(v[i] for v in vs) for i in range(3)])
dim = mx - mn
ax, val = opt.get('size', ['h', None])
cur = {'h': dim.z, 'w': dim.x, 'd': dim.y, 'l': max(dim)}[ax]
k = val / cur if val else 1.0
c = (mn + mx) / 2
org = opt.get('origin', 'bottom')
o = mathutils.Vector((c.x, c.y, mn.z if org == 'bottom' else c.z))
ob.data.transform(mathutils.Matrix.Translation(-o))
ob.data.transform(mathutils.Matrix.Scale(k, 4))
for p in ob.data.polygons: p.use_smooth = p.use_smooth
# only the base colour is used by the layout renderer: drop normal / roughness / metallic / emission maps (size)
for mat in bpy.data.materials:
    if not mat.use_nodes: continue
    nt = mat.node_tree
    for n in list(nt.nodes):
        if n.type == 'BSDF_PRINCIPLED':
            for inp in n.inputs:
                if inp.name != 'Base Color':
                    for l in list(inp.links): nt.links.remove(l)
        if n.type == 'NORMAL_MAP': nt.nodes.remove(n)
    used = set()
    for l in nt.links: used.add(l.from_node.name)
    for n in list(nt.nodes):
        if n.type == 'TEX_IMAGE' and n.name not in used: nt.nodes.remove(n)
for im in list(bpy.data.images):
    if im.users == 0: bpy.data.images.remove(im)
# split into named parts by loose-part rules (glTF frame: cx, cy (up), cz = loose part bbox centre; sx, sy, sz its size)
split = opt.get('split')
if split:
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.separate(type='LOOSE'); bpy.ops.object.mode_set(mode='OBJECT')
    groups = {}
    for o2 in [o for o in bpy.data.objects if o.type == 'MESH']:
        vs2 = [v.co for v in o2.data.vertices]
        a = [min(v[i] for v in vs2) for i in range(3)]; b = [max(v[i] for v in vs2) for i in range(3)]
        env = dict(cx=(a[0]+b[0])/2, cy=(a[2]+b[2])/2, cz=-(a[1]+b[1])/2, sx=b[0]-a[0], sy=b[2]-a[2], sz=b[1]-a[1])
        nm = next((k for k, rule in split.items() if eval(rule, {}, env)), 'body')
        groups.setdefault(nm, []).append(o2)
    for nm, obs in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o2 in obs: o2.select_set(True)
        bpy.context.view_layer.objects.active = obs[0]
        if len(obs) > 1: bpy.ops.object.join()
        j = bpy.context.view_layer.objects.active; j.name = nm; j.data.name = nm
    print('SPLIT', {k: len(v) for k, v in groups.items()})
# textures: downscale
mx_px = opt.get('tex', 1024)
for im in bpy.data.images:
    if im.size[0] > mx_px or im.size[1] > mx_px:
        s = mx_px / max(im.size); im.scale(max(1, int(im.size[0] * s)), max(1, int(im.size[1] * s)))
bpy.ops.object.select_all(action='DESELECT')
for o2 in bpy.data.objects:
    if o2.type == 'MESH': o2.select_set(True)
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', use_selection=True, export_image_format='JPEG' if opt.get('jpeg', True) else 'AUTO',
                          export_jpeg_quality=85, export_apply=True, export_yup=True, export_animations=False, export_skins=False, export_morph=False)
d2 = dim * k
print(f'NORM {os.path.basename(dst)} tris {n0}->{n1} size(x,y_up,z)= {d2.x:.3f} {d2.z:.3f} {d2.y:.3f} k={k:.4g} mats=? imgs={[ (i.name, tuple(i.size)) for i in bpy.data.images]}')
