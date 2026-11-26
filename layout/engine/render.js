// Mode renderer for the layout blockouts.
//   line  : clean black lines on white (object-id, normal and depth discontinuities, hidden lines removed by the
//           depth buffer), plus the outline and a pale fill of designated cast shadows (hand shadows on the page)
//   flat  : flat greys with the shot's lights (white) and their shadows, emitters white
//   depth : linear depth, near white -> far black
//   label : flat + names of visible objects and characters, the 4:5 safe area, shot header
//   lit   : mood preview: dark room, coloured lights, cast shadows, emitter glow
//   (guides for the painter, 2026-11-25; opt-in, never in the default --modes)
//   form    : evenly lit clay: hemisphere fill + a soft key from beside the camera, NO cast shadows, range-checked
//             screen-space occlusion and grey contour lines; people / furniture / props / room shell get faint
//             distinct tints (class codes, not colours)
//   contour : the line render without any shadow fill or terminator: silhouettes, creases, object boundaries on white
//   light   : two- or three-tone light map of the shot's real lights (fills and ambient removed): lit white, weak
//             light pale grey, shade 50 % grey; the form and contours faintly underneath
// A built shot (from a set's build.js) is { scene, cam, rig(mode) -> [lights], near, far, header, mirror?, shadowLine? }
import * as THREE from 'three';
import { FIG2 } from './figure2.js';   // figure guides v2 (costume wash, figure-against-figure outlines); off = unchanged
const GLASS_VOLUME = /beam|shaft|volume|sunlight|steam|blade|cone|light/i;   // glass-look meshes that are light, not glass

