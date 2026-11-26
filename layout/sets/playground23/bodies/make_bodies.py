# SET-LOCAL COPY for playground23 (the girl at 4, the boy at 7, Dad in 2023): a bridge until girl4 / boy7 / dad23 are
# added to layout/assets/bodies and the engine's BODY_OF. Copied from layout/assets/bodies/make_bodies.py; HERE is this
# folder, so bodies.json is read from here and <id>.glb + meta.json are written here. Additions over the shared script:
#   - race "asian_caucasian" (half East Asian, half European: 0.5 / 0.5 / 0)
#   - per-body "targets": {MakeHuman target name: weight} loaded on top of the macros before baking (head scale,
#     cheeks, chin ...); helper joints move with them, so the rig, eyes and landmarks stay consistent
#   - per-body "hairAssets" overriding the global map (null = no MakeHuman proxy: built from the scalp)
#   - hairBuild "crop": a short cut grown from the scalp (the boy's soft short cut; Dad's swept-up side-parted cut)
#   ~/opt/blender-4.5.17-linux-x64/blender -b --offline-mode --python layout/sets/playground23/bodies/make_bodies.py -- [id ...]
# Build the rigged body meshes for the layout engine (PROOF_BODY=mesh) from bodies.json, headless:
#   ~/opt/blender-4.5.17-linux-x64/blender -b --offline-mode --python layout/assets/bodies/make_bodies.py -- [id ...]
# Needs the MPFB2 add-on (extension bl_ext.user_default.mpfb) and the MakeHuman system assets pack (CC0) in MPFB's
# user data. Writes layout/assets/bodies/<id>.glb and meta.json (per body: height, bones, hair nodes, eye centres).
# Everything here is CC0 MakeHuman data; nothing is fetched (MPFB online access stays off).
import bpy, bmesh, sys, os, json, math
from mathutils import Vector, Matrix
import addon_utils

HERE = os.path.dirname(os.path.abspath(__file__))
addon_utils.enable("bl_ext.user_default.mpfb", default_set=True)
from bl_ext.user_default.mpfb.services import HumanService, TargetService, LocationService  # noqa: E402

SPEC = json.load(open(os.path.join(HERE, "bodies.json")))
DATA = LocationService.get_user_data()
RACE = {"asian": (1.0, 0.0, 0.0), "caucasian": (0.0, 1.0, 0.0), "african": (0.0, 0.0, 1.0), "mixed": (0.34, 0.33, 0.33), "asian_caucasian": (0.5, 0.5, 0.0)}


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


CLOTHES = os.path.join(DATA, "clothes")


def add_clothes(basemesh, name):
    return HumanService.add_mhclo_asset(os.path.join(CLOTHES, name, name + ".mhclo"), basemesh, asset_type="Clothes", subdiv_levels=0)


def delete_verts(obj, pred):
    bm = bmesh.new(); bm.from_mesh(obj.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if pred(v.co)], context="VERTS"); bm.to_mesh(obj.data); bm.free(); obj.data.update()


def isocut(bm, field):
    """Cut the mesh along the zero line of field(co) (edges split where it changes sign, faces split along it) and drop
    the faces on its negative side: smooth hair edges instead of the mesh's face staircase."""
    fv = {v: field(v.co) for v in bm.verts}
    new = []
    for e in [e for e in bm.edges if (fv[e.verts[0]] > 0) != (fv[e.verts[1]] > 0)]:
        a, b = e.verts; t = fv[a] / (fv[a] - fv[b])
        ne, nv = bmesh.utils.edge_split(e, a, t); fv[nv] = 0.0; new.append(nv)
    ns = set(new)
    for f in list({f for v in new for f in v.link_faces}):
        vs = [v for v in f.verts if v in ns]
        if len(vs) == 2:
            try: bmesh.ops.connect_verts(bm, verts=vs)
            except Exception: pass
    kill = [f for f in bm.faces if sum(fv.get(v, field(v.co)) for v in f.verts) / len(f.verts) < 0]
    bmesh.ops.delete(bm, geom=kill, context="FACES")
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")


