import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import StoryHeader from '../components/StoryHeader';
import useStoryScroll from '../hooks/useStoryScroll';
import useStoryReveal from '../hooks/useStoryReveal';
import {useOriginalImage} from '../utils/imageFallback';
import './StoryPage.css';
function ArtworkImage({src}) {
 const ref=useRef(null);
 useLayoutEffect(()=>{const img=ref.current, parent=img.parentElement;const fit=()=>{if(img.naturalWidth)img.style.transform=`scale(${parent.clientWidth/img.naturalWidth},${parent.clientHeight/img.naturalHeight})`;}; img.addEventListener('load',fit); const observer=new ResizeObserver(fit);observer.observe(parent);fit();return()=>{observer.disconnect();img.removeEventListener('load',fit);};},[src]);
 return <img ref={ref} className="story-art-image" src={src} alt="" draggable="false"/>;
}
const assetPathPrefix = "/assets/figma/story/oct23";
const imgProperty1Default = `/assets/figma/oct28/e6db4.svg`;
const imgProperty1 = `/assets/figma/oct28/b7252.svg`;
const imgPolygon28 = `/assets/figma/oct28/91001.svg`;
const imgPolygon33 = `/assets/figma/oct28/1d033.svg`;
const imgPolygon29 = `/assets/figma/oct28/94534.svg`;
const imgPolygon34 = `/assets/figma/oct28/95c58.svg`;
const imgPolygon38 = `/assets/figma/oct28/9c30f.svg`;
const imgPolygon39 = `/assets/figma/oct28/7307a.svg`;
const imgVector = `/assets/figma/oct28/ddcb8.svg`;
const imgVector1 = `/assets/figma/oct28/0b4a7.svg`;
const imgVector2 = `/assets/figma/oct28/1466b.svg`;
const imgVector3 = `/assets/figma/oct28/d2f97.svg`;
const imgPolygon30 = `/assets/figma/oct28/5d10a.svg`;
const imgPolygon35 = `/assets/figma/oct28/a9c83.svg`;
const imgPolygon31 = `/assets/figma/oct28/968fa.svg`;
const imgPolygon36 = `/assets/figma/oct28/f288a.svg`;
const imgPolygon40 = `/assets/figma/oct28/4217d.svg`;
const imgPolygon41 = `/assets/figma/oct28/9188c.svg`;
const imgVector4 = `/assets/figma/oct28/ec9c3.svg`;
const imgVector5 = `/assets/figma/oct28/a0670.svg`;
const imgVector6 = `/assets/figma/oct28/a23e9.svg`;
const imgVector7 = `/assets/figma/oct28/2ec98.svg`;
const imgVector8 = `/assets/figma/oct28/294bd.svg`;
const imgPolygon32 = `/assets/figma/oct28/1a703.svg`;
const imgPolygon37 = `/assets/figma/oct28/e75d1.svg`;
const imgPolygon42 = `/assets/figma/oct28/3a72b.svg`;
const imgPolygon43 = `/assets/figma/oct28/ba7c6.svg`;
const imgPolygon44 = `/assets/figma/oct28/ea4d7.svg`;
const imgPolygon45 = `/assets/figma/oct28/21430.svg`;
const imgVector9 = `/assets/figma/oct28/d56e4.svg`;
const imgVector10 = `/assets/figma/oct28/73152.svg`;
const imgVector11 = `/assets/figma/oct28/0889a.svg`;
const imgVector12 = `/assets/figma/oct28/c4491.svg`;
const imgGroup7 = `/assets/figma/oct28/fb960.svg`;
const imgVector13 = `/assets/figma/oct28/aa337.svg`;
const imgVector14 = `/assets/figma/oct28/ca77c.svg`;
const imgVector15 = `/assets/figma/oct28/0743d.svg`;
const imgVector16 = `/assets/figma/oct28/20ebc.svg`;
const imgSky = `/assets/figma/oct28/7a2dd.svg`;
const img67034 = `/assets/figma/oct28/bd5cc.webp`;
const img67033 = `/assets/figma/oct28/d9b20.svg`;
const img59264 = `/assets/figma/oct28/f5dd7.webp`;
const img59263 = `/assets/figma/oct28/98770.svg`;
const img63003 = `/assets/figma/oct28/087be.webp`;
const img63002 = `/assets/figma/oct28/73723.svg`;
const img57494 = `/assets/figma/oct28/2b00f.webp`;
const img57493 = `/assets/figma/oct28/842a1.svg`;
const img = `/assets/figma/oct28/60231.svg`;
const img1 = `/assets/figma/oct28/b9168.svg`;
const imgProperty1Default1 = `/assets/figma/oct28/409e1.svg`;
const imgProperty1Variant2 = `/assets/figma/oct28/cf26e.svg`;
const imgProperty1Default2 = `/assets/figma/oct28/98fe7.svg`;
const img2 = `/assets/figma/oct28/c2780.svg`;
const imgGroup = `/assets/figma/oct28/7f751.svg`;
const img3 = `/assets/figma/oct28/b1156.svg`;
const img66701 = `/assets/figma/oct28/f7bbf.webp`;
const imgVector17 = `/assets/figma/oct28/12ade.svg`;
const imgVector18 = `/assets/figma/oct28/3d4b5.svg`;
const img4 = `/assets/figma/oct28/c6ac5.svg`;
const imgCskkkkSamulnori78460171 = `/assets/figma/oct28/4cad1.webp`;
const img65773 = `/assets/figma/oct28/4e3f7.webp`;
const imgRectangle22 = `/assets/figma/oct28/0a868.svg`;
const img5 = `/assets/figma/oct28/becaa.svg`;
const imgVector19 = `/assets/figma/oct28/98889.svg`;
const img6 = `/assets/figma/oct28/9e4b6.svg`;
const img7 = `/assets/figma/oct28/496c3.svg`;
const img8 = `/assets/figma/oct28/4b760.svg`;
const img9 = `/assets/figma/oct28/d120c.svg`;
const img10 = `/assets/figma/oct28/53d17.svg`;
const img11 = `/assets/figma/oct28/ac14a.svg`;
const img12 = `/assets/figma/oct28/57d7a.svg`;
const img13 = `/assets/figma/oct28/a0810.svg`;
const imgVector20 = `/assets/figma/oct28/f2e5e.svg`;
const imgVector21 = `/assets/figma/oct28/f49a0.svg`;
const imgVector22 = `/assets/figma/oct28/3a87b.svg`;
const imgVector23 = `/assets/figma/oct28/8f7c5.svg`;
const imgVector24 = `/assets/figma/oct28/a07dc.svg`;
const imgVector25 = `/assets/figma/oct28/e805d.svg`;
const imgVector26 = `/assets/figma/oct28/03ca1.svg`;
const imgVector27 = `/assets/figma/oct28/13c45.svg`;
const imgVector28 = `/assets/figma/oct28/64fe3.svg`;
const imgVector29 = `/assets/figma/oct28/7445a.svg`;
const imgVector30 = `/assets/figma/oct28/10836.svg`;
const imgVector31 = `/assets/figma/oct28/21256.svg`;
const imgVector32 = `/assets/figma/oct28/d9339.svg`;
const imgVector33 = `/assets/figma/oct28/0daa3.svg`;
const imgVector34 = `/assets/figma/oct28/be9f8.svg`;
const imgVector35 = `/assets/figma/oct28/0f9e3.svg`;
const imgVector36 = `/assets/figma/oct28/2d3c8.svg`;
const imgVector37 = `/assets/figma/oct28/f00d3.svg`;
const imgVector38 = `/assets/figma/oct28/d7c46.svg`;
const imgVector39 = `${assetPathPrefix}/d7c46.svg`;
const img65772 = `/assets/figma/oct28/25068.svg`;
const img14 = `/assets/figma/oct28/d4a08.svg`;


