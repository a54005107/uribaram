const routeOrder = ['/', '/title', '/trumpet', '/flag', '/loading', '/instruments',
  '/play-loading', '/camera', '/experience', '/ending'];

export function pageDirection(from, to, navigationType, previousIndex, nextIndex) {
  // POP includes both browser Back and Forward; compare history positions.
  if (navigationType === 'POP' && Number.isInteger(previousIndex)
    && Number.isInteger(nextIndex) && previousIndex !== nextIndex) {
    return nextIndex < previousIndex ? -1 : 1;
  }
  // In-app return buttons push a URL, but still move back through the experience.
  const previous = routeOrder.indexOf(from), next = routeOrder.indexOf(to);
  return previous >= 0 && next >= 0 && next < previous ? -1 : 1;
}
