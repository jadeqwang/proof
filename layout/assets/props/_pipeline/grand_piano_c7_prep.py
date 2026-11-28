# grand_piano_c7: prepare "Grand Piano" by yimchingtung (Objaverse uid ee82222af7644df5bff9002314ad4838, CC BY 4.0)
# blender -b --factory-startup -P grand_piano_c7_prep.py -- in.glb out.glb [report.json]
#
# Source frame (Blender after glTF import): z up, keyboard toward -y, tail toward +y, straight spine on -x.
# Steps:
#  1. split every source mesh into loose components and sort them into named parts (lid, prop_stick, music_desk,
#     fallboard, keys_white, keys_black, case, case_front, legs, casters, lyre, pedals, action, strings, plate,
#     soundboard, ribs); keys and casters are told apart by sampling the base-colour texture at each component's UVs
#  2. close the lid: rotate it about its hinge (the spine-side edge, parallel to y) until flat, then seat it on the rim
#  3. fold the prop stick down flat (about its pivot on the treble rim), under the closed lid
#  4. scale uniformly so the 88-key keyboard is 1.227 m wide (Yamaha key span), then lengthen the body behind the
#     action (y > Y0) so keyboard front to tail = LENGTH (2.16 m, Jade's 7'1"; was 2.27, a C7); the rear leg + caster are moved, not stretched
#  5. decimate the strings and the action (hidden under the lid), name materials, keep only base-colour textures
#  6. origin on the floor under the centre of the keyboard front edge; export glTF (y up, keyboard toward +z)
import bpy, bmesh, sys, json, math
import numpy as np
from mathutils import Vector, Matrix

a = sys.argv[sys.argv.index('--') + 1:]
src, dst = a[0], a[1]
rep_path = a[2] if len(a) > 2 else None
KEY_SPAN = 1.227        # m, 88 keys (52 white keys x 23.6 mm)
LENGTH = 2.16           # m, keyboard front to tail: Jade "7'1\" to be exact" (r7 correction; was 2.27, a C7)
Y0 = -0.8               # source units: everything in front of this (keys, action, desk, front legs, lyre, prop stick) stays rigid
STRINGS_RATIO, ACTION_RATIO = 0.04, 0.12
rep = {}

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
for o in list(bpy.data.objects):
    if o.type != 'MESH': continue
    mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
for o in list(bpy.data.objects):
    if o.type != 'MESH': bpy.data.objects.remove(o)
for o in bpy.data.objects:
    o.data.transform(o.matrix_world); o.matrix_world = Matrix.Identity(4)

def srcmat(o):
    return o.data.materials[0].name if o.data.materials else ''

def base_image(mat):
    for n in mat.node_tree.nodes:
        if n.type == 'TEX_IMAGE' and n.image and any(l.to_socket.name == 'Base Color' for l in n.outputs[0].links):
            return n.image
    return None

_imgcache = {}
def sample(mat, uv):
    im = base_image(mat)
    if im is None: return np.array([0.5, 0.5, 0.5])
    if im.name not in _imgcache:
        w, h = im.size
        _imgcache[im.name] = np.array(im.pixels[:]).reshape(h, w, 4)
    px = _imgcache[im.name]; h, w = px.shape[:2]
    u = uv[0] % 1.0; v = uv[1] % 1.0
    return px[min(h - 1, int(v * h)), min(w - 1, int(u * w)), :3]

def components(o):
    bm = bmesh.new(); bm.from_mesh(o.data); bm.verts.ensure_lookup_table()
    uvl = bm.loops.layers.uv.active
    lab = [-1] * len(bm.verts); comps = []
    for v in bm.verts:
        if lab[v.index] >= 0: continue
        cid = len(comps); st = [v]; lab[v.index] = cid; ids = []
        while st:
            x = st.pop(); ids.append(x.index)
            for e in x.link_edges:
                y = e.other_vert(x)
                if lab[y.index] < 0: lab[y.index] = cid; st.append(y)
        co = np.array([tuple(bm.verts[i].co) for i in ids])
        uvs = [tuple(l[uvl].uv) for i in ids for l in bm.verts[i].link_loops] if uvl else []
        comps.append(dict(ids=ids, mn=co.min(0), mx=co.max(0), c=co.mean(0), uv=np.mean(uvs, 0) if uvs else None))
    bm.free()
    return lab, comps

# ---- 1. classify -------------------------------------------------------------------------------------------
M = {m.name: m for m in bpy.data.materials}
def mat_of(code): return next(m for n, m in M.items() if n.startswith('aiStandardSurface' + code + 'SG'))
src_objs = {o.name: o for o in bpy.data.objects}
parts = {}   # part -> list of (object, set(vert ids))
def add(part, o, ids): parts.setdefault(part, []).append((o, set(ids)))