function Component({ className, property1 = "Default" }) {
  const is = property1 === "클릭";
  return (
    <div className={className || "story-current-232"} id={is ? "node-2575_1287" : "node-2575_1283"}>
      <ArtworkImage src={is ? imgProperty1 : imgProperty1Default} />
    </div>
  );
}


function Component1({ className, property1 = "Default" }) {
  return (
    <div className={className || "story-current-233"} data-node-id="2551:2124">
      <div className="story-current-1" data-node-id="2551:2904">
        <div className="story-current-2" data-node-id="2551:2125" />
        <div className="story-current-3" data-node-id="2551:2126" />
        <div className="story-current-4" data-node-id="2551:2127" />
        <div className="story-current-5" data-node-id="2551:2128" />
        <div className="story-current-6" data-node-id="2551:2133" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon28} />
            </div>
          </div>
        </div>
        <div className="story-current-9" data-node-id="2551:2134" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon33} />
            </div>
          </div>
        </div>
        <div className="story-current-11" data-node-id="2551:2135" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon29} />
            </div>
          </div>
        </div>
        <div className="story-current-12" data-node-id="2551:2136" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon34} />
            </div>
          </div>
        </div>
        <div className="story-current-13" data-node-id="2551:2137" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon29} />
            </div>
          </div>
        </div>
        <div className="story-current-14" data-node-id="2551:2138" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon38} />
            </div>
          </div>
        </div>
        <div className="story-current-16" data-node-id="2551:2139" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon34} />
            </div>
          </div>
        </div>
        <div className="story-current-17" data-node-id="2551:2140" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon29} />
            </div>
          </div>
        </div>
        <div className="story-current-18" data-node-id="2551:2141" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon39} />
            </div>
          </div>
        </div>
        <div className="story-current-19" data-node-id="2551:2142" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon34} />
            </div>
          </div>
        </div>
        <div className="story-current-20" data-node-id="2551:2143" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon29} />
            </div>
          </div>
        </div>
        <div className="story-current-21" data-node-id="2551:2144" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon38} />
            </div>
          </div>
        </div>
        <div className="story-current-22" data-node-id="2551:2145" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon34} />
            </div>
          </div>
        </div>
        <div className="story-current-23" data-node-id="2551:2852" data-name="처 음 으 로">
          <div className="story-current-24" data-node-id="2551:2853" data-name="Vector">
            <ArtworkImage src={imgVector} />
          </div>
          <div className="story-current-25" data-node-id="2551:2854" data-name="Vector">
            <ArtworkImage src={imgVector1} />
          </div>
          <div className="story-current-26" data-node-id="2551:2855" data-name="Vector">
            <ArtworkImage src={imgVector2} />
          </div>
          <div className="story-current-27" data-node-id="2551:2856" data-name="Vector">
            <ArtworkImage src={imgVector3} />
          </div>
        </div>
      </div>
    </div>
  );
}


