// Builds public/models/mitm-intercept.glb.
//
// The model is authored procedurally (not modelled in a DCC tool), so the
// geometry IS this file — that is why it lives in scripts/ under version
// control rather than in the gitignored assets-src/, where the other three
// keep their .obj/.mtl. The uncompressed export still lands in assets-src/
// as a build intermediate.
//
// Usage:
//   node scripts/generate-mitm-model.mjs
//   npx --yes @gltf-transform/cli@latest optimize \
//     assets-src/glb-raw/mitm-intercept.glb public/models/mitm-intercept.glb \
//     --compress meshopt --texture-compress false
//
// The scene is a single frozen frame of the design's "intercepted" phase:
// a victim and a gateway node with the link between them bent up through a
// rogue interceptor, packets riding the diverted path, a captured-frame
// stack, a forged certificate, and the isolated-lab boundary ring.
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// GLTFExporter's binary path is written for the browser: it packs the buffer
// into a Blob and reads it back through FileReader, which Node has no global
// for. Node does have Blob, so a five-line shim is enough — and it must
// resolve asynchronously, because the exporter assigns `onloadend` on the
// line AFTER it calls readAsArrayBuffer. A promise microtask lands in exactly
// that gap; a synchronous callback would fire before the handler exists.
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onloadend) this.onloadend();
      });
    }
  };
}

// Baked design tweaks. The source ships a live tweaks panel; a debug panel
// must not reach a recruiter-facing page, so its defaults are frozen here.
const PHASE = "intercepted";
const TRAFFIC = 1;
const ROGUE_CERT = true;
// Offset for the packet placement so packet 0 does not sit exactly on the
// victim node. Half of one packet's spacing reads as "mid-flight".
const PHASE_T = 0.5 / 14;

/* ---------------------------------------------------------------- materials */
const gunmetal = new THREE.MeshStandardMaterial({ color: 0x23272c, roughness: 0.35, metalness: 0.38 });
gunmetal.name = "gunmetal";
const darkPanel = new THREE.MeshStandardMaterial({ color: 0x101215, roughness: 0.6, metalness: 0.2 });
darkPanel.name = "dark_panel";
const emerald = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.6, roughness: 0.3 });
emerald.name = "neon_emerald";
const emeraldDim = new THREE.MeshStandardMaterial({ color: 0x0a7a58, emissive: 0x10b981, emissiveIntensity: 0.5, roughness: 0.4 });
emeraldDim.name = "emerald_dim";
const amber = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.9, roughness: 0.3 });
amber.name = "tlp_amber";
const adversary = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.5, roughness: 0.3 });
adversary.name = "adversary_red";
const linkMat = new THREE.MeshStandardMaterial({ color: 0x0a7a58, emissive: 0x10b981, emissiveIntensity: 0.7, roughness: 0.4, transparent: true, opacity: 0.55 });
linkMat.name = "link_beam";
const cageMat = new THREE.MeshStandardMaterial({ color: 0x2a1416, emissive: 0xef4444, emissiveIntensity: 0.35, roughness: 0.4 });
cageMat.name = "rogue_cage_mat";

const model = new THREE.Group();
model.name = "mitm_intercept_node";

const AX = -1.15, BX = 1.15, NODE_Y = 0.46, MID_Y = 1.42;

/* ---------------------------------------------------------------- endpoints */
function endpoint(name, x) {
  const g = new THREE.Group();
  g.name = name;
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, 0.06, 6), darkPanel);
  pad.name = name + "_pad";
  pad.position.y = 0.03;
  g.add(pad);
  const padGlow = new THREE.Mesh(new THREE.TorusGeometry(0.335, 0.011, 10, 6), emeraldDim);
  padGlow.name = name + "_pad_glow";
  padGlow.rotation.x = Math.PI / 2;
  padGlow.position.y = 0.062;
  g.add(padGlow);
  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.46, 0.3), gunmetal);
  housing.name = name + "_housing";
  housing.position.y = 0.29;
  g.add(housing);
  for (let i = 0; i < 3; i++) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.035, 0.012), emeraldDim);
    slot.name = name + "_slot_" + i;
    slot.position.set(0, 0.18 + i * 0.1, 0.152);
    g.add(slot);
  }
  // Intercepted phase: both endpoints report hostile, so the status eye is red.
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 20, 20), adversary);
  eye.name = name + "_status_eye";
  eye.position.set(0, NODE_Y + 0.06, 0);
  g.add(eye);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.016, 12, 32), emeraldDim);
  collar.name = name + "_collar";
  collar.rotation.x = Math.PI / 2;
  collar.position.y = NODE_Y + 0.01;
  g.add(collar);
  g.position.x = x;
  model.add(g);
  return g;
}
endpoint("victim_node", AX);
endpoint("gateway_node", BX);