for o in list(src_objs.values()):
    sm = srcmat(o)
    code = sm.replace('aiStandardSurface', '').replace('SG', '')
    if code == '12': add('lid', o, range(len(o.data.vertices))); continue
    if code == '6': add('soundboard', o, range(len(o.data.vertices))); continue
    if code == '7': add('case', o, range(len(o.data.vertices))); continue
    if code == '8': add('ribs', o, range(len(o.data.vertices))); continue
    if code == '4': add('plate', o, range(len(o.data.vertices))); continue
    if code == '1': add('action', o, range(len(o.data.vertices))); continue
    if code == '15': add('pedals', o, range(len(o.data.vertices))); continue
    lab, comps = components(o)
    for cc in comps:
        mn, mx = cc['mn'], cc['mx']
        if code == '14':      # prop stick: the long stick; its socket block on the rim stays with the case
            add('prop_stick' if mx[2] > 1.5 else 'case', o, cc['ids'])
        elif code == '13':    # ebony front: desk, fallboard, lyre, keybed / key slip / cheeks / desk rails
            if mn[2] >= 1.3 and mn[1] >= -2.1 and mx[1] <= -1.5 and abs(mn[0]) < 1.6 and abs(mx[0]) < 1.6:
                add('music_desk', o, cc['ids'])
            elif mn[1] >= -3.22 and mx[1] <= -2.85 and mn[2] >= 0.3 and mx[2] <= 1.15:
                add('fallboard', o, cc['ids'])
            elif mx[2] < -0.1:
                add('lyre', o, cc['ids'])
            else:
                add('case_front', o, cc['ids'])
        elif code == '2':     # strings; the three pedal rods hang below the keybed
            add('lyre' if mn[2] < -0.5 else 'strings', o, cc['ids'])
        elif code == '5':     # keys: dark texture = black key
            col = sample(o.data.materials[0], cc['uv']) if cc['uv'] is not None else np.array([1, 1, 1])
            add('keys_black' if col.mean() < 0.35 else 'keys_white', o, cc['ids'])
        elif code == '9':     # legs: brass-textured components = casters
            col = sample(o.data.materials[0], cc['uv']) if cc['uv'] is not None else np.array([0, 0, 0])
            add('casters' if (col.mean() > 0.2 and mx[2] < -1.7) else 'legs', o, cc['ids'])
        else:
            add('case', o, cc['ids'])

# build one object per part
def build(part, items):
    for o, ids in items:
        tmp = o.data.copy(); bm = bmesh.new(); bm.from_mesh(tmp)
        bm.verts.ensure_lookup_table()
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.index not in ids], context='VERTS')
        me = bpy.data.meshes.new('t'); bm.to_mesh(me); bm.free()
        yield me, o.data.materials[0]

new_objs = {}
for part, items in parts.items():
    meshes = list(build(part, items))
    objs = []
    for me, mat in meshes:
        me.materials.clear(); me.materials.append(mat)
        ob = bpy.data.objects.new(part, me); bpy.context.scene.collection.objects.link(ob); objs.append(ob)
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objs: ob.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1: bpy.ops.object.join()
    j = bpy.context.view_layer.objects.active; j.name = part; j.data.name = part
    new_objs[part] = j
for o in src_objs.values(): bpy.data.objects.remove(o)
rep['parts'] = {p: len(o.data.vertices) for p, o in new_objs.items()}

def verts(o): return np.array([tuple(v.co) for v in o.data.vertices])
def xform(o, m): o.data.transform(m); o.data.update()

# ---- 2. close the lid -------------------------------------------------------------------------------------
lid = new_objs['lid']; L = verts(lid)
Lm = L[L[:, 1] > 0.3]            # main lid only (behind the folded-back front flap), for the plane fit
c = Lm.mean(0); _, _, vt = np.linalg.svd(Lm - c); n = vt[2]
if n[2] < 0: n = -n
open_deg = math.degrees(math.atan2(n[0], n[2]))     # tilt of the lid normal toward +x/-x in the x-z plane
rep['lid_source_open_deg'] = round(abs(open_deg), 1); rep['lid_normal_y_component'] = round(float(n[1]), 4)
lo = L[L[:, 0] < L[:, 0].min() + 0.4]                  # hinge edge: spine side
hinge = Vector((lo[:, 0].min(), 0, lo[:, 2].min()))
# rotate the fitted lid plane exactly flat (mostly about y = the hinge; the source lid also leans ~1.3 deg along y)
nz = Vector(n); ax = nz.cross(Vector((0, 0, 1))); tilt = nz.angle(Vector((0, 0, 1)))
R = Matrix.Translation(hinge) @ Matrix.Rotation(tilt, 4, ax.normalized()) @ Matrix.Translation(-hinge)
xform(lid, R)
L = verts(lid); case = verts(new_objs['case'])
rim_top = float(np.percentile(case[case[:, 2] > case[:, 2].max() - 0.1][:, 2], 95))
# seat: bottom of the lid on the rim, spine-side edge flush with the outside of the spine
dz = rim_top - float(np.percentile(L[L[:, 1] > 0.3][:, 2], 1)); dx = case[:, 0].min() - L[:, 0].min()
xform(lid, Matrix.Translation((dx, 0, dz)))
L = verts(lid)
rep['lid_closed_src'] = dict(min=L.min(0).round(3).tolist(), max=L.max(0).round(3).tolist(), rim_top=round(rim_top, 3), seat_dx=round(float(dx), 3), seat_dz=round(float(dz), 3))
hinge_src = Vector((L[:, 0].min(), 0, rim_top))

