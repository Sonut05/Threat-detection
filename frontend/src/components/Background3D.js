"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Background3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene Setup ──────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap at 1.5x, not 2x
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Colors ─────────────────────────────────────────────────────────────
    const PRIMARY = new THREE.Color(0x8a2be2);
    const ACCENT  = new THREE.Color(0x20b2aa);
    const DANGER  = new THREE.Color(0xff4b4b);

    // ── OPTIMIZED: Single InstancedMesh for all nodes (1 draw call) ─────────
    const NODE_COUNT = 80; // Reduced from 120 — still looks great
    const nodeGeo = new THREE.SphereGeometry(0.4, 6, 6); // Reduced segments
    const nodeMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85 });
    const instanced = new THREE.InstancedMesh(nodeGeo, nodeMat, NODE_COUNT);
    instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const nodeColors = new THREE.InstancedBufferAttribute(new Float32Array(NODE_COUNT * 3), 3);
    const nodeVelocities = [];
    const nodeTypes = [];
    const dummy = new THREE.Object3D();
    const tempColor = new THREE.Color();

    for (let i = 0; i < NODE_COUNT; i++) {
      const type = Math.random() < 0.08 ? 1 : Math.random() < 0.2 ? 2 : 0;
      nodeTypes.push(type);

      dummy.position.set(
        (Math.random() - 0.5) * 160,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 80
      );
      dummy.scale.setScalar(type === 1 ? 1.4 : type === 2 ? 1.1 : 1.0);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);

      const c = type === 1 ? DANGER : type === 2 ? ACCENT : PRIMARY;
      nodeColors.setXYZ(i, c.r, c.g, c.b);

      nodeVelocities.push(
        (Math.random() - 0.5) * 0.045,
        (Math.random() - 0.5) * 0.045,
        (Math.random() - 0.5) * 0.025
      );
    }
    nodeGeo.setAttribute("color", nodeColors);
    instanced.instanceMatrix.needsUpdate = true;
    scene.add(instanced);

    // ── OPTIMIZED: Pre-allocated edge geometry (no create/destroy per frame) ─
    const MAX_EDGES = 300;
    const edgePositions = new Float32Array(MAX_EDGES * 2 * 3); // 2 verts per line
    const edgeColors   = new Float32Array(MAX_EDGES * 2 * 3);
    const edgeGeo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(edgePositions, 3);
    const colAttr = new THREE.BufferAttribute(edgeColors, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    colAttr.setUsage(THREE.DynamicDrawUsage);
    edgeGeo.setAttribute("position", posAttr);
    edgeGeo.setAttribute("color",    colAttr);
    edgeGeo.setDrawRange(0, 0);
    const edgeMat  = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.35 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    scene.add(edgeLines);

    // ── OPTIMIZED: Particle dust as a single Points object ──────────────────
    const DUST_COUNT = 200;
    const dustPos = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT * 3; i++) dustPos[i] = (Math.random() - 0.5) * 200;
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: PRIMARY, size: 0.12, transparent: true, opacity: 0.3
    })));

    // ── Scratch vectors to avoid per-frame allocation ───────────────────────
    const posA = new THREE.Vector3();
    const posB = new THREE.Vector3();
    const mat4 = new THREE.Matrix4();
    const MAX_DIST = 30;
    const MAX_DIST_SQ = MAX_DIST * MAX_DIST;

    // ── Mouse parallax ───────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ── Resize handler ───────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // ── Animation ───────────────────────────────────────────────────────────
    let frameId;
    let tick = 0;
    let edgeFrame = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      tick += 0.008;
      edgeFrame++;

      // Camera parallax
      camera.position.x += (mouse.x * 8 - camera.position.x) * 0.025;
      camera.position.y += (-mouse.y * 5 - camera.position.y) * 0.025;
      camera.lookAt(scene.position);

      // Update node positions via instanced matrices
      for (let i = 0; i < NODE_COUNT; i++) {
        const base = i * 3;
        instanced.getMatrixAt(i, mat4);
        posA.setFromMatrixPosition(mat4);

        posA.x += nodeVelocities[base];
        posA.y += nodeVelocities[base + 1];
        posA.z += nodeVelocities[base + 2];

        if (Math.abs(posA.x) > 80) nodeVelocities[base]     *= -1;
        if (Math.abs(posA.y) > 50) nodeVelocities[base + 1] *= -1;
        if (Math.abs(posA.z) > 40) nodeVelocities[base + 2] *= -1;

        // Pulse threat nodes
        let scale = nodeTypes[i] === 1 ? 1.4 : nodeTypes[i] === 2 ? 1.1 : 1.0;
        if (nodeTypes[i] === 1) scale *= (1 + 0.2 * Math.sin(tick * 3 + i));

        dummy.position.copy(posA);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        instanced.setMatrixAt(i, dummy.matrix);
      }
      instanced.instanceMatrix.needsUpdate = true;

      // Rebuild edges every 6 frames using pre-allocated buffer
      if (edgeFrame % 6 === 0) {
        let edgeCount = 0;
        for (let i = 0; i < NODE_COUNT && edgeCount < MAX_EDGES; i++) {
          instanced.getMatrixAt(i, mat4);
          posA.setFromMatrixPosition(mat4);

          for (let j = i + 1; j < NODE_COUNT && edgeCount < MAX_EDGES; j++) {
            instanced.getMatrixAt(j, mat4);
            posB.setFromMatrixPosition(mat4);

            const dx = posA.x - posB.x, dy = posA.y - posB.y, dz = posA.z - posB.z;
            const distSq = dx*dx + dy*dy + dz*dz;
            if (distSq > MAX_DIST_SQ) continue;

            const alpha = (1 - Math.sqrt(distSq) / MAX_DIST) * 0.5;
            const isThreat = nodeTypes[i] === 1 || nodeTypes[j] === 1;
            const isAccent = !isThreat && (nodeTypes[i] === 2 || nodeTypes[j] === 2);
            const c = isThreat ? DANGER : isAccent ? ACCENT : PRIMARY;

            const v = edgeCount * 6;
            edgePositions[v]     = posA.x; edgePositions[v+1] = posA.y; edgePositions[v+2] = posA.z;
            edgePositions[v+3]   = posB.x; edgePositions[v+4] = posB.y; edgePositions[v+5] = posB.z;
            edgeColors[v]   = c.r * alpha * 2; edgeColors[v+1] = c.g * alpha * 2; edgeColors[v+2] = c.b * alpha * 2;
            edgeColors[v+3] = c.r * alpha * 2; edgeColors[v+4] = c.g * alpha * 2; edgeColors[v+5] = c.b * alpha * 2;
            edgeCount++;
          }
        }
        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
        edgeGeo.setDrawRange(0, edgeCount * 2);
      }

      // Gentle scene rotation
      scene.rotation.y = Math.sin(tick * 0.15) * 0.08;
      scene.rotation.x = Math.cos(tick * 0.10) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      nodeGeo.dispose();
      nodeMat.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      dustGeo.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
