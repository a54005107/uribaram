import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import StoryHeader from '../components/StoryHeader';
import './StoryPage.css';
function ArtworkImage({src}) {
 const ref=useRef(null);
 useEffect(()=>{const img=ref.current, parent=img.parentElement;const fit=()=>{if(img.naturalWidth)img.style.transform=`scale(${parent.clientWidth/img.naturalWidth},${parent.clientHeight/img.naturalHeight})`;}; img.addEventListener('load',fit); const observer=new ResizeObserver(fit);observer.observe(parent);fit();return()=>{observer.disconnect();img.removeEventListener('load',fit);};},[src]);
 return <img ref={ref} className="story-art-image" src={src} alt="" draggable="false"/>;
}
const assetPathPrefix = "/assets/figma/story/oct23";
const imgProperty1Default = `${assetPathPrefix}/e6db4.svg`;
const imgProperty1 = `${assetPathPrefix}/b7252.svg`;
const imgPolygon28 = `${assetPathPrefix}/91001.svg`;
const imgPolygon33 = `${assetPathPrefix}/1d033.svg`;
const imgPolygon29 = `${assetPathPrefix}/94534.svg`;
const imgPolygon34 = `${assetPathPrefix}/95c58.svg`;
const imgPolygon38 = `${assetPathPrefix}/9c30f.svg`;
const imgPolygon39 = `${assetPathPrefix}/7307a.svg`;
const imgVector = `${assetPathPrefix}/ddcb8.svg`;
const imgVector1 = `${assetPathPrefix}/0b4a7.svg`;
const imgVector2 = `${assetPathPrefix}/1466b.svg`;
const imgVector3 = `${assetPathPrefix}/d2f97.svg`;
const imgPolygon30 = `${assetPathPrefix}/5d10a.svg`;
const imgPolygon35 = `${assetPathPrefix}/a9c83.svg`;
const imgPolygon31 = `${assetPathPrefix}/968fa.svg`;
const imgPolygon36 = `${assetPathPrefix}/f288a.svg`;
const imgPolygon40 = `${assetPathPrefix}/4217d.svg`;
const imgPolygon41 = `${assetPathPrefix}/9188c.svg`;
const imgVector4 = `${assetPathPrefix}/ec9c3.svg`;
const imgVector5 = `${assetPathPrefix}/a0670.svg`;
const imgVector6 = `${assetPathPrefix}/a23e9.svg`;
const imgVector7 = `${assetPathPrefix}/2ec98.svg`;
const imgVector8 = `${assetPathPrefix}/294bd.svg`;
const imgPolygon32 = `${assetPathPrefix}/1a703.svg`;
const imgPolygon37 = `${assetPathPrefix}/e75d1.svg`;
const imgPolygon42 = `${assetPathPrefix}/3a72b.svg`;
const imgPolygon43 = `${assetPathPrefix}/ba7c6.svg`;
const imgPolygon44 = `${assetPathPrefix}/ea4d7.svg`;
const imgPolygon45 = `${assetPathPrefix}/21430.svg`;
const imgVector9 = `${assetPathPrefix}/d56e4.svg`;
const imgVector10 = `${assetPathPrefix}/73152.svg`;
const imgVector11 = `${assetPathPrefix}/0889a.svg`;
const imgVector12 = `${assetPathPrefix}/c4491.svg`;
const imgGroup7 = `${assetPathPrefix}/fb960.svg`;
const imgVector13 = `${assetPathPrefix}/aa337.svg`;
const imgVector14 = `${assetPathPrefix}/ca77c.svg`;
const imgVector15 = `${assetPathPrefix}/0743d.svg`;
const imgVector16 = `${assetPathPrefix}/20ebc.svg`;
const imgSky = `${assetPathPrefix}/7a2dd.svg`;
const img67034 = `${assetPathPrefix}/bd5cc.png`;
const img67033 = `${assetPathPrefix}/d9b20.svg`;
const img59264 = `${assetPathPrefix}/f5dd7.png`;
const img59263 = `${assetPathPrefix}/98770.svg`;
const img63003 = `${assetPathPrefix}/087be.png`;
const img63002 = `${assetPathPrefix}/73723.svg`;
const img57494 = `${assetPathPrefix}/2b00f.png`;
const img57493 = `${assetPathPrefix}/842a1.svg`;
const img = `${assetPathPrefix}/60231.svg`;
const img1 = `${assetPathPrefix}/b9168.svg`;
const imgProperty1Default1 = `${assetPathPrefix}/409e1.svg`;
const imgProperty1Variant2 = `${assetPathPrefix}/cf26e.svg`;
const imgProperty1Default2 = `${assetPathPrefix}/98fe7.svg`;
const img2 = `${assetPathPrefix}/9d376.svg`;
const imgGroup = `${assetPathPrefix}/7f751.svg`;
const img3 = `${assetPathPrefix}/b1156.svg`;
const img66701 = `${assetPathPrefix}/f7bbf.png`;
const imgVector17 = `${assetPathPrefix}/12ade.svg`;
const imgVector18 = `${assetPathPrefix}/3d4b5.svg`;
const img4 = `${assetPathPrefix}/c6ac5.svg`;
const imgCskkkkSamulnori78460171 = `${assetPathPrefix}/4cad1.png`;
const img65773 = `${assetPathPrefix}/4e3f7.png`;
const imgRectangle22 = `${assetPathPrefix}/0a868.svg`;
const img5 = `${assetPathPrefix}/becaa.svg`;
const imgVector19 = `${assetPathPrefix}/98889.svg`;
const img6 = `${assetPathPrefix}/9e4b6.svg`;
const img7 = `${assetPathPrefix}/496c3.svg`;
const img8 = `${assetPathPrefix}/0f5f2.svg`;
const img9 = `${assetPathPrefix}/d120c.svg`;
const img10 = `${assetPathPrefix}/53d17.svg`;
const img11 = `${assetPathPrefix}/ac14a.svg`;
const img12 = `${assetPathPrefix}/57d7a.svg`;
const img13 = `${assetPathPrefix}/a0810.svg`;
const imgVector20 = `${assetPathPrefix}/f2e5e.svg`;
const imgVector21 = `${assetPathPrefix}/f49a0.svg`;
const imgVector22 = `${assetPathPrefix}/3a87b.svg`;
const imgVector23 = `${assetPathPrefix}/8f7c5.svg`;
const imgVector24 = `${assetPathPrefix}/a07dc.svg`;
const imgVector25 = `${assetPathPrefix}/e805d.svg`;
const imgVector26 = `${assetPathPrefix}/03ca1.svg`;
const imgVector27 = `${assetPathPrefix}/13c45.svg`;
const imgVector28 = `${assetPathPrefix}/64fe3.svg`;
const imgVector29 = `${assetPathPrefix}/7445a.svg`;
const imgVector30 = `${assetPathPrefix}/10836.svg`;
const imgVector31 = `${assetPathPrefix}/21256.svg`;
const imgVector32 = `${assetPathPrefix}/d9339.svg`;
const imgVector33 = `${assetPathPrefix}/0daa3.svg`;
const imgVector34 = `${assetPathPrefix}/be9f8.svg`;
const imgVector35 = `${assetPathPrefix}/0f9e3.svg`;
const imgVector36 = `${assetPathPrefix}/2d3c8.svg`;
const imgVector37 = `${assetPathPrefix}/f00d3.svg`;
const imgVector38 = `${assetPathPrefix}/f71ba.svg`;
const imgVector39 = `${assetPathPrefix}/d7c46.svg`;
const img65772 = `${assetPathPrefix}/25068.svg`;
const img14 = `${assetPathPrefix}/d4a08.svg`;


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
        <div className="story-current-6" data-node-id="2551:2133" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon28} />
            </div>
          </div>
        </div>
        <div className="story-current-9" data-node-id="2551:2134" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon33} />
            </div>
          </div>
        </div>
        <div className="story-current-11" data-node-id="2551:2135" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon29} />
            </div>
          </div>
        </div>
        <div className="story-current-12" data-node-id="2551:2136" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon34} />
            </div>
          </div>
        </div>
        <div className="story-current-13" data-node-id="2551:2137" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon29} />
            </div>
          </div>
        </div>
        <div className="story-current-14" data-node-id="2551:2138" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon38} />
            </div>
          </div>
        </div>
        <div className="story-current-16" data-node-id="2551:2139" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon34} />
            </div>
          </div>
        </div>
        <div className="story-current-17" data-node-id="2551:2140" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon29} />
            </div>
          </div>
        </div>
        <div className="story-current-18" data-node-id="2551:2141" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon39} />
            </div>
          </div>
        </div>
        <div className="story-current-19" data-node-id="2551:2142" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon34} />
            </div>
          </div>
        </div>
        <div className="story-current-20" data-node-id="2551:2143" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon29} />
            </div>
          </div>
        </div>
        <div className="story-current-21" data-node-id="2551:2144" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon38} />
            </div>
          </div>
        </div>
        <div className="story-current-22" data-node-id="2551:2145" style={{ containerType: "size" }}>
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
        <div className="story-current-29" data-node-id="2551:2735" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon30} />
            </div>
          </div>
        </div>
        <div className="story-current-30" data-node-id="2551:2736" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon35} />
            </div>
          </div>
        </div>
        <div className="story-current-31" data-node-id="2551:2757" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon35} />
            </div>
          </div>
        </div>
        <div className="story-current-32" data-node-id="2551:2737" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon31} />
            </div>
          </div>
        </div>
        <div className="story-current-33" data-node-id="2551:2738" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon36} />
            </div>
          </div>
        </div>
        <div className="story-current-34" data-node-id="2551:2739" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon31} />
            </div>
          </div>
        </div>
        <div className="story-current-35" data-node-id="2551:2740" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon40} />
            </div>
          </div>
        </div>
        <div className="story-current-36" data-node-id="2551:2741" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon36} />
            </div>
          </div>
        </div>
        <div className="story-current-37" data-node-id="2551:2742" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon31} />
            </div>
          </div>
        </div>
        <div className="story-current-38" data-node-id="2551:2743" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon41} />
            </div>
          </div>
        </div>
        <div className="story-current-39" data-node-id="2551:2744" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon36} />
            </div>
          </div>
        </div>
        <div className="story-current-40" data-node-id="2551:2745" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon31} />
            </div>
          </div>
        </div>
        <div className="story-current-41" data-node-id="2551:2756" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon31} />
            </div>
          </div>
        </div>
        <div className="story-current-42" data-node-id="2551:2746" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon40} />
            </div>
          </div>
        </div>
        <div className="story-current-43" data-node-id="2551:2747" style={{ containerType: "size" }}>
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
        <div className="story-current-6" data-node-id="2551:2715" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon32} />
            </div>
          </div>
        </div>
        <div className="story-current-9" data-node-id="2551:2716" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon37} />
            </div>
          </div>
        </div>
        <div className="story-current-11" data-node-id="2551:2717" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon42} />
            </div>
          </div>
        </div>
        <div className="story-current-12" data-node-id="2551:2718" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon43} />
            </div>
          </div>
        </div>
        <div className="story-current-13" data-node-id="2551:2719" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon42} />
            </div>
          </div>
        </div>
        <div className="story-current-14" data-node-id="2551:2720" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon44} />
            </div>
          </div>
        </div>
        <div className="story-current-16" data-node-id="2551:2721" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon43} />
            </div>
          </div>
        </div>
        <div className="story-current-17" data-node-id="2551:2722" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon42} />
            </div>
          </div>
        </div>
        <div className="story-current-18" data-node-id="2551:2723" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon45} />
            </div>
          </div>
        </div>
        <div className="story-current-19" data-node-id="2551:2724" style={{ containerType: "size" }}>
          <div className="story-current-10">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon43} />
            </div>
          </div>
        </div>
        <div className="story-current-20" data-node-id="2551:2725" style={{ containerType: "size" }}>
          <div className="story-current-7">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon42} />
            </div>
          </div>
        </div>
        <div className="story-current-21" data-node-id="2551:2726" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgPolygon44} />
            </div>
          </div>
        </div>
        <div className="story-current-22" data-node-id="2551:2727" style={{ containerType: "size" }}>
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


