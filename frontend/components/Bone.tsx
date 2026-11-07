"use client";
import { Canvas } from "@react-three/fiber";
import { Component, type ReactNode } from "react";
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p className="empty">3D is unavailable on this device. All calculated results remain available in the charts.</p> : this.props.children; }
}
export default function Bone({ displacement, engineered }: { displacement: number; engineered: boolean }) {
  const gap = engineered ? .12 + .4 * displacement / (1 + displacement) : 0;
  return <Boundary><Canvas camera={{ position: [0, 0, 7], fov: 38 }} frameloop="demand" dpr={[1, 1.5]} fallback={<p>WebGL unavailable. Use the charts for calculated results.</p>}>
    <ambientLight intensity={1.5} /><directionalLight position={[3, 4, 5]} intensity={2.5} />
    <group rotation={[.1, .2, -.36]}>
      <mesh position={[0, -.35, 0]}><cylinderGeometry args={[.32, .36, 2.8, 48]} /><meshStandardMaterial color="#ddd9c8" roughness={.58} /></mesh>
      {[-.27, .27].map(x => <mesh key={x} position={[x, -1.9, 0]} scale={[.65, .55, .65]}><sphereGeometry args={[.65, 40, 32]} /><meshStandardMaterial color="#e6e2d4" roughness={.6} /></mesh>)}
      <group position={[0, gap, 0]}>
        <mesh position={[0, 1.45, 0]} scale={[1.15, .8, .9]}><sphereGeometry args={[.57, 40, 32]} /><meshStandardMaterial color="#e6e2d4" roughness={.6} /></mesh>
      </group>
      <mesh position={[0, 1.05+gap/2, 0]}><cylinderGeometry args={[.43, .34, engineered ? gap : .025, 48]} /><meshStandardMaterial color={engineered ? "#52b7a4" : "#a5947c"} transparent opacity={.8} /></mesh>
    </group>
  </Canvas></Boundary>;
}