function Component2({ className, property1 = "Default" }) {
  return (
    <div className={className || "story-current-233"} data-node-id="2551:2730">
      <div className="story-current-1" data-node-id="2551:2791">
        <div className="story-current-28" data-node-id="2551:2731" />
        <div className="story-current-3" data-node-id="2551:2732" />
        <div className="story-current-4" data-node-id="2551:2733" />
        <div className="story-current-5" data-node-id="2551:2734" />
        <div className="story-current-29" data-node-id="2551:2735" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon30} />
            </div>
          </div>
        </div>
        <div className="story-current-30" data-node-id="2551:2736" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon35} />
            </div>
          </div>
        </div>
        <div className="story-current-31" data-node-id="2551:2757" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon35} />
            </div>
          </div>
        </div>
        <div className="story-current-32" data-node-id="2551:2737" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon31} />
            </div>
          </div>
        </div>
        <div className="story-current-33" data-node-id="2551:2738" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon36} />
            </div>
          </div>
        </div>
        <div className="story-current-34" data-node-id="2551:2739" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon31} />
            </div>
          </div>
        </div>
        <div className="story-current-35" data-node-id="2551:2740" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon40} />
            </div>
          </div>
        </div>
        <div className="story-current-36" data-node-id="2551:2741" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon36} />
            </div>
          </div>
        </div>
        <div className="story-current-37" data-node-id="2551:2742" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon31} />
            </div>
          </div>
        </div>
        <div className="story-current-38" data-node-id="2551:2743" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon41} />
            </div>
          </div>
        </div>
        <div className="story-current-39" data-node-id="2551:2744" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon36} />
            </div>
          </div>
        </div>
        <div className="story-current-40" data-node-id="2551:2745" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon31} />
            </div>
          </div>
        </div>
        <div className="story-current-41" data-node-id="2551:2756" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon31} />
            </div>
          </div>
        </div>
        <div className="story-current-42" data-node-id="2551:2746" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon40} />
            </div>
          </div>
        </div>
        <div className="story-current-43" data-node-id="2551:2747" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon36} />
            </div>
          </div>
        </div>
        <div className="story-current-44" data-node-id="2551:2750" data-name="풍 물 이 야 기">
          <div className="story-current-45" data-node-id="2551:2751" data-name="Vector">
            <ArtworkImage src={imgVector4} />
          </div>
          <div className="story-current-46" data-node-id="2551:2752" data-name="Vector">
            <ArtworkImage src={imgVector5} />
          </div>
          <div className="story-current-47" data-node-id="2551:2753" data-name="Vector">
            <ArtworkImage src={imgVector6} />
          </div>
          <div className="story-current-48" data-node-id="2551:2754" data-name="Vector">
            <ArtworkImage src={imgVector7} />
          </div>
          <div className="story-current-49" data-node-id="2551:2755" data-name="Vector">
            <ArtworkImage src={imgVector8} />
          </div>
        </div>
      </div>
    </div>
  );
}


function Component3({ className, property1 = "Default" }) {
  return (
    <div className={className || "story-current-233"} data-node-id="2551:2710">
      <div className="story-current-1" data-node-id="2551:2790">
        <div className="story-current-2" data-node-id="2551:2711" />
        <div className="story-current-3" data-node-id="2551:2712" />
        <div className="story-current-4" data-node-id="2551:2713" />
        <div className="story-current-5" data-node-id="2551:2714" />
        <div className="story-current-6" data-node-id="2551:2715" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon32} />
            </div>
          </div>
        </div>
        <div className="story-current-9" data-node-id="2551:2716" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon37} />
            </div>
          </div>
        </div>
        <div className="story-current-11" data-node-id="2551:2717" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon42} />
            </div>
          </div>
        </div>
        <div className="story-current-12" data-node-id="2551:2718" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon43} />
            </div>
          </div>
        </div>
        <div className="story-current-13" data-node-id="2551:2719" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon42} />
            </div>
          </div>
        </div>
        <div className="story-current-14" data-node-id="2551:2720" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon44} />
            </div>
          </div>
        </div>
        <div className="story-current-16" data-node-id="2551:2721" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon43} />
            </div>
          </div>
        </div>
        <div className="story-current-17" data-node-id="2551:2722" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon42} />
            </div>
          </div>
        </div>
        <div className="story-current-18" data-node-id="2551:2723" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon45} />
            </div>
          </div>
        </div>
        <div className="story-current-19" data-node-id="2551:2724" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon43} />
            </div>
          </div>
        </div>
        <div className="story-current-20" data-node-id="2551:2725" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon42} />
            </div>
          </div>
        </div>
        <div className="story-current-21" data-node-id="2551:2726" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon44} />
            </div>
          </div>
        </div>
        <div className="story-current-22" data-node-id="2551:2727" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon43} />
            </div>
          </div>
        </div>
        <div className="story-current-50" data-node-id="2551:2784" data-name="소 문 내 기">
          <div className="story-current-51" data-node-id="2551:2785" data-name="Vector">
            <ArtworkImage src={imgVector9} />
          </div>
          <div className="story-current-52" data-node-id="2551:2786" data-name="Vector">
            <ArtworkImage src={imgVector10} />
          </div>
          <div className="story-current-53" data-node-id="2551:2787" data-name="Vector">
            <ArtworkImage src={imgVector11} />
          </div>
          <div className="story-current-54" data-node-id="2551:2788" data-name="Vector">
            <ArtworkImage src={imgVector12} />
          </div>
        </div>
      </div>
    </div>
  );
}


