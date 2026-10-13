import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './StoryPage.css';

// Figma 2570:2326. Text stays editable; artwork uses local original SVGs.
function StoryAsset({file}) {
  const ref = useRef(null);
  useEffect(() => {
    const img = ref.current, parent = img.parentElement;
    const resize = () => { if(img.naturalWidth) img.style.transform = `scale(${parent.clientWidth / img.naturalWidth}, ${parent.clientHeight / img.naturalHeight})`; };
    img.addEventListener('load', resize);
    const observer = new ResizeObserver(resize); observer.observe(parent); resize();
    return () => { observer.disconnect(); img.removeEventListener('load', resize); };
  }, [file]);
  return <img ref={ref} className="story-original-asset" src={`/assets/figma/story/${file}`} alt="" draggable="false"/>;
}
function Component01({navigate, scrollDown}) {
  return (
    <div className="story-style-1" data-node-id="2570:2327" data-name="01 · 소리가 모이면">
      <div className="story-style-2" data-node-id="2570:2328" data-name="Frame">
        <p className="story-style-3" data-node-id="2570:2329">
          우리바람
        </p>
        <p className="story-style-4" data-node-id="2570:2330">
          풍물 이야기
        </p>
        <p className="story-style-5" data-node-id="2570:2331" role="button" tabIndex={0} onClick={() => navigate('/')} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate('/'); } }}>{`처음으로  ↗`}</p>
      </div>
      <div className="story-style-6" data-node-id="2570:2332" data-name="Frame">
        <div className="story-style-7" data-node-id="2570:2333" role="heading" aria-level={1}>
          <p className="story-style-8">함께 치고, 춤추고,</p>
          <p className="story-style-9">소원을 빌던 놀이</p>
        </div>
        <div className="story-style-10" data-node-id="2570:2334">
          <p className="story-style-11">사람들이 모여 악기를 연주하고 춤추는 풍물놀이, ‘농악’이라고도 불러요.</p>
          <p className="story-style-11">농사가 잘되고 마을이 평안하기를 바라며 함께했지요.</p>
          <p className="story-style-12">이렇게 사람들이 모여 어울리는 자리를 ‘판’이라고 해요.</p>
        </div>
      </div>
      <div className="story-style-13" data-node-id="2570:2335" data-name="원본 그래픽 / janggu">
        <StoryAsset file="c026b.svg"/>
      </div>
      <div className="story-style-14" data-node-id="2570:2378" data-name="원본 그래픽 / gong">
        <div className="story-style-15" data-node-id="2570:2379" data-name="Group">
          <StoryAsset file="7ab6e.svg"/>
        </div>
        <div className="story-style-16" data-node-id="2570:2390" style={{ containerType: "size" }}>
          <div className="story-style-17">
            <div className="story-style-18" data-name="꽹과리채">
              <StoryAsset file="f2398.svg"/>
            </div>
          </div>
        </div>
      </div>
      <div className="story-style-19" data-node-id="2570:2394" data-name="원본 그래픽 / buk">
        <StoryAsset file="04af0.svg"/>
      </div>
      <div className="story-style-20" data-node-id="2570:2419" data-name="원본 그래픽 / sogo">
        <StoryAsset file="a5771.svg"/>
      </div>
      <p className="story-style-21" data-node-id="2570:2434" role="button" tabIndex={0} onClick={() => scrollDown()} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); scrollDown(); } }}>{`풍물놀이 알아보기  ↓`}</p>
    </div>
  );
}


