import { useEffect, useRef } from "react";
import * as THREE from "three";

const ThreeJsBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create blockchain node particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300;

    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    const sizeArray = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      // Position
      posArray[i * 3] = (Math.random() - 0.5) * 30;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 30;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 30;

      // Colors - Web3 theme: blues, purples, teals, and some gold
      const colorType = Math.random();
      if (colorType < 0.3) {
        // Blue nodes
        colorArray[i * 3] = 0.2 + Math.random() * 0.3;
        colorArray[i * 3 + 1] = 0.4 + Math.random() * 0.4;
        colorArray[i * 3 + 2] = 1.0;
      } else if (colorType < 0.6) {
        // Purple nodes
        colorArray[i * 3] = 0.5 + Math.random() * 0.5;
        colorArray[i * 3 + 1] = 0.2 + Math.random() * 0.3;
        colorArray[i * 3 + 2] = 0.8 + Math.random() * 0.2;
      } else if (colorType < 0.85) {
        // Teal nodes
        colorArray[i * 3] = 0.1 + Math.random() * 0.3;
        colorArray[i * 3 + 1] = 0.6 + Math.random() * 0.4;
        colorArray[i * 3 + 2] = 0.7 + Math.random() * 0.3;
      } else {
        // Gold nodes (rare, like special transactions)
        colorArray[i * 3] = 1.0;
        colorArray[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colorArray[i * 3 + 2] = 0.2 + Math.random() * 0.3;
      }

      // Size variation
      sizeArray[i] = Math.random() * 0.5 + 0.5;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colorArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    // Create blockchain network connections
    const lines: THREE.Line[] = [];
    const maxConnections = 150;

    for (let i = 0; i < maxConnections; i++) {
      const nodeA = Math.floor(Math.random() * particlesCount);
      const nodeB = Math.floor(Math.random() * particlesCount);

      if (nodeA !== nodeB) {
        const distance = new THREE.Vector3(
          posArray[nodeA * 3] - posArray[nodeB * 3],
          posArray[nodeA * 3 + 1] - posArray[nodeB * 3 + 1],
          posArray[nodeA * 3 + 2] - posArray[nodeB * 3 + 2]
        ).length();

        // Only connect nearby nodes to simulate realistic network topology
        if (distance < 8) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              posArray[nodeA * 3],
              posArray[nodeA * 3 + 1],
              posArray[nodeA * 3 + 2]
            ),
            new THREE.Vector3(
              posArray[nodeB * 3],
              posArray[nodeB * 3 + 1],
              posArray[nodeB * 3 + 2]
            ),
          ]);

          const linesMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color().setHSL(
              0.6 + Math.random() * 0.2, // Blue to purple hue
              0.7,
              0.5
            ),
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending,
          });

          const line = new THREE.Line(geometry, linesMaterial);
          scene.add(line);
          lines.push(line);
        }
      }
    }

    // Add floating geometric shapes representing blocks
    const blocks: THREE.Mesh[] = [];
    const blockCount = 20;

    for (let i = 0; i < blockCount; i++) {
      const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(
          0.6 + Math.random() * 0.3,
          0.8,
          0.6
        ),
        transparent: true,
        opacity: 0.6,
        wireframe: true,
      });

      const block = new THREE.Mesh(geometry, material);
      block.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25
      );

      block.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      scene.add(block);
      blocks.push(block);
    }

    camera.position.z = 8;

    // Animation variables
    let time = 0;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotate the entire particle system slowly
      particlesMesh.rotation.x += 0.0002;
      particlesMesh.rotation.y += 0.0005;

      // Animate particles with wave-like motion
      const positions = particlesGeometry.attributes.position.array as Float32Array;
      const colors = particlesGeometry.attributes.color.array as Float32Array;

      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;

        // Add subtle wave motion
        positions[i3 + 1] += Math.sin(time + i * 0.1) * 0.005;

        // Pulse colors for network activity simulation
        if (Math.random() < 0.01) {
          const intensity = 0.5 + Math.random() * 0.5;
          colors[i3] *= intensity;
          colors[i3 + 1] *= intensity;
          colors[i3 + 2] *= intensity;
        }
      }

      particlesGeometry.attributes.position.needsUpdate = true;
      particlesGeometry.attributes.color.needsUpdate = true;

      // Animate blockchain blocks
      blocks.forEach((block, index) => {
        block.rotation.x += 0.01 + index * 0.001;
        block.rotation.y += 0.008 + index * 0.0008;
        block.position.y += Math.sin(time + index) * 0.002;
      });

      // Occasionally pulse connection lines (transaction activity)
      lines.forEach((line) => {
        if (Math.random() < 0.005) {
          const material = line.material as THREE.LineBasicMaterial;
          material.opacity = Math.min(0.8, material.opacity + 0.3);
        } else {
          const material = line.material as THREE.LineBasicMaterial;
          material.opacity = Math.max(0.1, material.opacity * 0.98);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();

      // Dispose geometries and materials
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      lines.forEach(line => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      blocks.forEach(block => {
        block.geometry.dispose();
        (block.material as THREE.Material).dispose();
      });
    };
  }, []);

  return (
    <div ref={mountRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />
  );
};

export default ThreeJsBackground;
