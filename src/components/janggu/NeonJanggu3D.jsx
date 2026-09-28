import React, {forwardRef, useImperativeHandle, useMemo, useRef, useLayoutEffect} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {Bloom, EffectComposer} from '@react-three/postprocessing';
import * as THREE from 'three';
import NeonStrands from './NeonStrands';
import JangguRim from './JangguRim';
import HitRipples from './HitRipples';
import {JANGGU_WAVE_CONFIG as waveConfig} from '../../config/jangguWaveConfig';

const JangguScene = forwardRef(function JangguScene({rotationY = 0, rotationZ = 0, quality = 'high', debug = false, transformRef}, ref) {
  const groupRef = useRef(), hitCursor = useRef(0);
  const uniforms = useMemo(() => ({uTime: {value: 0}, uHitTimes: {value: [-100, -100, -100, -100]}, uHitSides: {value: [-1, 1, -1, 1]}, uHitStrengths: {value: [0, 0, 0, 0]},
    uWaveDuration: {value: waveConfig.duration}, uWaveSpeed: {value: waveConfig.travelSpeed}, uWaveDecay: {value: waveConfig.decay}, uWaveDisplacement: {value: waveConfig.displacement},
    uColor: {value: new THREE.Color('#f3b43f')}}), []);
  useFrame(({clock, size, camera}) => {
    uniforms.uTime.value = clock.elapsedTime;
    if (transformRef && groupRef.current) {
      const t = transformRef.current, group = groupRef.current;
      group.visible = Boolean(t);
      if (t) {
        group.position.set((t.x - .5) * size.width / camera.zoom, (.5 - t.y) * size.height / camera.zoom, 0);
        group.scale.setScalar(t.zoom / camera.zoom);
        group.rotation.set(0, THREE.MathUtils.degToRad(t.yaw), 0);
      }
    }
  });
  useImperativeHandle(ref, () => ({
    hit({side = 'left', strength = 'normal'} = {}) {
      const index = hitCursor.current++ % 4;
      uniforms.uHitTimes.value[index] = uniforms.uTime.value;
      uniforms.uHitSides.value[index] = side === 'left' ? -1 : 1;
      uniforms.uHitStrengths.value[index] = waveConfig.strength[strength] ?? waveConfig.strength.normal;
    },
    hitLeft(strength = 'normal') { this.hit({side: 'left', strength}); },
    hitRight(strength = 'normal') { this.hit({side: 'right', strength}); },
  }), [uniforms]);
  return <group ref={groupRef} visible={!transformRef} rotation={[0, THREE.MathUtils.degToRad(rotationY), THREE.MathUtils.degToRad(rotationZ)]}>
    <NeonStrands uniforms={uniforms} quality={quality}/><JangguRim side="left"/><JangguRim side="right"/>
    <HitRipples uniforms={uniforms} transformRef={transformRef} rotationY={rotationY} rotationZ={rotationZ}/>
    <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.22, .22, 2.45, 32]}/><meshBasicMaterial color="#d69b37" transparent opacity={.055} depthWrite={false}/></mesh>
    {debug && <axesHelper args={[2.4]}/>} 
  </group>;
});

function CameraScale({zoom}) {
  const camera = useThree((state) => state.camera);
  useLayoutEffect(() => { camera.zoom = zoom; camera.updateProjectionMatrix(); }, [camera, zoom]);
  return null;
}

const NeonJanggu3D = forwardRef(function NeonJanggu3D({rotationY = 0, rotationZ = 0, zoom = 105, quality = 'high', debug = false, transformRef}, ref) {
  return <Canvas className="neon-janggu-canvas" orthographic camera={{position: [0, 0, 7], zoom}} gl={{alpha: true, antialias: quality !== 'low', powerPreference: 'high-performance'}} dpr={quality === 'high' ? [1, 1.75] : [1, 1.25]}>
    <CameraScale zoom={zoom}/>
    <ambientLight intensity={.25}/><pointLight position={[2, 3, 5]} intensity={18} color="#ffd58a"/><pointLight position={[-3, -2, 3]} intensity={8} color="#315dff"/>
    <JangguScene ref={ref} transformRef={transformRef} rotationY={rotationY} rotationZ={rotationZ} quality={quality} debug={debug}/>
    <EffectComposer multisampling={quality === 'high' ? 4 : 0}><Bloom intensity={quality === 'low' ? .55 : .9} luminanceThreshold={.5} luminanceSmoothing={.35} mipmapBlur={quality !== 'low'}/></EffectComposer>
  </Canvas>;
});
export default NeonJanggu3D;