# ---- 3. fold the prop stick -------------------------------------------------------------------------------
ps = new_objs['prop_stick']; P = verts(ps)
bot = P[P[:, 2] < P[:, 2].min() + 0.1].mean(0); top = P[P[:, 2] > P[:, 2].max() - 0.1].mean(0)
d = top - bot; ang = math.atan2(d[2], -d[0])            # elevation of the stick above the -x direction
# rotation about +y by -ang turns a vector in the (-x, +z) quadrant down onto -x
Rp = Matrix.Translation(Vector(bot)) @ Matrix.Rotation(-ang, 4, 'Y') @ Matrix.Translation(-Vector(bot))
xform(ps, Rp); P = verts(ps)
# keep it under the lid
if P[:, 2].max() > rim_top - 0.01: xform(ps, Matrix.Translation((0, 0, rim_top - 0.01 - P[:, 2].max())))
P = verts(ps); rep['propstick_folded_src'] = dict(min=P.min(0).round(3).tolist(), max=P.max(0).round(3).tolist(), pivot=np.round(bot, 3).tolist(), elev_deg=round(math.degrees(ang), 1))
pivot_src = Vector(bot)

# nudge the music desk toward the keys so it clears the closed lid's front edge
D = verts(new_objs['music_desk']); L = verts(lid)
gap = 0.04 - (L[:, 1].min() - D[:, 1].max())          # keep the desk's back edge 1 cm (0.04 units) in front of the lid
if gap > 0: xform(new_objs['music_desk'], Matrix.Translation((0, -gap, 0)))
rep['desk_moved_forward_units'] = round(max(0.0, float(gap)), 3)

# ---- 4. scale + lengthen ------------------------------------------------------------------------------------
allv = np.concatenate([verts(o) for o in new_objs.values()])
K = np.concatenate([verts(new_objs['keys_white']), verts(new_objs['keys_black'])])
s = KEY_SPAN / (K[:, 0].max() - K[:, 0].min())
y_front, y_tail, z_floor = allv[:, 1].min(), allv[:, 1].max(), allv[:, 2].min()
xc = (K[:, 0].max() + K[:, 0].min()) / 2
L_units = LENGTH / s
k = (L_units - (Y0 - y_front)) / (y_tail - Y0)
rep['scale_m_per_unit'] = round(s, 5); rep['tail_stretch'] = round(k, 4)
def stretch_y(y): return np.where(y > Y0, Y0 + (y - Y0) * k, y)
rigid = {'legs', 'casters'}
for p, o in new_objs.items():
    me = o.data
    co = np.empty(len(me.vertices) * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    if p in rigid:   # move each loose component (a leg, a caster) rigidly by the stretch at its centre
        lab, comps = components(o)
        lab = np.array(lab)
        for i, cc in enumerate(comps):
            yc = cc['c'][1]
            if yc > Y0: co[lab == i, 1] += (Y0 + (yc - Y0) * k) - yc
    else:
        co[:, 1] = stretch_y(co[:, 1])
    co = (co - np.array([xc, y_front, z_floor])) * s
    me.vertices.foreach_set('co', co.ravel()); me.update()
hinge_out = Vector(((hinge_src.x - xc) * s, 0, (hinge_src.z - z_floor) * s))
pivot_out = Vector(((pivot_src.x - xc) * s, (pivot_src.y - y_front) * s, (pivot_src.z - z_floor) * s))

# ---- 5. weld, decimate hidden detail, materials -----------------------------------------------------------
# the source is triangle soup (every face loose); welding coincident vertices (UVs and normals are per corner,
# so they survive) cuts the file size and lets the decimator see real surfaces
rep['verts_before_weld'] = sum(len(o.data.vertices) for o in new_objs.values())
for o in new_objs.values():
    bm = bmesh.new(); bm.from_mesh(o.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0002)
    bm.to_mesh(o.data); bm.free(); o.data.update()
rep['verts_after_weld'] = sum(len(o.data.vertices) for o in new_objs.values())
for p, r in (('strings', STRINGS_RATIO), ('action', ACTION_RATIO)):
    o = new_objs[p]; bpy.context.view_layer.objects.active = o
    m = o.modifiers.new('dec', 'DECIMATE'); m.ratio = r; m.use_collapse_triangulate = True
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True)
    bpy.ops.object.modifier_apply(modifier='dec')

