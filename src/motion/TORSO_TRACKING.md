# 상체 추종 장구와 손바닥 방향 기반 궁채

궁굴채는 사용자가 요청한 잡는 방향에 맞춰 `STICK_CONFIG.gungulchae.angleOffset = 180`을 적용한다. 기본 연주 자세에서 둥근 머리가 손잡이 아래쪽으로 향하며, 손목을 돌리면 그 방향을 기준으로 함께 회전한다. 손잡이 anchor는 유지하고 렌더링과 타격 tip에 같은 보정 각도를 사용한다. 열채 방향은 그대로다.

타격 허용 범위는 실제 면의 가로·세로 반경 대비 1.22배이며, 최소 타격 속도는 .20이다. `HIT_CONFIG.zonePadding/impactVelocity`로 조절한다. 디버그의 실선은 실제 면, 바깥 점선은 허용 판정 영역이다.

타격 시 화면을 향하는 발광 링 3개가 타격한 면에서 퍼지고, 장구 선을 따라 밝은 파동이 전달된다. `src/config/jangguWaveConfig.js`에서 링 크기/지속 시간/밝기와 표면 파동 강도를 조정한다. **왼쪽 파동 / 오른쪽 파동** 버튼도 실제 타격과 같은 `handleHit` 경로를 사용하므로 인식 여부와 효과 표시 여부를 구분해 확인할 수 있다. 링은 시각 효과이며 hit 영역을 확대하지 않는다.

현재 구현 안내다. 이전 `STICK_INTERACTION.md`의 화면 하단 고정 배치는 이 구현으로 대체했다.

## 변경 원인과 구조

기존 고정 좌표는 `JANGGU_CONFIG.x/y`, `jangguLayout.js`의 viewport 배치, `CameraExperience.jsx`의 overlay style에 있었다. 궁채는 wrist→palm에 고정 180°를 더했고, 길이가 장구 너비를 따랐다. 이 조합은 손목 회전과 무관한 방향 보정, 신체 배치에 따른 채 길이 변화를 만들었다.

현재 Pose의 양쪽 어깨(11/12)와 골반(23/24)에서 기준점을 구한다. 기존 Pose 추론 콜백은 `motionEngine`과 새 `torsoTracker`에 동일 결과를 전달한다. 추가 카메라/모델은 없다.

`shoulderCenter = mean(shoulders)`

`hipCenter = mean(hips)`

`target = shoulderCenter + (hipCenter - shoulderCenter) * torsoFraction + shoulderWidth * offset`

offset y는 영상 종횡비를 보정한다. 골반이 가려졌으면 어깨 연결선에 수직인 아래 방향과 어깨 폭으로 torso를 추정한다. 어깨도 없으면 짧게 유지한 뒤 숨긴다. 화면 고정 위치로 돌아가지 않는다. 사용자가 화면 가장자리로 이동하면 장구도 함께 화면 밖으로 나갈 수 있다.

## Smoothing과 크기

장구 위치는 시간 기반 EMA 150ms, 크기는 260ms로 별도 처리한다. 크기는 shoulderWidth × 1.8에 최소 .24/최대 .70(원본 영상 폭 비율)을 적용한다. 작은 위치 변화와 크기 변화를 완화하고 가까워지거나 멀어질 때 자연스럽게 확대/축소한다. 최대 350ms 추적 손실 후 숨기고 다시 감지되면 이전 이력을 초기화한다.

장구는 고정 yaw 25°, 화면 내 회전 0°를 유지한다. 이번 구현은 상체 위치·크기 추종이며 정밀한 신체 3D 회전 추종은 아니다.

## 공통 Janggu Transform

`torsoTracker.layout()`은 mirror/cover 변환 후 `{x, y, width, height, zoom, yaw, rotation, zones, stale, debug}`를 만든다. `LiveSticks`의 RAF가 이 객체를 `transformRef`에 저장하고 같은 객체로 타격 판정을 수행한다. 전체 화면 Canvas의 3D 그룹은 같은 ref의 중심과 scale을 사용한다. 매 프레임 React state를 갱신하지 않는다.

장구가 움직여도 충돌 이력을 초기화하지 않는다. 이전 tip을 이전 타원 좌표에서 현재 타원 좌표로 변환해 상대 경로의 진입을 검사한다. 창 크기 변경/추적 소실 시에는 이력을 초기화한다. 실제 tip 속도가 임계값보다 낮으면 장구만 움직여도 타격되지 않는다. 빠른 tip 선분 교차, cooldown, Grab/Release, stale 손의 타격 차단은 유지한다.

## 궁채

