"use client";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

const MyModel = (props) => {
  const modelRef = useRef();
  const { scene } = useGLTF("/models/robot_playground.glb");

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01;
    }
  });

  return <primitive ref={modelRef} object={scene} {...props} />;
};

export default MyModel;
