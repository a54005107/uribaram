import {FilesetResolver} from '@mediapipe/tasks-vision';
let pending;
export function prepareHands() {
  if (!pending) {
    const base=new URL(import.meta.env.BASE_URL,location.href).href;
    pending=Promise.all([
      FilesetResolver.forVisionTasks(base+'mediapipe/wasm'),
      fetch(base+'mediapipe/hand_landmarker.task').then(response=>{
        if(!response.ok)throw new Error('Hand model download failed');
        return response.arrayBuffer();
      }),
    ]).then(([vision,buffer])=>({vision,modelAssetBuffer:new Uint8Array(buffer)}))
      .catch(error=>{pending=undefined;throw error;});
  }
  return pending;
}
