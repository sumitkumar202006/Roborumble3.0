"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface DistortionImageProps {
  src: string;
  className?: string;
}

export default function DistortionImage({
  src,
  className = "",
}: DistortionImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Shaders
  const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform float u_intensity;
    uniform sampler2D u_texture;
    varying vec2 vUv;

    void main() {
        vec2 uv = vUv;
        float wave1 = sin(uv.x * 10.0 + u_time * 0.5 + u_mouse.x * 5.0) * u_intensity;
        float wave2 = sin(uv.y * 12.0 + u_time * 0.8 + u_mouse.y * 4.0) * u_intensity;
        float wave3 = cos(uv.x * 8.0 + u_time * 0.5 + u_mouse.x * 3.0) * u_intensity;
        float wave4 = cos(uv.y * 9.0 + u_time * 0.7 + u_mouse.y * 3.5) * u_intensity;

        uv.y += wave1 + wave2;
        uv.x += wave3 + wave4;
        
        gl_FragColor = texture2D(u_texture, uv);
    }
  `;

  useEffect(() => {
    if (!containerRef.current) return;

    // Safety check for existing canvas to prevent duplicates on strict mode re-renders
    if (containerRef.current.querySelector("canvas")) {
      return;
    }

    const container = containerRef.current;
    let width = container.offsetWidth;
    let height = container.offsetHeight;

    // State
    const currentState = {
      mousePosition: { x: 0, y: 0 },
      waveIntensity: 0.005,
    };
    const targetState = { mousePosition: { x: 0, y: 0 }, waveIntensity: 0.005 };

    const ANIMATION_CONFIG = {
      transitionSpeed: 0.03,
      baseIntensity: 0.005,
      hoverIntensity: 0.009,
    };

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let planeMesh: THREE.Mesh;
    let animationId: number;

    // Helper: Update value with inertia
    const updateValue = (target: number, current: number, speed: number) => {
      return current + (target - current) * speed;
    };

    // Initialize Scene
    const init = (texture: THREE.Texture) => {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(80, width / height, 0.01, 10);
      camera.position.z = 1;

      const shaderUniforms = {
        u_time: { value: 1.0 },
        u_mouse: { value: new THREE.Vector2() },
        u_intensity: { value: currentState.waveIntensity },
        u_texture: { value: texture },
      };

      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        uniforms: shaderUniforms,
        vertexShader,
        fragmentShader,
      });

      planeMesh = new THREE.Mesh(geometry, material);
      scene.add(planeMesh);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // High DPI

      container.appendChild(renderer.domElement);

      // Handle Resize
      const onResize = () => {
        if (!containerRef.current) return;
        const newWidth = containerRef.current.offsetWidth;
        const newHeight = containerRef.current.offsetHeight;
        renderer.setSize(newWidth, newHeight);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);

      animate();
    };

    // Animation Loop
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      currentState.mousePosition.x = updateValue(
        targetState.mousePosition.x,
        currentState.mousePosition.x,
        ANIMATION_CONFIG.transitionSpeed,
      );
      currentState.mousePosition.y = updateValue(
        targetState.mousePosition.y,
        currentState.mousePosition.y,
        ANIMATION_CONFIG.transitionSpeed,
      );
      currentState.waveIntensity = updateValue(
        targetState.waveIntensity,
        currentState.waveIntensity,
        ANIMATION_CONFIG.transitionSpeed,
      );

      if (planeMesh) {
        const uniforms = (planeMesh.material as THREE.ShaderMaterial).uniforms;
        uniforms.u_intensity.value = currentState.waveIntensity;
        uniforms.u_time.value += 0.01; // Slightly faster time for visibility
        uniforms.u_mouse.value.set(
          currentState.mousePosition.x,
          currentState.mousePosition.y,
        );

        renderer.render(scene, camera);
      }
    };

    // Texture Loading
    const loader = new THREE.TextureLoader();
    loader.load(src, (texture) => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      // Adjust texture aspect ratio to cover
      // (Simple cover logic might be needed in shader, but defaulting to stretch for now as geometry is 2x2 clip space)
      init(texture);
    });

    // Interaction Handlers
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      // Calculate normalized shader coords (-1 to 1)
      targetState.mousePosition.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;
      targetState.mousePosition.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleMouseOver = () => {
      targetState.waveIntensity = ANIMATION_CONFIG.hoverIntensity;
    };

    const handleMouseOut = () => {
      targetState.waveIntensity = ANIMATION_CONFIG.baseIntensity;
      targetState.mousePosition = { x: 0, y: 0 };
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseOver);
    container.addEventListener("mouseleave", handleMouseOut);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener("resize", () => {}); // Basic cleanup
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseOver);
      container.removeEventListener("mouseleave", handleMouseOut);

      if (renderer) {
        renderer.dispose();
        // Be careful removing child if React already unmounted it
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      if (planeMesh) {
        planeMesh.geometry.dispose();
        (planeMesh.material as THREE.Material).dispose();
      }
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden transition-all duration-500 saturate-50 hover:saturate-100 ${className}`}
    >
      {/* Three.js Canvas will be injected here */}
    </div>
  );
}
