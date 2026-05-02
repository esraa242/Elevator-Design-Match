import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Maximize2 } from "lucide-react";

interface CabinViewer3DProps {
  imageUrl: string;
  cabinName: string;
  matchScore: number;
  onClose: () => void;
}

export function CabinViewer3D({ imageUrl, cabinName, matchScore, onClose }: CabinViewer3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    plane: THREE.Mesh;
    frameId: number;
    mouse: { x: number; y: number };
    targetRotation: { x: number; y: number };
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080808);
    scene.fog = new THREE.Fog(0x080808, 8, 20);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 3.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Load texture
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;

      // Main cabin plane
      const planeGeo = new THREE.PlaneGeometry(3.2, 4, 32, 32);

      // Luxury dark material with the cabin image
      const planeMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.3,
        metalness: 0.15,
      });

      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.castShadow = true;
      plane.receiveShadow = true;
      scene.add(plane);

      // Frame border (gold colored thin box)
      const frameGeo = new THREE.BoxGeometry(3.38, 4.18, 0.04);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0xb8960c,
        roughness: 0.2,
        metalness: 0.9,
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.z = -0.03;
      scene.add(frame);

      // Backing plate
      const backGeo = new THREE.BoxGeometry(3.44, 4.24, 0.02);
      const backMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.8,
        metalness: 0.2,
      });
      const backing = new THREE.Mesh(backGeo, backMat);
      backing.position.z = -0.06;
      scene.add(backing);

      // Shadow plane (ground)
      const shadowGeo = new THREE.PlaneGeometry(10, 10);
      const shadowMat = new THREE.ShadowMaterial({ opacity: 0.4 });
      const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -2.5;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      // Ambient light
      const ambient = new THREE.AmbientLight(0xfff8e7, 0.4);
      scene.add(ambient);

      // Key light (warm gold from top-left)
      const keyLight = new THREE.DirectionalLight(0xffd700, 2.0);
      keyLight.position.set(-3, 4, 5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      scene.add(keyLight);

      // Fill light (cool blue from right)
      const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
      fillLight.position.set(4, -2, 3);
      scene.add(fillLight);

      // Rim light (gold edge from behind)
      const rimLight = new THREE.PointLight(0xb8960c, 2.5, 10);
      rimLight.position.set(0, 0, -2);
      scene.add(rimLight);

      // Spotlight on cabin
      const spotlight = new THREE.SpotLight(0xfff0cc, 3.0, 12, Math.PI / 5, 0.5);
      spotlight.position.set(0, 4, 4);
      spotlight.target = plane;
      spotlight.castShadow = true;
      scene.add(spotlight);

      // Particle dust (tiny gold specks floating)
      const particleCount = 80;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
      }
      particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({ color: 0xb8960c, size: 0.015, transparent: true, opacity: 0.6 });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Store plane ref for mouse interaction
      sceneRef.current!.plane = plane;

      setIsLoaded(true);

      // Animate particles
      const originalPositions = positions.slice();
      let tick = 0;
      const posAttr = particleGeo.getAttribute("position") as THREE.BufferAttribute;

      const animate = () => {
        tick += 0.005;
        const rot = sceneRef.current!;
        rot.targetRotation.x += (rot.mouse.y * 0.3 - rot.targetRotation.x) * 0.05;
        rot.targetRotation.y += (rot.mouse.x * 0.4 - rot.targetRotation.y) * 0.05;

        plane.rotation.x = rot.targetRotation.x;
        plane.rotation.y = rot.targetRotation.y;
        frame.rotation.x = rot.targetRotation.x;
        frame.rotation.y = rot.targetRotation.y;
        backing.rotation.x = rot.targetRotation.x;
        backing.rotation.y = rot.targetRotation.y;

        // Float particles
        for (let i = 0; i < particleCount; i++) {
          posAttr.setY(i, originalPositions[i * 3 + 1] + Math.sin(tick + i * 0.5) * 0.15);
        }
        posAttr.needsUpdate = true;
        particles.rotation.y = tick * 0.05;

        renderer.render(scene, camera);
        rot.frameId = requestAnimationFrame(animate);
      };

      animate();
    });

    const state = {
      renderer,
      scene,
      camera,
      plane: null as unknown as THREE.Mesh,
      frameId: 0,
      mouse: { x: 0, y: 0 },
      targetRotation: { x: 0, y: 0 },
    };
    sceneRef.current = state;

    // Resize handler
    const onResize = () => {
      if (!mountRef.current || !sceneRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.frameId);
        sceneRef.current.renderer.dispose();
      }
      if (container.firstChild) container.removeChild(container.firstChild);
    };
  }, [imageUrl]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sceneRef.current || !mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    sceneRef.current.mouse.x = x;
    sceneRef.current.mouse.y = y;
    if (hint) setHint(false);
  };

  const resetView = () => {
    if (!sceneRef.current) return;
    sceneRef.current.mouse = { x: 0, y: 0 };
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5 z-10">
          <div>
            <p className="text-xs text-amber-500 uppercase tracking-[0.2em] font-semibold mb-1">3D Preview</p>
            <h2 className="text-2xl font-serif text-white">{cabinName}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 px-4 py-2 rounded-full">
              <span className="text-amber-400 font-bold text-lg">{matchScore}%</span>
              <span className="text-amber-500/70 text-xs uppercase tracking-wider">Match</span>
            </div>
            <button
              onClick={resetView}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
              title="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Canvas */}
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseMove={handleMouseMove}
        />

        {/* Loading overlay */}
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/90"
            >
              <div className="w-16 h-16 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin mb-4" />
              <p className="text-amber-500/70 text-sm uppercase tracking-widest">Rendering cabin...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mouse hint */}
        <AnimatePresence>
          {isLoaded && hint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 px-5 py-2.5 rounded-full"
            >
              <Maximize2 className="w-4 h-4 text-amber-500" />
              <span className="text-white/60 text-sm">Move your mouse to explore the cabin in 3D</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner decorations */}
        <div className="absolute top-20 left-8 w-12 h-12 border-l-2 border-t-2 border-amber-500/20 pointer-events-none" />
        <div className="absolute top-20 right-8 w-12 h-12 border-r-2 border-t-2 border-amber-500/20 pointer-events-none" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-amber-500/20 pointer-events-none" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-amber-500/20 pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
}