function Component7({ className, property1 = "Default" }) {
  return (
    <div className={className || "story-current-236"} data-node-id="2772:6997" role="button" tabIndex={0} aria-label="임실필봉농악 소개" onClick={e=>e.currentTarget.classList.toggle('is-revealed')}>
<div className="story-region-hover"><ArtworkImage src="/assets/figma/oct23/2772-6999.svg"/></div>
      <div className="story-current-67" data-node-id="2772:6812" style={{ maskImage: `url("${img67033}")` }} data-name="6703_걸궁굿 걸궁패가 마을에 도착하면 나발로 신호를 보냄_임실필봉농악_국가유산청 3">
        <ArtworkImage src={img67034} />
      </div>
    </div>
  );
}


function Component8({ className, property1 = "Default" }) {
  return (
    <div className={className || "story-current-237"} data-node-id="2772:6966" role="button" tabIndex={0} aria-label="평택농악 소개" onClick={e=>e.currentTarget.classList.toggle('is-revealed')}>
<div className="story-region-hover"><ArtworkImage src="/assets/figma/oct23/2772-6968.svg"/></div>
      <div className="story-current-68" data-node-id="2772:6759" style={{ containerType: "size" }}>
        <div className="story-current-69">
          <div className="story-current-70" style={{ maskImage: `url("${img59263}")` }} data-name="5926_수문장굿-집안으로 풍물패들이 들어간다_평택농악_국가유산청 3">
            <ArtworkImage src={img59264} />
          </div>
        </div>
      </div>
    </div>
  );
}


