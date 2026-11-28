# blender -b -P garment_prep.py -- in.glb out.glb '<json opts>'
# A hanging garment for the closet guides: keeps the named garment and hanger objects (or adds a hanger from another
# file), bakes transforms, scales so the GARMENT (shoulder top to hem) is opts.L metres long, origin at the top of the
# hanger's hook (centre of the hook in x/y), glTF y up, hanger bar along x. Two meshes / materials: 'garment', 'hanger'.
# Textures dropped (the set gives each garment one canonical colour). Decimated to opts.tris.
import bpy, sys, json, math, mathutils
a = sys.argv[sys.argv.index('--') + 1:]
src, dst, opt = a[0], a[1], json.loads(a[2])
bpy.ops.wm.read_factory_settings(use_empty=True)
def load(path, keep):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    for o in new:
        if o.type == 'MESH':
            mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
    out = []
    for o in new:
        if o.type == 'MESH' and any(o.name == k for k in keep): out.append(o)
    for o in new:
        if o not in out: bpy.data.objects.remove(o)
    return out
def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True); o.modifiers.clear()
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1: bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active; ob.name = name
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if name == 'garment' and opt.get('clean'):
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles(threshold=opt['clean']); bpy.ops.mesh.normals_make_consistent(inside=False)
        bpy.ops.object.mode_set(mode='OBJECT')
    m = bpy.data.materials.new(name); m.use_nodes = True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.8, 0.8, 0.8, 1) if name == 'garment' else (0.3, 0.3, 0.3, 1)
    ob.data.materials.clear(); ob.data.materials.append(m)
    for p in ob.data.polygons: p.material_index = 0
    return ob
def bounds(ob):
    vs = [v.co for v in ob.data.vertices]
    return (mathutils.Vector([min(v[i] for v in vs) for i in range(3)]), mathutils.Vector([max(v[i] for v in vs) for i in range(3)]))
G = join(load(src, opt['garment']), 'garment')
if opt.get('rotz'):
    R = mathutils.Matrix.Rotation(math.radians(opt['rotz']), 4, 'Z'); G.data.transform(R)
gmn, gmx = bounds(G)
k = opt['L'] / (gmx.z - gmn.z)
G.data.transform(mathutils.Matrix.Scale(k, 4))
# optional width (sx, hanger-bar direction) / thickness (sy) fit about the garment's centre: the closet is 0.61 m deep and coats hang compressed
gmn, gmx = bounds(G); gc0 = (gmn + gmx) / 2
SX = opt.get('w') and opt['w'] / (gmx.x - gmn.x) or 1.0; SY = opt.get('t') and opt['t'] / (gmx.y - gmn.y) or 1.0
SM = mathutils.Matrix.Translation(gc0) @ mathutils.Matrix.Diagonal((SX, SY, 1, 1)) @ mathutils.Matrix.Translation(-gc0)
G.data.transform(SM); gmn, gmx = bounds(G)
def band(objs, b, minf=20):
    # keep only the loose parts whose bbox centre y (source units) is inside b, with at least minf faces
    out = []
    for o in objs:
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.separate(type='LOOSE'); bpy.ops.object.mode_set(mode='OBJECT')
        for p in list(bpy.context.selected_objects):
            vs = [v.co for v in p.data.vertices]; cy = (min(v.y for v in vs) + max(v.y for v in vs)) / 2
            if b[0] <= cy <= b[1] and len(p.data.polygons) >= minf: out.append(p)
            else: bpy.data.objects.remove(p)
    return out
if opt.get('hanger'):
    hs = load(src, opt['hanger'])
    if opt.get('band'): hs = band(hs, opt['band'], opt.get('minf', 20))
    H = join(hs, 'hanger')
    if opt.get('rotz'): H.data.transform(R)
    H.data.transform(mathutils.Matrix.Scale(k, 4))
    H.data.transform(mathutils.Matrix.Translation(gc0) @ mathutils.Matrix.Diagonal((SX, 1, 1, 1)) @ mathutils.Matrix.Translation(-gc0))
else:   # a hanger from another file, scaled so its bar spans opts.addHanger.w of the garment's width, bar top opts.addHanger.drop below the garment top
    A = opt['addHanger']; hs = load(A['file'], A['objs'])
    if A.get('band'): hs = band(hs, A['band'], A.get('minf', 20))
    H = join(hs, 'hanger')
    hmn, hmx = bounds(H); s = A['w'] / (hmx.x - hmn.x)
    c = (hmn + hmx) / 2
    H.data.transform(mathutils.Matrix.Translation(-mathutils.Vector((c.x, c.y, hmn.z))))
    H.data.transform(mathutils.Matrix.Scale(s, 4))
    gc = (gmn + gmx) / 2; hb = A.get('bar', 0.02)   # hb: the bar's height above the hanger's lowest point (scaled), so the bar sits in the shoulders
    H.data.transform(mathutils.Matrix.Translation(mathutils.Vector((gc.x + A.get('dx', 0), gc.y + A.get('dy', 0), gmx.z - A['drop']))))
hmn, hmx = bounds(H)
# the hook: the hanger's top 3 cm; origin = its x/y centre, top z
top = [v.co for v in H.data.vertices if v.co.z > hmx.z - 0.03]
hx = sum(v.x for v in top) / len(top); hy = sum(v.y for v in top) / len(top)
T = mathutils.Matrix.Translation(-mathutils.Vector((hx, hy, hmx.z)))
for ob in (G, H): ob.data.transform(T)
for ob, t in ((G, opt.get('tris', 12000)), (H, opt.get('htris', 1500))):
    n = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    if n > t:
        bpy.context.view_layer.objects.active = ob
        m = ob.modifiers.new('dec', 'DECIMATE'); m.ratio = t / n; bpy.ops.object.modifier_apply(modifier='dec')
    print('XPART', ob.name, n, '->', sum(len(p.vertices) - 2 for p in ob.data.polygons))
for ob in (G, H):
    for p in ob.data.polygons: p.use_smooth = True
gmn, gmx = bounds(G); hmn, hmx = bounds(H)
print('XSIZE garment', [round(v, 3) for v in (gmx - gmn)], 'top', round(gmx.z, 3), 'hem', round(gmn.z, 3), 'hanger', [round(v, 3) for v in (hmx - hmn)])
for img in list(bpy.data.images): bpy.data.images.remove(img)
bpy.ops.object.select_all(action='DESELECT'); G.select_set(True); H.select_set(True)
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', use_selection=True, export_yup=True, export_materials='EXPORT', export_normals=True, export_texcoords=False)
