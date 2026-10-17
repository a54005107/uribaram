import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import StoryHeader from '../components/StoryHeader';
import './StoryPage.css';
function ArtworkImage({src}) {
 const ref=useRef(null);
 useEffect(()=>{const img=ref.current, parent=img.parentElement;const fit=()=>{if(img.naturalWidth)img.style.transform=`scale(${parent.clientWidth/img.naturalWidth},${parent.clientHeight/img.naturalHeight})`;}; img.addEventListener('load',fit); const observer=new ResizeObserver(fit);observer.observe(parent);fit();return()=>{observer.disconnect();img.removeEventListener('load',fit);};},[src]);
 return <img ref={ref} className="story-art-image" src={src} alt="" draggable="false"/>;
}
const assetPathPrefix = "/assets/figma/story/current";
const imgSky = `${assetPathPrefix}/b1da9.svg`;
const img = `${assetPathPrefix}/b9168.svg`;
const imgProperty1Default = `${assetPathPrefix}/409e1.svg`;
const imgProperty1Variant2 = `${assetPathPrefix}/cf26e.svg`;
const imgProperty1Default1 = `${assetPathPrefix}/98fe7.svg`;
const img1 = `${assetPathPrefix}/9d376.svg`;
const imgGroup = `${assetPathPrefix}/7f751.svg`;
const img2 = `${assetPathPrefix}/b1156.svg`;
const img3 = `${assetPathPrefix}/becaa.svg`;
const img4 = `${assetPathPrefix}/9e4b6.svg`;
const img5 = `${assetPathPrefix}/496c3.svg`;
const img6 = `${assetPathPrefix}/0f5f2.svg`;
const img7 = `${assetPathPrefix}/d120c.svg`;
const imgStar1 = `${assetPathPrefix}/cc63e.svg`;
const imgPolygon43 = `${assetPathPrefix}/7741e.svg`;
const img8 = `${assetPathPrefix}/53d17.svg`;
const img9 = `${assetPathPrefix}/ac14a.svg`;
const img10 = `${assetPathPrefix}/57d7a.svg`;
const img11 = `${assetPathPrefix}/64dcc.svg`;
const imgRectangle22 = `${assetPathPrefix}/b3a7c.svg`;
const imgVector = `${assetPathPrefix}/95859.svg`;
const imgVector1 = `${assetPathPrefix}/b81e3.svg`;
const imgVector2 = `${assetPathPrefix}/f847e.svg`;
const imgVector3 = `${assetPathPrefix}/1c8b5.svg`;
const imgVector4 = `${assetPathPrefix}/7a9c1.svg`;
const imgVector5 = `${assetPathPrefix}/9f13c.svg`;
const imgVector6 = `${assetPathPrefix}/7d292.svg`;
const imgVector7 = `${assetPathPrefix}/a4e3b.svg`;
const img12 = `${assetPathPrefix}/84e0b.svg`;


function Component({ className, propValue = "sky" }) {
  return (
    <div className={className || "story-current-117"} data-node-id="2625:4700">
      <ArtworkImage src={imgSky} />
    </div>
  );
}

function Component1({ className }) {
  return (
    <div className={className || "story-current-118"} data-node-id="2271:3229" data-name="로고_원형">
      <ArtworkImage src={img} />
    </div>
  );
}


function Component2({ className, property1 = "Default" }) {
  const isVariant2 = property1 === "Variant2";
  return (
    <div className={className || "story-current-119"} id={isVariant2 ? "node-2028_475" : "node-2028_473"}>
      <ArtworkImage src={isVariant2 ? imgProperty1Variant2 : imgProperty1Default} />
    </div>
  );
}


function Component3({ className, property1 = "Default" }) {
  return (
    <div className={className || "story-current-120"} data-node-id="2028:465">
      <ArtworkImage src={imgProperty1Default1} />
    </div>
  );
}


