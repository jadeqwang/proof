# Build the rigged body meshes for the layout engine (PROOF_BODY=mesh) from bodies.json, headless:
#   ~/opt/blender-4.5.17-linux-x64/blender -b --offline-mode --python layout/assets/bodies/make_bodies.py -- [id ...]
# Needs the MPFB2 add-on (extension bl_ext.user_default.mpfb) and the MakeHuman system assets pack (CC0) in MPFB's
# user data. Writes layout/assets/bodies/<id>.glb and meta.json (per body: height, bones, hair nodes, eye centres).
# Everything here is CC0 MakeHuman data; nothing is fetched (MPFB online access stays off).
import bpy, bmesh, sys, os, json, math
from mathutils import Vector
import addon_utils

HERE = os.path.dirname(os.path.abspath(__file__))
addon_utils.enable("bl_ext.user_default.mpfb", default_set=True)
from bl_ext.user_default.mpfb.services import HumanService, TargetService, LocationService  # noqa: E402

SPEC = json.load(open(os.path.join(HERE, "bodies.json")))
DATA = LocationService.get_user_data()
RACE = {"asian": (1.0, 0.0, 0.0), "caucasian": (0.0, 1.0, 0.0), "african": (0.0, 0.0, 1.0), "mixed": (0.34, 0.33, 0.33)}


def age_macro(a):  # MakeHuman: 0 = 1 yr, 0.1875 = 11 yr, 0.5 = 25 yr, 1 = 90 yr (piecewise linear)
    if a <= 11: return max(0.0, (a - 1) / 10 * 0.1875)
    if a <= 25: return 0.1875 + (a - 11) / 14 * 0.3125
    return min(1.0, 0.5 + (a - 25) / 65 * 0.5)


def clear():
    for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.armatures, bpy.data.materials, bpy.data.images):
        for d in list(coll):
            if d.users == 0: coll.remove(d)


def group_centroid(obj, name):
    g = obj.vertex_groups.get(name)
    if g is None: return None
    s, n = Vector(), 0
    for v in obj.data.vertices:
        for ge in v.groups:
            if ge.group == g.index and ge.weight > 0.5: s += v.co; n += 1
    return s / n if n else None


def weight(v, gi):
    for ge in v.groups:
        if ge.group == gi: return ge.weight
    return 0.0


