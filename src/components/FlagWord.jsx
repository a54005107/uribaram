import React from 'react';
import {savedFlagWish} from '../config/flagWishes';

// Figma 2199:2160: lettering is artwork, independent of installed fonts.
export default function FlagWord({className = ''}) {
  const wish = savedFlagWish();
  return <img className={className} src={`/assets/figma/oct23/${wish[1]}.svg`}
    width="214.072" height="705.647" alt={wish[0]} draggable="false" />;
}