export class ModeRenderer {
  constructor(W, H) {
    this.W = W; this.H = H;
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
    this.canvas = canvas;
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false });
    r.setPixelRatio(1); r.setSize(W, H, false); r.outputColorSpace = THREE.LinearSRGBColorSpace;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.localClippingEnabled = false;
    this.r = r;
    this.gbuf = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    this.idT = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    this.maskT = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    this.out = document.createElement('canvas'); this.out.width = W; this.out.height = H;
    this.gbufMat = new THREE.ShaderMaterial({
      side: THREE.DoubleSide, clipping: true,
      vertexShader: `#include <common>
        #include <clipping_planes_pars_vertex>
        varying vec3 vN; varying float vD;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vD = -mv.z; gl_Position = projectionMatrix * mv;
        #include <clipping_planes_vertex>
        }`,
      fragmentShader: `#include <common>
        #include <clipping_planes_pars_fragment>
        varying vec3 vN; varying float vD;
        void main(){
        #include <clipping_planes_fragment>
        vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*0.5+0.5, vD); }`,
    });
    this.depthMat = new THREE.ShaderMaterial({
      side: THREE.DoubleSide, clipping: true, uniforms: { uNear: { value: 0.3 }, uFar: { value: 10 } },
      vertexShader: `#include <common>
        #include <clipping_planes_pars_vertex>
        varying float vD; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix * mv;
        #include <clipping_planes_vertex>
        }`,
      fragmentShader: `#include <common>
        #include <clipping_planes_pars_fragment>
        uniform float uNear, uFar; varying float vD;
        void main(){
        #include <clipping_planes_fragment>
        float t = clamp((vD-uNear)/(uFar-uNear),0.,1.); float g = 1.-pow(t,0.7); gl_FragColor = vec4(vec3(g),1.); }`,
    });
    this.edgeMat = new THREE.ShaderMaterial({
      depthTest: false, depthWrite: false,
      uniforms: { tG: { value: this.gbuf.texture }, tI: { value: this.idT.texture }, tM: { value: this.maskT.texture }, uPx: { value: new THREE.Vector2(1 / W, 1 / H) },
        uNT: { value: 0.25 }, uDT: { value: 0.035 }, uMask: { value: 0 }, uFill: { value: 0.84 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader: `
        uniform sampler2D tG, tI, tM; uniform vec2 uPx; uniform float uNT, uDT, uMask, uFill; varying vec2 vUv;
        vec4 G(vec2 o){ return texture2D(tG, vUv + o*uPx); }
        vec4 I(vec2 o){ return texture2D(tI, vUv + o*uPx); }
        vec4 M(vec2 o){ return texture2D(tM, vUv + o*uPx); }
        void main(){
          vec4 c = G(vec2(0.)); vec3 n0 = c.rgb*2.-1.; float d0 = c.a; vec4 i0 = I(vec2(0.)); float e = 0.;
          vec2 offs[4]; offs[0]=vec2(1.,0.); offs[1]=vec2(0.,1.); offs[2]=vec2(1.,1.); offs[3]=vec2(1.,-1.);
          for (int k=0;k<4;k++){
            vec4 a = G(offs[k]), b = G(-offs[k]);
            if (d0 > 0.) {
              e = max(e, step(uNT, 1.-dot(n0, a.rgb*2.-1.)) * step(0.0001, a.a));
              e = max(e, step(uNT, 1.-dot(n0, b.rgb*2.-1.)) * step(0.0001, b.a));
              float lap = abs(a.a + b.a - 2.*d0); e = max(e, step(uDT, lap / max(d0, 1e-4)));
            }
            vec4 ia = I(offs[k]), ib = I(-offs[k]);
            e = max(e, step(0.002, distance(i0, ia))); e = max(e, step(0.002, distance(i0, ib)));
          }
          float g = 1.;
          if (uMask > 0.5) {
            vec4 m0 = M(vec2(0.));
            if (m0.g > 0.5 && m0.r < 0.5) g = uFill;
            for (int k=0;k<4;k++){ vec4 a = M(offs[k]), b = M(-offs[k]);
              if (m0.g > 0.5 && a.g > 0.5 && abs(m0.r - a.r) > 0.5) e = max(e, 0.8);
              if (m0.g > 0.5 && b.g > 0.5 && abs(m0.r - b.r) > 0.5) e = max(e, 0.8); }
          }
          gl_FragColor = vec4(vec3(g * (1.-e)), 1.);
        }`,
    });
    const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.edgeMat); q.frustumCulled = false;
    this.quadScene = new THREE.Scene(); this.quadScene.add(q); this.quadCam = new THREE.Camera();

    // --- guide modes (form / contour / light) ---
    this.formT = new THREE.WebGLRenderTarget(W, H, { samples: 4 });
    this.irrT = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
    this.guideMat = new THREE.ShaderMaterial({
      depthTest: false, depthWrite: false,
      uniforms: { tG: { value: this.gbuf.texture }, tI: { value: this.idT.texture }, tF: { value: this.formT.texture }, tL: { value: this.irrT.texture },
        uPx: { value: new THREE.Vector2(1 / W, 1 / H) }, uNT: { value: 0.25 }, uDT: { value: 0.035 }, uMode: { value: 0 },
        uLine: { value: 0.62 }, uAO: { value: 0.32 }, uLo: { value: 0.05 }, uHi: { value: 0.42 }, uShade: { value: 0.5 }, uMid: { value: 0.76 }, uUnder: { value: 0.22 }, uUnderLine: { value: 0.28 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader: `
        uniform sampler2D tG, tI, tF, tL; uniform vec2 uPx; uniform float uNT, uDT, uMode, uLine, uAO, uLo, uHi, uShade, uMid, uUnder, uUnderLine; varying vec2 vUv;
        vec4 G(vec2 o){ return texture2D(tG, vUv + o*uPx); }
        vec4 I(vec2 o){ return texture2D(tI, vUv + o*uPx); }
        float edge(){
          vec4 c = G(vec2(0.)); vec3 n0 = c.rgb*2.-1.; float d0 = c.a; vec4 i0 = I(vec2(0.)); float e = 0.;
          vec2 offs[4]; offs[0]=vec2(1.,0.); offs[1]=vec2(0.,1.); offs[2]=vec2(1.,1.); offs[3]=vec2(1.,-1.);
          for (int k=0;k<4;k++){
            vec4 a = G(offs[k]), b = G(-offs[k]);
            if (d0 > 0.) {
              e = max(e, step(uNT, 1.-dot(n0, a.rgb*2.-1.)) * step(0.0001, a.a));
              e = max(e, step(uNT, 1.-dot(n0, b.rgb*2.-1.)) * step(0.0001, b.a));
              float lap = abs(a.a + b.a - 2.*d0); e = max(e, step(uDT, lap / max(d0, 1e-4)));
            }
            vec4 ia = I(offs[k]), ib = I(-offs[k]);
            e = max(e, step(0.002, distance(i0, ia))); e = max(e, step(0.002, distance(i0, ib)));
          }
          return e;
        }
        // range-checked occlusion from the linear depth: neighbours a little nearer than this pixel darken it
        float occl(){
          float d0 = G(vec2(0.)).a; if (d0 <= 0.) return 0.;
          float o = 0., n = 0.;
          for (int r=0;r<2;r++){ float rad = r==0 ? 7. : 19.;
            for (int k=0;k<8;k++){ float a = float(k)*0.7854 + float(r)*0.39; vec2 off = vec2(cos(a), sin(a))*rad;
              float dn = G(off).a; n += 1.;
              if (dn <= 0.) continue;
              float dd = (d0 - dn) / d0;           // + : the neighbour is nearer
              o += smoothstep(0.004, 0.05, dd) * (1. - smoothstep(0.10, 0.25, dd)); } }
          return o / n;
        }
        void main(){
          float e = edge();
          vec3 f = texture2D(tF, vUv).rgb; float bg = step(G(vec2(0.)).a, 0.);
          float ao = occl();
          vec3 form = f * (1. - uAO*ao);
          if (uMode < 0.5) {                                   // form
            gl_FragColor = vec4(mix(form, vec3(0.08), e*uLine), 1.);
          } else {                                             // light
            float irr = dot(texture2D(tL, vUv).rgb, vec3(0.333));
            float lo = smoothstep(uLo*0.6, uLo*1.6, irr), hi = smoothstep(uHi*0.6, uHi*1.4, irr);   // wide: falloff reads as a ramp, a shadow edge (a jump) stays crisp
            float tone = mix(uShade, mix(uMid, 1., hi), lo);
            float fl = dot(form, vec3(0.333));               // faint form underneath (+-uUnder around the tone)
            float v = tone * (1. - uUnder + uUnder*clamp(fl/0.8, 0., 1.2));
            v = mix(v, v*0.55, e*uUnderLine);
            gl_FragColor = vec4(vec3(clamp(v, 0., 1.)), 1.);
          }
        }`,
    });
    const gq = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.guideMat); gq.frustumCulled = false;
    this.guideScene = new THREE.Scene(); this.guideScene.add(gq);
  }

  // --- 2026-11-26 round 5 (engine-body): a beam's HAZE volume (an emissive see-through prism, sets' beamMeshes: lit and
  // glow only) is drawn by its FAR faces only, at twice the opacity. Drawn double-sided, its near faces veiled whatever
  // stood behind them but not the part of a figure that reached into the prism: a dark blob with a hard edge where the
  // figure crossed the near face (office91 REF_sw_back: the social worker's upper back). Now anything in front of the far
  // wall is unveiled evenly; the room behind keeps the same veil.
  // --- material switching -------------------------------------------------------------------------
  _mat(m, pass, ids) {
    const L = m.userData.look || {}; const ud = m.userData; ud.mats = ud.mats || {};
    if (pass === 'gbuf') return this.gbufMat;
    if (pass === 'depth') return this.depthMat;
    if (pass === 'id') { const c = ids.get(m); return new THREE.MeshBasicMaterial({ color: new THREE.Color(((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255), side: THREE.DoubleSide }); }
    const key = pass;
    if (ud.mats[key]) return ud.mats[key];
    let mat;
    if ((pass === 'flat' || pass === 'label') && L.material) { ud.mats[key] = L.material; return L.material; }   // a look may bring its own material (sets/_beam.js: the beam mask)
    if (pass === 'flat' || pass === 'label') {
      const gv = L.flatGrey ?? L.grey ?? 0.6;
      if (L.emit) mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(L.flatEmit ?? 0.97, L.flatEmit ?? 0.97, L.flatEmit ?? 0.97), side: THREE.DoubleSide });
      else if (L.art) mat = new THREE.MeshLambertMaterial({ map: L.artGrey || L.art, side: THREE.DoubleSide });   // fixed background art (sets/_art.js): its greys
      else if (L.flatCol != null) mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(L.flatCol), side: THREE.DoubleSide });   // v2: clothing / eyes in their colour
      else if (L.map && pass === 'label') mat = new THREE.MeshBasicMaterial({ map: L.map, transparent: true, side: THREE.DoubleSide });
      else mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(gv, gv, gv), side: THREE.DoubleSide });
    } else if (pass === 'lit') {
      if (L.glass) mat = new THREE.MeshBasicMaterial({ color: L.col ?? 0x8899aa, transparent: true, opacity: L.opacity ?? 0.12, side: THREE.DoubleSide, depthWrite: false });
      else if (L.emit && hazeSide(m) != null) mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(L.emit).multiplyScalar(L.emitI ?? 1), side: hazeSide(m), map: L.litMap, transparent: true, opacity: 2, depthWrite: false });
      else if (L.emit) { const c = new THREE.Color(L.emit).multiplyScalar(L.emitI ?? 1); mat = new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide, map: L.litMap || null, transparent: !!L.litMap }); }
      else if (L.art) mat = new THREE.MeshLambertMaterial({ map: L.art, side: THREE.DoubleSide });   // fixed background art in colour
      else mat = new THREE.MeshLambertMaterial({ color: L.col ?? 0x808080, side: THREE.DoubleSide });
    } else if (pass === 'glow') {
      mat = L.emit && hazeSide(m) != null ? new THREE.MeshBasicMaterial({ color: new THREE.Color(L.emit).multiplyScalar(L.emitI ?? 1), side: hazeSide(m), map: L.litMap, transparent: true, opacity: 2, depthWrite: false })
        : L.emit ? new THREE.MeshBasicMaterial({ color: new THREE.Color(L.emit).multiplyScalar(L.emitI ?? 1), side: THREE.DoubleSide, map: L.litMap || null, transparent: !!L.litMap })
        : new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, transparent: !!L.glass, opacity: L.glass ? 0 : 1, depthWrite: !L.glass });
    } else if (pass === 'form') {
      mat = L.glass ? new THREE.MeshBasicMaterial({ color: new THREE.Color(0.62, 0.74, 0.80), transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide })
        : L.emit ? new THREE.MeshBasicMaterial({ color: new THREE.Color(0.97, 0.97, 0.97), side: THREE.DoubleSide })
        : L.art ? this._formArtMat(ud.formTint || [0.8, 0.8, 0.8], L.artGrey || L.art) : this._formMat(ud.formTint || [0.8, 0.8, 0.8]);
    } else if (pass === 'artline') {   // fixed background art: its edge map, white elsewhere (multiplied over line / contour)
      mat = new THREE.MeshBasicMaterial({ color: 0xffffff, map: L.art ? (L.artEdge || null) : null, side: THREE.DoubleSide });
    } else if (pass === 'irr') {   // irradiance of the shot's real lights on white (light mode)
      mat = L.emit ? new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }) : new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    } else if (pass === 'costume') {   // v2: clothing colour, white elsewhere (the wash over contour / light)
      mat = new THREE.MeshBasicMaterial({ color: L.costumeCol != null && !L.emit ? new THREE.Color(L.costumeCol) : new THREE.Color(1, 1, 1), side: THREE.DoubleSide });
    } else if (pass === 'mask') {
      mat = L.recvShadowLine ? new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }) : new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    }
    ud.mats[key] = mat; return mat;
  }
  _prep(scene, pass, vis) {
    // meshes sharing userData.idGroup (the pieces of one mannequin limb, the phalanges of one finger) share one id, so
    // line mode draws no id edge between them: only their silhouette and real creases (normal / depth discontinuities)
    const ids = new Map(); let i = 1; const meshes = []; const groups = new Map();
    scene.traverse((o) => {
      if (!o.isMesh) return; const L = o.userData.look; if (!L) return;
      if (o.userData.baseVisible === undefined) o.userData.baseVisible = o.visible;
      let v = o.userData.baseVisible;
      const vv = vis === 'form' ? 'line' : vis;   // form sees what line sees, plus solid glass (table tops, panes)
      if (L.only && !L.only.includes(vv)) v = false;
      if (L.hide && L.hide.includes(vv)) v = false;
      if (L.glass && vis !== 'lit' && !(vis === 'form' && !GLASS_VOLUME.test(o.userData.label || ''))) v = false;
      o.visible = v; if (!v) return;
      const gk = o.userData.idGroup; let k = gk != null ? groups.get(gk) : undefined;
      if (k === undefined) { k = i++; if (gk != null) groups.set(gk, k); }
      meshes.push(o); ids.set(o, (k * 2654435761) & 0xffffff || 1); o.userData.idx = k;
    });
    for (const m of meshes) m.material = this._mat(m, pass, ids);
    return { ids, meshes };
  }
  _lights(scene, built, mode) {
    if (scene.userData.rig) { scene.userData.rig.parent.remove(scene.userData.rig); scene.userData.rig = null; }
    const rig = new THREE.Group(); (built.rig(mode) || []).forEach((l) => { rig.add(l); if (l.target && !l.target.parent) rig.add(l.target); });
    (built.root || scene).add(rig); scene.userData.rig = rig;
    rig.traverse((l) => { if (l.isLight && l.castShadow) { l.shadow.mapSize.set(2048, 2048); l.shadow.bias = l.shadow.bias || -0.0004; l.shadow.normalBias = l.shadow.normalBias || 0.004; l.shadow.radius = l.shadow.radius || 2; } });
    return rig;
  }

  // --- passes ---------------------------------------------------------------------------------------
  _render(scene, cam, target, clear = 0x000000, alpha = 1) {
    this.r.setRenderTarget(target); this.r.setClearColor(clear, alpha); this.r.clear(); this.r.render(scene, cam); this.r.setRenderTarget(null);
  }
  idPass(built, cam = built.cam) {
    const { scene } = built; const { ids, meshes } = this._prep(scene, 'id', 'line');
    this._lights(scene, built, 'none');
    this._render(scene, cam, this.idT, 0x000000, 1);
    const buf = new Uint8Array(this.W * this.H * 4); this.r.readRenderTargetPixels(this.idT, 0, 0, this.W, this.H, buf);
    const byId = new Map(); for (const m of meshes) byId.set(ids.get(m), m);
    return { buf, byId, meshAt: (x, y) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= this.W || y >= this.H) return null; const k = ((this.H - 1 - y) * this.W + x) * 4; return byId.get((buf[k] << 16) | (buf[k + 1] << 8) | buf[k + 2]) || null; } };
  }
  _toCanvas() { const c = document.createElement('canvas'); c.width = this.W; c.height = this.H; c.getContext('2d').drawImage(this.canvas, 0, 0); return c; }

  renderView(built, mode, cam) {
    const c = this._renderView(built, mode, cam);
    if (FIG2.body) this._fig2Post(built, mode, cam, c);
    return c;
  }
  // v2: the costume colour wash over contour (pale) and light, and a dark outline where one figure meets another
  _fig2Post(built, mode, cam, c) {
    const g = c.getContext('2d');
    if (mode === 'contour' || mode === 'light') {
      this._prep(built.scene, 'costume', 'line'); this._lights(built.scene, built, 'none');
      this._render(built.scene, cam, null, 0xffffff, 1);
      g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = mode === 'contour' ? 0.42 : 0.55; g.drawImage(this.canvas, 0, 0); g.restore();
    }
    if (['flat', 'label', 'form', 'light'].includes(mode)) {
      const id = this.idPass(built, cam), W = this.W, H = this.H, who = new Array(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = ((H - 1 - y) * W + x) * 4; const m = id.byId.get((id.buf[k] << 16) | (id.buf[k + 1] << 8) | id.buf[k + 2]); who[y * W + x] = m ? m.userData.who || null : null; }
      const im = g.getImageData(0, 0, W, H), d = im.data;
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x, a = who[i]; if (!a) continue;
        for (const j of [i - 1, i + 1, i - W, i + W]) { const b = who[j]; if (b && b !== a) { d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 26; break; } } }
      g.putImageData(im, 0, 0);
    }
  }
  _renderView(built, mode, cam) {
    const { scene } = built; const W = this.W, H = this.H;
    scene.background = null;
    if (mode === 'line') {
      this._prep(scene, 'gbuf', 'line'); this._lights(scene, built, 'none');
      this._render(scene, cam, this.gbuf, 0x000000, 0);
      const { ids } = this._prep(scene, 'id', 'line'); this._render(scene, cam, this.idT, 0x000000, 1);
      let useMask = 0;
      if (built.shadowLine) { this._prep(scene, 'mask', 'line'); const rig = this._lights(scene, built, 'mask'); useMask = rig.children.length ? 1 : 0; this._render(scene, cam, this.maskT, 0x000000, 1); }
      // receivers in green: render again with receivers flagged (g channel) — encode by a second tiny trick: Lambert white
      // lit -> r=g=b=1; shadowed -> r=g=b=ambient(0). We need "is receiver" separately, so re-render with an emissive flag.
      if (useMask) this._maskFlag(built, cam);
      this.edgeMat.uniforms.uMask.value = useMask; this.edgeMat.uniforms.uNT.value = built.edgeNT ?? 0.25;
      this.r.setRenderTarget(null); this.r.setClearColor(0xffffff, 1); this.r.clear(); this.r.render(this.quadScene, this.quadCam);
      return this._artLines(built, cam, this._toCanvas());
    }
    if (mode === 'depth') {
      this.depthMat.uniforms.uNear.value = built.near ?? 0.3; this.depthMat.uniforms.uFar.value = built.far ?? 10;
      this._prep(scene, 'depth', 'depth'); this._lights(scene, built, 'none');
      this._render(scene, cam, null, 0x000000, 1); return this._toCanvas();
    }
    if (mode === 'flat' || mode === 'label') {
      this._prep(scene, mode, mode); this._lights(scene, built, 'flat');
      this._render(scene, cam, null, built.flatBg ?? 0x9a9a9a, 1); return this._toCanvas();
    }
    if (mode === 'lit') {
      this._prep(scene, 'lit', 'lit'); this._lights(scene, built, 'lit');
      this._render(scene, cam, null, built.litBg ?? 0x05060a, 1);
      const base = this._toCanvas();
      // glow: emitters only, blurred, added
      this._prep(scene, 'glow', 'lit'); this._lights(scene, built, 'none');
      this._render(scene, cam, null, 0x000000, 1);
      const g = base.getContext('2d'); g.globalCompositeOperation = 'lighter';
      g.filter = 'blur(10px)'; g.globalAlpha = 0.9; g.drawImage(this.canvas, 0, 0);
      g.filter = 'blur(36px)'; g.globalAlpha = 0.8; g.drawImage(this.canvas, 0, 0);
      g.filter = 'none'; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      if (built.litPost) built.litPost(g, this);
      return base;
    }
    if (mode === 'form' || mode === 'contour' || mode === 'light') return this._guide(built, mode, cam);
    throw new Error('unknown mode ' + mode);
  }
  // --- guide modes ------------------------------------------------------------------------------
  _formMat(tint) {
    return new THREE.ShaderMaterial({
      side: THREE.DoubleSide, clipping: true, uniforms: { uTint: { value: new THREE.Vector3(...tint) } },
      vertexShader: `#include <common>
        #include <clipping_planes_pars_vertex>
        varying vec3 vN; varying vec3 vW;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vW = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix * mv;
        #include <clipping_planes_vertex>
        }`,
      fragmentShader: `#include <common>
        #include <clipping_planes_pars_fragment>
        uniform vec3 uTint; varying vec3 vN; varying vec3 vW;
        void main(){
        #include <clipping_planes_fragment>
          vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
          vec3 wn = normalize((vec4(n, 0.) * viewMatrix).xyz);            // view -> world (orthonormal)
          vec3 key = normalize(vec3(-0.45, 0.55, 0.75));                   // soft key from above-left of the camera
          float k = max(dot(n, key), 0.);
          float hemi = 0.5 + 0.5*wn.y;                                     // sky above, ground below
          float v = 0.58 + 0.27*k + 0.15*hemi;
          gl_FragColor = vec4(uTint * v / 0.8 * 0.92, 1.); }`,
    });
  }
  // fixed background art (opt-in: look.art, sets/_art.js): the form shading modulated by the picture's greys
  _formArtMat(tint, map) {
    return new THREE.ShaderMaterial({
      side: THREE.DoubleSide, clipping: true, uniforms: { uTint: { value: new THREE.Vector3(...tint) }, tMap: { value: map } },
      vertexShader: `#include <common>
        #include <clipping_planes_pars_vertex>
        varying vec3 vN; varying vec2 vUv;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vUv = uv; gl_Position = projectionMatrix * mv;
        #include <clipping_planes_vertex>
        }`,
      fragmentShader: `#include <common>
        #include <clipping_planes_pars_fragment>
        uniform vec3 uTint; uniform sampler2D tMap; varying vec3 vN; varying vec2 vUv;
        void main(){
        #include <clipping_planes_fragment>
          vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
          vec3 wn = normalize((vec4(n, 0.) * viewMatrix).xyz);
          vec3 key = normalize(vec3(-0.45, 0.55, 0.75));
          float k = max(dot(n, key), 0.);
          float hemi = 0.5 + 0.5*wn.y;
          float v = 0.58 + 0.27*k + 0.15*hemi;
          float a = texture2D(tMap, vUv).r;
          gl_FragColor = vec4(uTint * v / 0.8 * 0.92 * (0.3 + 0.7*a), 1.); }`,
    });
  }
  // line / contour: multiply the edge maps of any visible fixed art over the canvas (no art in the scene: unchanged)
  _artLines(built, cam, c) {
    let any = false; built.scene.traverse((o) => { if (o.isMesh && o.visible && o.userData.look?.art) any = true; });
    if (!any) return c;
    this._prep(built.scene, 'artline', 'line'); this._lights(built.scene, built, 'none');
    this._render(built.scene, cam, null, 0xffffff, 1);
    const g = c.getContext('2d'); g.save(); g.globalCompositeOperation = 'multiply'; g.drawImage(this.canvas, 0, 0); g.restore();
    return c;
  }
  // class per visible mesh: people (userData.who), else by the world size of its label group: room shell / furniture / prop
  _classify(meshes) {
    const boxes = new Map();
    for (const m of meshes) { if (m.userData.who) continue; const k = m.userData.label || ('#' + m.id);
      const b = new THREE.Box3().setFromObject(m); if (b.isEmpty()) continue; if (!boxes.has(k)) boxes.set(k, b); else boxes.get(k).union(b); }
    const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; };
    const TINT = { person: [0.92, 0.915, 0.905], hair: [0.56, 0.55, 0.54], room: [0.77, 0.77, 0.78], furniture: [0.84, 0.80, 0.72], prop: [0.70, 0.80, 0.90] };
    for (const m of meshes) {
      if (m.userData.look?.formTint) { m.userData.formTint = m.userData.look.formTint; m.userData.formClass = m.userData.who ? 'costume' : 'tinted'; if (m.userData.mats) delete m.userData.mats.form; continue; }   // v2 (engine/figure2.js)
      let cls, k = m.userData.label || ('#' + m.id);
      if (m.userData.who) cls = (m.material?.userData?.hair || (m.userData.look?.grey ?? 1) <= 0.15) ? 'hair' : 'person';
      else { const b = boxes.get(k); const s = b ? b.getSize(new THREE.Vector3()) : new THREE.Vector3(1, 1, 1);
        const big = Math.max(s.x, s.y, s.z), diag = s.length();
        cls = big > 2.6 || diag > 3.4 ? 'room' : big > 0.45 ? 'furniture' : 'prop'; }
      const g = m.userData.look?.flatGrey ?? m.userData.look?.grey ?? 0.6;
      const j = cls === 'person' || cls === 'hair' ? 0 : (hash(k) - 0.5) * 0.09 - (0.6 - Math.min(g, 0.9)) * 0.2;   // neighbouring objects differ slightly; dark materials a little darker
      m.userData.formTint = TINT[cls].map((c) => Math.min(1, c * (1 + j)));
      m.userData.formClass = cls;
      if (m.userData.mats) delete m.userData.mats.form;
    }
  }
  _guide(built, mode, cam) {
    const { scene } = built;
    // geometry buffers (normals + depth, ids) exactly as line mode sees the scene
    this._prep(scene, 'gbuf', 'line'); this._lights(scene, built, 'none');
    this._render(scene, cam, this.gbuf, 0x000000, 0);
    this._prep(scene, 'id', 'line'); this._render(scene, cam, this.idT, 0x000000, 1);
    this.guideMat.uniforms.uNT.value = built.edgeNT ?? 0.25;
    if (mode === 'contour') {
      this.edgeMat.uniforms.uMask.value = 0; this.edgeMat.uniforms.uNT.value = built.edgeNT ?? 0.25;
      this.r.setRenderTarget(null); this.r.setClearColor(0xffffff, 1); this.r.clear(); this.r.render(this.quadScene, this.quadCam);
      return this._artLines(built, cam, this._toCanvas());
    }
    // the form pass (no lights needed: the shader shades from the normal)
    const { meshes } = this._prep(scene, 'id', 'line'); this._classify(meshes);
    this._prep(scene, 'form', 'form'); this._lights(scene, built, 'none');
    this._render(scene, cam, this.formT, built.formBg ?? 0xf2f2f2, 1);
    if (mode === 'light') {
      // the shot's real lights: the flat rig without ambient / hemisphere fills and without shadowless directional fills
      this._prep(scene, 'irr', 'flat'); const rig = this._lights(scene, built, 'flat');
      const drop = []; rig.traverse((l) => { if (l.isAmbientLight || l.isHemisphereLight || (l.isDirectionalLight && !l.castShadow)) drop.push(l); });
      drop.forEach((l) => l.parent.remove(l));
      this._render(scene, cam, this.irrT, 0x000000, 1);
      const gl = built.lightGuide || {};
      this.guideMat.uniforms.uLo.value = gl.lo ?? 0.05; this.guideMat.uniforms.uHi.value = gl.hi ?? 0.42;
    }
    this.guideMat.uniforms.uMode.value = mode === 'light' ? 1 : 0;
    this.r.setRenderTarget(null); this.r.setClearColor(0xffffff, 1); this.r.clear(); this.r.render(this.guideScene, this.quadCam);
    return this._toCanvas();
  }

  // the mask target holds r = lit by the shadow light; set g = 1 on shadow receivers (second pass with colorWrite on g only)
  _maskFlag(built, cam) {
    const { scene } = built; const gl = this.r.getContext();
    const save = []; scene.traverse((o) => { if (o.isMesh && o.visible) { save.push([o, o.material]);
      o.material = o.userData.look?.recvShadowLine ? (this._gOn ||= new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, colorWrite: true })) : (this._gOff ||= new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })); } });
    // render to a temp target then merge: simplest is to render r into maskT (already) and g into a second target
    if (!this.flagT) this.flagT = new THREE.WebGLRenderTarget(this.W, this.H, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    this._render(scene, cam, this.flagT, 0x000000, 1);
    save.forEach(([o, m]) => { o.material = m; });
    // merge on the GPU: maskT.g = flagT.g
    if (!this.mergeMat) {
      this.mergeMat = new THREE.ShaderMaterial({ uniforms: { tA: { value: null }, tB: { value: null } }, depthTest: false, depthWrite: false,
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.,1.); }',
        fragmentShader: 'uniform sampler2D tA, tB; varying vec2 vUv; void main(){ float lit = texture2D(tA, vUv).r; float rc = texture2D(tB, vUv).g; gl_FragColor = vec4(step(0.08, lit), rc, 0., 1.); }' });
      this.mergeT = new THREE.WebGLRenderTarget(this.W, this.H, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
      const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mergeMat); q.frustumCulled = false; this.mergeScene = new THREE.Scene(); this.mergeScene.add(q);
    }
    this.mergeMat.uniforms.tA.value = this.maskT.texture; this.mergeMat.uniforms.tB.value = this.flagT.texture;
    this.r.setRenderTarget(this.mergeT); this.r.render(this.mergeScene, this.quadCam); this.r.setRenderTarget(null);
    this.edgeMat.uniforms.tM.value = this.mergeT.texture;
  }

  // full render of a shot in one mode, including the mirror composite, returns a 2D canvas
  render(built, mode) {
    const main = this.renderView(built, mode, built.cam);
    if (built.mirror) {
      // render the world reflected in the mirror plane (winding handled by three's negative-determinant flip),
      // keep only what lies in front of the mirror, then paste it inside the glass's visible pixels
      const root = built.root, glassMeshes = built.mirror.meshes;
      root.matrixAutoUpdate = false; root.matrix.copy(built.mirror.R); root.updateMatrixWorld(true);
      glassMeshes.forEach((m) => { m.userData.baseVisible = false; });
      this.r.clippingPlanes = [built.mirror.clipPlane];
      const refl = this.renderView(built, mode, built.cam);
      this.r.clippingPlanes = [];
      root.matrix.identity(); root.updateMatrixWorld(true);
      glassMeshes.forEach((m) => { m.userData.baseVisible = true; });
      const id = this.idPass(built);
      const glass = new Set(glassMeshes);
      const mask = document.createElement('canvas'); mask.width = this.W; mask.height = this.H; const mg = mask.getContext('2d');
      const im = mg.createImageData(this.W, this.H);
      for (let y = 0; y < this.H; y++) for (let x = 0; x < this.W; x++) { const k = ((this.H - 1 - y) * this.W + x) * 4; const m = id.byId.get((id.buf[k] << 16) | (id.buf[k + 1] << 8) | id.buf[k + 2]);
        if (m && glass.has(m)) im.data[(y * this.W + x) * 4 + 3] = 255; }
      mg.putImageData(im, 0, 0); mg.globalCompositeOperation = 'source-in';
      if (mode === 'lit') { mg.globalAlpha = 0.85; }
      mg.drawImage(refl, 0, 0);
      const g = main.getContext('2d'); g.drawImage(mask, 0, 0);
      if (mode === 'line' || mode === 'contour') { // outline the mirror glass
        g.strokeStyle = '#000'; g.lineWidth = 2; const q = built.mirror.quadPx(built.cam); g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke(); }
    }
    return main;
  }
}

// the side of a closed emissive see-through prism that faces AWAY from its inside (null: not a haze volume)
function hazeSide(m) {
  const L = m.userData.look || {}; if (!L.litMap || m.userData._hazeSide === null) return null; if (m.userData._hazeSide !== undefined) return m.userData._hazeSide;
  const g = m.geometry, p = g.getAttribute('position'), ix = g.index;
  if (!p || !ix || p.count !== 8 || ix.count !== 24) { m.userData._hazeSide = null; return null; }
  const c = new THREE.Vector3(); for (let i = 0; i < 8; i++) c.add(new THREE.Vector3().fromBufferAttribute(p, i)); c.multiplyScalar(1 / 8);
  const a = new THREE.Vector3().fromBufferAttribute(p, ix.getX(0)), b = new THREE.Vector3().fromBufferAttribute(p, ix.getX(1)), d = new THREE.Vector3().fromBufferAttribute(p, ix.getX(2));
  const n = b.clone().sub(a).cross(d.clone().sub(a)), out = n.dot(a.clone().add(b).add(d).multiplyScalar(1 / 3).sub(c)) > 0;
  return (m.userData._hazeSide = out ? THREE.BackSide : THREE.FrontSide);   // outward-wound: the far faces are the back faces
}