function Component4({ className, property1 = "Default" }) {
  return (
    <div className={className || "story-current-234"} data-node-id="2575:1301">
      <div className="story-current-55" data-node-id="2579:1224" data-name="깃발 표시 영역">
        <Component3 className="story-current-56" />
        <Component2 className="story-current-57" />
        <Component1 className="story-current-58" />
        <div className="story-current-59" data-node-id="2755:4413" data-name="얼쑤한컷">
          <div className="story-current-60" data-node-id="I2755:4413;2755:2420">
            <ArtworkImage src={imgGroup7} />
          </div>
          <div className="story-current-61" data-node-id="I2755:4413;2755:2496" data-name="얼 쑤 한 컷">
            <div className="story-current-62" data-node-id="I2755:4413;2755:2497" data-name="Vector">
              <ArtworkImage src={imgVector13} />
            </div>
            <div className="story-current-63" data-node-id="I2755:4413;2755:2498" data-name="Vector">
              <ArtworkImage src={imgVector14} />
            </div>
            <div className="story-current-64" data-node-id="I2755:4413;2755:2499" data-name="Vector">
              <ArtworkImage src={imgVector15} />
            </div>
            <div className="story-current-65" data-node-id="I2755:4413;2755:2500" data-name="Vector">
              <ArtworkImage src={imgVector16} />
            </div>
          </div>
        </div>
      </div>
      <Component className="story-current-66" />
    </div>
  );
}


function Component5({ className, propValue = "sky" }) {
  return (
    <div className={className || "story-current-235"} data-node-id="2625:4700">
      <ArtworkImage src={imgSky} />
    </div>
  );
}


function Component6({ className, property1 = "Default" }) {
  return (
    <div className={className || "story-current-233"} data-node-id="2755:2419">
      <div className="story-current-60" data-node-id="2755:2420">
        <ArtworkImage src={imgGroup7} />
      </div>
      <div className="story-current-61" data-node-id="2755:2496" data-name="얼 쑤 한 컷">
        <div className="story-current-62" data-node-id="2755:2497" data-name="Vector">
          <ArtworkImage src={imgVector13} />
        </div>
        <div className="story-current-63" data-node-id="2755:2498" data-name="Vector">
          <ArtworkImage src={imgVector14} />
        </div>
        <div className="story-current-64" data-node-id="2755:2499" data-name="Vector">
          <ArtworkImage src={imgVector15} />
        </div>
        <div className="story-current-65" data-node-id="2755:2500" data-name="Vector">
          <ArtworkImage src={imgVector16} />
        </div>
      </div>
    </div>
  );
}


function Component7({className}) {
  return <div className={className || 'story-current-236'} data-node-id="2772:6997" role="button" tabIndex={0} aria-label="임실필봉농악 소개"
    onClick={e=>e.currentTarget.classList.toggle('is-revealed')}
    onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.currentTarget.classList.toggle('is-revealed');}}}>
    <div className="story-region-photo" style={{maskImage:`url("${img67033}")`}}><img src={img67034} alt="임실필봉농악 공연 모습" draggable="false"/></div>
    <div className="story-region-hover"><ArtworkImage src="/assets/figma/oct23/2772-6999.svg"/></div>
  </div>;
}

function Component8({className}) {
  return <div className={className || 'story-current-237'} data-node-id="2772:6966" role="button" tabIndex={0} aria-label="평택농악 소개"
    onClick={e=>e.currentTarget.classList.toggle('is-revealed')}
    onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.currentTarget.classList.toggle('is-revealed');}}}>
    <div className="story-region-photo" style={{maskImage:`url("${img59263}")`}}><img src={img59264} alt="평택농악 공연 모습" draggable="false"/></div>
    <div className="story-region-hover"><ArtworkImage src="/assets/figma/oct23/2772-6968.svg"/></div>
  </div>;
}

function Component9({className}) {
  return <div className={className || 'story-current-238'} data-node-id="2772:7029" role="button" tabIndex={0} aria-label="이리농악 소개"
    onClick={e=>e.currentTarget.classList.toggle('is-revealed')}
    onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.currentTarget.classList.toggle('is-revealed');}}}>
    <div className="story-region-photo" style={{maskImage:`url("${img63002}")`}}><img src={img63003} alt="이리농악 공연 모습" draggable="false"/></div>
    <div className="story-region-hover"><ArtworkImage src="/assets/figma/oct23/2772-7031.svg"/></div>
  </div>;
}

function Component10({className}) {
  return <div className={className || 'story-current-237'} data-node-id="2772:7057" role="button" tabIndex={0} aria-label="진주삼천포농악 소개"
    onClick={e=>e.currentTarget.classList.toggle('is-revealed')}
    onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.currentTarget.classList.toggle('is-revealed');}}}>
    <div className="story-region-photo" style={{maskImage:`url("${img57493}")`}}><img src={img57494} alt="진주삼천포농악 공연 모습" draggable="false"/></div>
    <div className="story-region-hover"><ArtworkImage src="/assets/figma/oct23/2772-7069.svg"/></div>
  </div>;
}

function Component11({ className, property1 = "Default" }) {
  return (
    <div className={className || "story-current-239"} data-node-id="2142:3722">
      <div className="story-current-75" data-node-id="2199:2830" data-name="북">
        <ArtworkImage src={img} />
      </div>
    </div>
  );
}

function Component12({ className }) {
  return (
    <div className={className || "story-current-240"} data-node-id="2271:3229" data-name="로고_원형">
      <ArtworkImage src={img1} />
    </div>
  );
}


function Component13({ className, property1 = "Default" }) {
  const isVariant2 = property1 === "Variant2";
  return (
    <div className={className || "story-current-241"} id={isVariant2 ? "node-2028_475" : "node-2028_473"}>
      <ArtworkImage src={isVariant2 ? imgProperty1Variant2 : imgProperty1Default1} />
    </div>
  );
}


