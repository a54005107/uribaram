# 우리바람 에셋 라이브러리

**51개 에셋 버전 / 812개 모션용 부품.** 기존 화면 에셋 17개·245개 부품에 graphic 페이지의 34개 에셋·567개 부품을 추가했습니다.

[통합 미리보기](index.html)를 브라우저로 열거나 개발 서버의 `/assets/figma/index.html`로 접근하세요. 종류·이름·버전을 선택하고 부품을 하나씩 켜거나 끌 수 있습니다.

폰트·색상 기준은 [스타일 미리보기](styles/index.html)와 [스타일 안내](styles/README.md)에 정리했습니다. `styles/tokens.css`와 `styles/tokens.json`을 사용할 수 있으며, 폰트 파일 자체는 포함하지 않습니다.

## 폴더 규칙

종류 → 에셋 → 버전 순서입니다. 원본과 부품이 서로 멀리 떨어져 있던 기존 `parts/` 구조를 없애고, 같은 버전 폴더에 모았습니다.

```text
figma/
├─ flag/          깃발, 깃대, 세로 글자, 흔들리는 깃발
├─ instruments/   나팔, 장구, 북, 소고, 꽹과리, 징
├─ headwear/      상모 2종, 고깔
├─ brand/         로고, 얼씨구좋다
├─ decorations/   음표, 파티클, 반짝이
├─ ui/            바람 담기 버튼 기본·호버
├─ index.html     통합 미리보기
├─ manifest.json  전체 에셋 목록과 Figma 출처
└─ path-map.json  이전 파일 경로 → 새 경로

instruments/janggu/default/
├─ original.svg   Figma에서 내보낸 전체 원본
├─ assembled.svg  부품별 id가 있는 조립 SVG
├─ manifest.json  부품 목록, 순서, 좌표, 중심점
└─ parts/
   ├─ ring-001-yellow.svg
   ├─ ring-002-pink.svg
   └─ ...
```

- `screen`, `waiting-screen`, `input-screen`: Page 3 화면에 배치된 크기·각도.
- `default`, `variant-2`, `variant-3`: graphic 페이지의 기본/변형 컴포넌트.
- `red`, `blue`, `yellow`: 문구 입력 깃발 색상 버전.
- `graphic`: 원본 페이지의 독립 에셋.

원본 에셋의 버전별 색상·각도·레이어 순서를 유지했습니다. 서로 비슷해 보여도 출처/배치/색상이 다를 수 있어 자동 중복 제거하지 않았습니다.

## 부품 사용

모든 부품은 해당 original.svg와 **동일한 전체 viewBox**를 사용합니다. 같은 위치·크기에 manifest의 `zIndex` 순서대로 겹치면 원래 모양이 복원됩니다. 부품 주변의 투명 여백은 의도한 것입니다.

- `ring-*`: 개별 링. 장구는 링 30개와 몸체 선·장식 12개, 채 2개로 분리합니다.
- `trim-*`, `red-trim-*`: 깃발 삼각 장식 각각.
- `cloth-*`, `top-band-*`, `lettering-*`: 깃발 천, 상단 띠, 글자 도형.
- `ribbon-*`, `tube-*`, `pole-segment-*`, `stick-*`: 리본, 나팔 관, 깃대, 채.
- `detail-*`, `decoration-*`, `ui-shape-*`: 그 외 원본 도형. 마스크와 복합 경로의 내부 윤곽선은 함께 유지합니다.

`manifest.json`의 `bounds`와 `pivot`은 원본 SVG 좌표계에서 측정한 도형 경계와 중심점입니다. 고정점이나 타격점의 의미를 자동 부여한 값은 아닙니다. 원본 회전은 경로 좌표에 반영될 수 있어 `transform: null`이어도 회전 없는 도형이라는 뜻은 아닙니다.

```jsx
<img src="/assets/figma/flag/input/red/original.svg" alt="입력용 깃발" />
<img src="/assets/figma/instruments/janggu/default/parts/ring-001-yellow.svg" alt="" />
```

`assembled.svg`를 inline으로 넣으면 `data-part-id`로 개별 모션을 줄 수 있습니다.

```css
[data-part-id^="ring-"] {
  transform-box: fill-box;
  transform-origin: center;
}
```

별도 img로 모션을 줄 때는 pivot을 viewBox 너비·높이로 나눈 비율을 transform-origin으로 사용합니다. 여러 SVG를 inline으로 삽입할 때는 mask/clipPath ID가 충돌하지 않도록 접두사를 추가하세요. 부품 번호는 렌더링 순서이며 파동의 진행 순서를 뜻하지 않습니다.

## 출처와 재생성

- [화면 배치본 Page 3](https://www.figma.com/design/K4cBqqg0jvcXERg5vESRI9?node-id=1823-2)
- [graphic 원본 페이지](https://www.figma.com/design/K4cBqqg0jvcXERg5vESRI9?node-id=1878-783)

에셋별 nodeId는 루트 manifest에, 부품별 원본 SVG 요소 순번은 버전 manifest에 기록했습니다. Figma 레이어는 변경하지 않았습니다. 내보내기는 contentsOnly, useAbsoluteBounds, svgOutlineText를 적용해 주변 배경을 제외하고 글자를 벡터로 유지합니다.

`python scripts/export-svg-parts.py`로 부품과 미리보기를 다시 생성합니다. 원본 해시가 같으면 기존 bounds/pivot도 보존합니다. 원본이 바뀌면 좌표를 브라우저에서 다시 측정해야 합니다.

812개 부품의 로딩과 51개 에셋의 원본/재조립 비교를 Chromium에서 확인했습니다. 별도 이미지 합성에는 경계 안티앨리어싱의 미세한 차이가 있습니다. 기존 사이트의 카메라·MediaPipe·장구 체험 코드와 `public/assets/janggu`의 기존 자료는 변경하지 않았습니다.