/* ------------------------------------------------------- rogue interceptor */
const rogue = new THREE.Group();
rogue.name = "rogue_interceptor";
const rogueCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), adversary);
rogueCore.name = "rogue_core";
rogue.add(rogueCore);

// The design draws the cage with `wireframe: true`. glTF has no wireframe
// flag — exporting it as-is would ship a SOLID icosahedron that swallows the
// core. Rebuild the wireframe as real edge geometry instead: one thin
// cylinder per unique edge, which survives export and meshopt intact.
{
  const ico = new THREE.IcosahedronGeometry(0.36, 0);
  const edges = new THREE.EdgesGeometry(ico, 1);
  const pos = edges.attributes.position;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), mid = new THREE.Vector3(), dir = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < pos.count; i += 2) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    const len = a.distanceTo(b);
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, len, 5, 1), cageMat);
    strut.name = "rogue_cage_edge_" + i / 2;
    strut.position.copy(mid.copy(a).add(b).multiplyScalar(0.5));
    strut.quaternion.setFromUnitVectors(up, dir.copy(b).sub(a).normalize());
    rogue.add(strut);
  }
  ico.dispose();
  edges.dispose();
}

[-1, 1].forEach((s, i) => {
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.34, 12), gunmetal);
  arm.name = "sniffer_arm_" + i;
  arm.position.set(s * 0.22, 0.16, 0);
  arm.rotation.z = -s * 0.5;
  rogue.add(arm);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 16), amber);
  tip.name = "sniffer_tip_" + i;
  tip.position.set(s * 0.3, 0.3, 0);
  rogue.add(tip);
});
rogue.position.set(0, MID_Y, 0);
model.add(rogue);

/* ------------------------------------------------------ forged certificate */
if (ROGUE_CERT) {
  const cert = new THREE.Group();
  cert.name = "rogue_certificate";
  const certPlate = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.018), darkPanel);
  certPlate.name = "cert_plate";
  cert.add(certPlate);
  const certEdge = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.008, 8, 4), amber);
  certEdge.name = "cert_edge";
  certEdge.rotation.z = Math.PI / 4;
  certEdge.position.z = 0.012;
  cert.add(certEdge);
  for (let i = 0; i < 3; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.016, 0.01), amber);
    line.name = "cert_line_" + i;
    line.position.set(0, 0.06 - i * 0.07, 0.014);
    cert.add(line);
  }
  cert.position.set(0.62, MID_Y + 0.16, 0.18);
  // Frozen at the mid-point of the design's idle sway rather than an extreme.
  cert.rotation.y = -0.5;
  model.add(cert);
}

/* ------------------------------------------------------------- link + path */
// Intercepted phase: divert = 1, so the path bends fully up through the rogue.
const DIVERT = 1;
const A = new THREE.Vector3(AX, NODE_Y + 0.06, 0);
const B = new THREE.Vector3(BX, NODE_Y + 0.06, 0);
const M = new THREE.Vector3(0, MID_Y, 0);
const straightMid = new THREE.Vector3(0, NODE_Y + 0.06, 0);
const ctrl = straightMid.clone().lerp(M, DIVERT);

function pathPoint(u, out) {
  const iu = 1 - u;
  return out.set(
    iu * iu * A.x + 2 * iu * u * ctrl.x + u * u * B.x,
    iu * iu * A.y + 2 * iu * u * ctrl.y + u * u * B.y,
    0
  );
}

// Intercepted phase recolours the beam hostile red.
linkMat.color.setHex(0xef4444);
linkMat.emissive.setHex(0xef4444);
linkMat.opacity = 0.55;

