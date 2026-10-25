import React, {useEffect, useState} from 'react';

const colors = ['pink', 'sky', 'yellow', 'pink', 'green', 'sky', 'pink'];
const assets = ['pink', 'sky', 'yellow', 'blue'];

export default function StoryHeader({scrollRef}) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const root = scrollRef.current;
    const sections = [...root.querySelectorAll('.story-section')];
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = root.getBoundingClientRect().top;
      // Switch when the next section reaches the area beneath the header.
      const boundary = top + Math.min(root.clientHeight * .2, root.clientWidth * 267 / 2560);
      let index = 0;
      sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= boundary + 1) index = i; });
      setActive(index);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    root.addEventListener('scroll', schedule, {passive: true});
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    sections.forEach(section => observer.observe(section));
    update();
    return () => {
      root.removeEventListener('scroll', schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [scrollRef]);
  const color = colors[active];
  return <div className="story-header-anchor" aria-hidden="true">
    <div className="story-scroll-header" data-color={color} data-section={active + 1}>
      {assets.map(name => <img key={name} className={color === name ? 'is-active' : ''} src={`/assets/figma/story/header/${name}.svg`} alt="" draggable="false" />)}
      <div className={`story-header-green ${color === 'green' ? 'is-active' : ''}`} />
    </div>
  </div>;
}