function Component9({ className, property1 = "Default" }) {
  return (
    <div className={className || "story-current-238"} data-node-id="2772:7029" role="button" tabIndex={0} aria-label="이리농악 소개" onClick={e=>e.currentTarget.classList.toggle('is-revealed')}>
<div className="story-region-hover"><ArtworkImage src="/assets/figma/oct23/2772-7031.svg"/></div>
      <div className="story-current-71" data-node-id="2772:6844" style={{ containerType: "size" }}>
        <div className="story-current-72">
          <div className="story-current-73" style={{ maskImage: `url("${img63002}")` }} data-name="6300_질굿을 하면서 소고를 치고 있다_이리농악_국가유산청 2">
            <ArtworkImage src={img63003} />
          </div>
        </div>
      </div>
    </div>
  );
}


function Component10({ className, property1 = "Default" }) {
  return (
    <div className={className || "story-current-237"} data-node-id="2772:7057" role="button" tabIndex={0} aria-label="진주삼천포농악 소개" onClick={e=>e.currentTarget.classList.toggle('is-revealed')}>
<div className="story-region-hover"><ArtworkImage src="/assets/figma/oct23/2772-7069.svg"/></div>
      <div className="story-current-74" data-node-id="2772:6896" style={{ maskImage: `url("${img57493}")` }} data-name="5749_길놀이_진주삼천포농악_국가유산청 3">
        <ArtworkImage src={img57494} />
      </div>
    </div>
  );
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
 {slide>0 && <img className="story-flag-photo" src={'/assets/figma/story/current/'+['','d16c4.png','623b8.png'][slide]} alt="농기 사진"/>}
      <div className="story-current-76" style={{visibility:slide?'hidden':'visible',containerType:'size'}} data-node-id="2632:4729">
        <div className="story-current-77">
          <div className="story-current-8" data-name="깃대">
            <ArtworkImage src={img2} />
          </div>
        </div>
      </div>
      <div className="story-current-78" style={{visibility:slide?'hidden':'visible',containerType:'size'}} data-node-id="2632:4738">
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
 const files=['f7bbf.png','f5287.png','6635d.png','181d1.png','140b8.png'];
 return <div className={className} data-node-id="2728:2349">
  {files.map((file,i)=><img key={file} className={'story-place-photo '+(i===slide?'is-active':'')} src={assetPathPrefix+'/'+file} alt={['마당밟이','판굿','진주삼천포농악 놀이','길놀이','성주굿'][i]}/>)}
  <div className="story-place-shade"/>
  <div className="story-place-dots" role="group" aria-label="장소 사진">{files.map((file,i)=><button key={file} onClick={()=>setSlide(i)} aria-label={(i+1)+'번째 사진'} aria-pressed={i===slide}>✦</button>)}</div>
  <button className="story-place-next" onClick={()=>setSlide((slide+1)%files.length)} aria-label="다음 장소 사진"><img src={img4} alt=""/></button>
 </div>;
}

