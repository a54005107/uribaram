import React from 'react';

export default function StickOverlay({side, style}) {
  const isLeft = side === 'left';
  return <div className={`stick-overlay ${isLeft ? 'gungulchae' : 'yeolchae'}`} style={style} aria-label={isLeft ? '왼손 궁굴채' : '오른손 열채'}>
    <div className="stick-shadow"/>
    <div className="stick-shaft shaft-rear"><i/></div>
    <div className="stick-shaft shaft-front"><i/></div>
    <div className="stick-handle-wrap"><i/><i/><i/></div>
    <div className="stick-grip-gap"/>
    {isLeft && <div className="stick-head"/>}
    {!isLeft && <div className="stick-flat-tip"/>}
    <span>{isLeft ? '궁굴채' : '열채'}</span>
  </div>;
}
