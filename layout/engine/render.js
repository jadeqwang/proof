// Mode renderer for the layout blockouts.
//   line  : clean black lines on white (object-id, normal and depth discontinuities, hidden lines removed by the
//           depth buffer), plus the outline and a pale fill of designated cast shadows (hand shadows on the page)
//   flat  : flat greys with the shot's lights (white) and their shadows, emitters white
//   depth : linear depth, near white -> far black
//   label : flat + names of visible objects and characters, the 4:5 safe area, shot header
//   lit   : mood preview: dark room, coloured lights, cast shadows, emitter glow
// A built shot (from a set's build.js) is { scene, cam, rig(mode) -> [lights], near, far, header, mirror?, shadowLine? }
import * as THREE from 'three';

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
  }

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
      else if (L.map && pass === 'label') mat = new THREE.MeshBasicMaterial({ map: L.map, transparent: true, side: THREE.DoubleSide });
      else mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(gv, gv, gv), side: THREE.DoubleSide });
    } else if (pass === 'lit') {
      if (L.glass) mat = new THREE.MeshBasicMaterial({ color: L.col ?? 0x8899aa, transparent: true, opacity: L.opacity ?? 0.12, side: THREE.DoubleSide, depthWrite: false });
      else if (L.emit) { const c = new THREE.Color(L.emit).multiplyScalar(L.emitI ?? 1); mat = new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide, map: L.litMap || null, transparent: !!L.litMap }); }
      else mat = new THREE.MeshLambertMaterial({ color: L.col ?? 0x808080, side: THREE.DoubleSide });
    } else if (pass === 'glow') {
      mat = L.emit ? new THREE.MeshBasicMaterial({ color: new THREE.Color(L.emit).multiplyScalar(L.emitI ?? 1), side: THREE.DoubleSide, map: L.litMap || null, transparent: !!L.litMap })
        : new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, transparent: !!L.glass, opacity: L.glass ? 0 : 1, depthWrite: !L.glass });
    } else if (pass === 'mask') {
      mat = L.recvShadowLine ? new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }) : new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    }
    ud.mats[key] = mat; return mat;
  }
  _prep(scene, pass, vis) {
    const ids = new Map(); let i = 1; const meshes = [];
    scene.traverse((o) => {
      if (!o.isMesh) return; const L = o.userData.look; if (!L) return;
      if (o.userData.baseVisible === undefined) o.userData.baseVisible = o.visible;
      let v = o.userData.baseVisible;
      if (L.only && !L.only.includes(vis)) v = false;
      if (L.hide && L.hide.includes(vis)) v = false;
      if (L.glass && vis !== 'lit') v = false;
      o.visible = v; if (!v) return;
      meshes.push(o); ids.set(o, (i * 2654435761) & 0xffffff || 1); o.userData.idx = i; i++;
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
      return this._toCanvas();
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
    throw new Error('unknown mode ' + mode);
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
      if (mode === 'line') { // outline the mirror glass
        g.strokeStyle = '#000'; g.lineWidth = 2; const q = built.mirror.quadPx(built.cam); g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke(); }
    }
    return main;
  }
}
