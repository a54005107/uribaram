import React, {forwardRef, useImperativeHandle, useMemo, useRef} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {Bloom, EffectComposer} from '@react-three/postprocessing';
import * as THREE from 'three';
import NeonStrands from './NeonStrands';
import JangguRim from './JangguRim';

const JangguScene = forwardRef(function JangguScene({rotationY = 0, rotationZ = 0, quality = 'high', debug = false}, ref) {
  const groupRef = useRef(), hitCursor = useRef(0);
  const uniforms = useMemo(() => ({uTime: {value: 0}, uHitTimes: {value: [-100, -100, -100, -100]}, uHitSides: {value: [-1, 1, -1, 1]}, uHitStrengths: {value: [0, 0, 0, 0]}, uColor: {value: new THREE.Color('#f3b43f')}}), []);
  useFrame(({clock}, delta) => {
    uniforms.uTime.value = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, THREE.MathUtils.degToRad(rotationY), 8, delta);
      groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, THREE.MathUtils.degToRad(rotationZ), 8, delta);
    }
  });
  useImperativeHandle(ref, () => ({
    hit({side = 'left', strength = 'normal'} = {}) {
      const index = hitCursor.current++ % 4;
      uniforms.uHitTimes.value[index] = uniforms.uTime.value;
      uniforms.uHitSides.value[index] = side === 'left' ? -1 : 1;
      uniforms.uHitStrengths.value[index] = strength === 'strong' ? 1 : strength === 'weak' ? .35 : .65;
    },
    hitLeft(strength = 'normal') { this.hit({side: 'left', strength}); },
    hitRight(strength = 'normal') { this.hit({side: 'right', strength}); },
  }), [uniforms]);
  return <group ref={groupRef} scale={1.03}>
    <NeonStrands uniforms={uniforms} quality={quality}/><JangguRim side="left"/><JangguRim side="right"/>
    <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.22, .22, 2.45, 32]}/><meshBasicMaterial color="#d69b37" transparent opacity={.055} depthWrite={false}/></mesh>
    {debug && <axesHelper args={[2.4]}/>} 
  </group>;
});

const NeonJanggu3D = forwardRef(function NeonJanggu3D({rotationY = 0, rotationZ = 0, quality = 'high', debug = false}, ref) {
  return <Canvas className="neon-janggu-canvas" orthographic camera={{position: [0, 0, 7], zoom: 105}} gl={{alpha: true, antialias: quality !== 'low', powerPreference: 'high-performance'}} dpr={quality === 'high' ? [1, 1.75] : [1, 1.25]}>
    <ambientLight intensity={.25}/><pointLight position={[2, 3, 5]} intensity={18} color="#ffd58a"/><pointLight position={[-3, -2, 3]} intensity={8} color="#315dff"/>
    <JangguScene ref={ref} rotationY={rotationY} rotationZ={rotationZ} quality={quality} debug={debug}/>
    <EffectComposer multisampling={quality === 'high' ? 4 : 0}><Bloom intensity={quality === 'low' ? .55 : .9} luminanceThreshold={.5} luminanceSmoothing={.35} mipmapBlur={quality !== 'low'}/></EffectComposer>
  </Canvas>;
});
export default NeonJanggu3D;