def shell(base, rig, pick, offset, name, thick=0.0, field=None, subdiv=0):
    """A hair shell grown from the body's own surface: the picked faces of the (face-edited) body, cut along field = 0
    (if given), optionally subdivided (subdiv cuts per edge, smoothed: a finer surface for strand texture), pushed out
    along their normals by offset(co, n), optionally solidified (a visible rim: the step of a cut), skinned like the
    skin under it."""
    obj = base.copy(); obj.data = base.data.copy(); obj.name = name; bpy.context.scene.collection.objects.link(obj)
    for m in list(obj.modifiers): obj.modifiers.remove(m)
    bm = bmesh.new(); bm.from_mesh(obj.data); bm.faces.ensure_lookup_table()
    dl = bm.verts.layers.deform.active; bg = base.vertex_groups["body"].index
    keep = {f for f in bm.faces if all(v[dl].get(bg, 0) > 0.5 for v in f.verts) and pick(f.calc_center_median(), f.normal, f, dl)}
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f not in keep], context="FACES")
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
    if subdiv:   # deform weights are interpolated onto the new vertices; before the cut, so a finely uneven edge is sampled
        bmesh.ops.subdivide_edges(bm, edges=list(bm.edges), cuts=subdiv, use_grid_fill=True, smooth=1.0)
        bmesh.ops.triangulate(bm, faces=list(bm.faces))
    if field: isocut(bm, field)
    bm.normal_update()
    for v in bm.verts: v.co = v.co + v.normal * offset(v.co, v.normal)
    bm.to_mesh(obj.data); bm.free(); obj.data.update()
    if thick:
        md = obj.modifiers.new("solid", "SOLIDIFY"); md.thickness = thick; md.offset = -1.0; md.use_rim = True
        bpy.ops.object.select_all(action="DESELECT"); bpy.context.view_layer.objects.active = obj; obj.select_set(True)
        bpy.ops.object.modifier_apply(modifier=md.name)
    # the shell keeps the skin's own weights (head and neck bones), so it moves with the scalp and nape it covers
    md = obj.modifiers.new("Armature", "ARMATURE"); md.object = rig
    return obj


def in_group(obj, name, f, dl, w=0.5):
    gi = obj.vertex_groups[name].index
    return sum(1 for v in f.verts if v[dl].get(gi, 0) > w) * 2 > len(f.verts)


