import React, {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {JANGGU_CONFIG} from '../../config/stickInteractionConfig';
import {JANGGU_WAVE_CONFIG as config} from '../../config/jangguWaveConfig';

// Fixed pool: repeated hits overlap without mounting meshes or updating React state.
export default function HitRipples({uniforms, transformRef, rotationY = 0, rotationZ = 0}) {
  const rings = useRef([]);
  const inverseRotation = useRef(new THREE.Quaternion());
  const euler = useRef(new THREE.Euler());
  useFrame(() => {
    const yaw = transformRef?.current?.yaw ?? rotationY;
    euler.current.set(0, THREE.MathUtils.degToRad(yaw), THREE.MathUtils.degToRad(transformRef ? 0 : rotationZ));
    inverseRotation.current.setFromEuler(euler.current).invert();
    for (let i = 0; i < rings.current.length; i++) {
      const mesh = rings.current[i];
      if (!mesh) continue;
      const slot = Math.floor(i / config.ringCount), ring = i % config.ringCount;
      const age = uniforms.uTime.value - uniforms.uHitTimes.value[slot] - ring * config.ringDelay;
      mesh.visible = age >= 0 && age < config.ringDuration;
      if (!mesh.visible) continue;
      const t = age / config.ringDuration, strength = uniforms.uHitStrengths.value[slot];
      const eased = 1 - (1 - t) ** 2;
      const radius = config.startRadius + (config.endRadius - config.startRadius) * eased * (.8 + strength * .2);
      mesh.position.set(uniforms.uHitSides.value[slot] * JANGGU_CONFIG.rimX, 0, 0);
      // Face the camera so the wave remains wide even when the drum rim is edge-on.
      mesh.quaternion.copy(inverseRotation.current);
      mesh.scale.setScalar(radius);
      mesh.material.opacity = config.ringOpacity * strength * (1 - t) ** 1.2 * Math.min(1, age / .025);
    }
  });
  return <group>{Array.from({length: 4 * config.ringCount}, (_, i) => <mesh
    key={i} ref={(mesh) => { rings.current[i] = mesh; }} visible={false} renderOrder={30} frustumCulled={false}>
    <ringGeometry args={[1 - config.ringThickness, 1, 80]}/>
    <meshBasicMaterial color={i % config.ringCount === 0 ? '#fff3c0' : '#ffb63d'} transparent opacity={0}
      blending={THREE.AdditiveBlending} depthTest={false} depthWrite={false} toneMapped={false} side={THREE.DoubleSide}/>
  </mesh>)}</group>;
}