const linkGroup = new THREE.Group();
linkGroup.name = "link_path";
model.add(linkGroup);
const SEGS = 26;
{
  const p0 = new THREE.Vector3(), p1 = new THREE.Vector3(), dir = new THREE.Vector3();
  const xAxis = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < SEGS; i++) {
    pathPoint(i / SEGS, p0);
    pathPoint((i + 1) / SEGS, p1);
    const seg = new THREE.Mesh(new THREE.BoxGeometry(1, 0.028, 0.028), linkMat);
    seg.name = "link_seg_" + i;
    seg.position.copy(p0).add(p1).multiplyScalar(0.5);
    // Baked into the transform, exactly as the runtime layoutLink() does.
    seg.scale.x = p0.distanceTo(p1);
    seg.quaternion.setFromUnitVectors(xAxis, dir.copy(p1).sub(p0).normalize());
    linkGroup.add(seg);
  }
}

/* ----------------------------------------------------------------- packets */
const packets = new THREE.Group();
packets.name = "packets";
model.add(packets);
const PKT = 14;
const visiblePackets = Math.round(PKT * Math.min(TRAFFIC, 1));
{
  const pt = new THREE.Vector3();
  for (let i = 0; i < visiblePackets; i++) {
    // Every 4th packet is amber (the forged/observed ones); the rest carry
    // the hostile red of the intercepted phase.
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.045, 0.045), i % 4 === 0 ? amber : adversary);
    p.name = "packet_" + i;
    const u = (PHASE_T + i / PKT) % 1;
    pathPoint(u, pt);
    p.position.copy(pt);
    p.rotation.y = u * 6;
    // The runtime swells packets near the interceptor; freeze that swell.
    const near = 1 - Math.min(Math.abs(u - 0.5) * 4, 1);
    p.scale.setScalar(1 + near * DIVERT * 0.5);
    packets.add(p);
  }
}

/* ------------------------------------------------------- captured frames */
const capture = new THREE.Group();
capture.name = "capture_stack";
for (let i = 0; i < 5; i++) {
  const f = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.022, 0.2), i === 0 ? amber : emeraldDim);
  f.name = "capture_frame_" + i;
  f.position.set(0, i * 0.055, 0);
  f.rotation.y = i * 0.1;
  capture.add(f);
}
capture.position.set(-0.66, MID_Y - 0.3, 0.22);
model.add(capture);

/* ------------------------------------------------------- lab boundary ring */
// The design places this ring at 1.72, which is right for the full-viewport
// stage it was authored on. Here the model lives in a ~300px square panel and
// Scene3D frames the camera to the whole bounding sphere, so a ring 3.4 wide
// around content only 2.3 wide pushed the camera back far enough that the
// nodes and interceptor read noticeably smaller than the other three set
// pieces in the same slot. Pulling it in keeps the isolated-lab motif while
// letting the auto-frame sit where its siblings do.
const BOUNDARY_R = 1.28;
const boundary = new THREE.Mesh(new THREE.TorusGeometry(BOUNDARY_R, 0.01, 10, 6), amber);
boundary.name = "lab_boundary";
boundary.rotation.x = Math.PI / 2;
boundary.position.y = 0.006;
model.add(boundary);
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 0.14, 6), darkPanel);
  post.name = "boundary_post_" + i;
  post.position.set(Math.cos(a) * BOUNDARY_R, 0.07, Math.sin(a) * BOUNDARY_R);
  model.add(post);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 14), amber);
  cap.name = "boundary_cap_" + i;
  cap.position.set(Math.cos(a) * BOUNDARY_R, 0.155, Math.sin(a) * BOUNDARY_R);
  model.add(cap);
}

/* -------------------------------------------------------------- export */
let meshes = 0;
model.traverse((o) => {
  if (o.isMesh) {
    meshes += 1;
    if (!o.name) o.name = "part_" + meshes;
    o.castShadow = false;
    o.receiveShadow = false;
  }
});

const outRaw = resolve(root, "assets-src/glb-raw/mitm-intercept.glb");
mkdirSync(dirname(outRaw), { recursive: true });

const buf = await new GLTFExporter().parseAsync(model, { binary: true });
writeFileSync(outRaw, Buffer.from(buf));

const box = new THREE.Box3().setFromObject(model);
const size = box.getSize(new THREE.Vector3());
console.log(`wrote ${outRaw}`);
console.log(`  meshes: ${meshes}  bytes: ${Buffer.from(buf).length}`);
console.log(`  bbox:   ${size.toArray().map((n) => n.toFixed(3)).join(" x ")}`);