def build_hair(spec, basemesh, rig, parts, eyeL, eyeR, mouth):
    """Hair to the cast sheets (bodies.json "hairBuild"): kids' long hair trimmed to length + a light parted fringe of
    strands; first love's stepped cut (a long top layer with a centre part over an even short buzz, a visible step);
    close pulled-back hair under a bun."""
    hb = spec.get("hairBuild", {}); ipd = (eyeL - eyeR).length; eC = (eyeL + eyeR) / 2
    bones = rig.data.bones
    hg = basemesh.vertex_groups["head"].index; eg = basemesh.vertex_groups["ears"].index
    ng = basemesh.vertex_groups["neck_01"].index
    def head(f, dl): return all((v[dl].get(hg, 0) > 0.02 or v[dl].get(ng, 0) > 0.2) and v[dl].get(eg, 0) < 0.05 for v in f.verts)
    hc = eC + Vector((0, 1.4 * ipd, 0))   # a point inside the head, behind the eyes
    def ang(c): d = c - hc; return abs(math.degrees(math.atan2(d.x, -d.y)))   # 0 front, 90 over the ear, 180 back
    def interp(a, tab):
        for (a0, z0), (a1, z1) in zip(tab, tab[1:]):
            if a <= a1: t = (a - a0) / (a1 - a0); t = t * t * (3 - 2 * t); return z0 + (z1 - z0) * t
        return tab[-1][1]
    HAIRLINE = [(0, 1.0), (40, 0.95), (62, 0.45), (75, 0.2), (100, 0.05), (118, -0.85), (140, -1.5), (180, -1.62)]   # ipd above the eyes
    def hairline(c): return c.z - (eC.z + ipd * interp(ang(c), HAIRLINE))
    for st, how in hb.items():
        key = "hair_" + st
        if how.get("trim") and key in parts:   # MakeHuman long hair cut to the sheet's length
            z = {"nape": mouth.z - 0.2 * ipd, "chin": mouth.z - 0.95 * ipd, "shoulders": bones["neck_01"].head_local.z - 0.6 * ipd, "blades": bones["spine_03"].head_local.z, "midback": bones["spine_02"].head_local.z}[how["trim"]]
            delete_verts(parts[key], lambda co: co.z < z)
        if how.get("fringe"):   # a light fringe parted in the middle: two soft curtains, the forehead showing between them,
            # their lower edge well above the brows in the middle and sloping down toward the temples (cast sheets)
            lift = 0.0 if how["fringe"] == "light" else 0.22   # at 10 the fringe has grown out: higher
            def fringe(c, lift=lift):
                ax = abs(c.x) / ipd   # one soft fringe across the forehead, a slight lift at the centre parting, lower toward the temples
                return min(c.z - (eC.z + ipd * (0.66 + lift + 0.1 * math.exp(-(ax / 0.14) ** 2) - 0.2 * min(1.0, ax / 0.95))), 1.05 * ipd - abs(c.x))
            def pick(c, n, f, dl): return head(f, dl) and c.y < eC.y + 0.2 * ipd and c.z > eC.z + 0.3 * ipd
            parts[key + "__fringe"] = shell(basemesh, rig, pick, lambda co, n: 0.0045, key + "__fringe", thick=0.003, field=fringe)
        if how.get("cap"):   # close hair over the whole scalp, pulled back (under a bun: "knot" adds the bun itself)
            parts[key] = shell(basemesh, rig, lambda c, n, f, dl: head(f, dl), lambda co, n: 0.005, key, field=hairline, subdiv=1)
            if how.get("knot"): parts[key + "__knot"] = bun_knot(basemesh, rig, key + "__knot", eC, ipd, how["knot"])
        if how.get("crop"):   # set-local: a short cut from the scalp (the boy; Dad in 2023)
            parts[key] = crop(basemesh, rig, key, eC, ipd, hc, hairline, head, how["crop"])
        if how.get("dutch"):   # set-local: the girl's two Dutch braids into low pigtails, over close hair with a centre part
            parts[key + "__braids"] = dutch_braids(basemesh, rig, key + "__braids", eC, ipd, hc, how["dutch"])
        if how.get("perm"):   # Mama: a jaw-length, side-parted perm of loose springy curls (cast/mama/mama_R)
            parts[key] = perm(basemesh, rig, key, eC, ipd, mouth, hc)
        if how.get("stepped"):
            # the step: from the fringe tip on the forehead back above the ear, round the back at ear-top level
            STEP = [(0, 0.45), (35, 0.4), (62, 0.32), (88, 0.24), (112, 0.0), (140, -0.3), (180, -0.42)]   # over the ear tops, down to mid-ear height at the back (cast/first_love/fl_B_backhead_neck_v5)
            # 2026-11-26 (Jade: "a little too perfect ... like he doesn't brush it every day, just runs his hand through it"):
            # finger-combed pieces. s = where a strand sits across the flow (strands fall from the part / crown: s is the
            # arc length round a stadium around the part, constant along each strand); the pieces are ridges in s with
            # sharp grooves between them, deeper toward the ends, and the point-cut ends are uneven per piece.
            yF, yC, R0 = eC.y + 0.35 * ipd, hc.y + 0.35 * ipd, ipd
            L = yC - yF; PER = 2 * (math.pi * R0 + L)
            def flow_s(co):
                if co.y < yF: return R0 * math.atan2(co.x, yF - co.y)
                if co.y <= yC: return math.copysign(R0 * math.pi / 2 + (co.y - yF), co.x if co.x else 1.0)
                th = math.atan2(abs(co.x), co.y - yC)   # 0 straight back, pi/2 at the side
                return math.copysign(R0 * math.pi / 2 + L + R0 * (math.pi / 2 - th), co.x if co.x else 1.0)
            def ridge(u, n, ph): return math.sqrt(abs(math.sin(n * u / 2 + ph))) - 0.64
            def pieces(co):   # -0.6 .. +0.4: rounded pieces, sharp gaps between them
                u = 2 * math.pi * flow_s(co) / PER
                return 0.55 * ridge(u, 46, 0.3) + 0.3 * ridge(u, 71, 1.7) + 0.15 * ridge(u, 23, 2.9)
            def ends(c):   # the ends: uneven per piece, in broader steps than the surface pieces
                u = 2 * math.pi * flow_s(c) / PER
                return 0.6 * math.sin(13 * u + 0.9) + 0.4 * math.sin(21 * u + 2.2)   # smooth (a cusped edge folds the solidified rim)
            def step(c): return c.z - (eC.z + ipd * (interp(ang(c), STEP) + 0.06 * ends(c)))   # point-cut, uneven per piece
            NAPE = [(0, 1.0), (40, 0.95), (62, 0.45), (75, 0.2), (100, 0.0), (118, -0.75), (140, -1.15), (180, -1.3)]   # his buzz ends higher on the neck (fl_B)
            def nape(c): return c.z - (eC.z + ipd * interp(ang(c), NAPE))
            parts[key + "__buzz"] = shell(basemesh, rig, lambda c, n, f, dl: head(f, dl), lambda co, n: 0.0035, key + "__buzz", field=nape, subdiv=1)
            ztop = eC.z + 1.9 * ipd
            def top_off(co, n):
                # the part: a slightly irregular, finger-made dip on the midline, top of the head only
                px = 0.05 * ipd * math.sin(co.y / ipd * 4.1)
                part = min(1.0, abs(co.x - px) / (0.12 * ipd)) if co.z > eC.z + 1.2 * ipd and co.y < yC + 0.2 * ipd else 1.0
                a = ang(co); back = max(0.0, min(1.0, (a - 55) / 50))
                hang = 0.16 * max(0.0, eC.z + 0.7 * ipd - co.z) * back   # below the crown the layer hangs straight, off the skull
                # less dome: thinner on the flat top, fuller at the upper corners of the head, so the outline is squarer
                up = max(-1.0, min(1.0, n.z)); corner = 1.0 - (2 * up * up - 1) ** 2   # 0 on top and at the sides, 1 at 45 degrees
                along = max(0.0, min(1.0, (ztop - co.z) / (1.6 * ipd)))   # 0 at the roots on top, 1 at the ends
                tex = (0.0012 + 0.0032 * along) * pieces(co) / 0.4 * part * max(0.0, min(1.0, step(co) / (0.2 * ipd)))   # eased off at the ends (a folded rim speckles)
                return 0.0065 + 0.006 * corner + 0.006 * (0.5 + 0.5 * part) + hang + tex
            parts[key] = shell(basemesh, rig, lambda c, n, f, dl: head(f, dl), top_off, key, thick=0.008, field=lambda c: min(hairline(c) + 0.3 * ipd, step(c)), subdiv=2)
    return parts


