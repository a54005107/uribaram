export function createHandWorkerClient(worker, {timeoutMs = 20000} = {}) {
  let closed = false, serial = 0, pending = null;
  const rejectPending = error => {
    if (!pending) return;
    clearTimeout(pending.timer); const {reject} = pending; pending = null; reject(error);
  };
  worker.onmessage = ({data}) => {
    if (!pending || pending.id !== data.id) return;
    const {resolve, reject, timer} = pending; clearTimeout(timer); pending = null;
    data.error ? reject(new Error(data.error)) : resolve(data);
  };
  worker.onerror = event => rejectPending(new Error(event.message || 'Hand worker failed'));
  return {
    request(type, payload, transfer = []) {
      if (closed) return Promise.reject(new Error('Hand worker closed'));
      if (pending) return Promise.reject(new Error('Hand frame already in flight'));
      return new Promise((resolve, reject) => {
        const id = ++serial;
        pending = {id, resolve, reject, timer:setTimeout(() => rejectPending(new Error('Hand worker timed out')), timeoutMs)};
        try { worker.postMessage({id, type, ...payload}, transfer); }
        catch (error) { rejectPending(error); }
      });
    },
    close() { closed = true; rejectPending(new Error('Hand worker closed')); worker.terminate(); },
  };
}