function Component02({navigate, scrollDown}) {
  return (
    <div className="story-style-22" data-node-id="2570:2435" data-name="02 · 바람을 담다">
      <div className="story-style-23" data-node-id="2570:2436" data-name="Frame">
        <p className="story-style-24" data-node-id="2570:2437">{`01  /  소원과 깃발`}</p>
        <div className="story-style-25" data-node-id="2570:2438" role="heading" aria-level={2}>
          <p className="story-style-11">소원을 적었던</p>
          <p className="story-style-12">깃발, 기억하나요?</p>
        </div>
        <div className="story-style-26" data-node-id="2570:2439">
          <p className="story-style-11">풍물놀이에서 볼 수 있는 깃발 중 하나가 ‘농기’예요.</p>
          <p className="story-style-11">농사를 소중히 여기는 글귀나 마을을 나타내는 표시를 담았지요.</p>
          <p className="story-style-12">우리바람에서는 이 농기에 여러분의 소원을 담아 보았어요.</p>
        </div>
      </div>
      <p className="story-style-27" data-node-id="2570:2440">
        농기에 개인의 소원을 쓰는 것은 우리바람에서 새롭게 만든 체험이에요.
      </p>
      <div className="story-style-28" data-node-id="2570:2441" style={{ containerType: "size" }}>
        <div className="story-style-29">
          <div className="story-style-18" data-name="원본 그래픽 / flag">
            <StoryAsset file="8a126.svg"/>
          </div>
        </div>
      </div>
      <div className="story-style-30" data-node-id="2570:2470">
        <p className="story-style-31">무</p>
        <p className="story-style-31">사</p>
        <p className="story-style-31">졸</p>
        <p className="story-style-32">업</p>
      </div>
    </div>
  );
}


function Component03({navigate, scrollDown}) {
  return (
    <div className="story-style-33" data-node-id="2570:2471" data-name="03 · 이 판의 소리">
      <div className="story-style-34" data-node-id="2570:2472" data-name="Frame">
        <p className="story-style-35" data-node-id="2570:2473">{`02  /  함께하는 사람들`}</p>
        <p className="story-style-36" data-node-id="2570:2474" role="heading" aria-level={2}>
          함께 연주하는 사람들은?
        </p>
        <div className="story-style-37" data-node-id="2570:2475">
          <p className="story-style-11">풍물놀이를 하는 무리를 ‘풍물패’, 그 구성원을 ‘치배’라고 불러요.</p>
          <p className="story-style-12">악기를 치는 사람뿐 아니라 깃발을 들거나 여러 인물로 분장해 노는 사람도 함께해요.</p>
        </div>
      </div>
      <div className="story-style-38" data-node-id="2570:2476" data-name="원본 그래픽 / gong">
        <div className="story-style-15" data-node-id="2570:2477" data-name="Group">
          <StoryAsset file="be9a3.svg"/>
        </div>
        <div className="story-style-16" data-node-id="2570:2488" style={{ containerType: "size" }}>
          <div className="story-style-17">
            <div className="story-style-18" data-name="꽹과리채">
              <StoryAsset file="307a1.svg"/>
            </div>
          </div>
        </div>
      </div>
      <p className="story-style-39" data-node-id="2570:2492">
        꽹과리 · 쇠
      </p>
      <div className="story-style-40" data-node-id="2570:2493" data-name="원본 그래픽 / janggu">
        <StoryAsset file="db8c6.svg"/>
      </div>
      <p className="story-style-41" data-node-id="2570:2536">
        장구
      </p>
      <div className="story-style-42" data-node-id="2570:2537" data-name="원본 그래픽 / buk">
        <StoryAsset file="2e38d.svg"/>
      </div>
      <p className="story-style-43" data-node-id="2570:2562">
        북
      </p>
      <div className="story-style-44" data-node-id="2570:2563" data-name="원본 그래픽 / jing">
        <StoryAsset file="13d99.svg"/>
      </div>
      <p className="story-style-45" data-node-id="2570:2576">
        징
      </p>
      <div className="story-style-46" data-node-id="2570:2577" data-name="원본 그래픽 / sogo">
        <StoryAsset file="9378f.svg"/>
      </div>
      <p className="story-style-47" data-node-id="2570:2592">
        소고
      </p>
      <div className="story-style-48" data-node-id="2570:2593" data-name="Frame">
        <p className="story-style-49" data-node-id="2570:2594">
          ‘쇠치배’는 꽹과리를 치는 사람, ‘장구잽이’는 장구를 치는 사람이에요.
        </p>
        <p className="story-style-50" data-node-id="2570:2595">
          처음에 불었던 긴 나팔 ‘나발’은 사람들을 모으는 신호로 쓰이기도 해요.
        </p>
      </div>
    </div>
  );
}


