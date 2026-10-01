import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import vertexShader from '../../shaders/jangguWave.vert.glsl?raw';
import fragmentShader from '../../shaders/jangguWave.frag.glsl?raw';

const radiusAtX = (x) => .34 + .62 * Math.pow(Math.abs(x) / 1.55, 1.35);

export default function NeonStrands({uniforms, quality = 'high'}) {
  const strandCount = quality === 'low' ? 14 : quality === 'medium' ? 20 : 26;
  const segments = quality === 'low' ? 24 : quality === 'medium' ? 36 : 52;
  const geometries = useMemo(() => Array.from({length: strandCount}, (_, index) => {
    const angle = index / strandCount * Math.PI * 2;
    const points = Array.from({length: 9}, (_, pointIndex) => {
      const x = -1.55 + pointIndex / 8 * 3.1;
      const radius = radiusAtX(x);
      return new THREE.Vector3(x, Math.cos(angle) * radius, Math.sin(angle) * radius);
    });
    const curve = new THREE.CatmullRomCurve3(points);
    return {beam: new THREE.TubeGeometry(curve, segments, .022, 6, false), core: new THREE.TubeGeometry(curve, segments, .007, 5, false)};
  }), [strandCount, segments]);
  const materials = useMemo(() => ({beam: new THREE.ShaderMaterial({vertexShader, fragmentShader, uniforms: {...uniforms, uColor: {value: new THREE.Color('#e7a52c')}}, transparent: true, opacity: .9, toneMapped: false}), core: new THREE.ShaderMaterial({vertexShader, fragmentShader, uniforms: {...uniforms, uColor: {value: new THREE.Color('#fff9dc')}}, toneMapped: false})}), [uniforms]);
  useEffect(() => () => { geometries.forEach(({beam, core}) => { beam.dispose(); core.dispose(); }); materials.beam.dispose(); materials.core.dispose(); }, [geometries, materials]);
  return <group>{geometries.map(({beam, core}, index) => <group key={index}><mesh geometry={beam} material={materials.beam}/><mesh geometry={core} material={materials.core}/></group>)}</group>;
}
