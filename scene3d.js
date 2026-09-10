import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const smooth = (t) => t * t * (3 - 2 * t);

function layouts(n) {
  const r = rng(7);
  const L = [];
  // 0 hero: loose cloud
  L.push(Array.from({ length: n }, () => {
    const th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1), rad = 3.6 + r() * 3.4;
    return { p: new THREE.Vector3(rad * Math.sin(ph) * Math.cos(th), rad * Math.cos(ph) * 0.7, rad * Math.sin(ph) * Math.sin(th) - 1),
      q: new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 6.28, r() * 6.28, r() * 6.28)), loose: 1 };
  }));
  // 1 about: tilted ring
  L.push(Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2, rad = 5.2 + (i % 2) * 0.5;
    const p = new THREE.Vector3(Math.cos(a) * rad, Math.sin(a * 2) * 0.35, Math.sin(a) * rad);
    p.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.62);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.62, -a + Math.PI / 2, 0, 'XYZ'));
    return { p, q, loose: 0.25 };
  }));
  // 2 work: four towers
  L.push(Array.from({ length: n }, (_, i) => {
    const t = i % 4, k = Math.floor(i / 4), per = Math.ceil(n / 4);
    const x = (t - 1.5) * 3.3 + (k % 2 ? 0.08 : -0.08);
    return { p: new THREE.Vector3(x, (k - per / 2) * 0.55 + 0.3, (k % 2) * 0.1), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (t - 1.5) * 0.18, 0)), loose: 0.08, group: t };
  }));
  // 3 experience: rising staircase
  L.push(Array.from({ length: n }, (_, i) => {
    const f = i / (n - 1), col = i % 4, row = Math.floor(i / 4);
    const x = -7.2 + row * (14.4 / (n / 4 - 1));
    return { p: new THREE.Vector3(x, -2.6 + f * 5.2 + (col - 1.5) * 0.56, (col % 2) * 0.9 - 0.45), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.18, 0)), loose: 0.1 };
  }));
  // 4 stack: double helix
  L.push(Array.from({ length: n }, (_, i) => {
    const s = i % 2, k = Math.floor(i / 2), per = Math.ceil(n / 2);
    const a = (k / per) * Math.PI * 3 + s * Math.PI;
    return { p: new THREE.Vector3(Math.cos(a) * 3.2, (k - per / 2) * 0.34, Math.sin(a) * 3.2), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -a, 0.35)), loose: 0.12 };
  }));
  // 5 certifications: wall
  L.push(Array.from({ length: n }, (_, i) => {
    const cols = 8, c = i % cols, rw = Math.floor(i / cols), rows = Math.ceil(n / cols);
    return { p: new THREE.Vector3((c - (cols - 1) / 2) * 1.62, ((rows - 1) / 2 - rw) * 0.66, Math.sin(c * 0.9 + rw) * 0.35), q: new THREE.Quaternion(), loose: 0.05 };
  }));
  // 6 contact: compact cube
  L.push(Array.from({ length: n }, (_, i) => {
    const x = i % 4, y = Math.floor(i / 4) % 3, z = Math.floor(i / 12);
    return { p: new THREE.Vector3((x - 1.5) * 1.5, (y - 1) * 0.56, (z - 1.5) * 1.1), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.6, 0)), loose: 0.03 };
  }));
  return [L[0], L[1], L[3], L[2], L[5], L[4], L[6]];
}