function Component04({navigate, scrollDown}) {
  return (
    <div className="story-style-22" data-node-id="2570:2596" data-name="04 · 길과 집과 마당">
      <div className="story-style-51" data-node-id="2570:2597" data-name="Frame">
        <p className="story-style-52" data-node-id="2570:2598">{`03  /  함께 노는 여러 모습`}</p>
        <p className="story-style-53" data-node-id="2570:2599" role="heading" aria-level={2}>
          길에서도, 집에서도, 마당에서도
        </p>
        <div className="story-style-54" data-node-id="2570:2600">
          <p className="story-style-11">풍물놀이는 하는 장소와 목적에 따라 모습과 이름이 달라요.</p>
          <p className="story-style-12">풍물에서 ‘굿’은 복을 비는 의식뿐 아니라 연주와 놀이를 가리키기도 해요.</p>
        </div>
      </div>
      <div className="story-style-55" data-node-id="2570:2601" data-name="Frame">
        <div className="story-style-56" data-node-id="2570:2602" data-name="Frame">
          <div className="story-style-57" data-node-id="2570:2603" data-name="Frame">
            <div className="story-style-58" data-node-id="2570:2604" data-name="원본 그래픽 / gong">
              <div className="story-style-15" data-node-id="2570:2605" data-name="Group">
                <StoryAsset file="8f44e.svg"/>
              </div>
              <div className="story-style-16" data-node-id="2570:2616" style={{ containerType: "size" }}>
                <div className="story-style-17">
                  <div className="story-style-18" data-name="꽹과리채">
                    <StoryAsset file="b53d3.svg"/>
                  </div>
                </div>
              </div>
            </div>
            <div className="story-style-59" data-node-id="2570:2620" data-name="원본 그래픽 / janggu">
              <StoryAsset file="46bf7.svg"/>
            </div>
            <div className="story-style-60" data-node-id="2570:2663" data-name="원본 그래픽 / buk">
              <StoryAsset file="e5c09.svg"/>
            </div>
            <div className="story-style-61" data-node-id="2570:2688" data-name="원본 그래픽 / jing">
              <StoryAsset file="6c2e6.svg"/>
            </div>
          </div>
          <p className="story-style-62" data-node-id="2570:2701">
            길을 따라 연주하는
          </p>
          <p className="story-style-63" data-node-id="2570:2702">
            길굿
          </p>
          <div className="story-style-64" data-node-id="2570:2703">
            <p className="story-style-11">악기를 치며 길을 걸어가요.</p>
            <p className="story-style-11">다음 장소로 이동하는 동안에도</p>
            <p className="story-style-12">연주는 이어져요.</p>
          </div>
        </div>
        <div className="story-style-56" data-node-id="2570:2704" data-name="Frame">
          <div className="story-style-57" data-node-id="2570:2705" data-name="Frame">
            <div className="story-style-65" data-node-id="2570:2706" data-name="원본 그래픽 / gong">
              <div className="story-style-15" data-node-id="2570:2707" data-name="Group">
                <StoryAsset file="ec58e.svg"/>
              </div>
              <div className="story-style-16" data-node-id="2570:2718" style={{ containerType: "size" }}>
                <div className="story-style-17">
                  <div className="story-style-18" data-name="꽹과리채">
                    <StoryAsset file="ac3ab.svg"/>
                  </div>
                </div>
              </div>
            </div>
            <div className="story-style-66" data-node-id="2570:2722" data-name="원본 그래픽 / janggu">
              <StoryAsset file="88f72.svg"/>
            </div>
            <div className="story-style-67" data-node-id="2570:2765" data-name="원본 그래픽 / buk">
              <StoryAsset file="a8b3d.svg"/>
            </div>
            <div className="story-style-68" data-node-id="2570:2790" data-name="원본 그래픽 / jing">
              <StoryAsset file="3f593.svg"/>
            </div>
          </div>
          <p className="story-style-62" data-node-id="2570:2803">
            집집마다 복을 비는
          </p>
          <p className="story-style-63" data-node-id="2570:2804">
            마당밟이
          </p>
          <div className="story-style-64" data-node-id="2570:2805">
            <p className="story-style-11">집을 찾아가 악기를 치며</p>
            <p className="story-style-11">나쁜 일이 물러가고 가족들이</p>
            <p className="story-style-12">무탈하게 지내기를 빌어요.</p>
          </div>
        </div>
        <div className="story-style-56" data-node-id="2570:2806" data-name="Frame">
          <div className="story-style-57" data-node-id="2570:2807" data-name="Frame">
            <div className="story-style-69" data-node-id="2570:2808" data-name="원본 그래픽 / gong">
              <div className="story-style-15" data-node-id="2570:2809" data-name="Group">
                <StoryAsset file="c9c49.svg"/>
              </div>
              <div className="story-style-16" data-node-id="2570:2820" style={{ containerType: "size" }}>
                <div className="story-style-17">
                  <div className="story-style-18" data-name="꽹과리채">
                    <StoryAsset file="261cb.svg"/>
                  </div>
                </div>
              </div>
            </div>
            <div className="story-style-70" data-node-id="2570:2824" data-name="원본 그래픽 / janggu">
              <StoryAsset file="64914.svg"/>
            </div>
            <div className="story-style-71" data-node-id="2570:2867" data-name="원본 그래픽 / buk">
              <StoryAsset file="4271e.svg"/>
            </div>
            <div className="story-style-72" data-node-id="2570:2892" data-name="원본 그래픽 / jing">
              <StoryAsset file="3f593.svg"/>
            </div>
          </div>
          <p className="story-style-62" data-node-id="2570:2905">
            한자리에 모여 솜씨를 펼치는
          </p>
          <p className="story-style-63" data-node-id="2570:2906">
            판굿
          </p>
          <div className="story-style-64" data-node-id="2570:2907">
            <p className="story-style-11">넓은 마당에 모여 연주하고 춤춰요.</p>
            <p className="story-style-11">여럿이 대형을 바꾸기도 하고,</p>
            <p className="story-style-12">한 사람씩 솜씨를 보여주기도 해요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


function Component05({navigate, scrollDown}) {
  return (
    <div className="story-style-73" data-node-id="2570:2908" data-name="05 · 옷차림과 복색">
      <div className="story-style-74" data-node-id="2570:2909" data-name="Frame">
        <p className="story-style-75" data-node-id="2570:2910">{`04  /  연주할 때 입는 옷`}</p>
        <p className="story-style-76" data-node-id="2570:2911" role="heading" aria-level={2}>
          옷차림에도 볼거리가 있어요
        </p>
        <div className="story-style-77" data-node-id="2570:2912">
          <p className="story-style-78">풍물놀이에서 입는 옷과 갖추는 차림새를 ‘복색’이라고 해요.</p>
          <p className="story-style-79">지역과 맡은 역할에 따라 옷의 색이나 머리에 쓰는 것이 달라요.</p>
        </div>
      </div>
      <p className="story-style-80" data-node-id="2570:2913">
        임실필봉농악의 옷차림을 예로 보면
      </p>
      <div className="story-style-81" data-node-id="2570:2914" data-name="Frame">
        <div className="story-style-82" data-node-id="2570:2915" data-name="Frame">
          <div className="story-style-83" data-node-id="2570:2916" data-name="Rectangle" />
          <p className="story-style-84" data-node-id="2570:2917">
            바지저고리와 조끼
          </p>
          <div className="story-style-85" data-node-id="2570:2918">
            <p className="story-style-78">흰 바지저고리에 남색 조끼를 입는</p>
            <p className="story-style-79">차림이 기본이에요.</p>
          </div>
        </div>
        <div className="story-style-82" data-node-id="2570:2919" data-name="Frame">
          <div className="story-style-86" data-node-id="2570:2920" data-name="Rectangle" />
          <p className="story-style-84" data-node-id="2570:2921">
            몸에 두르는 삼색띠
          </p>
          <div className="story-style-85" data-node-id="2570:2922">
            <p className="story-style-78">세 가지 색의 띠를 몸에 둘러요.</p>
            <p className="story-style-79">옷 위로 색이 선명하게 드러나지요.</p>
          </div>
        </div>
        <div className="story-style-82" data-node-id="2570:2923" data-name="Frame">
          <div className="story-style-87" data-node-id="2570:2924" data-name="Rectangle" />
          <p className="story-style-84" data-node-id="2570:2925">
            머리에 쓰는 고깔과 상모
          </p>
          <div className="story-style-85" data-node-id="2570:2926">
            <p className="story-style-78">고깔은 위가 뾰족한 모자예요.</p>
            <p className="story-style-79">상모는 머리 움직임으로 장식을 돌려요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


function Component06({navigate, scrollDown}) {
  return (
    <div className="story-style-88" data-node-id="2570:2927" data-name="06 · 지역마다 다른 풍물">
      <div className="story-style-89" data-node-id="2570:2928" data-name="Frame">
        <p className="story-style-90" data-node-id="2570:2929">{`05  /  지역마다 다른 모습`}</p>
        <div className="story-style-91" data-node-id="2570:2930" role="heading" aria-level={2}>
          <p className="story-style-11">사는 곳이 다르면,</p>
          <p className="story-style-12">소리도 달라져요</p>
        </div>
        <div className="story-style-92" data-node-id="2570:2931">
          <p className="story-style-11">풍물놀이는 여러 지역에서 저마다의 모습으로 이어져 왔어요.</p>
          <p className="story-style-12">연주하는 리듬인 ‘가락’도, 옷차림과 춤도 조금씩 달라요.</p>
        </div>
      </div>
      <div className="story-style-93" data-node-id="2570:2932" data-name="원본 그래픽 / janggu">
        <StoryAsset file="a8cf7.svg"/>
      </div>
      <div className="story-style-94" data-node-id="2570:2975" data-name="Frame">
        <p className="story-style-95" data-node-id="2570:2976">
          그중 전북 임실의 필봉마을에서 이어 온 풍물놀이가
        </p>
        <p className="story-style-96" data-node-id="2570:2977">
          ‘임실필봉농악’이에요.
        </p>
      </div>
    </div>
  );
}


function Component07({navigate, scrollDown}) {
  return (
    <div className="story-style-22" data-node-id="2570:2978" data-name="07 · 우리바람과 마당밟이">
      <div className="story-style-97" data-node-id="2570:2979" data-name="Frame">
        <p className="story-style-98" data-node-id="2570:2980">{`06  /  전통에서 우리바람으로`}</p>
        <div className="story-style-99" data-node-id="2570:2981" role="heading" aria-level={2}>
          <p className="story-style-78">서로의 안녕을 빌던 마음을,</p>
          <p className="story-style-79">화면 속으로</p>
        </div>
        <div className="story-style-100" data-node-id="2570:2982">
          <p className="story-style-78">우리바람은 임실필봉농악의 ‘마당밟이’를 참고해 만들었어요.</p>
          <p className="story-style-78">집집마다 찾아가 평안을 빌던 마음을,</p>
          <p className="story-style-79">각자의 소원을 담고 함께 연주하는 경험으로 옮겼어요.</p>
        </div>
        <div className="story-style-101" data-node-id="2570:2983">
          <p className="story-style-78">농기에 소원을 쓰고, 악기를 고르고, 몸을 움직여 소리를 내는 과정은</p>
          <p className="story-style-79">누구나 쉽게 참여할 수 있도록 새롭게 구성했어요.</p>
        </div>
      </div>
      <div className="story-style-102" data-node-id="2570:2984" style={{ containerType: "size" }}>
        <div className="story-style-29">
          <div className="story-style-18" data-name="원본 그래픽 / flag">
            <StoryAsset file="1f280.svg"/>
          </div>
        </div>
      </div>
      <div className="story-style-103" data-node-id="2570:3013">
        <p className="story-style-31">무</p>
        <p className="story-style-31">사</p>
        <p className="story-style-31">졸</p>
        <p className="story-style-32">업</p>
      </div>
      <p className="story-style-104" data-node-id="2570:3014">
        전통의 절차를 그대로 재현하기보다, 함께 소원을 빌고 어울리는 마음을 전하고 싶었어요.
      </p>
    </div>
  );
}


function Component08({navigate, scrollDown}) {
  return (
    <div className="story-style-105" data-node-id="2570:3015" data-name="08 · 다시 연주하기">
      <div className="story-style-106" data-node-id="2570:3016" data-name="Frame">
        <p className="story-style-107" data-node-id="2570:3017" role="heading" aria-level={2}>
          이제, 다시 함께 놀아볼까요?
        </p>
        <p className="story-style-108" data-node-id="2570:3018">
          조금 더 익숙해진 악기와 이름들을 떠올리며 한 번 더 연주해 보세요.
        </p>
      </div>
      <div className="story-style-109" data-node-id="2570:3019" data-name="우리바람 / 이야기 버튼" role="button" tabIndex={0} onClick={() => navigate('/instruments')} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate('/instruments'); } }}>
        <p className="story-style-110" data-node-id="I2570:3019;132:6">
          다시 연주하기 ↗
        </p>
      </div>
      <div className="story-style-111" data-node-id="2570:3020" data-name="우리바람 / 이야기 버튼" role="button" tabIndex={0} onClick={() => window.open('https://www.youtube.com/results?search_query=국립국악원+임실필봉농악', '_blank', 'noopener,noreferrer')} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.open('https://www.youtube.com/results?search_query=국립국악원+임실필봉농악', '_blank', 'noopener,noreferrer'); } }}>
        <p className="story-style-110" data-node-id="I2570:3020;132:6">
          실제 풍물 보기 ↗
        </p>
      </div>
      <div className="story-style-112" data-node-id="2570:3021">
        <p className="story-style-11">{`우리바람  ·  Our Wind, Our Wish`}</p>
        <p className="story-style-12">{`참고  한국민족문화대백과사전 「농악」 · 국립국악원 국악사전 「임실필봉농악」`}</p>
      </div>
    </div>
  );
}