function Component14({ className, property1 = "Default" }) {
  return (
    <div className={className || "story-current-242"} data-node-id="2028:465">
      <ArtworkImage src={imgProperty1Default2} />
    </div>
  );
}


function Component15({ className, property1 = "Default" }) {
 const [slide,setSlide]=useState(0);
  return (
    <div className={className || "story-current-243"} data-node-id="2632:4771">
 {slide>0 && <img className="story-flag-photo" src={'/assets/figma/story/current/'+['','d16c4.webp','623b8.webp'][slide]} alt="농기 사진"/>}
      <div className="story-current-76" data-art-container="" style={{visibility:slide?'hidden':'visible',containerType:'size'}} data-node-id="2632:4729">
        <div className="story-current-77">
          <div className="story-current-8" data-name="깃대">
            <ArtworkImage src={img2} />
          </div>
        </div>
      </div>
      <div className="story-current-78" data-art-container="" style={{visibility:slide?'hidden':'visible',containerType:'size'}} data-node-id="2632:4738">
        <div className="story-current-79">
          <div className="story-current-8" data-name="Group">
            <ArtworkImage src={imgGroup} />
          </div>
        </div>
      </div>
      <div className="story-current-80" data-node-id="2653:2022">
        <div className="story-current-81">
          <button className="story-current-82" onClick={()=>setSlide((slide+1)%3)} aria-label="다음 농기 보기" data-name="다음 농기 보기">
            <ArtworkImage src={img3} />
          </button>
        </div>
      </div>
    </div>
  );
}


function Component16({className}) {
 const [slide,setSlide]=useState(0);
 const files=['f7bbf.webp','f5287.webp','6635d.webp','181d1.webp','140b8.webp'];
 return <div className={className} data-node-id="2728:2349">
  {files.map((file,i)=><img key={file} className={'story-place-photo '+(i===slide?'is-active':'')} src={assetPathPrefix+'/'+file} alt={['마당밟이','판굿','진주삼천포농악 놀이','길놀이','성주굿'][i]}/>)}
  <div className="story-place-shade"/>
  <div className="story-place-dots" role="group" aria-label="장소 사진">{files.map((file,i)=><button key={file} onClick={()=>setSlide(i)} aria-label={(i+1)+'번째 사진'} aria-pressed={i===slide}><span aria-hidden="true" className="story-pagination-star"/></button>)}</div>
  <button className="story-place-next" onClick={()=>setSlide((slide+1)%files.length)} aria-label="다음 장소 사진"><img src={img4} alt=""/></button>
 </div>;
}