def smooth_face(bm_obj, mode, eyeL, eyeR, mouth):
    """Remove the face's features. mode 'none' (first love, never face-on): the whole front of the face from brow to chin
    is cut out, the hole filled with concentric rings and faired (bi-harmonic, so it stays rounded and meets the head
    smoothly): no eyes, nose or mouth. 'blank' (strangers the film leaves undrawn): only the eyes and the mouth are cut
    out and faired over; the nose stays as a gaze cue. The eye sockets and the mouth pocket go with the cut."""
    import numpy as np
    ipd = (eyeL - eyeR).length; eC = (eyeL + eyeR) / 2
    me = bm_obj.data
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    dl = bm.verts.layers.deform.active
    hg = bm_obj.vertex_groups["head"].index; bg = bm_obj.vertex_groups["body"].index; eg = bm_obj.vertex_groups["ears"].index
    def ok(v): d = v[dl]; return d.get(bg, 0) > 0.5 and d.get(hg, 0) > 0.3 and d.get(eg, 0) < 0.1
    def front(p, k=1.0): return p.y < eC.y + 0.3 * ipd * k and mouth.z - 0.8 * ipd * k < p.z < eC.z + 0.7 * ipd * k and abs(p.x) < 1.3 * ipd * k
    def feat(p, k=1.0):
        for e in (eyeL, eyeR):
            if (p - e).length < 0.5 * ipd * k and p.y < e.y + 0.25 * ipd: return True
        if mode == "blank": return False   # strangers keep nose and mouth: only the eyes go
        if abs(p.x) < 0.34 * ipd * k and eC.z - 0.92 * ipd < p.z < eC.z - 0.5 * ipd and p.y < eC.y - 0.28 * ipd: return True   # nose tip and nostrils
        d = p - mouth
        return abs(d.x) < 0.72 * ipd * k and -0.4 * ipd * k < d.z < 0.2 * ipd * k and p.y < mouth.y + 0.3 * ipd
    cutf = feat   # cut the eye and mouth openings (with their pockets) for both modes; "none" then fairs the whole front
    orig = set(bm.verts)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if ok(v) and cutf(v.co)], context="VERTS")
    # drop floating pieces of the head left by the cut (socket and mouth pockets)
    seen, comps = set(), []
    for v0 in bm.verts:
        if v0 in seen: continue
        comp, st = [], [v0]; seen.add(v0)
        while st:
            v = st.pop(); comp.append(v)
            for e in v.link_edges:
                o = e.other_vert(v)
                if o not in seen: seen.add(o); st.append(o)
        comps.append(comp)
    main = max(comps, key=len)
    drop = [v for c in comps if c is not main and all(ok(w) for w in c[:20]) for v in c]
    bmesh.ops.delete(bm, geom=drop, context="VERTS")
    bnd = [e for e in bm.edges if e.is_boundary and all(ok(v) for v in e.verts)]
    faces = bmesh.ops.holes_fill(bm, edges=bnd, sides=0)["faces"]
    print("FACE holes", [len(f.verts) for f in faces], flush=True)
    # concentric rings into each filled hole (quads), then a fan at the centre
    for f in faces:
        cur = f
        fc = f.calc_center_median(); rad = sum((v.co - fc).length for v in f.verts) / len(f.verts)
        for i in range(8):
            bmesh.ops.inset_individual(bm, faces=[cur], thickness=rad / 10, depth=0.0)
            if not cur.is_valid: break
        if cur.is_valid: bmesh.ops.poke(bm, faces=[cur])
    bm.verts.ensure_lookup_table(); bm.verts.index_update()
    new = [v for v in bm.verts if v not in orig]
    for _ in range(30):   # weights of the new vertices from an old neighbour
        for v in new:
            if v[dl].get(bg, 0) > 0.5: continue
            for e in v.link_edges:
                o = e.other_vert(v)
                if o[dl].get(bg, 0) > 0.5:
                    for kk, w in o[dl].items(): v[dl][kk] = w
                    break
    n = len(bm.verts); P = np.array([v.co[:] for v in bm.verts]); E = np.array([[e.verts[0].index, e.verts[1].index] for e in bm.edges])
    deg = np.bincount(E.ravel(), minlength=n).astype(float); deg[deg == 0] = 1
    newset = set(new)
    core = np.array([(v in newset) or (ok(v) and ((front(v.co, 1.0) or v.co.y < eC.y - 0.15 * ipd or (v[dl].get(bg, 0) > 0.5 and v[dl].get(eg, 0) < 0.1 and v[dl].get(hg, 0) > 0.05 and front(v.co, 0.9))) if mode == 'none' else cutf(v.co, 1.3))) for v in bm.verts])
    # thin-plate fairing: solve Lg^2 Q = 0 on the core with everything else fixed (Lg = graph Laplacian D - A), by
    # conjugate gradients (the bi-Laplacian is symmetric positive definite on the core)
    def Lg(X):
        S = np.stack([np.bincount(E[:, 0], weights=X[E[:, 1], c], minlength=n) + np.bincount(E[:, 1], weights=X[E[:, 0], c], minlength=n) for c in range(3)], 1)
        return deg[:, None] * X - S
    Q = P.copy(); fixed = Q.copy(); fixed[core] = 0
    b = -Lg(Lg(fixed))[core]
    def A(x): X = np.zeros_like(Q); X[core] = x; return Lg(Lg(X))[core]
    x = Q[core].copy(); r = b - A(x); d = r.copy(); rr = (r * r).sum(0)
    for it in range(3000):
        Ad = A(d); al = rr / np.maximum((d * Ad).sum(0), 1e-30); x += d * al; r -= Ad * al
        rn = (r * r).sum(0)
        if np.sqrt(rn.max()) < 1e-9: break
        d = r + d * (rn / np.maximum(rr, 1e-30)); rr = rn
    Q[core] = x
    for i, v in enumerate(bm.verts): v.co = Q[i]
    bm.to_mesh(me); bm.free(); me.update()
    return int(core.sum())