- Grip은 네 MCP 평균의 72% + wrist 28%다. 실제 손잡이 pivot과 동일한 `gripOffset`을 유지한다.
- 방향은 wrist→middle MCP의 세로 방향과 pinky MCP→index MCP의 가로 방향을 정규화해 합성한다. 가로 방향 기본 가중치는 .65다. 손별 `angleOffset`으로 잡는 방향을 보정한다. 궁굴채는 둥근 머리가 아래를 향하도록 180°, 열채는 0°다.
- x/y/z로 palm tilt도 추정하여 디버그에 표시한다. 렌더링은 안정적인 2D 축 회전이며 깊이 방향 단축이나 정밀한 3D 물체 회전은 아직 적용하지 않는다.
- 회전에는 unwrap, 최대 각속도, 별도 One Euro 필터를 사용한다. 투영 축이 짧으면 방향을 유지한다.
- 위치는 adaptive One Euro를 유지하고 빠른 이동일수록 최대 지연 허용값을 .012에서 .003으로 줄인다. 정상 추적 중 forward prediction은 없다.
- 채 길이는 손의 MCP 간 폭으로 계산하고 Grab 시점부터 고정한다. 장구 크기나 상체 위치를 바꿔도 손에 든 채의 길이가 바뀌지 않는다. 다시 놓고 잡으면 현재 손 크기로 재설정한다.
- `tip = anchor + direction(rotation) × length × (1 - gripOffset)`을 화면 픽셀 기준으로 계산하고 viewport 좌표로 변환한다. 렌더와 충돌은 이 tip을 공유한다.
- 주먹 판정, 잡기/놓기 debounce, 260ms 일시 가림 유지는 변경하지 않았다.

## 설정

`src/config/stickInteractionConfig.js`:

| 설정 | 조정 목적 |
|---|---|
| `JANGGU_CONFIG.torsoFraction` | 어깨→골반 사이 배치 비율, 기본 .38 |
| `torsoOffsetX/torsoOffsetY` | 어깨 폭 기준 추가 위치 보정 |
| `fallbackTorsoLength` | 골반 미감지 시 상체 길이 |
| `positionSmoothingMs/sizeSmoothingMs` | 장구 위치/크기 안정성 |
| `scaleMultiplier/minScale/maxScale` | 어깨 폭 대비 장구 크기와 제한 |
| `minConfidence/minShoulderWidth` | 신체 기준점 품질 조건 |
| `lostTrackingGraceMs/staleAfterMs` | 신체 손실 유지/타격 중단 |
| `STICK_CONFIG.*.gripOffset` | 손잡이 pivot |
| `angleOffset/palmLengthScale/minLength/maxLength` | 채 방향 보정·손 대비 길이 |
| `FILTER_CONFIG.grip/rotation` | 위치/각도 One Euro 필터 |
| `TRACKING_CONFIG.palmAcrossWeight` | 가로/세로 palm 방향 혼합 |
| `minPalmVector/minProjectedAxis/maxAngularSpeed` | 방향 불안정 억제 |
| `maxAnchorLag/fastAnchorLag/fastSpeed` | 속도별 위치 지연 제한 |
| `gripPalmWeight` | palm/wrist Grip 가중치 |

## 파일

추가: `src/motion/torsoTracker.js`, `src/motion/torsoTracker.test.js`, 이 문서.

수정: `src/config/stickInteractionConfig.js`, `src/motion/jangguLayout.js`, `src/motion/stickTracker.js`, `src/motion/stickHitEngine.js`, `src/motion/stickInteraction.test.js`, `src/components/sticks/LiveSticks.jsx`, `src/components/janggu/NeonJanggu3D.jsx`, `src/pages/CameraExperience.jsx`, `src/styles.css`, README 안내 문서.

## 검증과 카메라 점검

자동 검증:

```sh
node src/motion/torsoTracker.test.js
node src/motion/stickInteraction.test.js
node src/motion/motion.test.js
npm run build
```

23개 테스트는 상체 이동/EMA/크기/골반 누락/추적 손실, 이동 장구의 타격 이력, 정지 tip의 오타격 방지, 채 길이 독립성, 기존 Grip/각도/좌표 변환을 검증한다. 합성 좌표 테스트이며 실제 카메라 인식 정확도와 지연 측정은 별도로 해야 한다.

`npm run dev` 후 `/experience?debug=tracking` 또는 **모션 디버그 켜기**에서 아래 8개를 확인한다.

1. 상체 좌우 이동: shoulder/torso/target 점과 장구 중심이 함께 이동하는지 확인.
2. 상체 위아래 이동: 골반이 보일 때와 안 보일 때 모두 몸을 따라가는지 확인.
3. 정지: 장구 위치·크기가 떨리지 않는지 확인. EMA 시간을 조정.
4. 주먹 유지: 분홍 Grip과 흰 Anchor가 손 안에서 유지되는지 확인.
5. 느린 손 이동: palm→Grip→tip 연결선이 자연스럽게 따라가는지 확인.
6. 빠른 이동: anchor 지연과 놓침을 확인. `fastAnchorLag`, `fastSpeed`, grip 필터 조정.
7. 손목 회전: 하늘색 orientation 선과 채 각도를 확인. `palmAcrossWeight`, `angleOffset`, 회전 필터 조정.
8. 타격: 상체를 움직이면서 보이는 tip이 노란 hit 타원에 닿을 때만 파동이 발생하는지 확인. 손을 고정하고 몸만 움직일 때 오타격이 없는지도 확인.

현재 환경에서 실제 카메라를 이용한 위 8가지 동작 검증은 수행하지 못했다. 손바닥 방향 가중치와 신체 offset의 체감 자연스러움은 실제 사용자의 손·자세·카메라로 최종 튜닝해야 한다.