def rigid_to_head(obj, rig):
    """Skin every vertex of obj fully to the head bone (a bun or a perm moves with the head as one piece)."""
    for g in list(obj.vertex_groups): obj.vertex_groups.remove(g)
    obj.vertex_groups.new(name="head").add([v.index for v in obj.data.vertices], 1.0, "REPLACE")
    for m in list(obj.modifiers): obj.modifiers.remove(m)
    md = obj.modifiers.new("Armature", "ARMATURE"); md.object = rig


def new_like(base, name, bm):
    """A new object with base's parent (the rig) and transform, holding bm's mesh."""
    obj = base.copy(); obj.data = bpy.data.meshes.new(name); obj.name = name
    bm.to_mesh(obj.data); bm.free(); obj.data.update(); bpy.context.scene.collection.objects.link(obj)
    for m in list(obj.modifiers): obj.modifiers.remove(m)
    for g in list(obj.vertex_groups): obj.vertex_groups.remove(g)
    return obj


def bun_knot(base, rig, name, eC, ipd, where):
    """A bun pinned at the back of the head, half sunk into the close hair (it used to be an engine ball floating behind
    the skull, over a bob-length shell): a flattened, slightly twisted knot, rigid with the head. where = 'low'
    (aunt, grandmother: at the occiput) or 'mid'."""
    bg = base.vertex_groups["body"].index; hg = base.vertex_groups["head"].index
    hc = eC + Vector((0, 1.4 * ipd, 0))
    elev = math.radians(5 if where == "low" else 22)
    d = Vector((0, math.cos(elev), math.sin(elev)))   # back (+y) and up
    best, bp = -1e9, None
    for v in base.data.vertices:   # the skull's surface point furthest along d
        if any(ge.group == hg and ge.weight > 0.5 for ge in v.groups) and any(ge.group == bg and ge.weight > 0.5 for ge in v.groups):
            r = v.co - hc
            if r.length and r.normalized().dot(d) > 0.985 and r.dot(d) > best: best, bp = r.dot(d), v.co.copy()
    if bp is None: bp = hc + d * 1.45 * ipd
    R = 0.62 * ipd
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=20, radius=R)
    for v in bm.verts:   # a knot of hair wound round: flattened along d, spiral grooves of the twist
        p = v.co / R; ang_ = math.atan2(p.x, p.z); r = math.hypot(p.x, p.z)
        g = 1.0 + 0.06 * math.sin(3 * ang_ + 9 * r) * min(1.0, 3 * r)
        v.co = Vector((p.x * g, p.y * 0.62, p.z * g)) * R
    # local frame: y along d (out from the skull), z up
    yax = d; xax = Vector((1, 0, 0)); zax = xax.cross(yax).normalized()
    M = [xax, yax, zax]
    ctr = bp + d * (0.32 * R)   # sunk about 40% of its depth into the hair
    for v in bm.verts: v.co = ctr + M[0] * v.co.x + M[1] * v.co.y + M[2] * v.co.z
    obj = new_like(base, name, bm)
    rigid_to_head(obj, rig)
    return obj


