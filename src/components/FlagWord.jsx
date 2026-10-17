import React from 'react';

// Figma 2199:2160: lettering is artwork, independent of installed fonts.
export default function FlagWord({className = ''}) {
  return <img className={className} src="/assets/figma/feedback/uribaram.svg"
    width="214.072" height="705.647" alt="우리바람" draggable="false" />;
}
