export function appendHistory(history, point, timestamp, config) {
  return [...history, {...point, timestamp}]
    .filter((p) => timestamp - p.timestamp <= config.historyMs).slice(-config.historyLimit);
}
