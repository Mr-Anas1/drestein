"use client";
import { useGLTF } from "@react-three/drei";

export default function MyModel(props) {
  const { scene } = useGLTF("/models/robot_playground.glb");
  return <primitive object={scene} {...props} />;
}
