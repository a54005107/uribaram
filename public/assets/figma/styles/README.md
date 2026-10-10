# 폰트·색상 기준

[Figma style 원본](https://www.figma.com/design/K4cBqqg0jvcXERg5vESRI9?node-id=0-1)에서 읽은 값입니다. 원본 Figma는 변경하지 않았으며, 현재 대기 화면에서 이 토큰을 사용합니다.

## 폰트

폰트 패밀리: **Chai Hwaljjak**. 아래 weight는 Figma에서 읽은 값입니다.

| 구분 | 스타일 (weight) | 크기 | 행간 | 자간 |
|---|---|---|---|---|
| T | Heavy (800) | 64px | 110% | -2% |
| H1 | Bold (700) | 48px | 120% | -1% |
| H2 | Bold (700) | 36px | 130% | 0% |
| B1 | Medium (500) | 28px | 150% | 0% |
| B2 | Regular (400) | 22px | 150% | 0% |
| Caption | Regular (400) | 18px | 140% | 0% |

전달받은 TTF 4종을 `public/assets/fonts/`에 포함했습니다. `tokens.css`의 `@font-face`가 Regular(400), Medium(500), Bold(700), Heavy(800)를 연결하므로 로컬 설치 없이 사이트와 미리보기에서 같은 글꼴을 사용합니다. `font-display: swap`으로 다운로드 중에는 대체 글꼴을 표시합니다.

## 색상

- cyan: `#50E6FF`
- pink: `#FF6CF1`
- yellow: `#FFEB36`
- green: `#13BA14`
- blue: `#3373ED`
- red: `#FF3364`
- charcoal: `#2C2C2E`
- off-white: `#F9F9F9`
- brown: `#481100`

초록색 노드 1981:2210의 라벨은 #FFEB36이지만 실제 채우기는 **#13BA14**입니다. 토큰은 실제 채우기를 기준으로 저장했고 원문 라벨도 tokens.json에 보존했습니다.

## 저장 파일

- tokens.json: 정리된 폰트·색상 규격, 노드 ID, 원본 라벨.
- tokens.css: --uribaram-* CSS 변수와 굵기별 @font-face 정의. 각 Figma 화면에서 import하며 기존 크기·행간·자간 토큰을 사용합니다.
- figma-source.json: Figma에서 읽은 원본 속성. 부동소수점 색상·행간과 변수 연결 ID 포함.
- index.html: 색상표 및 타이포그래피 규격 미리보기.

Figma 자간 -2%는 CSS -0.02em, 행간 110%는 단위 없는 1.1로 변환했습니다. 검정 글자와 왼쪽 정렬은 원본 예제의 표시 속성으로 원본 JSON에 기록했으며, 전역 글자색으로 강제하지 않았습니다.
