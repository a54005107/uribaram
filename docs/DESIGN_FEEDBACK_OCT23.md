# 10/23 디자이너 수정 반영

참조: Figma K4cBqqg0jvcXERg5vESRI9 / Page 3, 2028:168, 2271:3227, 2305:824 및 2819·2821 피드백 원본.

- 농기: 자유 입력 없이 10가지 문구 선택, 원본 SVG 문구, 색상 선택, 선택 내용의 이후 깃발 반영. `FlagPage`, `FlagWord`, `config/flagWishes`.
- 풍물 이야기: 2560×15807 최신 디자인, 사진·본문·장식 교체, 농기 사진 3장/장소 사진 5장, 지역 카드 hover·키보드 focus 소개, 하단 이동 버튼. 16:9 화면 비율과 연속 스크롤의 구간 정렬 유지. 최신 피그마 표시 색상 순서는 핑크·하늘·노랑·핑크·초록·하늘·핑크. `StoryPage`, `StoryHeader`.
- 얼쑤 한컷: 지정 얼굴 폭 458.522 기준 상모/고깔 확대. 얼굴 뒤의 상모 장식, 앞의 흰 꽃, 노란 축 끝의 줄 시작점. 기존 추적·회전·촬영 canvas 유지. `drawHeadwear`, `usePhotoHeadwear`, `config/headwearArtwork`.
- 플레이: 카메라 영상을 배경으로 표시, 장구 회전 -53.969893도와 타격 좌표 통일, 메뉴의 피그마 기본/확대 에셋 연결. 기존 약한 타격 반응과 별 물리 효과 유지. `figmaPlayLayout`, `InstrumentPlayPage`.
- 메뉴: 최신 디자인에 있는 얼쑤 한컷 진입 추가.
- 사진 공유: 미완료였던 단기 TURN 자격증명 연결과 오류 처리를 정리. 서비스 계정은 아직 없으므로 실제 QR 수신은 [설정 후 확인](PHOTO_RELAY_SETUP.md) 필요.

## 확인

- `npm run build` 성공. 기존 큰 번들 경고는 남아 있음.
- 장구 좌표/타격·상모 움직임·QR 토큰/만료·TURN 자격증명/정리 관련 자동 테스트 19개 통과.
- 브라우저: 10개 문구 선택과 저장, 사진 에셋 및 carousel 로드, 섹션별 색상, 1920×1080·1024×768·390×844에서 16:9/가로 넘침 없음, 가상 카메라 배경, 지역 카드 focus, 4개 메뉴, 런타임 예외 없음.
- 합성 얼굴 canvas로 모자 크기와 얼굴 앞뒤 배치 확인. 실제 사람을 촬영한 테스트는 하지 않음. 현재 얼굴 가림은 추적한 타원 영역 기반이므로 옆얼굴·긴 머리·빠른 회전에서 실기기 조정이 필요할 수 있음.
- 휴대폰 QR 수신 및 iOS 저장은 TURN 계정 연결 후 별도 확인 필요. 배포/푸시는 수행하지 않음.

## 모션 범위

메뉴·지역 카드의 기본/hover 상태 및 프로토타입에서 읽은 300ms 전환을 반영했습니다. 프레임 사이 Smart Animate의 내부 보간은 MCP motion export에서 나오지 않아 기존 페이지 전환을 유지했습니다. 전체 전환을 피그마와 1:1로 재현했다고 주장하지 않습니다. 관련 Figma motion 스킬의 내보내기 제한 안내:

> Prototype interactions aren't currently supported in MCP. Keyframes on the canvas are visible, but not the smart animate interactions between frames or their transition settings. Code generated from this selection will represent the start and end states, not the transition between them.

디자이너가 대면 논의로 남긴 악기 움직임과 추후 편집 예정인 음원은 기존 동작/파일을 유지했습니다.