function StoryArtwork({scrollDown,navigate}) {
 const share=async()=>{try{const url=new URL('/',location.href).href;if(navigator.share)await navigator.share({title:'우리바람',url});else await navigator.clipboard.writeText(url);}catch{}};
  return (
    <div className="story-current-98" data-node-id="2271:3227" data-name="풍물 이야기">
      <div className="story-current-99" data-node-id="2658:3674">
        <div className="story-current-100" data-node-id="2658:3434" style={{ containerType: "size" }}>
          <div className="story-current-15">
            <div className="story-current-8">
              <ArtworkImage src={imgRectangle22} />
            </div>
          </div>
        </div>
        <div className="story-current-101" data-node-id="2658:3416">
          <p className="story-current-102">
            <span className="story-current-103">{`참고   `}</span>
            <span className="story-current-104">{`한국민족문화대백과사전 「농악」·  국립국악원 국악사전 「임실필봉농악」·  필봉문화촌`}</span>
          </p>
          <p className="story-current-105">
            <span className="story-current-103">사진 출처</span>
            <span className="story-current-104">{`   국가유산청 · 고창농악보존회`}</span>
          </p>
        </div>
        <p className="story-current-106" data-node-id="2658:3419">{`우리바람  ·  Our Wind, Our Wish`}</p>
        <p className="story-current-107" data-node-id="2658:3417">
          © 2026 Choi Soo Myeong
        </p>
        <div className="story-current-108" data-node-id="2658:3418">
          <p className="story-current-102">
            <span className="story-current-103">기획 및 디자인</span>
            <span className="story-current-104">{`   Choi Soo Myeong`}</span>
          </p>
          <p className="story-current-105">
            <span className="story-current-103">{`개발 `}</span>
            <span className="story-current-104">{` Choi Ji Sun`}</span>
          </p>
        </div>
      </div>
      <div className="story-current-109" data-node-id="2728:2500" data-name="cskkkk-samulnori-7846017 1">
        <ArtworkImage src={imgCskkkkSamulnori78460171} />
      </div>
      <div className="story-current-111" data-node-id="2750:2239" style={{ backgroundImage: "linear-gradient(180deg, rgb(255, 95, 247) 58.654%, rgba(255, 95, 247, 0.814) 72.596%, rgba(255, 95, 247, 0.528) 85.577%, rgba(255, 95, 247, 0) 100%)" }} />
      <Component16 className="story-current-112" />
      <div className="story-current-113" data-node-id="2722:2233" />
      <Component15 className="story-current-114" />
      <p className="story-current-115" data-node-id="2469:2694">
        방금 함께한 놀이,
        <br aria-hidden />
        풍물놀이에서 시작됐어요
      </p>
      <p className="story-current-116" data-node-id="2615:4630">
        바람을 적었던 깃발
      </p>
      <div className="story-current-117" data-node-id="2566:977">
        <p className="story-current-118">
          <span className="story-current-119">{`사람들이 모여 악기를 연주하고 춤추는 풍물놀이는 `}</span>
          <span className="story-current-120">‘농악’</span>
          <span className="story-current-119">이라고도 불러요</span>
        </p>
        <p className="story-current-121">농사가 잘되고 마을이 평안하기를 바라며 함께했지요</p>
        <p>
          <span className="story-current-119">{`이렇게 사람들이 모여 어울리는 자리를 `}</span>
          <span className="story-current-120">‘판’</span>
          <span className="story-current-119">이라고 해요</span>
        </p>
      </div>
      <div className="story-current-122" data-node-id="2627:4728">
        <p className="story-current-123">풍물놀이에서 볼 수 있는 깃발 중 하나예요</p>
        <p className="story-current-124">
          <span className="story-current-125">[농기]</span>
          <span className="story-current-119">라고 부르는 이것은, 농사를 소중히 여기는 글귀나</span>
        </p>
        <p className="story-current-123">마을을 나타내는 표시를 담았어요</p>
        <p className="story-current-123">​</p>
        <p className="story-current-126">우리바람에서는 이 농기에 우리들의 바람을 담아 봤어요</p>
      </div>
      <div className="story-current-127" role="button" tabIndex={0} aria-label="다음 이야기" onClick={scrollDown} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();scrollDown();}}} data-node-id="2620:4633">
        <div className="story-current-128">
          <div className="story-current-129" data-name="<">
            <ArtworkImage src={img5} />
          </div>
        </div>
      </div>
      <div className="story-current-130" data-node-id="2654:2362" />
      <div className="story-current-131" data-node-id="2785:7717" />
      <p className="story-current-132" data-node-id="2654:2378">
        함께 하는 사람들
      </p>
      <div className="story-current-133" data-node-id="2728:2325" style={{ containerType: "size" }}>
        <div className="story-current-134">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector19} />
          </div>
        </div>
      </div>
      <div className="story-current-135" data-node-id="2658:3328">
        <p className="story-current-136">길에서도,</p>
        <p className="story-current-136">논에서도,</p>
        <p className="story-current-137">마당에서도</p>
      </div>
      <p className="story-current-138" data-node-id="2658:3331">
        지역마다 다양한 소리들
      </p>
      <div className="story-current-139" data-node-id="2658:3343">
        <p className="story-current-136">서로의 안녕을 빌던 마음을</p>
        <p className="story-current-137">화면 속으로</p>
      </div>
      <div className="story-current-140" data-node-id="2654:2379">
        <p className="story-current-141">
          <span className="story-current-119">{`풍물놀이를 하는 무리를 `}</span>
          <span className="story-current-125">‘풍물패’</span>
          <span className="story-current-119">{`, 그 구성원을 `}</span>
          <span className="story-current-125">‘치배’</span>
          <span className="story-current-119">{` 라고 해요`}</span>
        </p>
        <p className="story-current-142">악기를 치는 사람뿐 아니라 깃발을 들거나 여러 인물로 분장해 노는 사람도 함께 해요</p>
        <p className="story-current-143">
          <span className="story-current-144">{`또한, 관람하는 사람들 또한 `}</span>
          <span className="story-current-145">함께 즐기는 것</span>
          <span className="story-current-144">이 풍물놀이의 매력이에요</span>
        </p>
      </div>
      <div className="story-current-146" data-node-id="2658:3329">
        <p className="story-current-121">풍물놀이는 하는 장소와 목적에 따라</p>
        <p className="story-current-121">모습과 이름이 달라요. 풍물에서 ‘굿’은</p>
        <p className="story-current-121">복을 비는 의식뿐 아니라</p>
        <p className="story-current-119">연주와 놀이를 가리키기도 해요</p>
      </div>
      <div className="story-current-147" data-node-id="2658:3332">
        <p className="story-current-121">여러 지역에서 저마다의 모습으로 이어져 왔어요</p>
        <p className="story-current-118">
          <span className="story-current-119">{`연주하는 리듬인 `}</span>
          <span className="story-current-125">’가락’</span>
          <span className="story-current-119">도, 옷차림과 춤도 조금씩 달라요</span>
        </p>
        <p>
          <span className="story-current-119">{`그 중에서도 `}</span>
          <span className="story-current-125">국가무형문화재 제11호</span>
          <span className="story-current-119">로 지정된 5가지 농악이에요.</span>
        </p>
      </div>
      <div className="story-current-148" data-node-id="2658:3350">
        <p className="story-current-121">농기에 소원을 쓰고, 악기를 고르고, 몸을 움직여 소리를 내는 과정을</p>
        <p className="story-current-119">누구나 쉽게 참여할 수 있도록 새롭게 구성했어요</p>
      </div>
      <p className="story-current-149" data-node-id="2796:2887">
        다음에 풍물놀이를 만나면, 조금 더 반갑게,
        <br aria-hidden />
        우리바람에서의 짧은 경험이
        <br aria-hidden />
        풍물놀이를 더 알고 싶은 마음으로 이어지길 바라요
      </p>
      <p className="story-current-150" data-node-id="2658:3333">
        우리바람은 임실필봉농악을 바탕으로 하고 있어요
      </p>
      <div className="story-current-151" data-node-id="2654:2491">
        <div className="story-current-152">
          <div className="story-current-153" data-name="소고">
            <div className="story-current-154" data-node-id="I2654:2491;2199:2886" data-name="소고 그룹">
              <div className="story-current-155" data-node-id="I2654:2491;2142:3723" style={{ containerType: "size" }}>
                <div className="story-current-156">
                  <div className="story-current-8" data-name="소고">
                    <ArtworkImage src={img6} />
                  </div>
                </div>
              </div>
              <div className="story-current-157" data-node-id="I2654:2491;2142:3738" style={{ containerType: "size" }}>
                <div className="story-current-158">
                  <div className="story-current-8" data-name="소고채">
                    <div className="story-current-159">
                      <ArtworkImage src={img7} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="story-current-160" data-node-id="2654:2693">
        <div className="story-current-161">
          <div className="story-current-162" data-name="장구">
            <div className="story-current-163" data-node-id="I2654:2693;2199:3035" data-name="장구 그룹">
              <ArtworkImage src={img8} />
            </div>
          </div>
        </div>
      </div>
      <div className="story-current-164" data-node-id="2658:2802">
        <div className="story-current-165">
          <div className="story-current-166" data-name="꽹과리">
            <div className="story-current-167" data-node-id="I2658:2802;2658:3236">
              <div className="story-current-168" data-node-id="I2658:2802;2658:3151" data-name="소고">
                <ArtworkImage src={img9} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="story-current-169" data-node-id="2658:3346">
        <p className="story-current-121">우리바람은 임실필봉농악의 ‘마당밟이’를 참고해 만들었어요</p>
        <p className="story-current-121">집집마다 찾아가 평안을 빌던 마음을,</p>
        <p className="story-current-119">각자의 소원을 담고 함께 연주하는 경험으로 옮겼어요</p>
      </div>
      <Component14 className="story-current-170" />
      <div className="story-current-171" data-node-id="2658:3375">
        <div className="story-current-172">
          <div className="story-current-173" data-name="음표2">
            <ArtworkImage src={img10} />
          </div>
        </div>
      </div>
      <div className="story-current-174" data-node-id="2658:3697">
        <div className="story-current-175">
          <div className="story-current-173" data-name="음표2">
            <ArtworkImage src={img11} />
          </div>
        </div>
      </div>
      <div className="story-current-176" data-node-id="2658:3387">
        <div className="story-current-177">
          <div className="story-current-178" data-name="음표3">
            <ArtworkImage src={img12} />
          </div>
        </div>
      </div>
      <div className="story-current-179" data-node-id="2658:3706">
        <div className="story-current-180">
          <div className="story-current-181" data-name="음표3">
            <ArtworkImage src={img13} />
          </div>
        </div>
      </div>
      <Component13 className="story-current-182" />
      <Component13 className="story-current-183" property1="Variant2" />
      <div className="story-current-184" data-node-id="2658:3402" style={{ containerType: "size" }}>
        <div className="story-current-185">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector20} />
          </div>
        </div>
      </div>
      <div className="story-current-186" data-node-id="2658:3404" style={{ containerType: "size" }}>
        <div className="story-current-187">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector21} />
          </div>
        </div>
      </div>
      <div className="story-current-188" data-node-id="2658:3405" style={{ containerType: "size" }}>
        <div className="story-current-189">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector22} />
          </div>
        </div>
      </div>
      <div className="story-current-190" data-node-id="2658:3684" style={{ containerType: "size" }}>
        <div className="story-current-191">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector23} />
          </div>
        </div>
      </div>
      <div className="story-current-192" data-node-id="2658:3685" style={{ containerType: "size" }}>
        <div className="story-current-191">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector24} />
          </div>
        </div>
      </div>
      <div className="story-current-193" data-node-id="2658:3686" style={{ containerType: "size" }}>
        <div className="story-current-194">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector25} />
          </div>
        </div>
      </div>
      <div className="story-current-195" data-node-id="2658:3687" style={{ containerType: "size" }}>
        <div className="story-current-191">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector26} />
          </div>
        </div>
      </div>
      <div className="story-current-196" data-node-id="2658:3406" style={{ containerType: "size" }}>
        <div className="story-current-197">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector27} />
          </div>
        </div>
      </div>
      <div className="story-current-198" data-node-id="2752:2359" style={{ containerType: "size" }}>
        <div className="story-current-199">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector28} />
          </div>
        </div>
      </div>
      <p className="story-current-200" data-node-id="2658:3435">
        바람을 싣고, 소리 따라 저 멀리
      </p>
      <Component12 className="story-current-201" />
      <div className="story-current-202" data-node-id="2728:2321" style={{ containerType: "size" }}>
        <div className="story-current-134">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector29} />
          </div>
        </div>
      </div>
      <div className="story-current-203" data-node-id="2728:2328" style={{ containerType: "size" }}>
        <div className="story-current-134">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector29} />
          </div>
        </div>
      </div>
      <div className="story-current-204" data-node-id="2728:2334" style={{ containerType: "size" }}>
        <div className="story-current-134">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector30} />
          </div>
        </div>
      </div>
      <div className="story-current-205" data-node-id="2728:2323" style={{ containerType: "size" }}>
        <div className="story-current-134">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector31} />
          </div>
        </div>
      </div>
      <div className="story-current-206" data-node-id="2728:2324" style={{ containerType: "size" }}>
        <div className="story-current-134">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector32} />
          </div>
        </div>
      </div>
      <div className="story-current-207" data-node-id="2728:2326" style={{ containerType: "size" }}>
        <div className="story-current-208">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector33} />
          </div>
        </div>
      </div>
      <div className="story-current-209" data-node-id="2785:7718" style={{ containerType: "size" }}>
        <div className="story-current-208">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector33} />
          </div>
        </div>
      </div>
      <div className="story-current-210" data-node-id="2785:7719" style={{ containerType: "size" }}>
        <div className="story-current-208">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector34} />
          </div>
        </div>
      </div>
      <div className="story-current-211" data-node-id="2785:7720" style={{ containerType: "size" }}>
        <div className="story-current-208">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector35} />
          </div>
        </div>
      </div>
      <div className="story-current-212" data-node-id="2785:7724" style={{ containerType: "size" }}>
        <div className="story-current-208">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector35} />
          </div>
        </div>
      </div>
      <div className="story-current-213" data-node-id="2785:7725" style={{ containerType: "size" }}>
        <div className="story-current-208">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector36} />
          </div>
        </div>
      </div>
      <div className="story-current-214" data-node-id="2785:7721" style={{ containerType: "size" }}>
        <div className="story-current-208">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector37} />
          </div>
        </div>
      </div>
      <div className="story-current-215" data-node-id="2785:7722" style={{ containerType: "size" }}>
        <div className="story-current-208">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector37} />
          </div>
        </div>
      </div>
      <div className="story-current-216" data-node-id="2785:7723" style={{ containerType: "size" }}>
        <div className="story-current-208">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector38} />
          </div>
        </div>
      </div>
      <div className="story-current-217" data-node-id="2728:2327" style={{ containerType: "size" }}>
        <div className="story-current-208">
          <div className="story-current-8" data-name="Vector">
            <ArtworkImage src={imgVector39} />
          </div>
        </div>
      </div>
      <div className="story-current-218" data-node-id="2745:2248">
        <div className="story-current-81">
          <div className="story-current-219" />
        </div>
      </div>
      <Component11 className="story-current-220" />
      <div className="story-current-221" data-node-id="2772:7131">
        <div className="story-current-222">
          <div className="story-current-223" data-name="강릉" role="button" tabIndex={0} aria-label="강릉농악 소개" onClick={e=>e.currentTarget.classList.toggle('is-revealed')}>