def fair_nipples(obj):
    """Clothes cover the chest: fair the nipples away (thin-plate, like the face) so tops do not show them."""
    import numpy as np
    me = obj.data; bg = obj.vertex_groups["body"].index
    body = [v for v in me.vertices if any(ge.group == bg and ge.weight > 0.5 for ge in v.groups)]
    z0 = min(v.co.z for v in body); h = max(v.co.z for v in body) - z0; rad = 0.022 * h
    g = [obj.vertex_groups[n].index for n in ("nipple", "nippleTip") if n in obj.vertex_groups]
    cs = [v.co.copy() for v in body if any(ge.group in g and ge.weight > 0.3 for ge in v.groups)]
    L = [c for c in cs if c.x > 0]; R = [c for c in cs if c.x <= 0]
    if not (L and R): return 0
    cents = [sum(L, Vector()) / len(L), sum(R, Vector()) / len(R)]
    n = len(me.vertices); P = np.array([v.co[:] for v in me.vertices]); E = np.array([e.vertices[:] for e in me.edges])
    deg = np.bincount(E.ravel(), minlength=n).astype(float); deg[deg == 0] = 1
    # a sweater over the chest: the nipple disc is pressed onto the plane of the ring round it (a slight dome), then a
    # short Laplacian smoothing blends it in
    X = P.copy(); r0 = 0.75 * rad
    for c in cents:
        cc = np.array(c[:]); d = np.linalg.norm(P - cc, axis=1); fr = (P[:, 1] - c.y) < 0.6 * rad
        ring = fr & (d > r0) & (d < 1.5 * r0); inner = fr & (d <= r0)
        if ring.sum() < 4 or inner.sum() == 0: continue
        Rp = P[ring]; ctr = Rp.mean(0); u, sv, vt = np.linalg.svd(Rp - ctr); nn = vt[2]
        if nn[1] > 0: nn = -nn   # outward = toward -y (front)
        Q = P[inner] - ctr; Q = Q - np.outer(Q @ nn, nn); rr = np.linalg.norm(Q, axis=1) / r0
        X[inner] = ctr + Q + np.outer(0.12 * r0 * np.clip(1 - rr ** 2, 0, 1), nn)
    dist = np.min([np.linalg.norm(P - np.array(c[:]), axis=1) for c in cents], axis=0)
    front = np.min([P[:, 1] - c.y for c in cents], axis=0) < 0.6 * rad
    wgt = np.where(front, np.clip((1.1 * rad - dist) / (0.6 * rad), 0, 1), 0.0); core = wgt > 0
    for it in range(15):
        S = np.stack([np.bincount(E[:, 0], weights=X[E[:, 1], k], minlength=n) + np.bincount(E[:, 1], weights=X[E[:, 0], k], minlength=n) for k in range(3)], 1) / deg[:, None]
        X = X + 0.5 * wgt[:, None] * (S - X)
    core = core | (np.abs(X - P).sum(1) > 0)
    x = X[core]
    print('NIPPLE core L/R', int((core & (P[:, 0] > 0)).sum()), int((core & (P[:, 0] <= 0)).sum()), 'move max', float(np.abs(P[core] - x).max()), 'centres', [tuple(round(q, 3) for q in c) for c in cents], flush=True)
    P[core] = x
    for i in np.nonzero(core)[0]: me.vertices[i].co = P[i]
    me.update(); return int(core.sum())