function StoryArtwork({scrollDown,navigate}) {
 const share=async()=>{try{const url=new URL('/',location.href).href;if(navigator.share)await navigator.share({title:'우리바람',url});else await navigator.clipboard.writeText(url);}catch{}};

  return (
    <div className="story-oct28-0" data-node-id="2902:7486" data-name="풍물 이야기">
      <div className="story-oct28-1" data-node-id="2902:7487">
        <div className="story-oct28-2" data-node-id="2902:7488" data-art-container="" style={{ containerType: "size" }}>
          <div className="story-oct28-3">
            <div className="story-oct28-4">
              <ArtworkImage src={imgRectangle22} />
            </div>
          </div>
        </div>
        <div className="story-oct28-6" data-node-id="2902:7489">
          <p className="story-oct28-7">
            <span className="story-oct28-8">{`참고   `}</span>
            <span className="story-oct28-9">{`한국민족문화대백과사전 「농악」·  국립국악원 국악사전 「임실필봉농악」·  필봉문화촌`}</span>
          </p>
          <p className="story-oct28-10">
            <span className="story-oct28-8">사진 출처</span>
            <span className="story-oct28-9">{`   국가유산청 · 고창농악보존회`}</span>
          </p>
        </div>
        <p className="story-oct28-11" data-node-id="2902:7490">{`우리바람  ·  Our Wind, Our Wish`}</p>
        <p className="story-oct28-12" data-node-id="2902:7491">
          © 2026 Choi Soo Myeong
        </p>
        <div className="story-oct28-13" data-node-id="2902:7492">
          <p className="story-oct28-7">
            <span className="story-oct28-8">기획 및 디자인</span>
            <span className="story-oct28-9">{`   Choi Soo Myeong`}</span>
          </p>
          <p className="story-oct28-10">
            <span className="story-oct28-8">{`개발 `}</span>
            <span className="story-oct28-9">{` Choi Ji Sun`}</span>
          </p>
        </div>
      </div>
      <div className="story-oct28-14" data-node-id="2902:7493" data-name="cskkkk-samulnori-7846017 1">
        <ArtworkImage src={imgCskkkkSamulnori78460171} />
      </div>
      <div className="story-oct28-16" data-node-id="2902:7494" style={{ backgroundImage: "linear-gradient(180deg, rgb(255, 95, 247) 58.654%, rgba(255, 95, 247, 0.814) 72.596%, rgba(255, 95, 247, 0.528) 85.577%, rgba(255, 95, 247, 0) 100%)" }} />
      <Component16 className="story-oct28-17" />
      <div className="story-oct28-18" data-node-id="2902:7496" />
      <Component15 className="story-oct28-19" />
      <p className="story-oct28-20" data-node-id="2902:7498">
        방금 함께한 놀이,
        <br aria-hidden />
        풍물놀이에서 시작됐어요
      </p>
      <p className="story-oct28-21" data-node-id="2902:7499">
        바람을 적었던 깃발
      </p>
      <div className="story-oct28-22" data-node-id="2902:7500">
        <p className="story-oct28-23">
          <span className="story-oct28-24">{`사람들이 모여 악기를 연주하고 춤추는 풍물놀이는 `}</span>
          <span className="story-oct28-25">‘농악’</span>
          <span className="story-oct28-24">이라고도 불러요</span>
        </p>
        <p className="story-oct28-26">농사가 잘되고 마을이 평안하기를 바라며 함께했지요</p>
        <p>
          <span className="story-oct28-24">{`이렇게 사람들이 모여 어울리는 자리를 `}</span>
          <span className="story-oct28-25">‘판’</span>
          <span className="story-oct28-24">이라고 해요</span>
        </p>
      </div>
      <div className="story-oct28-27" data-node-id="2902:7501">
        <p className="story-oct28-28">풍물놀이에서 볼 수 있는 깃발 중 하나예요</p>
        <p className="story-oct28-29">
          <span className="story-oct28-30">[농기]</span>
          <span className="story-oct28-24">라고 부르는 이것은, 농사를 소중히 여기는 글귀나</span>
        </p>
        <p className="story-oct28-28">마을을 나타내는 표시를 담았어요</p>
        <p className="story-oct28-28">​</p>
        <p className="story-oct28-31">우리바람에서는 이 농기에 우리들의 바람을 담아 봤어요</p>
      </div>
      <div className="story-oct28-32" data-node-id="2902:7502">
        <div className="story-oct28-33">
          <div className="story-oct28-34" data-name="<" role="button" tabIndex={0} aria-label="다음 이야기" onClick={scrollDown} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();scrollDown();}}}>
            <ArtworkImage src={img5} />
          </div>
        </div>
      </div>
      <div className="story-oct28-35" data-node-id="2902:7504" />
      <div className="story-oct28-36" data-node-id="2902:7505" />
      <p className="story-oct28-37" data-node-id="2902:7506">
        함께 하는 사람들
      </p>
      <div className="story-oct28-38" data-node-id="2902:7507" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-39">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector19} />
          </div>
        </div>
      </div>
      <div className="story-oct28-40" data-node-id="2902:7508">
        <p className="story-oct28-41">길에서도,</p>
        <p className="story-oct28-41">논에서도,</p>
        <p className="story-oct28-42">마당에서도</p>
      </div>
      <p className="story-oct28-43" data-node-id="2902:7509">
        지역마다 다양한 소리들
      </p>
      <div className="story-oct28-44" data-node-id="2902:7510">
        <p className="story-oct28-41">서로의 안녕을 빌던 마음을</p>
        <p className="story-oct28-42">화면 속으로</p>
      </div>
      <div className="story-oct28-45" data-node-id="2902:7511">
        <p className="story-oct28-46">
          <span className="story-oct28-24">{`풍물놀이를 하는 무리를 `}</span>
          <span className="story-oct28-30">‘풍물패’</span>
          <span className="story-oct28-24">{`, 그 구성원을 `}</span>
          <span className="story-oct28-30">‘치배’</span>
          <span className="story-oct28-24">{` 라고 해요`}</span>
        </p>
        <p className="story-oct28-47">악기를 치는 사람뿐 아니라 깃발을 들거나 여러 인물로 분장해 노는 사람도 함께 해요</p>
        <p className="story-oct28-48">
          <span className="story-oct28-49">{`또한, 관람하는 사람들 또한 `}</span>
          <span className="story-oct28-50">함께 즐기는 것</span>
          <span className="story-oct28-49">이 풍물놀이의 매력이에요</span>
        </p>
      </div>
      <div className="story-oct28-51" data-node-id="2902:7512">
        <p className="story-oct28-26">풍물놀이는 하는 장소와 목적에 따라</p>
        <p className="story-oct28-26">모습과 이름이 달라요. 풍물에서 ‘굿’은</p>
        <p className="story-oct28-26">복을 비는 의식뿐 아니라</p>
        <p className="story-oct28-24">연주와 놀이를 가리키기도 해요</p>
      </div>
      <div className="story-oct28-52" data-node-id="2902:7513">
        <p className="story-oct28-26">여러 지역에서 저마다의 모습으로 이어져 왔어요</p>
        <p className="story-oct28-23">
          <span className="story-oct28-24">{`연주하는 리듬인 `}</span>
          <span className="story-oct28-30">’가락’</span>
          <span className="story-oct28-24">도, 옷차림과 춤도 조금씩 달라요</span>
        </p>
        <p>
          <span className="story-oct28-24">{`그 중에서도 `}</span>
          <span className="story-oct28-30">국가무형문화재 제11호</span>
          <span className="story-oct28-24">로 지정된 5가지 농악이에요.</span>
        </p>
      </div>
      <div className="story-oct28-53" data-node-id="2902:7514">
        <p className="story-oct28-26">농기에 소원을 쓰고, 악기를 고르고, 몸을 움직여 소리를 내는 과정을</p>
        <p className="story-oct28-24">누구나 쉽게 참여할 수 있도록 새롭게 구성했어요</p>
      </div>
      <p className="story-oct28-54" data-node-id="2902:7515">
        다음에 풍물놀이를 만나면, 조금 더 반갑게,
        <br aria-hidden />
        우리바람에서의 짧은 경험이
        <br aria-hidden />
        풍물놀이를 더 알고 싶은 마음으로 이어지길 바라요
      </p>
      <p className="story-oct28-55" data-node-id="2902:7516">
        우리바람은 임실필봉농악을 바탕으로 하고 있어요
      </p>
      <div className="story-oct28-56" data-node-id="2902:7517">
        <div className="story-oct28-57">
          <div className="story-oct28-58" data-name="소고">
            <div className="story-oct28-59" data-node-id="I2902:7517;2199:2886" data-name="소고 그룹">
              <div className="story-oct28-60" data-node-id="I2902:7517;2142:3723" data-art-container="" style={{ containerType: "size" }}>
                <div className="story-oct28-61">
                  <div className="story-oct28-4" data-name="소고">
                    <ArtworkImage src={img6} />
                  </div>
                </div>
              </div>
              <div className="story-oct28-62" data-node-id="I2902:7517;2142:3738" data-art-container="" style={{ containerType: "size" }}>
                <div className="story-oct28-63">
                  <div className="story-oct28-4" data-name="소고채">
                    <div className="story-oct28-64">
                      <ArtworkImage src={img7} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="story-oct28-66" data-node-id="2902:7518">
        <div className="story-oct28-67">
          <div className="story-oct28-68" data-name="장구">
            <div className="story-oct28-69" data-node-id="I2902:7518;2199:3035" data-name="장구 그룹">
              <ArtworkImage src={img8} />
            </div>
          </div>
        </div>
      </div>
      <div className="story-oct28-70" data-node-id="2902:7519">
        <div className="story-oct28-71">
          <div className="story-oct28-72" data-name="꽹과리">
            <div className="story-oct28-73" data-node-id="I2902:7519;2658:3236">
              <div className="story-oct28-74" data-node-id="I2902:7519;2658:3151" data-name="소고">
                <ArtworkImage src={img9} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="story-oct28-75" data-node-id="2902:7520">
        <p className="story-oct28-26">우리바람은 임실필봉농악의 ‘마당밟이’를 참고해 만들었어요</p>
        <p className="story-oct28-26">집집마다 찾아가 평안을 빌던 마음을,</p>
        <p className="story-oct28-24">각자의 소원을 담고 함께 연주하는 경험으로 옮겼어요</p>
      </div>
      <Component14 className="story-oct28-76" />
      <div className="story-oct28-77" data-node-id="2902:7522">
        <div className="story-oct28-78">
          <div className="story-oct28-79" data-name="음표2">
            <ArtworkImage src={img10} />
          </div>
        </div>
      </div>
      <div className="story-oct28-80" data-node-id="2902:7523">
        <div className="story-oct28-81">
          <div className="story-oct28-79" data-name="음표2">
            <ArtworkImage src={img11} />
          </div>
        </div>
      </div>
      <div className="story-oct28-82" data-node-id="2902:7524">
        <div className="story-oct28-83">
          <div className="story-oct28-84" data-name="음표3">
            <ArtworkImage src={img12} />
          </div>
        </div>
      </div>
      <div className="story-oct28-85" data-node-id="2902:7525">
        <div className="story-oct28-86">
          <div className="story-oct28-87" data-name="음표3">
            <ArtworkImage src={img13} />
          </div>
        </div>
      </div>
      <Component13 className="story-oct28-88" />
      <Component13 className="story-oct28-89" property1="Variant2" />
      <div className="story-oct28-90" data-node-id="2902:7528" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-91">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector20} />
          </div>
        </div>
      </div>
      <div className="story-oct28-92" data-node-id="2902:7529" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-93">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector21} />
          </div>
        </div>
      </div>
      <div className="story-oct28-94" data-node-id="2902:7530" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-95">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector22} />
          </div>
        </div>
      </div>
      <div className="story-oct28-96" data-node-id="2902:7531" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-97">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector23} />
          </div>
        </div>
      </div>
      <div className="story-oct28-98" data-node-id="2902:7532" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-97">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector24} />
          </div>
        </div>
      </div>
      <div className="story-oct28-99" data-node-id="2902:7533" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-100">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector25} />
          </div>
        </div>
      </div>
      <div className="story-oct28-101" data-node-id="2902:7534" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-97">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector26} />
          </div>
        </div>
      </div>
      <div className="story-oct28-102" data-node-id="2902:7535" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-103">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector27} />
          </div>
        </div>
      </div>
      <div className="story-oct28-104" data-node-id="2902:7536" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-105">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector28} />
          </div>
        </div>
      </div>
      <p className="story-oct28-106" data-node-id="2902:7537">
        바람을 싣고, 소리 따라 저 멀리
      </p>
      <Component12 className="story-oct28-107" />
      <div className="story-oct28-108" data-node-id="2902:7539" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-39">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector29} />
          </div>
        </div>
      </div>
      <div className="story-oct28-109" data-node-id="2902:7540" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-39">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector29} />
          </div>
        </div>
      </div>
      <div className="story-oct28-110" data-node-id="2902:7541" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-39">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector30} />
          </div>
        </div>
      </div>
      <div className="story-oct28-111" data-node-id="2902:7542" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-39">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector31} />
          </div>
        </div>
      </div>
      <div className="story-oct28-112" data-node-id="2902:7543" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-39">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector32} />
          </div>
        </div>
      </div>
      <div className="story-oct28-113" data-node-id="2902:7544" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-114">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector33} />
          </div>
        </div>
      </div>
      <div className="story-oct28-115" data-node-id="2902:7545" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-114">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector33} />
          </div>
        </div>
      </div>
      <div className="story-oct28-116" data-node-id="2902:7546" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-114">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector34} />
          </div>
        </div>
      </div>
      <div className="story-oct28-117" data-node-id="2902:7547" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-114">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector35} />
          </div>
        </div>
      </div>
      <div className="story-oct28-118" data-node-id="2902:7548" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-114">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector36} />
          </div>
        </div>
      </div>
      <div className="story-oct28-119" data-node-id="2902:7549" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-114">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector37} />
          </div>
        </div>
      </div>
      <div className="story-oct28-120" data-node-id="2902:7550" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-114">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector37} />
          </div>
        </div>
      </div>
      <div className="story-oct28-121" data-node-id="2902:7551" data-art-container="" style={{ containerType: "size" }}>
        <div className="story-oct28-114">
          <div className="story-oct28-4" data-name="Vector">
            <ArtworkImage src={imgVector38} />
          </div>
        </div>
      </div>
      <div className="story-oct28-122" data-node-id="2902:7552">
        <div className="story-oct28-123">
          <div className="story-oct28-124" />
        </div>
      </div>
      <Component11 className="story-oct28-125" />
      <div className="story-oct28-126" data-node-id="2902:7554">
        <div className="story-oct28-127">
          <div className="story-oct28-128" data-name="강릉" role="button" tabIndex={0} aria-label="강릉농악 소개" onClick={e=>e.currentTarget.classList.toggle('is-revealed')} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.currentTarget.classList.toggle('is-revealed');}}}><div className="story-region-hover"><ArtworkImage src="/assets/figma/oct23/2772-6973.svg"/></div>
            <div className="story-oct28-129" data-node-id="I2902:7554;2772:6870" style={{ maskImage: `url("${img65772}")` }} data-name="6577_팔도진놀이_강릉농악_국가유산청 2">
              <ArtworkImage src={img65773} />
            </div>
          </div>
        </div>
      </div>
      <div className="story-oct28-130 story-region-slot"><Component10 /></div>
      <div className="story-oct28-131 story-region-slot"><Component9 /></div>
      <div className="story-oct28-132 story-region-slot"><Component8 /></div>
      <div className="story-oct28-133 story-region-slot"><Component7 /></div>
      <div className="story-oct28-134 story-footer-action" role="button" tabIndex={0} aria-label="처음으로" onClick={()=>navigate('/')} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();navigate('/');}}}><Component1 className="story-footer-art"/></div>
      <div className="story-oct28-135 story-footer-action" role="button" tabIndex={0} aria-label="소문내기" onClick={()=>share()} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();share();}}}><Component3 className="story-footer-art"/></div>
      <div className="story-oct28-136 story-footer-action" role="button" tabIndex={0} aria-label="얼쑤 한컷" onClick={()=>navigate('/photo')} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();navigate('/photo');}}}><Component6 className="story-footer-art"/></div>
    </div>
  );
}
const storyStops=[0,2434,3890.727,6152.895,7715,11500,13600,15807];
export default function StoryPage(){
 const ref=useRef(null),shellRef=useRef(null),navigate=useNavigate();
 useStoryScroll(ref);
 useStoryReveal(ref);
 const previousScale=useRef(null), resizePosition=useRef(null);
 const [viewport,setViewport]=useState({width:window.innerWidth,height:window.innerHeight});
 useEffect(()=>{const observer=new ResizeObserver(([e])=>{
  const root=ref.current;
  if(root && previousScale.current && previousScale.current!==Math.min(e.contentRect.width/2560,e.contentRect.height/1440)){resizePosition.current=root.scrollTop/previousScale.current;root.style.scrollSnapType="none";}
  setViewport({width:e.contentRect.width,height:e.contentRect.height});
 });observer.observe(shellRef.current);return()=>observer.disconnect();},[]);
 const scale=Math.min(viewport.width/2560,viewport.height/1440);
 useLayoutEffect(()=>{
  const root=ref.current;
  if(previousScale.current && previousScale.current!==scale){
   const position=resizePosition.current ?? root.scrollTop/previousScale.current;
   root.style.scrollSnapType="none";
   root.scrollTop=position*scale;
   const frame=requestAnimationFrame(()=>{root.style.scrollSnapType="";});
   previousScale.current=scale;
   return()=>{cancelAnimationFrame(frame);root.style.scrollSnapType="";};
  }
  root.style.scrollSnapType="";
  previousScale.current=scale;
 },[scale]);
 const snapStops=storyStops.slice(0,-1).flatMap((top,i)=>{const end=storyStops[i+1];const count=Math.max(1,Math.ceil((end-top)/1440));return Array.from({length:count},(_,j)=>Math.min(top+j*(end-top)/count,15807-1440));});
 return <div ref={shellRef} className="story-shell"><main ref={ref} className="story-page" aria-label="풍물 이야기" tabIndex={0} onErrorCapture={useOriginalImage} style={{width:2560*scale,height:viewport.height,'--story-scale':scale}}>
  <StoryHeader scrollRef={ref}/>
  <div className="story-brand-anchor"><button className="story-brand" onClick={()=>navigate('/')} aria-label="우리바람 처음으로"><img src="/assets/figma/story/oct23/d4a08.svg" alt="우리바람"/></button></div>
  <div className="story-document" style={{height:15807*scale}}>
   <div className="story-artwork" style={{transform:`scale(${scale})`}}><StoryArtwork navigate={navigate} scrollDown={() => ref.current.scrollTo({top:2434*scale,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})}/></div>
   {storyStops.slice(0,-1).map((top,i)=><section key={top} className="story-section" aria-label={['풍물놀이 소개','바람을 담은 농기','함께 하는 사람들','다양한 장소','지역마다 다양한 소리들','우리바람','마무리'][i]} style={{top:top*scale,height:(storyStops[i+1]-top)*scale}}/>)}
   {snapStops.map(top=><div key={top} className="story-snap-point" aria-hidden="true" style={{top:top*scale}}/>)}
  </div>
 </main></div>;
}