<div className="story-region-hover"><ArtworkImage src="/assets/figma/oct23/2772-6973.svg"/></div>
            <div className="story-current-224" data-node-id="I2772:7131;2772:6870" style={{ maskImage: `url("${img65772}")` }} data-name="6577_팔도진놀이_강릉농악_국가유산청 2">
              <ArtworkImage src={img65773} />
            </div>
          </div>
        </div>
      </div>
      <Component10 className="story-current-225" />
      <Component9 className="story-current-226" />
      <Component8 className="story-current-227" />
      <Component7 className="story-current-228" />
      <div className="story-current-229 story-footer-action" role="button" tabIndex={0} aria-label="처음으로" onClick={()=>navigate('/')} onKeyDown={e=>{if(e.key==='Enter'){navigate('/');}}}><Component1 className="story-footer-art"/></div>
      <div className="story-current-230 story-footer-action" role="button" tabIndex={0} aria-label="소문내기" onClick={()=>share()} onKeyDown={e=>{if(e.key==='Enter'){share();}}}><Component3 className="story-footer-art"/></div>
      <div className="story-current-231 story-footer-action" role="button" tabIndex={0} aria-label="얼쑤 한컷" onClick={()=>navigate('/photo')} onKeyDown={e=>{if(e.key==='Enter'){navigate('/photo');}}}><Component6 className="story-footer-art"/></div>
    </div>
  );
}
const storyStops=[0,2434,3890.727,6152.895,7715,11500,13600,15807];
export default function StoryPage(){
 const ref=useRef(null),shellRef=useRef(null),navigate=useNavigate();
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
 return <div ref={shellRef} className="story-shell"><main ref={ref} className="story-page" aria-label="풍물 이야기" tabIndex={0} style={{width:2560*scale,height:1440*scale,'--story-scale':scale}}>
  <StoryHeader scrollRef={ref}/>
  <div className="story-brand-anchor"><button className="story-brand" onClick={()=>navigate('/')} aria-label="우리바람 처음으로"><img src="/assets/figma/story/oct23/d4a08.svg" alt="우리바람"/></button></div>
  <div className="story-document" style={{height:15807*scale}}>
   <div className="story-artwork" style={{transform:`scale(${scale})`}}><StoryArtwork navigate={navigate} scrollDown={() => ref.current.scrollTo({top:2434*scale,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})}/></div>
   {storyStops.slice(0,-1).map((top,i)=><section key={top} className="story-section" aria-label={['풍물놀이 소개','바람을 담은 농기','함께 하는 사람들','다양한 장소','지역마다 다양한 소리들','우리바람','마무리'][i]} style={{top:top*scale,height:(storyStops[i+1]-top)*scale}}/>)}
   {snapStops.map(top=><div key={top} className="story-snap-point" aria-hidden="true" style={{top:top*scale}}/>)}
  </div>
 </main></div>;
}