def build(spec):
    clear()
    mac = TargetService.get_default_macro_info_dict()
    a, c, af = RACE[spec.get("race", "mixed")]
    mac.update(gender=1.0 if spec["sex"] == "m" else 0.0, age=age_macro(spec["age"]), weight=spec.get("weight", 0.5), muscle=spec.get("muscle", 0.5),
               proportions=spec.get("proportions", 0.5), height=0.5, race={"asian": a, "caucasian": c, "african": af})
    if spec["age"] < 13: mac["cupsize"] = 0.0
    basemesh = HumanService.create_human(macro_detail_dict=mac, scale=0.1, feet_on_ground=False)
    TargetService.bake_targets(basemesh)
    rig = HumanService.add_builtin_rig(basemesh, "game_engine")
    eyeL, eyeR, mouth = group_centroid(basemesh, "joint-l-eye"), group_centroid(basemesh, "joint-r-eye"), group_centroid(basemesh, "lips")
    parts = {}
    if spec["face"] == "drawn":
        parts["eyes"] = HumanService.add_mhclo_asset(os.path.join(DATA, "eyes/high-poly/high-poly.mhclo"), basemesh, asset_type="Eyes", subdiv_levels=0)
        parts["brows"] = HumanService.add_mhclo_asset(os.path.join(DATA, "eyebrows/eyebrow001/eyebrow001.mhclo"), basemesh, asset_type="Eyebrows", subdiv_levels=0)
    for st in dict.fromkeys(spec["hair"]):
        asset = SPEC["hairAssets"][st]
        parts["hair_" + st] = HumanService.add_mhclo_asset(os.path.join(DATA, f"hair/{asset}/{asset}.mhclo"), basemesh, asset_type="Hair", subdiv_levels=0)
    smoothed = 0
    print("NIPPLES", fair_nipples(basemesh), flush=True)
    if spec["face"] in ("none", "blank"): smoothed = smooth_face(basemesh, spec["face"], eyeL, eyeR, mouth)
    # drop the helper geometry (everything outside the 'body' group) and the mask modifier
    bg = basemesh.vertex_groups["body"].index
    bm = bmesh.new(); bm.from_mesh(basemesh.data); bm.verts.ensure_lookup_table()
    dl = bm.verts.layers.deform.active
    kill = [v for v in bm.verts if dl is None or v[dl].get(bg, 0.0) < 0.5]
    bmesh.ops.delete(bm, geom=kill, context="VERTS"); bm.to_mesh(basemesh.data); bm.free()
    for m in list(basemesh.modifiers):
        if m.type == "MASK": basemesh.modifiers.remove(m)
    for o in [basemesh] + list(parts.values()):
        for m in list(o.modifiers):
            if m.type not in ("ARMATURE",): o.modifiers.remove(m)
    # exact height: scale the rig (and its children) so the body's sole-to-crown height is h, soles at z = 0
    zs = [v.co.z for v in basemesh.data.vertices]
    z0, z1 = min(zs), max(zs); s = spec["h"] / (z1 - z0)
    bpy.ops.object.select_all(action="DESELECT")
    for o in [rig, basemesh] + list(parts.values()): o.select_set(True)
    bpy.context.view_layer.objects.active = rig
    rig.scale = (s, s, s); rig.location = (0, 0, -z0 * s)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    zs = [(basemesh.matrix_world @ v.co).z for v in basemesh.data.vertices]
    lm = {k: [round(x, 5) for x in (v * s + Vector((0, 0, -z0 * s)))] for k, v in (('eye_l', eyeL), ('eye_r', eyeR), ('mouth', mouth))}
    # eye bones (the game-engine rig has none): at each eyeball's centre, pointing forward (-Y), parented to the head
    meta_eyes = None
    if "eyes" in parts:
        eo = parts["eyes"]; mw = eo.matrix_world
        cs = {}
        for side, sg in (("l", 1), ("r", -1)):
            pts = [mw @ v.co for v in eo.data.vertices if (v.co.x > 0) == (sg > 0)]
            lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))); hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
            cs[side] = ((lo + hi) / 2, (hi - lo))
        bpy.ops.object.select_all(action="DESELECT"); bpy.context.view_layer.objects.active = rig; rig.select_set(True)
        bpy.ops.object.mode_set(mode="EDIT")
        eb = rig.data.edit_bones
        for side in ("l", "r"):
            b = eb.new("eye_" + side); c0 = rig.matrix_world.inverted() @ cs[side][0]
            b.head = c0; b.tail = c0 + Vector((0, -0.02, 0)); b.parent = eb["head"]; b.use_deform = True
        bpy.ops.object.mode_set(mode="OBJECT")
        for g in list(eo.vertex_groups): eo.vertex_groups.remove(g)
        gl, gr = eo.vertex_groups.new(name="eye_l"), eo.vertex_groups.new(name="eye_r")
        gl.add([v.index for v in eo.data.vertices if v.co.x > 0], 1.0, "REPLACE"); gr.add([v.index for v in eo.data.vertices if v.co.x <= 0], 1.0, "REPLACE")
        meta_eyes = {s: {"centre": list(cs[s][0]), "size": list(cs[s][1])} for s in cs}
    # names for the adapter
    basemesh.name = "body"
    for k, o in parts.items(): o.name = k
    for o in [basemesh] + list(parts.values()): o.data.materials.clear()
    out = os.path.join(HERE, spec["id"] + ".glb")
    bpy.ops.object.select_all(action="DESELECT")
    for o in [rig, basemesh] + list(parts.values()): o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", use_selection=True, export_apply=True, export_skins=True, export_morph=False,
                              export_animations=False, export_materials="NONE", export_yup=True, export_normals=True, export_texcoords=False,
                              export_influence_nb=4, export_all_influences=False)
    bones = {b.name: {"head": [round(x, 5) for x in b.head_local], "tail": [round(x, 5) for x in b.tail_local], "parent": b.parent.name if b.parent else None} for b in rig.data.bones}
    return {"id": spec["id"], "h": spec["h"], "measured_h": round(max(zs) - min(zs), 4), "sole_z": round(min(zs), 4), "verts": len(basemesh.data.vertices),
            "face": spec["face"], "landmarks_blender_zup": lm, "smoothed_verts": smoothed, "hair": {st: SPEC["hairAssets"][st] for st in spec["hair"]}, "eyes": meta_eyes,
            "parts": {k: len(o.data.vertices) for k, o in parts.items()}, "bones_blender_zup": bones,
            "macros": {k: (round(v, 4) if isinstance(v, float) else v) for k, v in mac.items()}}


argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
metaf = os.path.join(HERE, "meta.json")
meta = json.load(open(metaf)) if os.path.exists(metaf) else {}
for spec in SPEC["bodies"]:
    if argv and spec["id"] not in argv: continue
    r = build(spec)
    meta[spec["id"]] = r
    print("BODY", spec["id"], "h", r["measured_h"], "verts", r["verts"], "parts", r["parts"], "smoothed", r["smoothed_verts"], flush=True)
    json.dump(meta, open(metaf, "w"), indent=1)