def perm(base, rig, name, eC, ipd, mouth, hc):
    """Mama's perm (cast/mama/mama_R_rest_heads_v1): soft late-1980s perm of loose springy curls, side-parted (on her
    right), ending at the jaw, the face open. Built as a volume: the head inflated (fuller toward the ends, a little
    swept toward her left from the part), voxel-remeshed into one closed surface, the face cut out (an elliptic prism, so
    the hair has a visible thickness where it frames the face), open at the bottom, curls displaced on the surface
    (Voronoi lumps, a little longer than wide), then rigid with the head."""
    import numpy as np
    from mathutils import noise
    bg = base.vertex_groups["body"].index
    zb = mouth.z - 0.6 * ipd   # the ends: at the jaw (never longer); a little higher at the back (ztilt)
    xp = -0.55 * ipd            # the side part, over her right eye (-x = her right)
    bm = bmesh.new(); bm.from_mesh(base.data); dl = bm.verts.layers.deform.active
    hg = base.vertex_groups["head"].index
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v[dl].get(bg, 0) < 0.5 or v.co.z < zb - 0.3 * ipd or v[dl].get(hg, 0) < 0.3], context="VERTS")
    bm.normal_update()
    ztop = eC.z + 2.0 * ipd
    pts = []
    for v in bm.verts:
        c = v.co; n_ = v.normal; down = max(0.0, min(1.0, (ztop - c.z) / (ztop - zb)))   # 0 at the crown, 1 at the ends
        if c.z < eC.z + 0.4 * ipd and c.y < eC.y + 0.9 * ipd and abs(c.x) < 1.0 * ipd: continue   # the face itself does not shape the hair
        sweep = 0.12 * ipd * max(0.0, min(1.0, (c.x - xp) / ipd)) * max(0.0, 1 - down * 1.5)   # volume swept over from the part
        t = (0.24 * ipd + 0.55 * ipd * down ** 1.6 + sweep) * (1 - 0.55 * max(0.0, -n_.y) * (1 - down))   # thin over the forehead
        pts.append(c + n_ * t)
    bm.free(); bm = bmesh.new()
    for p_ in pts: bm.verts.new(p_)
    # the hull: a perm stands off the head as one soft mass, widest at the ends (a bell), hanging clear of the neck
    bmesh.ops.convex_hull(bm, input=list(bm.verts))
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
    bmesh.ops.triangulate(bm, faces=list(bm.faces))
    obj = new_like(base, name, bm)
    bpy.ops.object.select_all(action="DESELECT"); bpy.context.view_layer.objects.active = obj; obj.select_set(True)
    # the face cut: an elliptic prism along y from the front of the face to just in front of the ears; the oval's top
    # is the hairline, its sides just outside the cheeks, open downward
    fa, ftop, fz = 1.12 * ipd, eC.z + 1.05 * ipd, eC.z - 0.2 * ipd
    yb = eC.y + 0.95 * ipd
    cb = bmesh.new(); ring = []
    for i in range(48):
        th = math.pi * i / 47   # the upper half-ellipse, then straight sides down
        ring.append((fa * math.cos(th), fz + (ftop - fz) * math.sin(th)))
    prof = [(fa, zb - 1.5 * ipd)] + ring + [(-fa, zb - 1.5 * ipd)]
    front = [cb.verts.new((x, eC.y - 2.5 * ipd, z)) for x, z in prof]
    back = [cb.verts.new((x, yb, z)) for x, z in prof]
    n = len(prof)
    for i in range(n):
        j = (i + 1) % n
        cb.faces.new((front[i], front[j], back[j], back[i]))
    cb.faces.new(front[::-1]); cb.faces.new(back)
    bmesh.ops.recalc_face_normals(cb, faces=list(cb.faces))
    # and the sides of the face: in profile the hair's front edge runs from the top of the forehead down and back to in
    # front of the ear (behind the cheekbone): everything in front of that sloping line goes (a prism along x)
    ys, zs_ = eC.y + 0.62 * ipd, eC.z + 0.35 * ipd
    yt, zt = eC.y - 3 * ipd, zs_ + (eC.y - 3 * ipd - ys) * ((1.25 - 0.35) / (-0.45 - 0.62))
    prof2 = [(eC.y - 3 * ipd, zb - 3 * ipd), (ys, zb - 3 * ipd), (ys, zs_), (yt, zt)]
    cb2 = bmesh.new()
    L_ = [cb2.verts.new((-3 * ipd, y, z)) for y, z in prof2]; R_ = [cb2.verts.new((3 * ipd, y, z)) for y, z in prof2]
    for i in range(4):
        j = (i + 1) % 4; cb2.faces.new((L_[i], L_[j], R_[j], R_[i]))
    cb2.faces.new(L_[::-1]); cb2.faces.new(R_)
    bmesh.ops.recalc_face_normals(cb2, faces=list(cb2.faces))
    for cbm in (cb, cb2):
        cut = new_like(base, name + "_cut", cbm); cut.parent = None
        cut.matrix_world = obj.matrix_world
        md = obj.modifiers.new("face", "BOOLEAN"); md.operation = "DIFFERENCE"; md.object = cut; md.solver = "EXACT"
        bpy.ops.object.modifier_apply(modifier=md.name)
        bpy.data.objects.remove(cut, do_unlink=True)
    # one even surface (the cut faces too, so the curls show where the hair frames the face)
    bpy.ops.object.select_all(action="DESELECT"); bpy.context.view_layer.objects.active = obj; obj.select_set(True)
    obj.data.remesh_voxel_size = 0.045 * ipd; obj.data.use_remesh_fix_poles = True
    bpy.ops.object.voxel_remesh()
    # open at the bottom along a soft, curl-scalloped line at the jaw
    bm = bmesh.new(); bm.from_mesh(obj.data)
    isocut(bm, lambda c: c.z - (zb + 0.25 * ipd * max(0.0, min(1.0, (c.y - eC.y) / (2.2 * ipd))) + 0.07 * ipd * math.sin(9 * math.atan2(c.x, c.y - hc.y)) + 0.1 * ipd * noise.noise(Vector((c.x, c.y, 0)) * (3.0 / ipd))))
    # curls: rounded lumps (1 - F1 of a Voronoi field, cells ~0.3 ipd, a little stretched downward), along the normals
    bm.normal_update()
    sc = Vector((1 / (0.34 * ipd), 1 / (0.34 * ipd), 1 / (0.55 * ipd)))
    disp = []
    for v in bm.verts:
        c = v.co; q = Vector((c.x * sc.x, c.y * sc.y, c.z * sc.z))
        f1 = noise.voronoi(q, distance_metric="DISTANCE")[0][0]
        lump = max(0.0, 1.0 - f1 / 0.9) ** 0.7 - 0.45
        down = max(0.0, min(1.0, (ztop - c.z) / (ztop - zb)))
        amp = 0.12 * ipd * (0.3 + 0.7 * down)   # flatter at the roots, springier toward the ends
        groove = 0.0
        if c.z > eC.z + 1.0 * ipd and c.y < hc.y + 0.2 * ipd:   # the side part: a narrow line where the hair lies flat to the scalp
            w = abs(c.x - xp) / (0.22 * ipd)
            if w < 1: amp *= 0.3 + 0.7 * w; groove = -0.22 * ipd * (1 - w * w) ** 2 * min(1.0, (hc.y + 0.2 * ipd - c.y) / (0.6 * ipd))
        disp.append(v.normal * (amp * lump + groove))
    for v, dd in zip(bm.verts, disp): v.co += dd
    bm.to_mesh(obj.data); bm.free(); obj.data.update()
    for p_ in obj.data.polygons: p_.use_smooth = True
    rigid_to_head(obj, rig)
    return obj


