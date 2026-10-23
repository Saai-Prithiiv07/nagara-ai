import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';
import {
  Flame,
  CloudRain,
  TreePine,
  Maximize2,
  Eye,
  Layers,
  Sparkles,
  RefreshCw,
  Compass
} from 'lucide-react';

export type CityViewMode = 'biophilic' | 'thermal' | 'monsoon';

interface City3DCanvasProps {
  onSelectMarker?: (wardId: string) => void;
}

export const City3DCanvas: React.FC<City3DCanvasProps> = ({ onSelectMarker }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [viewMode, setViewMode] = useState<CityViewMode>('biophilic');
  const [activeZone, setActiveZone] = useState<string>('macro');
  const [cameraTargetPos, setCameraTargetPos] = useState<[number, number, number]>([35, 28, 48]);
  const [cameraLookAtPos, setCameraLookAtPos] = useState<[number, number, number]>([0, 4, 0]);

  // Keep ref for dynamic mode changes without recreating WebGL context
  const viewModeRef = useRef<CityViewMode>(viewMode);
  viewModeRef.current = viewMode;

  const cameraTargetRef = useRef<[number, number, number]>(cameraTargetPos);
  cameraTargetRef.current = cameraTargetPos;

  const cameraLookAtRef = useRef<[number, number, number]>(cameraLookAtPos);
  cameraLookAtRef.current = cameraLookAtPos;

  // Handler for jumping camera to specific telemetry zone
  const handleFocusZone = (
    zone: string,
    target: [number, number, number],
    look: [number, number, number],
    wardId?: string
  ) => {
    setActiveZone(zone);
    setCameraTargetPos(target);
    setCameraLookAtPos(look);
    if (wardId && onSelectMarker) {
      onSelectMarker(wardId);
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050d0a);
    const fogExp = new THREE.FogExp2(0x050d0a, 0.015);
    scene.fog = fogExp;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(35, 28, 48);
    camera.lookAt(0, 4, 0);

    const currentLookAt = new THREE.Vector3(0, 4, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Dynamic Lights
    const ambientLight = new THREE.AmbientLight(0x0e2e22, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x34d399, 2.2);
    dirLight.position.set(45, 60, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 150;
    dirLight.shadow.camera.left = -45;
    dirLight.shadow.camera.right = 45;
    dirLight.shadow.camera.top = 45;
    dirLight.shadow.camera.bottom = -45;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 1.4);
    rimLight.position.set(-35, 20, -35);
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(0x38bdf8, 3, 50);
    accentLight.position.set(0, 14, 0);
    scene.add(accentLight);

    // Ground Plane & Tactical Grid
    const groundGeo = new THREE.PlaneGeometry(180, 180);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x040a07,
      roughness: 0.92,
      metalness: 0.08
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(180, 45, 0x10b981, 0x0c251c);
    gridHelper.position.y = 0.04;
    scene.add(gridHelper);

    // Materials
    const darkBuildingMat = new THREE.MeshStandardMaterial({
      color: 0x091812,
      roughness: 0.35,
      metalness: 0.65
    });

    const glassBuildingMat = new THREE.MeshStandardMaterial({
      color: 0x0e281f,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.92
    });

    const thermalBuildingMat = new THREE.MeshStandardMaterial({
      color: 0x450a0a,
      roughness: 0.4,
      metalness: 0.5,
      emissive: 0xef4444,
      emissiveIntensity: 0.45
    });

    const thermalHotspotMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      roughness: 0.3,
      metalness: 0.6,
      emissive: 0xf97316,
      emissiveIntensity: 0.85
    });

    const greenRoofMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.7,
      metalness: 0.1
    });

    const solarPanelMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.15,
      metalness: 0.95
    });

    const treeTrunkMat = new THREE.MeshStandardMaterial({
      color: 0x271c14,
      roughness: 0.9
    });

    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.6
    });

    const foliageLightMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      roughness: 0.5
    });

    // Cloud Material
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xdcfce7,
      roughness: 0.9,
      transparent: true,
      opacity: 0.28,
      depthWrite: false
    });

    // City Layout
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    const buildingBox = new THREE.BoxGeometry(1, 1, 1);
    const treeTrunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.2, 6);
    const foliageGeo = new THREE.DodecahedronGeometry(0.8, 1);

    interface BuildingData {
      mesh: THREE.Mesh;
      baseY: number;
      targetHeight: number;
      roofAdditions?: THREE.Object3D[];
      isPeenyaHotspot: boolean;
      type: string;
    }

    const buildingRecords: BuildingData[] = [];
    const treeFoliageMeshes: { mesh: THREE.Mesh; baseRot: number }[] = [];

    // Procedural city distribution
    for (let gx = -5; gx <= 5; gx++) {
      for (let gz = -5; gz <= 5; gz++) {
        // Skip center lake plaza and cross avenues
        if (Math.abs(gx) === 0 && Math.abs(gz) === 0) continue;
        if (Math.abs(gx) === 2 || Math.abs(gz) === 2) continue;

        const posX = gx * 7.5 + (Math.sin(gx * 3 + gz) * 1.4);
        const posZ = gz * 7.5 + (Math.cos(gz * 2 - gx) * 1.4);
        const distFromCenter = Math.sqrt(posX * posX + posZ * posZ);

        if (distFromCenter > 48) continue;

        const w = 3 + (Math.sin(gx * 7) + 1) * 1.2;
        const d = 3 + (Math.cos(gz * 5) + 1) * 1.2;
        const h = Math.max(5, 27 - distFromCenter * 0.42 + (Math.sin(gx * 11 + gz * 13) + 1) * 4);

        const isPeenyaZone = posX < -8 && posZ < -8;
        const isJayanagarZone = posX > 8 && posZ > 8;

        let type = 'commercial';
        if (isJayanagarZone || (!isPeenyaZone && Math.sin(gx * 17) > 0.1)) {
          type = 'sustainable-residential';
        } else if (distFromCenter < 20 && Math.cos(gx * 7) > 0.4) {
          type = 'civic-spire';
        } else if (Math.sin(gx * 23 + gz * 19) > 0.65) {
          type = 'park';
        }

        if (type === 'park') {
          // Park
          const parkGeo = new THREE.BoxGeometry(w * 1.25, 0.3, d * 1.25);
          const parkMesh = new THREE.Mesh(parkGeo, greenRoofMat);
          parkMesh.position.set(posX, 0.15, posZ);
          parkMesh.receiveShadow = true;
          cityGroup.add(parkMesh);

          // Miyawaki tree cluster
          const numTrees = 4;
          for (let t = 0; t < numTrees; t++) {
            const tx = posX + (Math.sin(t * 1.8) * w * 0.35);
            const tz = posZ + (Math.cos(t * 2.2) * d * 0.35);
            const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
            trunk.position.set(tx, 0.8, tz);
            trunk.castShadow = true;
            cityGroup.add(trunk);

            const fol = new THREE.Mesh(foliageGeo, t % 2 === 0 ? foliageMat : foliageLightMat);
            fol.position.set(tx, 1.8 + (t * 0.15), tz);
            fol.scale.setScalar(0.9 + (t * 0.1));
            fol.castShadow = true;
            cityGroup.add(fol);
            treeFoliageMeshes.push({ mesh: fol, baseRot: fol.rotation.y });
          }
          continue;
        }

        // Building Mesh
        const bldgMesh = new THREE.Mesh(
          buildingBox,
          type === 'civic-spire' ? glassBuildingMat : darkBuildingMat
        );
        bldgMesh.scale.set(w, 0.1, d);
        bldgMesh.position.set(posX, 0.05, posZ);
        bldgMesh.castShadow = true;
        bldgMesh.receiveShadow = true;
        cityGroup.add(bldgMesh);

        const roofParts: THREE.Object3D[] = [];

        // Sustainable Rooftop features
        if (type === 'sustainable-residential') {
          const roofGrass = new THREE.Mesh(buildingBox, greenRoofMat);
          roofGrass.scale.set(w * 0.88, 0.35, d * 0.88);
          roofGrass.position.set(posX, h + 0.18, posZ);
          roofGrass.castShadow = true;
          cityGroup.add(roofGrass);
          roofParts.push(roofGrass);

          const solar = new THREE.Mesh(buildingBox, solarPanelMat);
          solar.scale.set(w * 0.5, 0.18, d * 0.38);
          solar.position.set(posX - w * 0.15, h + 0.5, posZ);
          solar.rotation.x = 0.22;
          cityGroup.add(solar);
          roofParts.push(solar);

          const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
          trunk.scale.setScalar(0.7);
          trunk.position.set(posX + w * 0.22, h + 0.5, posZ + d * 0.22);
          cityGroup.add(trunk);
          roofParts.push(trunk);

          const fol = new THREE.Mesh(foliageGeo, foliageMat);
          fol.scale.setScalar(0.75);
          fol.position.set(posX + w * 0.22, h + 1.1, posZ + d * 0.22);
          cityGroup.add(fol);
          roofParts.push(fol);
          treeFoliageMeshes.push({ mesh: fol, baseRot: fol.rotation.y });
        }

        if (type === 'civic-spire') {
          const spireGeo = new THREE.CylinderGeometry(0.08, 0.35, 6.5, 8);
          const spireMat = new THREE.MeshStandardMaterial({
            color: 0x34d399,
            emissive: 0x10b981,
            emissiveIntensity: 0.7,
            metalness: 0.95
          });
          const spire = new THREE.Mesh(spireGeo, spireMat);
          spire.position.set(posX, h + 3.25, posZ);
          cityGroup.add(spire);
          roofParts.push(spire);

          const beaconGeo = new THREE.SphereGeometry(0.35, 12, 12);
          const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.set(posX, h + 6.5, posZ);
          cityGroup.add(beacon);
          roofParts.push(beacon);
        }

        buildingRecords.push({
          mesh: bldgMesh,
          baseY: 0,
          targetHeight: h,
          roofAdditions: roofParts,
          isPeenyaHotspot: isPeenyaZone,
          type
        });
      }
    }

    // Central Sponge Wetland & Inundation Plane
    const lakeGeo = new THREE.CircleGeometry(9.2, 36);
    const lakeMat = new THREE.MeshStandardMaterial({
      color: 0x082f49,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.88
    });
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(0, 0.14, 0);
    scene.add(lake);

    const wetlandRingGeo = new THREE.RingGeometry(9.2, 12.2, 36);
    const wetlandMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.82
    });
    const wetlandRing = new THREE.Mesh(wetlandRingGeo, wetlandMat);
    wetlandRing.rotation.x = -Math.PI / 2;
    wetlandRing.position.set(0, 0.16, 0);
    scene.add(wetlandRing);

    // Drifting Low-Poly Volumetric Clouds
    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);

    const cloudPuffs: { group: THREE.Group; speed: number; xReset: number }[] = [];
    for (let c = 0; c < 7; c++) {
      const puffGroup = new THREE.Group();
      const numSpheres = 4 + (c % 3);
      for (let s = 0; s < numSpheres; s++) {
        const sphereGeo = new THREE.SphereGeometry(2.5 + Math.random() * 2, 8, 8);
        const sphereMesh = new THREE.Mesh(sphereGeo, cloudMat);
        sphereMesh.position.set(
          (s - numSpheres / 2) * 2.2 + (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 2
        );
        puffGroup.add(sphereMesh);
      }
      puffGroup.position.set(-60 + c * 20, 36 + (c % 3) * 3, -30 + (c % 4) * 20);
      cloudGroup.add(puffGroup);
      cloudPuffs.push({ group: puffGroup, speed: 0.04 + (c % 3) * 0.02, xReset: -70 });
    }

    // Monsoonal Rain Particle System
    const rainCount = 800;
    const rainPositions = new Float32Array(rainCount * 3);
    for (let r = 0; r < rainCount; r++) {
      rainPositions[r * 3] = (Math.random() - 0.5) * 120;
      rainPositions[r * 3 + 1] = Math.random() * 50 + 2;
      rainPositions[r * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.55,
      transparent: true,
      opacity: 0.0 // invisible initially, shown in monsoon mode
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    scene.add(rainPoints);

    // Dynamic Transit Arteries
    const pathCurve1 = new THREE.LineCurve3(new THREE.Vector3(-65, 0.22, 0), new THREE.Vector3(65, 0.22, 0));
    const pathCurve2 = new THREE.LineCurve3(new THREE.Vector3(0, 0.22, -65), new THREE.Vector3(0, 0.22, 65));

    const lineMatEmerald = new THREE.LineDashedMaterial({
      color: 0x10b981,
      linewidth: 3,
      dashSize: 4.5,
      gapSize: 2.2
    });
    const lineMatCyan = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      linewidth: 3,
      dashSize: 3.5,
      gapSize: 2.8
    });

    const transitLine1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pathCurve1.getPoints(50)), lineMatEmerald);
    transitLine1.computeLineDistances();
    scene.add(transitLine1);

    const transitLine2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pathCurve2.getPoints(50)), lineMatCyan);
    transitLine2.computeLineDistances();
    scene.add(transitLine2);

    // Floating 3D Environmental Beacons
    interface BeaconTarget {
      x: number;
      y: number;
      z: number;
      name: string;
      label: string;
      color: number;
    }

    const beacons: BeaconTarget[] = [
      { x: -14, y: 16, z: -14, name: 'Peenya', label: 'UHI Peak +4.2°C', color: 0xf59e0b },
      { x: 18, y: 14, z: -10, name: 'Bellandur', label: 'Runoff Risk 93/100', color: 0x06b6d4 },
      { x: -8, y: 12, z: 18, name: 'Whitefield', label: 'Aquifer Deficit', color: 0x3b82f6 },
      { x: 14, y: 15, z: 16, name: 'Jayanagar', label: 'Tree Canopy 32%', color: 0x10b981 }
    ];

    const beaconRings: THREE.Mesh[] = [];
    beacons.forEach(b => {
      const ringGeo = new THREE.RingGeometry(1.2, 1.6, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: b.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(b.x, b.y, b.z);
      scene.add(ringMesh);
      beaconRings.push(ringMesh);

      const beamGeo = new THREE.CylinderGeometry(0.12, 0.7, b.y, 16);
      const beamMat = new THREE.MeshBasicMaterial({
        color: b.color,
        transparent: true,
        opacity: 0.22
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(b.x, b.y / 2, b.z);
      scene.add(beam);
    });

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 8;
      mouseY = y * 5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 550;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation & Staggered Entrance
    let clock = new THREE.Clock();
    let animationFrameId: number;
    let entranceProgress = 0;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Entrance Stagger (0 to 1 over first 1.4 seconds)
      if (entranceProgress < 1) {
        entranceProgress = Math.min(1, entranceProgress + 0.022);
        const ease = 1 - Math.pow(1 - entranceProgress, 3);
        buildingRecords.forEach(b => {
          const curH = Math.max(0.2, b.targetHeight * ease);
          b.mesh.scale.y = curH;
          b.mesh.position.y = curH / 2;
          if (b.roofAdditions) {
            b.roofAdditions.forEach(part => {
              part.position.y = (part as any).userData?.origY || (b.targetHeight * ease + (part.position.y - b.targetHeight));
            });
          }
        });
      }

      // View Mode Dynamic Tweaks
      const curMode = viewModeRef.current;
      if (curMode === 'thermal') {
        scene.background = new THREE.Color(0x120404);
        fogExp.color.setHex(0x120404);
        ambientLight.color.setHex(0x2d0b0b);
        dirLight.color.setHex(0xf97316);
        accentLight.color.setHex(0xef4444);
        groundMat.color.setHex(0x0e0606);
        lakeMat.color.setHex(0x1e1b4b);
        rainMat.opacity = 0.0;

        buildingRecords.forEach(b => {
          if (b.isPeenyaHotspot) {
            b.mesh.material = thermalHotspotMat;
          } else {
            b.mesh.material = thermalBuildingMat;
          }
        });
      } else if (curMode === 'monsoon') {
        scene.background = new THREE.Color(0x040f17);
        fogExp.color.setHex(0x040f17);
        ambientLight.color.setHex(0x0a2233);
        dirLight.color.setHex(0x38bdf8);
        accentLight.color.setHex(0x0284c7);
        groundMat.color.setHex(0x030d14);
        lakeMat.color.setHex(0x0284c7);
        lakeMat.opacity = 0.95;
        lake.scale.set(1.4, 1.4, 1.4); // Lake swell
        rainMat.opacity = 0.75;

        buildingRecords.forEach(b => {
          b.mesh.material = b.type === 'civic-spire' ? glassBuildingMat : darkBuildingMat;
        });

        // Animate Rain
        const posAttr = rainGeo.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < rainCount; i++) {
          arr[i * 3 + 1] -= 0.85;
          if (arr[i * 3 + 1] < 0) {
            arr[i * 3 + 1] = 48;
          }
        }
        posAttr.needsUpdate = true;
      } else {
        // Biophilic Standard
        scene.background = new THREE.Color(0x050d0a);
        fogExp.color.setHex(0x050d0a);
        ambientLight.color.setHex(0x0e2e22);
        dirLight.color.setHex(0x34d399);
        accentLight.color.setHex(0x38bdf8);
        groundMat.color.setHex(0x040a07);
        lakeMat.color.setHex(0x082f49);
        lakeMat.opacity = 0.88;
        lake.scale.set(1.0, 1.0, 1.0);
        rainMat.opacity = 0.0;

        buildingRecords.forEach(b => {
          b.mesh.material = b.type === 'civic-spire' ? glassBuildingMat : darkBuildingMat;
        });
      }

      // Smooth Camera Lerp
      const targetPos = cameraTargetRef.current;
      const targetLook = cameraLookAtRef.current;

      if (!prefersReducedMotion) {
        let finalTargetX = targetPos[0] + mouseX * 0.4;
        let finalTargetY = Math.max(12, targetPos[1] + mouseY * 0.4);
        let finalTargetZ = targetPos[2];

        // If in macro mode, add slow subtle orbit
        if (targetPos[0] === 35 && targetPos[2] === 48) {
          const orbitAngle = elapsedTime * 0.035;
          finalTargetX = 36 * Math.cos(orbitAngle) + mouseX;
          finalTargetZ = 46 * Math.sin(orbitAngle);
        }

        camera.position.x += (finalTargetX - camera.position.x) * 0.04;
        camera.position.y += (finalTargetY - camera.position.y) * 0.04;
        camera.position.z += (finalTargetZ - camera.position.z) * 0.04;

        currentLookAt.x += (targetLook[0] - currentLookAt.x) * 0.05;
        currentLookAt.y += (targetLook[1] - currentLookAt.y) * 0.05;
        currentLookAt.z += (targetLook[2] - currentLookAt.z) * 0.05;
        camera.lookAt(currentLookAt);

        // Wind sway on tree foliage
        treeFoliageMeshes.forEach((item, idx) => {
          item.mesh.rotation.z = Math.sin(elapsedTime * 2.2 + idx) * 0.06;
          item.mesh.rotation.x = Math.cos(elapsedTime * 1.8 + idx) * 0.04;
        });

        // Cloud drift
        cloudPuffs.forEach(p => {
          p.group.position.x += p.speed;
          if (p.group.position.x > 65) {
            p.group.position.x = p.xReset;
          }
        });

        // Pulse beacon rings
        beaconRings.forEach((ring, idx) => {
          const s = 1 + Math.sin(elapsedTime * 2.8 + idx) * 0.28;
          ring.scale.set(s, s, 1);
        });

        // Dash offset animation
        lineMatEmerald.dashSize = 4.5 + Math.sin(elapsedTime * 3) * 1.5;
        lineMatCyan.dashSize = 3.5 + Math.cos(elapsedTime * 3) * 1.2;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [prefersReducedMotion]);

  return (
    <div className="relative w-full h-[550px] lg:h-[630px] rounded-3xl overflow-hidden glass-panel-elevated border border-emerald-500/35 shadow-2xl">
      {/* Three.js Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Engine Identity Badge */}
      <div className="absolute top-5 left-5 z-20 flex flex-wrap gap-2 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-xl bg-black/85 border border-emerald-500/40 backdrop-blur-md text-[11px] font-mono text-emerald-300 shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold tracking-wider">3D PROCEDURAL DIGITAL TWIN • WEBGL</span>
        </div>
      </div>

      {/* Top Right: View Mode Climate Switcher */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-black/80 border border-emerald-500/30 backdrop-blur-md shadow-2xl pointer-events-auto">
        <button
          onClick={() => setViewMode('biophilic')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'biophilic'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Standard Sustainable Biophilic Twin"
        >
          <TreePine className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Biophilic</span>
        </button>

        <button
          onClick={() => setViewMode('thermal')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'thermal'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40'
              : 'text-zinc-400 hover:text-amber-300'
          }`}
          title="Thermal Infrared Urban Heat Island Scan"
        >
          <Flame className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Thermal UHI</span>
        </button>

        <button
          onClick={() => setViewMode('monsoon')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'monsoon'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40'
              : 'text-zinc-400 hover:text-cyan-300'
          }`}
          title="Monsoonal Cloudburst Runoff Simulation"
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Monsoon Deluge</span>
        </button>
      </div>

      {/* Bottom Center: Camera Telemetry Zone Jumps */}
      <div className="absolute bottom-5 left-5 right-5 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex flex-wrap items-center gap-2">
          {/* Macro Orbit */}
          <button
            onClick={() => handleFocusZone('macro', [35, 28, 48], [0, 4, 0])}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono border backdrop-blur-md transition-all cursor-pointer ${
              activeZone === 'macro'
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold'
                : 'bg-black/75 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 inline mr-1" />
            Macro Orbit
          </button>

          {/* Peenya UHI Focus */}
          <button
            onClick={() => handleFocusZone('peenya', [-16, 18, -4], [-14, 8, -14], 'peenya')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono border backdrop-blur-md transition-all cursor-pointer ${
              activeZone === 'peenya'
                ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-bold'
                : 'bg-black/75 border-zinc-800 text-zinc-400 hover:text-amber-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block mr-1.5 animate-pulse" />
            Peenya UHI Peak
          </button>

          {/* Bellandur Wetland Focus */}
          <button
            onClick={() => handleFocusZone('bellandur', [22, 16, 2], [18, 6, -10], 'bellandur')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono border backdrop-blur-md transition-all cursor-pointer ${
              activeZone === 'bellandur'
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 font-bold'
                : 'bg-black/75 border-zinc-800 text-zinc-400 hover:text-cyan-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block mr-1.5 animate-pulse" />
            Bellandur Runoff
          </button>

          {/* Jayanagar Canopy Focus */}
          <button
            onClick={() => handleFocusZone('jayanagar', [18, 16, 24], [14, 6, 16], 'jayanagar')}
            className={`hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-mono border backdrop-blur-md transition-all cursor-pointer ${
              activeZone === 'jayanagar'
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 font-bold'
                : 'bg-black/75 border-zinc-800 text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse" />
            Jayanagar Canopy
          </button>
        </div>

        <div className="text-[11px] font-mono text-emerald-400/80 bg-black/75 px-3 py-1.5 rounded-xl border border-emerald-500/25 hidden md:block">
          <span>Click zones or drag mouse to inspect 3D micro-climates</span>
        </div>
      </div>
    </div>
  );
};