export function createScene(canvas, opts = {}) {
  const count = opts.count || 48;
  const accent = new THREE.Color(opts.accent || '#f0a35e');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 720 ? 1.25 : 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.2, 15);

  // environment: a hand-built lit room for the glass to reflect
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x141312, side: THREE.BackSide }));
  env.add(room);
  const panel = (c, x, y, z, w, h, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.y = ry; env.add(m); };
  panel(new THREE.Color(6, 6, 6), 0, 8, -6, 14, 4, 0);
  panel(new THREE.Color(2.5, 2.5, 2.8), -10, 2, 0, 6, 10, Math.PI / 2);
  panel(accent.clone().multiplyScalar(2.2), 10, -3, 2, 5, 8, -Math.PI / 2);
  panel(new THREE.Color(1.2, 1.2, 1.3), 0, -9, 4, 12, 3, 0);
  scene.environment = pm.fromScene(env, 0.03).texture;
  pm.dispose();

  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const key = new THREE.DirectionalLight(0xfff4e6, 1.4); key.position.set(4, 6, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(accent, 1.1); rim.position.set(-6, -2, -4); scene.add(rim);

  const root = new THREE.Group();
  scene.add(root);
  const geo = new THREE.BoxGeometry(1.4, 0.5, 1.0);
  const edgeGeo = new THREE.EdgesGeometry(geo);
  const ledGeo = new THREE.BoxGeometry(0.16, 0.06, 0.03);
  const blocks = [];
  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xe9e4da, metalness: 0.05, roughness: 0.22, transparent: true, opacity: 0.42, clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 1.3, depthWrite: false });
    const m = new THREE.Mesh(geo, mat);
    const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: 0xf2efe9, transparent: true, opacity: 0.32 }));
    m.add(edges);
    const led = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: accent }));
    led.position.set(0.5, 0.12, 0.515);
    m.add(led);
    m.userData = { led, edges, phase: Math.random() * 6.28, speed: 0.6 + Math.random() * 0.9 };
    root.add(m);
    blocks.push(m);
  }

  const L = layouts(count);
  const state = { progress: 0, explode: 1, mouse: new THREE.Vector2(), rot: new THREE.Vector2(), focus: -1, focusK: 0 };
  const tmpP = new THREE.Vector3(), tmpQ = new THREE.Quaternion();
  const camTargets = [15, 13.5, 16, 17.5, 13.5, 14.5, 11.5];
  let raf = 0, t0 = performance.now(), alive = true;

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const tick = (now) => {
    if (!alive) return;
    const t = (now - t0) / 1000;
    const p = Math.max(0, Math.min(L.length - 1, state.progress));
    const a = Math.floor(p), b = Math.min(L.length - 1, a + 1), k = smooth(p - a);
    const ex = state.explode;
    for (let i = 0; i < count; i++) {
      const A = L[a][i], B = L[b][i], m = blocks[i], u = m.userData;
      tmpP.lerpVectors(A.p, B.p, k);
      const loose = A.loose + (B.loose - A.loose) * k;
      tmpP.x += Math.sin(t * u.speed + u.phase) * 0.25 * loose;
      tmpP.y += Math.cos(t * u.speed * 0.8 + u.phase) * 0.3 * loose;
      tmpP.z += Math.sin(t * u.speed * 0.5 + u.phase * 2) * 0.2 * loose;
      if (ex > 0) { const s = 1 + ex * 3.2; tmpP.multiplyScalar(s); tmpP.z -= ex * 6; }
      m.position.lerp(tmpP, 0.13);
      tmpQ.slerpQuaternions(A.q, B.q, k);
      if (ex > 0) tmpQ.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(ex * 2, ex * 3, 0)));
      m.quaternion.slerp(tmpQ, 0.12);
      // focus: dim non-group towers in the work chapter
      const g = L[3][i].group;
      const inWork = Math.abs(p - 3) < 0.6;
      const dim = inWork && state.focus >= 0 && g !== state.focus ? 1 : 0;
      const target = 0.42 - dim * 0.3;
      m.material.opacity += (target - m.material.opacity) * 0.1;
      u.edges.material.opacity += ((dim ? 0.08 : 0.32) - u.edges.material.opacity) * 0.1;
      const blink = 0.55 + 0.45 * Math.sin(t * 2.2 * u.speed + u.phase * 3);
      u.led.material.color.copy(accent).multiplyScalar(dim ? 0.15 : blink * 1.6);
    }
    state.rot.x += (state.mouse.y * -0.28 - state.rot.x) * 0.05;
    state.rot.y += (state.mouse.x * 0.55 - state.rot.y) * 0.05;
    root.rotation.x = state.rot.x;
    root.rotation.y = state.rot.y + Math.sin(t * 0.18) * 0.16;
    const portrait = camera.aspect < 1 ? (1 / camera.aspect) * 0.9 : 1;
    const cz = (camTargets[a] + (camTargets[b] - camTargets[a]) * k) * portrait;
    camera.position.z += (cz + ex * 4 - camera.position.z) * 0.06;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    setProgress(v) { state.progress = v; },
    setExplode(v) { state.explode = v; },
    setMouse(x, y) { state.mouse.set(x, y); },
    setFocus(i) { state.focus = i; },
    setAccent(css) { accent.set(css); rim.color.copy(accent); },
    destroy() {
      alive = false; cancelAnimationFrame(raf); ro.disconnect();
      geo.dispose(); edgeGeo.dispose(); ledGeo.dispose();
      blocks.forEach(m => { m.material.dispose(); m.userData.edges.material.dispose(); m.userData.led.material.dispose(); });
      renderer.dispose();
    }
  };
}