def strip(mat):   # only the base colour is used by the layout renderer
    nt = mat.node_tree
    for nd in list(nt.nodes):
        if nd.type == 'BSDF_PRINCIPLED':
            for inp in nd.inputs:
                if inp.name != 'Base Color':
                    for l in list(inp.links): nt.links.remove(l)
        if nd.type == 'NORMAL_MAP': nt.nodes.remove(nd)
    used = {l.from_node.name for l in nt.links}
    for nd in list(nt.nodes):
        if nd.type == 'TEX_IMAGE' and nd.name not in used: nt.nodes.remove(nd)
def flat(name, rgb, rough=0.4, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    return m
MATNAME = {'case': 'piano_case', 'case_front': 'piano_case_front', 'lid': 'piano_lid', 'prop_stick': 'piano_propstick',
           'music_desk': 'piano_desk', 'fallboard': 'piano_fallboard', 'legs': 'piano_legs', 'casters': 'piano_brass_casters',
           'lyre': 'piano_lyre', 'pedals': 'piano_brass', 'action': 'piano_felt_action', 'strings': 'piano_strings',
           'plate': 'piano_plate', 'soundboard': 'piano_soundboard', 'ribs': 'piano_ribs'}
for p, o in new_objs.items():
    if p == 'keys_white': o.data.materials[0] = flat('piano_keys_white', (0.86, 0.84, 0.79), 0.3); continue
    if p == 'keys_black': o.data.materials[0] = flat('piano_keys_black', (0.015, 0.015, 0.015), 0.3); continue
    m = o.data.materials[0].copy(); m.name = MATNAME[p]; strip(m)
    for i in range(len(o.data.materials)): o.data.materials[i] = m
for m in list(bpy.data.materials):
    if m.users == 0: bpy.data.materials.remove(m)
for im in list(bpy.data.images):
    if im.users == 0: bpy.data.images.remove(im)

# lid and prop stick get their own pivots (hinge / stick pivot) so they can be opened in three.js
def set_origin(o, p):
    o.data.transform(Matrix.Translation(-p)); o.location = p

# ---- report + export ------------------------------------------------------------------------------------------
allv = np.concatenate([np.array([tuple(o.matrix_world @ v.co) for v in o.data.vertices]) for o in new_objs.values()])
mn, mx = allv.min(0), allv.max(0)
# Blender (x, y, z up) -> glTF (x, z, -y)
rep['size_m_gltf_xyz'] = [round(float(mx[0] - mn[0]), 4), round(float(mx[2] - mn[2]), 4), round(float(mx[1] - mn[1]), 4)]
rep['bounds_gltf'] = dict(x=[round(float(mn[0]), 4), round(float(mx[0]), 4)], y=[round(float(mn[2]), 4), round(float(mx[2]), 4)], z=[round(float(-mx[1]), 4), round(float(-mn[1]), 4)])
rep['tris'] = {p: sum(len(f.vertices) - 2 for f in o.data.polygons) for p, o in new_objs.items()}
rep['tris_total'] = sum(rep['tris'].values())
rep['materials'] = {p: [m.name for m in o.data.materials] for p, o in new_objs.items()}
rep['lid_hinge_gltf'] = dict(point=[round(hinge_out.x, 4), round(hinge_out.z, 4), 0.0], direction=[0, 0, 1])
rep['propstick_pivot_gltf'] = [round(pivot_out.x, 4), round(pivot_out.z, 4), round(-pivot_out.y, 4)]
K = np.concatenate([np.array([tuple(v.co) for v in new_objs[p].data.vertices]) for p in ('keys_white', 'keys_black')])
rep['key_top_y_m'] = round(float(K[:, 2].max()), 4); rep['keyboard_width_m'] = round(float(K[:, 0].max() - K[:, 0].min()), 4)
set_origin(new_objs['lid'], hinge_out)
set_origin(new_objs['prop_stick'], pivot_out)
print('REPORT', json.dumps(rep))
if rep_path: json.dump(rep, open(rep_path, 'w'), indent=1)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_yup=True, export_image_format='JPEG', export_jpeg_quality=85)
