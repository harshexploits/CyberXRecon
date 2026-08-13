import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function createStarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
}

const starVertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const starFragmentShader = `
  uniform sampler2D pointTexture;
  varying vec3 vColor;
  void main() {
    vec4 tex = texture2D(pointTexture, gl_PointCoord);
    gl_FragColor = vec4(vColor, 1.0) * tex;
  }
`;

export default function ThreeDGalaxy() {
  const mountRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 28;
    camera.position.y = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const twinkleSpeeds = new Float32Array(count);

    // Color gradient markers
    const colorCore = new THREE.Color('#e0f7fa');  // Core light cyan-white
    const colorMid = new THREE.Color('#22d3ee');   // Mid neon cyan
    const colorOuter = new THREE.Color('#a855f7'); // Outer neon purple
    const colorEdge = new THREE.Color('#ec4899');  // Edge hot pink/magenta

    const maxRadius = 38;
    const branches = 3;
    const spin = 1.8;

    for (let i = 0; i < count; i++) {
      // Spiral Math
      const radius = Math.random() * maxRadius;
      const branchAngle = ((i % branches) * 2 * Math.PI) / branches;
      const spinAngle = radius * spin;
      const angle = branchAngle + spinAngle;

      // Organic dispersion
      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 3.5;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 1.8;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 3.5;

      positions[i * 3]     = Math.cos(angle) * radius + randomX;
      positions[i * 3 + 1] = randomY; // Flat disk on Y axis
      positions[i * 3 + 2] = Math.sin(angle) * radius + randomZ;

      // Color Interpolation based on distance from core
      const t = radius / maxRadius;
      const starColor = new THREE.Color();
      if (t < 0.25) {
        starColor.lerpColors(colorCore, colorMid, t / 0.25);
      } else if (t < 0.7) {
        starColor.lerpColors(colorMid, colorOuter, (t - 0.25) / 0.45);
      } else {
        starColor.lerpColors(colorOuter, colorEdge, (t - 0.7) / 0.3);
      }

      colors[i * 3]     = starColor.r;
      colors[i * 3 + 1] = starColor.g;
      colors[i * 3 + 2] = starColor.b;

      // Twinkling properties - central stars are slightly larger and brighter
      sizes[i] = (0.15 + Math.random() * 0.3) * (1.3 - t);
      twinkleSpeeds[i] = 0.4 + Math.random() * 2.6;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: { pointTexture: { value: createStarTexture() } },
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const stars = new THREE.Points(geometry, material);
    // Pre-set stable initial rotation so there is no jitter/snap on first render
    stars.rotation.x = -Math.PI / 8;
    stars.rotation.y = 0;
    scene.add(stars);

    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      scrollRef.current = scrollY / maxScroll;
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    let animationFrameId;
    const startTime = Date.now();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = (Date.now() - startTime) * 0.001;

      // Twinkling
      const sizeAttr = geometry.attributes.size;
      const sizeArray = sizeAttr.array;
      for (let i = 0; i < count; i++) {
        sizeArray[i] = 0.12 + Math.abs(Math.sin(time * twinkleSpeeds[i])) * 0.38;
      }
      sizeAttr.needsUpdate = true;

      // Stable slow constant spin — no lerp to a moving target (avoids reload snap)
      stars.rotation.y = time * 0.018;
      // Subtle x-tilt driven only by scroll, from resting position
      const restX = -Math.PI / 8;
      const scrollTilt = scrollRef.current * (Math.PI * 0.2);
      stars.rotation.x += (restX + scrollTilt - stars.rotation.x) * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      
      geometry.dispose();
      material.dispose();
      if (material.uniforms && material.uniforms.pointTexture && material.uniforms.pointTexture.value) {
        material.uniforms.pointTexture.value.dispose();
      }
      renderer.dispose();
      
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none bg-black" />;
}