def hair_asset(spec, st):
    """The MakeHuman hair proxy for a hairStyle: the body's own map first (null = built from the scalp), else the global one."""
    own = spec.get("hairAssets", {})
    return own[st] if st in own else SPEC["hairAssets"].get(st)


def crop(base, rig, name, eC, ipd, hc, hairline, head, o):
    """A short cut grown from the scalp (set-local, playground23). o: side / top = thickness (ipd) over the sides and
    on top; lift = extra height at the front of the top (hair swept up and back); part = 'left' / 'right' / none (a
    groove where the hair parts, the far side fuller); front = how far the hairline sits above the shared HAIRLINE
    (ipd). The thickness eases in from the cut edge, so the front rises from the hairline instead of a cliff (and no
    fringe falls over the forehead)."""
    side, top, lift = o.get("side", 0.07), o.get("top", 0.12), o.get("lift", 0.0)
    xp = {"left": 0.5 * ipd, "right": -0.5 * ipd, "centre": 0.0}.get(o.get("part"), None)   # +x = the figure's left
    ztop0, ztop1 = eC.z + 0.9 * ipd, eC.z + 1.8 * ipd
    fr = o.get("front", 0.0)
    def field(c): return hairline(c) - fr * ipd * max(0.0, 1.0 - abs(c.x) / (1.2 * ipd)) * (1.0 if c.y < hc.y else 0.0)
    def sstep(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
    def off(co, n):
        wt = sstep((co.z - ztop0) / (ztop1 - ztop0))                    # 0 on the sides, 1 on top
        front = sstep((hc.y - co.y) / (1.6 * ipd))                      # 1 at the front of the head, 0 behind the crown
        t = side + wt * (top + lift * front)
        if xp is not None and co.z > eC.z + 1.1 * ipd and co.y < hc.y + 0.5 * ipd:
            d = co.x - xp; s_ = 1.0 if (d < 0) == (xp > 0) else -1.0   # s_ > 0 toward the crown's middle: the fuller side
            w = abs(d) / (0.16 * ipd)
            if w < 1: t = side + (t - side) * (0.25 + 0.75 * w * w)    # the part line: the hair lies close there
            elif s_ > 0 and xp != 0: t += 0.04 * wt * min(1.0, (w - 1))  # the swept side a little fuller
        e0 = o.get("edge", 0.35)
        return ipd * t * (e0 + (1 - e0) * sstep(field(co) / (0.3 * ipd)))   # eased in from the cut edge
    return shell(base, rig, lambda c, n, f, dl: head(f, dl), off, name, thick=0.004 * ipd / 0.062, field=field, subdiv=1)


def dutch_braids(base, rig, name, eC, ipd, hc, o):
    """Two Dutch braids (set-local, the girl at 4): each starts at the front hairline beside the centre part, runs back
    over the top and the side of the head, down behind the ear to the nape, and goes on as a low pigtail hanging to
    about the collar, ending in a curly puff below the tie. A braid is a chain of plaited lumps (ellipsoids, alternately
    tilted) laid on the scalp (ray-cast onto the body), voxel-remeshed into one surface, rigid with the head."""
    from mathutils.bvhtree import BVHTree
    bg = base.vertex_groups["body"].index
    me = base.data
    isb = [any(ge.group == bg and ge.weight > 0.5 for ge in v.groups) for v in me.vertices]
    polys = [list(p_.vertices) for p_ in me.polygons if all(isb[i] for i in p_.vertices)]
    bvh = BVHTree.FromPolygons([v.co.copy() for v in me.vertices], polys)
    r = o.get("radius", 0.2) * ipd
    def surf(dv):   # the scalp point in direction dv from inside the head, and its normal
        dv = dv.normalized(); hit = bvh.ray_cast(hc + dv * 6 * ipd, -dv)
        return (hit[0], hit[1]) if hit[0] is not None else (hc + dv * 1.5 * ipd, dv)
    def catmull(P, n):
        out = []
        for i in range(len(P) - 1):
            p0, p1, p2, p3 = P[max(0, i - 1)], P[i], P[i + 1], P[min(len(P) - 1, i + 2)]
            for k in range(n):
                t = k / n
                out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
        out.append(P[-1]); return out
    bm = bmesh.new()
    def lump(c, ax, side, rad, tilt):
        ax = ax.normalized(); up = side.cross(ax).normalized(); side = ax.cross(up).normalized()
        R = Matrix.Rotation(tilt, 3, ax) @ Matrix((side, up, ax)).transposed()
        g = bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=10, radius=1.0)
        for v in g["verts"]: v.co = c + R @ Vector((v.co.x * rad * 0.95, v.co.y * rad * 0.7, v.co.z * rad * 1.15))
    for sx in (1, -1):
        K = [Vector((sx * 0.35, -1.25, 1.0)), Vector((sx * 0.6, -0.5, 1.45)), Vector((sx * 0.85, 0.5, 1.15)), Vector((sx * 0.9, 1.15, 0.2)), Vector((sx * 0.6, 1.1, -0.75))]
        pts, nrm = [], []
        for dv in catmull(K, 14):
            p_, n_ = surf(dv); pts.append(p_ + n_ * 0.45 * r); nrm.append(n_)
        # thinner where it starts at the hairline, full by the top of the head
        L = 0.0; i = 0; last = pts[0]; k = 0
        while i < len(pts) - 1:
            a_, b_ = pts[i], pts[i + 1]; ax = b_ - a_
            rad = r * (0.55 + 0.45 * min(1.0, i / 10))
            lump(a_, ax, nrm[i].cross(ax), rad, 0.5 if k % 2 else -0.5); k += 1
            # next lump ~0.7 rad further along the path
            step = 0.7 * rad; acc = 0.0
            while i < len(pts) - 1 and acc < step: acc += (pts[i + 1] - pts[i]).length; i += 1
        # the low pigtail: hangs from the nape, a little out to the side and back, to about the collar
        p0 = pts[-1]
        tail = [p0, p0 + Vector((sx * 0.2, 0.25, -0.5)) * ipd, p0 + Vector((sx * 0.35, 0.3, -1.1)) * ipd, p0 + Vector((sx * 0.42, 0.28, -1.6)) * ipd]
        tp = catmull(tail, 8); acc = 0.0; k2 = 0
        tie = None
        for j in range(len(tp) - 1):
            acc += (tp[j + 1] - tp[j]).length
            if acc < 0.7 * r and j: continue
            acc = 0.0; ax = tp[j + 1] - tp[j]; frac = j / (len(tp) - 1)
            if tie is None and frac > 0.15: tie = tp[j]
            lump(tp[j], ax, Vector((1, 0, 0)).cross(ax) if ax.length else Vector((0, 1, 0)), r * (0.85 - 0.25 * frac), 0.5 if k2 % 2 else -0.5); k2 += 1
        # curly ends: a loose puff of curls below the braid
        end = tp[-1]
        for q in range(9):
            a = q * 2.4; off = Vector((math.cos(a) * 0.45 * r, math.sin(a) * 0.45 * r, -0.35 * r * (q % 3)))
            g = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.75 * r)
            for v in g["verts"]: v.co = v.co + end + off + Vector((0, 0, -0.5 * r))
        # the hair tie: a small ring-ish band at the top of the pigtail
        if tie is not None:
            g = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.62 * r)
            for v in g["verts"]: v.co = Vector((v.co.x, v.co.y, v.co.z * 0.5)) + tie
    obj = new_like(base, name, bm)
    bpy.ops.object.select_all(action="DESELECT"); bpy.context.view_layer.objects.active = obj; obj.select_set(True)
    obj.data.remesh_voxel_size = 0.045 * ipd; bpy.ops.object.voxel_remesh()
    for p_ in obj.data.polygons: p_.use_smooth = True
    rigid_to_head(obj, rig)
    return obj