const sections = [
  [Component01,1260,'소리가 모이면'],[Component02,1120,'소원과 깃발'],
  [Component03,1410,'함께하는 사람들'],[Component04,1370,'함께 노는 여러 모습'],
  [Component05,1100,'연주할 때 입는 옷'],[Component06,1120,'지역마다 다른 모습'],
  [Component07,1080,'전통에서 우리바람으로'],[Component08,800,'다시 연주하기'],
];
export default function StoryPage() {
  const navigate = useNavigate(), ref = useRef(null);
  const [viewport,setViewport] = useState({width: window.innerWidth, height: window.innerHeight});
  useEffect(() => { const observer = new ResizeObserver(([entry]) => setViewport({width: entry.contentRect.width, height: entry.contentRect.height})); observer.observe(ref.current); return () => observer.disconnect(); }, []);
  const scrollDown = () => ref.current.querySelectorAll('section')[1].scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  return <main ref={ref} className="story-page" tabIndex={0} aria-label="풍물 이야기" style={{'--story-viewport-height':`${viewport.height}px`}}>
    <div className="story-document">{sections.map(([Section,height,title],index) => <section key={title} className={`story-section story-section-${index+1}`} aria-label={title} style={{'--story-art-height':`${height}px`, '--story-section-scale': Math.min(viewport.width/2240, viewport.height/height)}}><Section navigate={navigate} scrollDown={scrollDown}/></section>)}</div>
  </main>;
}