function Component4({ className, property1 = "Default" }) {
  const [slide, setSlide] = useState(0);
  return (
    <div className={className || "story-current-121"} data-node-id="2632:4771">
      {slide === 0 ? <>
      <div className="story-current-1" data-node-id="2632:4729" style={{ containerType: "size" }}>
        <div className="story-current-2">
          <div className="story-current-3" data-name="깃대">
            <ArtworkImage src={img1} />
          </div>
        </div>
      </div>
      <div className="story-current-4" data-node-id="2632:4738" style={{ containerType: "size" }}>
        <div className="story-current-5">
          <div className="story-current-3" data-name="Group">
            <ArtworkImage src={imgGroup} />
          </div>
        </div>
      </div>
      </> : <div className="story-flag-photo" style={{height: slide === 1 ? 575.25 : 576.977}}><ArtworkImage src={`${assetPathPrefix}/${slide === 1 ? 'd16c4.png' : '623b8.png'}`}/></div>}
      <div className="story-current-6" data-node-id="2653:2022">
        <div className="story-current-7">
          <button type="button" className="story-current-8" aria-label="다음 농기 보기" onClick={() => setSlide(value => (value + 1) % 3)}>
            <ArtworkImage src={slide === 0 ? img2 : `${assetPathPrefix}/${slide === 1 ? 'f4eae.svg' : 'e3d5c.svg'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StoryArtwork({scrollDown}) {
  return (
    <div className="story-current-9" data-node-id="2271:3227" data-name="풍물 이야기">
      <Component4 className="story-current-10" />
      <div className="story-current-11" data-node-id="2625:4643" />
      <div className="story-current-12" data-node-id="2658:3437" />
      <p className="story-current-13" data-node-id="2469:2694">
        방금 함께한 놀이,
        <br aria-hidden />
        풍물놀이에서 시작됐어요
      </p>
      <p className="story-current-14" data-node-id="2615:4630">
        바람을 적었던 깃발
      </p>
      <div className="story-current-15" data-node-id="2566:977">
        <p className="story-current-16">사람들이 모여 악기를 연주하고 춤추는 풍물놀이는 ‘농악’이라고도 불러요</p>
        <p className="story-current-16">농사가 잘되고 마을이 평안하기를 바라며 함께했지요</p>
        <p className="story-current-17">이렇게 사람들이 모여 어울리는 자리를 ‘판’이라고 해요</p>
      </div>
      <div className="story-current-18" data-node-id="2627:4728">
        <p className="story-current-19">풍물놀이에서 볼 수 있는 깃발 중 하나예요</p>
        <p className="story-current-20">
          <span className="story-current-21">[농기]</span>
          <span className="story-current-17">라고 부르는 이것은, 농사를 소중히 여기는 글귀나</span>
        </p>
        <p className="story-current-19">마을을 나타내는 표시를 담았어요</p>
        <p className="story-current-19">​</p>
        <p className="story-current-22">우리바람에서는 이 농기에 우리들의 바람을 담아 봤어요</p>
      </div>
      <div className="story-current-23" data-node-id="2620:4633" role="button" tabIndex={0} aria-label="깃발 이야기로 내려가기" onClick={scrollDown} onKeyDown={event => { if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); scrollDown(); } }}>
        <div className="story-current-24">
          <div className="story-current-25" data-name="<">
            <ArtworkImage src={img3} />
          </div>
        </div>
      </div>
      <div className="story-current-26" data-node-id="2654:2362" />
      <p className="story-current-27" data-node-id="2654:2378">
        함께 하는 사람들
      </p>
      <div className="story-current-28" data-node-id="2658:3328">
        <p className="story-current-29">길에서도,</p>
        <p className="story-current-29">논에서도,</p>
        <p className="story-current-30">마당에서도</p>
      </div>
      <p className="story-current-31" data-node-id="2658:3331">
        지역마다 다양한 소리들
      </p>
      <div className="story-current-32" data-node-id="2658:3343">
        <p className="story-current-29">서로의 안녕을 빌던 마음을</p>
        <p className="story-current-30">화면 속으로</p>
      </div>
      <div className="story-current-33" data-node-id="2654:2379">
        <p className="story-current-20">
          <span className="story-current-17">{`풍물놀이를 하는 무리를 `}</span>
          <span className="story-current-21">‘풍물패’</span>
          <span className="story-current-17">{`, 그 구성원을 `}</span>
          <span className="story-current-21">‘치배’</span>
          <span className="story-current-17">{` 라고 해요`}</span>
        </p>
        <p className="story-current-19">악기를 치는 사람뿐 아니라 깃발을 들거나 여러 인물로 분장해 노는 사람도 함께 해요</p>
        <p className="story-current-19">​</p>
        <p className="story-current-34">
          <span className="story-current-17">{`또한, 관람하는 사람들 또한 `}</span>
          <span className="story-current-21">함께 즐기는 것</span>
          <span className="story-current-17">이 풍물놀이의 매력이에요</span>
        </p>
      </div>
      <div className="story-current-35" data-node-id="2658:3329">
        <p className="story-current-16">풍물놀이는 하는 장소와 목적에 따라</p>
        <p className="story-current-16">모습과 이름이 달라요. 풍물에서 ‘굿’은</p>
        <p className="story-current-16">복을 비는 의식뿐 아니라</p>
        <p className="story-current-17">연주와 놀이를 가리키기도 해요</p>
      </div>
      <div className="story-current-36" data-node-id="2658:3332">
        <p className="story-current-16">여러 지역에서 저마다의 모습으로 이어져 왔어요</p>
        <p>
          <span className="story-current-17">{`연주하는 리듬인 `}</span>
          <span className="story-current-21">’가락’</span>
          <span className="story-current-17">도, 옷차림과 춤도 조금씩 달라요</span>
        </p>
      </div>
      <div className="story-current-37" data-node-id="2658:3350">
        <p className="story-current-16">농기에 소원을 쓰고, 악기를 고르고, 몸을 움직여 소리를 내는 과정을</p>
        <p className="story-current-17">누구나 쉽게 참여할 수 있도록 새롭게 구성했어요</p>
      </div>
      <p className="story-current-38" data-node-id="2658:3333">
        우리바람은 임실필봉농악을 바탕으로 하고 있어요
      </p>
      <div className="story-current-39" data-node-id="2654:2491">
        <div className="story-current-40">
          <div className="story-current-41" data-name="소고">
            <div className="story-current-42" data-node-id="I2654:2491;2199:2886" data-name="소고 그룹">
              <div className="story-current-43" data-node-id="I2654:2491;2142:3723" style={{ containerType: "size" }}>
                <div className="story-current-44">
                  <div className="story-current-3" data-name="소고">
                    <ArtworkImage src={img4} />
                  </div>
                </div>
              </div>
              <div className="story-current-45" data-node-id="I2654:2491;2142:3738" style={{ containerType: "size" }}>
                <div className="story-current-46">
                  <div className="story-current-3" data-name="소고채">
                    <div className="story-current-47">
                      <ArtworkImage src={img5} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="story-current-49" data-node-id="2654:2693">
        <div className="story-current-50">
          <div className="story-current-51" data-name="장구">
            <div className="story-current-52" data-node-id="I2654:2693;2199:3035" data-name="장구 그룹">
              <ArtworkImage src={img6} />
            </div>
          </div>
        </div>
      </div>
      <div className="story-current-53" data-node-id="2658:2802">
        <div className="story-current-54">
          <div className="story-current-55" data-name="꽹과리">
            <div className="story-current-56" data-node-id="I2658:2802;2658:3236">
              <div className="story-current-57" data-node-id="I2658:2802;2658:3151" data-name="소고">
                <ArtworkImage src={img7} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="story-current-58" data-node-id="2658:3335">
        <div className="story-current-59">
          <div className="story-current-60" />
        </div>
      </div>
      <div className="story-current-61" data-node-id="2658:3336">
        <div className="story-current-62">
          <div className="story-current-63" />
        </div>
      </div>
      <div className="story-current-64" data-node-id="2658:3338">
        <div className="story-current-65">
          <div className="story-current-66">
            <div className="story-current-67">
              <ArtworkImage src={imgStar1} />
            </div>
          </div>
        </div>
      </div>
      <div className="story-current-68" data-node-id="2658:3340">
        <div className="story-current-69">
          <div className="story-current-70" />
        </div>
      </div>
      <div className="story-current-71" data-node-id="2658:3342">
        <div className="story-current-72">
          <div className="story-current-73">
            <div className="story-current-74">
              <ArtworkImage src={imgPolygon43} />
            </div>
          </div>
        </div>
      </div>
      <div className="story-current-75" data-node-id="2658:3346">
        <p className="story-current-16">우리바람은 임실필봉농악의 ‘마당밟이’를 참고해 만들었어요</p>
        <p className="story-current-16">집집마다 찾아가 평안을 빌던 마음을,</p>
        <p className="story-current-17">각자의 소원을 담고 함께 연주하는 경험으로 옮겼어요</p>
      </div>
      <Component3 className="story-current-76" />
      <div className="story-current-77" data-node-id="2658:3375">
        <div className="story-current-78">
          <div className="story-current-79" data-name="음표2">
            <ArtworkImage src={img8} />
          </div>
        </div>
      </div>
      <div className="story-current-80" data-node-id="2658:3697">
        <div className="story-current-81">
          <div className="story-current-79" data-name="음표2">
            <ArtworkImage src={img9} />
          </div>
        </div>
      </div>
      <div className="story-current-82" data-node-id="2658:3387">
        <div className="story-current-83">
          <div className="story-current-84" data-name="음표3">
            <ArtworkImage src={img10} />
          </div>
        </div>
      </div>
      <div className="story-current-85" data-node-id="2658:3706">
        <div className="story-current-86">
          <div className="story-current-87" data-name="음표3">
            <ArtworkImage src={img11} />
          </div>
        </div>
      </div>
      <Component2 className="story-current-88" />
      <Component2 className="story-current-89" property1="Variant2" />
      <div className="story-current-90" data-node-id="2658:3674">
        <div className="story-current-91" data-node-id="2658:3434" style={{ containerType: "size" }}>
          <div className="story-current-92">
            <div className="story-current-3">
              <ArtworkImage src={imgRectangle22} />
            </div>
          </div>
        </div>
        <div className="story-current-93" data-node-id="2658:3416">
          <p className="story-current-20">
            <span className="story-current-94">{`참고   `}</span>
            <span className="story-current-95">{`한국민족문화대백과사전 「농악」·  국립국악원 국악사전 「임실필봉농악」·  필봉문화촌`}</span>
          </p>
          <p className="story-current-34">
            <span className="story-current-94">사진 출처</span>
            <span className="story-current-95">{`   국가유산청 · 고창농악보존회`}</span>
          </p>
        </div>
        <p className="story-current-96" data-node-id="2658:3419">{`우리바람  ·  Our Wind, Our Wish`}</p>
        <p className="story-current-97" data-node-id="2658:3417">
          © 2026 Choi Soo Myeong
        </p>
        <div className="story-current-98" data-node-id="2658:3418">
          <p className="story-current-20">
            <span className="story-current-94">기획 및 디자인</span>
            <span className="story-current-95">{`   Choi Soo Myeong`}</span>
          </p>
          <p className="story-current-34">
            <span className="story-current-94">개발</span>
            <span className="story-current-95">{` Choi Ji Sun`}</span>
          </p>
        </div>
      </div>
      <div className="story-current-99" data-node-id="2658:3402" style={{ containerType: "size" }}>
        <div className="story-current-100">
          <div className="story-current-3" data-name="Vector">
            <ArtworkImage src={imgVector} />
          </div>
        </div>
      </div>
      <div className="story-current-101" data-node-id="2658:3404" style={{ containerType: "size" }}>
        <div className="story-current-102">
          <div className="story-current-3" data-name="Vector">
            <ArtworkImage src={imgVector1} />
          </div>
        </div>
      </div>
      <div className="story-current-103" data-node-id="2658:3405" style={{ containerType: "size" }}>
        <div className="story-current-104">
          <div className="story-current-3" data-name="Vector">
            <ArtworkImage src={imgVector2} />
          </div>
        </div>
      </div>
      <div className="story-current-105" data-node-id="2658:3684" style={{ containerType: "size" }}>
        <div className="story-current-104">
          <div className="story-current-3" data-name="Vector">
            <ArtworkImage src={imgVector3} />
          </div>
        </div>
      </div>
      <div className="story-current-106" data-node-id="2658:3685" style={{ containerType: "size" }}>
        <div className="story-current-104">
          <div className="story-current-3" data-name="Vector">
            <ArtworkImage src={imgVector4} />
          </div>
        </div>
      </div>
      <div className="story-current-107" data-node-id="2658:3686" style={{ containerType: "size" }}>
        <div className="story-current-108">
          <div className="story-current-3" data-name="Vector">
            <ArtworkImage src={imgVector5} />
          </div>
        </div>
      </div>
      <div className="story-current-109" data-node-id="2658:3687" style={{ containerType: "size" }}>
        <div className="story-current-104">
          <div className="story-current-3" data-name="Vector">
            <ArtworkImage src={imgVector6} />
          </div>
        </div>
      </div>
      <div className="story-current-110" data-node-id="2658:3406" style={{ containerType: "size" }}>
        <div className="story-current-100">
          <div className="story-current-3" data-name="Vector">
            <ArtworkImage src={imgVector7} />
          </div>
        </div>
      </div>
      <p className="story-current-111" data-node-id="2658:3435">
        바람을 싣고, 소리 따라 저 멀리
      </p>
      <Component1 className="story-current-112" />

    </div>
  );
}

const storyStops=[0,1315,2771.73,4534.79,5850,10500,12755];
export default function StoryPage(){
 const ref=useRef(null),shellRef=useRef(null),navigate=useNavigate();
 const [viewport,setViewport]=useState({width:window.innerWidth,height:window.innerHeight});
 useEffect(()=>{const observer=new ResizeObserver(([e])=>setViewport({width:e.contentRect.width,height:e.contentRect.height}));observer.observe(shellRef.current);return()=>observer.disconnect();},[]);
 const scale=Math.min(viewport.width/2240,viewport.height/1260);
 const snapStops=storyStops.slice(0,-1).flatMap((top,i)=>{const end=storyStops[i+1];const count=Math.max(1,Math.round((end-top)/1260));return Array.from({length:count},(_,j)=>Math.min(top+j*(end-top)/count,12755-1260));});
 return <div ref={shellRef} className="story-shell"><main ref={ref} className="story-page" aria-label="풍물 이야기" tabIndex={0} style={{width:2240*scale,height:1260*scale,'--story-scale':scale}}>
  <StoryHeader scrollRef={ref}/>
  <div className="story-brand-anchor"><button className="story-brand" onClick={()=>navigate('/')} aria-label="우리바람 처음으로"><img src="/assets/figma/story/current/84e0b.svg" alt="우리바람"/></button></div>
  <div className="story-document" style={{height:12755*scale}}>
   <div className="story-artwork" style={{transform:`scale(${scale})`}}><StoryArtwork scrollDown={() => ref.current.scrollTo({top:1315*scale,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})}/></div>
   {storyStops.slice(0,-1).map((top,i)=><section key={top} className="story-section" aria-label={['풍물놀이 소개','바람을 적었던 깃발','함께 하는 사람들','놀이 장소','지역마다 다양한 소리들','마무리'][i]} style={{top:top*scale,height:(storyStops[i+1]-top)*scale}}/>)}
   {snapStops.map(top=><div key={top} className="story-snap-point" aria-hidden="true" style={{top:top*scale}}/>)}
  </div>
 </main></div>;
}