def build(spec):
    clear()
    mac = TargetService.get_default_macro_info_dict()
    a, c, af = RACE[spec.get("race", "mixed")]
    mac.update(gender=1.0 if spec["sex"] == "m" else 0.0, age=age_macro(spec["age"]), weight=spec.get("weight", 0.5), muscle=spec.get("muscle", 0.5),
               proportions=spec.get("proportions", 0.5), height=0.5, race={"asian": a, "caucasian": c, "african": af})
    if spec["age"] < 13: mac["cupsize"] = 0.0
    basemesh = HumanService.create_human(macro_detail_dict=mac, scale=0.1, feet_on_ground=False)
    for tname, w in spec.get("targets", {}).items():   # set-local: extra MakeHuman targets on top of the macros
        sk = TargetService.load_target(basemesh, TargetService.target_full_path(tname), weight=w)
        sk.slider_max = max(1.0, w); sk.value = w   # weights above 1 (a bigger head than the target's full step)
    TargetService.bake_targets(basemesh)
    rig = HumanService.add_builtin_rig(basemesh, "game_engine")
    eyeL, eyeR, mouth = group_centroid(basemesh, "joint-l-eye"), group_centroid(basemesh, "joint-r-eye"), group_centroid(basemesh, "lips")
    parts = {}
    if spec["face"] == "drawn":
        parts["eyes"] = HumanService.add_mhclo_asset(os.path.join(DATA, "eyes/high-poly/high-poly.mhclo"), basemesh, asset_type="Eyes", subdiv_levels=0)
        parts["brows"] = HumanService.add_mhclo_asset(os.path.join(DATA, "eyebrows/eyebrow001/eyebrow001.mhclo"), basemesh, asset_type="Eyebrows", subdiv_levels=0)
    for st in dict.fromkeys(spec["hair"]):
        asset = hair_asset(spec, st)
        if not asset: continue   # built from the scalp (build_hair)
        parts["hair_" + st] = HumanService.add_mhclo_asset(os.path.join(DATA, f"hair/{asset}/{asset}.mhclo"), basemesh, asset_type="Hair", subdiv_levels=0)
    # garments (MakeHuman CC0 clothes proxies, fitted and rigged by MPFB): a long-sleeved crew top + jeans, a tee + jeans,
    # a skirt (the lower half of the elegant suit); the engine trims and colours them per costume
    parts["garment_long"] = add_clothes(basemesh, "male_casualsuit02")
    parts["garment_short"] = add_clothes(basemesh, "female_casualsuit01" if spec["sex"] == "f" else "male_casualsuit04")
    if spec.get("skirt"):
        parts["garment_skirt"] = add_clothes(basemesh, "female_elegantsuit01")
        zw = rig.data.bones["spine_01"].head_local.z
        delete_verts(parts["garment_skirt"], lambda co: co.z > zw)
    smoothed = 0
    print("NIPPLES", fair_nipples(basemesh), flush=True)
    if spec["face"] in ("none", "blank"): smoothed = smooth_face(basemesh, "none", eyeL, eyeR, mouth)   # strangers too: no mark inside the face (cast/strangers sheets)
    build_hair(spec, basemesh, rig, parts, eyeL, eyeR, mouth)
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
            "face": spec["face"], "landmarks_blender_zup": lm, "smoothed_verts": smoothed, "hair": {st: hair_asset(spec, st) or "procedural" for st in spec["hair"]}, "eyes": meta_eyes,
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
