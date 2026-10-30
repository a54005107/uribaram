// Share the same numerical scale on Safari 15.6 and current browsers.
// ResizeObserver reports layout dimensions before artwork transforms are applied.
export function installLayoutCompatibility(root) {
  const observed = new Set();
  const set = (element, name, value) => {
    if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
  };
  const viewport = () => {
    const width = document.documentElement.clientWidth;
    const height = window.innerHeight;
    const fit = Math.min(width / 2560, height / 1440);
    const style = document.documentElement;
    set(style, '--viewport-design-scale', String(width / 2560));
    set(style, '--design-fit', String(fit));
    set(style, '--design-indicator-scale', String(fit * 2560 / 2240));
    set(style, '--viewport-indicator-scale', String(Math.max(.45, Math.min(width / 2240, 1))));
  };
  const sizes = new ResizeObserver(entries => {
    for (const {target, contentRect} of entries) {
      set(target, '--art-cqw', `${contentRect.width / 100}px`);
      set(target, '--art-cqh', `${contentRect.height / 100}px`);
    }
  });
  const scan = () => {
    for (const element of observed) {
      if (!root.contains(element)) { sizes.unobserve(element); observed.delete(element); }
    }
    for (const element of root.querySelectorAll('[data-art-container]')) {
      if (!observed.has(element)) { observed.add(element); sizes.observe(element); }
    }
  };
  const changes = new MutationObserver(scan);
  changes.observe(root, {childList: true, subtree: true});
  viewport(); scan();
  window.addEventListener('resize', viewport);
  return () => { changes.disconnect(); sizes.disconnect(); window.removeEventListener('resize', viewport); };
}
