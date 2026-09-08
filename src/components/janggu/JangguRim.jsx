import React from 'react';

export default function JangguRim({side}) {
  const x = side === 'left' ? -1.58 : 1.58;
  return <group position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
    <mesh><torusGeometry args={[.94, .09, 12, 72]}/><meshStandardMaterial color="#171a22" metalness={.92} roughness={.2} emissive="#d99b26" emissiveIntensity={1.2}/></mesh>
    <mesh><ringGeometry args={[.69, .86, 72]}/><meshStandardMaterial color="#090b11" metalness={.75} roughness={.28} emissive="#5b3707" emissiveIntensity={.45} side={2}/></mesh>
    <mesh position={[0, 0, .012]}><torusGeometry args={[.76, .025, 8, 72]}/><meshBasicMaterial color="#fff2b1" toneMapped={false}/></mesh>
  </group>;
}
