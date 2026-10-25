import fs from 'node:fs';
const p='src/pages/PhotoPage.jsx';let s=fs.readFileSync(p,'utf8');
s=s.replace("import QRCode", "import {useNavigate} from 'react-router-dom';\nimport QRCode");
s=s.replace('export default function PhotoPage() {','export default function PhotoPage() {\n  const navigate = useNavigate();\n  const pageRef = useRef(null);\n  const [board,setBoard] = useState({scale:1,left:0,top:0});\n  useEffect(()=>{const observer=new ResizeObserver(([e])=>{const {width,height}=e.contentRect;const scale=Math.min(width/2240,height/1260);setBoard({scale,left:(width-2240*scale)/2,top:(height-1260*scale)/2});});observer.observe(pageRef.current);return()=>observer.disconnect();},[]);');
s=s.replace('<main className="photo-page"','<main ref={pageRef} className="photo-page"');
const start=s.indexOf('    <div className="photo-help">'),end=s.indexOf('    {photo && <section',start);
s=s.slice(0,start)+`    {!photo && <>
      <div className="photo-design-board" style={{left:board.left,top:board.top,transform:\`scale(\${board.scale})\`}}>
        <button className="photo-back" onClick={()=>navigate('/ending')} aria-label="이전 페이지">‹</button>
        <button className="photo-hat-choice photo-gokkal" onClick={()=>setKind('gokkal')} aria-label="고깔 선택" aria-pressed={kind==='gokkal'}><img src="/assets/figma/feedback/gokkal.svg" alt=""/></button>
        <button className="photo-hat-choice photo-sangmo" onClick={()=>setKind('sangmo')} aria-label="상모 선택" aria-pressed={kind==='sangmo'}><img src="/assets/figma/feedback/sangmo.svg" alt=""/></button>
        <button className="photo-shutter" onClick={capture} disabled={!ready} aria-label="사진 찍기"><img src="/assets/figma/feedback/shutter.svg" alt=""/></button>
      </div>
      <p className="photo-tracking-status" role="status">{headStatus==='loading'?'상모를 준비하고 있어요…':headStatus==='error'?'상모 인식을 시작하지 못했어요. 사진 촬영은 할 수 있어요.':''}</p>
      <details className="photo-camera-controls" open={status==='error'||undefined}>
        <summary>카메라 설정</summary>
        <label>카메라 <select value={deviceId} onChange={event=>{setReady(false);void selectDevice(event.target.value);}}>{devices.map(device=><option key={device.deviceId} value={device.deviceId}>{device.label||'카메라'}</option>)}</select></label>
        <button onClick={()=>{setNotice('');void start();}}>다시 연결</button>
        <p role="status">{error||notice||(status==='loading'?'카메라 연결 중…':'')}</p>
      </details>
    </>}
`+s.slice(end);
fs.writeFileSync(p,s);
