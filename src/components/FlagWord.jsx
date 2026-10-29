import React from 'react';
import {savedFlagWish} from '../config/flagWishes';
import wordBounds from '../config/flagWordBounds.json';

// Figma 2199:2160: lettering is artwork, independent of installed fonts.
export default function FlagWord({className = '', wish = savedFlagWish(), centered = false, width = 214.072, height = 705.647}) {
  if (centered) {
    const bounds = wordBounds[wish[1]];
    return <svg className={className} width={width} height={height}
      viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
      preserveAspectRatio="xMidYMid meet" role="img" aria-label={wish[0]}>
      <image href={`/assets/figma/oct23/${wish[1]}.svg`} width={bounds.sourceWidth} height={bounds.sourceHeight}/>
    </svg>;
  }
  return <img className={className} src={`/assets/figma/oct23/${wish[1]}.svg`}
    width="214.072" height="705.647" alt={wish[0]} draggable="false" />;
}
