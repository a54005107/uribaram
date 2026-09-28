# Grip 고정과 화면 하단 장구

이 문서는 이전 단계의 구현 기록이다. 현재 화면 하단 고정 배치는 제거되었으며, 최신 동작과 설정은 [상체 추종 안내](TORSO_TRACKING.md)를 따른다.

## 원인과 변경

기존 코드는 손을 찾으면 주먹 여부와 무관하게 채를 표시했다. Hand 결과가 없을 때 Pose 채로 바뀌면서 기준 위치도 달라졌다. 위치/끝점에 별도 필터를 적용하고 중앙 기준으로 CSS perspective 회전을 했으며, CSS 손잡이 위치와 계산상 gripOffset이 달랐다. React 상태의 약 8Hz 갱신 제한도 채에 그대로 적용되어 지연이 커졌다.

장구 위치는 어깨 중심과 어깨 폭으로 계산했다. 3D Canvas는 136%로 확대되어 있고 orthographic zoom은 고정값이었지만, 타격 영역은 별도의 박스 비율로 추정했다.

현재 채는 Hand 결과만 사용한다. 기존 카메라 스트림, Hand/Pose 모델, 모션 분석 엔진을 재사용한다. 채는 RAF에서 DOM 스타일을 직접 갱신하며 React에는 상태 설명만 약 8Hz로 전달한다. 손 추론 간격은 30ms, Pose는 50ms이며 실제 성능은 장치에 따라 달라진다.

## Grip 및 손 상태

- Palm Center: index/middle/ring/pinky MCP 네 점의 평균.
- Grip: palm 72% + wrist 28%. 여러 관절을 사용하므로 손목 하나에 고정되지 않는다.
- 주먹 점수: 네 손가락의 굽힘 각도와 손끝↔손바닥 거리(손바닥 길이로 정규화)를 함께 사용한다. 영상 종횡비를 보정하며 엄지는 주먹 점수에서 제외한다.
- OPEN → CLOSING → FIST: 점수 .62 이상이 55ms 및 최소 2프레임 지속되어야 잡는다.
- FIST → OPENING → OPEN: 점수 .28 이하가 170ms 및 최소 2프레임 지속되어야 놓는다. 중간 점수와 순간적인 오류는 기존 grab을 유지한다. 감지 누락은 연속 확인 시간을 끊는다.

## 위치·회전·손실

Grip에 기존 One Euro adaptive filter를 사용한다. 정지 시 흔들림을 줄이고 빠른 이동에서는 cutoff를 높인다. 필터 지연 거리는 영상 높이 기준 .012로 제한하며, 정상 추적 중 앞으로 예측하지 않는다. wrist→palm 벡터로 회전을 계산하고 unwrap 및 회전 필터를 적용한다. 벡터가 너무 짧으면 이전 방향을 유지하고 최대 각속도로 순간적인 뒤집힘을 제한한다.

CSS transform-origin과 손잡이 중심은 동일한 `gripOffset`을 사용한다. tip은 같은 anchor·길이·회전에서 계산한다. 별도 tip 필터와 CSS rotateY/perspective는 제거했다. 이는 평면 회전 모델이며 손의 3D roll까지 재현하지 않는다.

일시 가림은 최대 260ms 유지한다. 이전 속도의 감쇠 이동은 최대 .025로 제한하고 장시간 손실이면 숨긴다. 재등장 시 오래된 속도/필터/잡기 상태를 초기화한다. grace 상태에서는 타격을 발생시키지 않는다.

## 장구와 타격 좌표

`createJangguLayout(viewportWidth, viewportHeight)`가 공통 기준이다. 중심은 기본 `(0.5, 0.77)`, 너비는 화면 폭의 최대 56%, 높이는 최대 32%이며 모델 비율과 아래 여백을 유지한다. ResizeObserver로 창 크기를 반영한다. 얼굴/가슴 위치와 관계없이 카메라 준비 후 표시된다.

장구 rim 중심/반지름/고정 yaw와 orthographic zoom을 공통 config/layout에서 사용한다. 이 3D rim을 화면에 투영한 타원을 hit zone으로 사용한다. 기존 136% Canvas 확대와 최소 픽셀 크기를 제거했다. 손 좌표는 mirror + object-fit cover crop을 거쳐 같은 viewport 정규화 좌표로 변환한다.

채 끝의 이전→현재 선분과 타격 타원의 진입 교차를 검사하여 빠른 동작이 타원을 통째로 지나가도 감지한다. 속도 임계값과 cooldown을 적용하며, 잡지 않은 손/손실 보간/동일 추론 프레임에는 추가 타격이 없다. 장구 크기가 바뀌면 이전 충돌 이력을 초기화한다. 타격은 2D 투영 기준이며 3D 깊이 충돌이 아니다.

## 파일

수정: `src/config/stickInteractionConfig.js`, `src/hooks/useHandTracking.js`, `src/hooks/useStickHitDetection.js`, `src/pages/CameraExperience.jsx`, `src/components/sticks/StickOverlay.jsx`, `src/components/janggu/NeonJanggu3D.jsx`, `src/components/janggu/JangguRim.jsx`, `src/styles.css`, README 문서.

추가: `src/motion/gripAnalyzer.js`, `stickTracker.js`, `jangguLayout.js`, `stickHitEngine.js`, `stickInteraction.test.js`, `src/components/sticks/LiveSticks.jsx`, 이 문서.

## 튜닝

설정은 `src/config/stickInteractionConfig.js`에서 조절한다.

| 설정 | 역할 |
|---|---|
| `GRIP_CONFIG.grabThreshold/releaseThreshold` | 잡기/놓기 점수 |
| `grabMs/releaseMs/confirmationFrames` | 상태 확인 시간·프레임 |
| `straightAngle/foldedAngle/openTipDistance/closedTipDistance/angleWeight` | 주먹 점수 계산 |
| `TRACKING_CONFIG.gripPalmWeight` | 손바닥 안쪽 Grip 위치 |
| `FILTER_CONFIG.grip/rotation` | 정지 필터 강도와 빠른 이동 반응성 |
| `maxAnchorLag` | 최대 위치 지연 거리 |
| `minPalmVector/maxAngularSpeed` | 회전 불안정 방지 |
| `settleMs/coastMs/maxCoastDistance/maxCoastSpeed` | 가림 유지 시간과 보간 한도 |
| `inferenceIntervalMs/staleAfterMs/minConfidence` | 손 추론 간격·지연 판정·신뢰도 |
| `STICK_CONFIG.*.gripOffset/angleOffset/lengthScale/minLength/maxLength` | 손잡이 위치·채 방향·길이 |
| `JANGGU_CONFIG.x/y/width/maxHeight/bottomMargin` | 화면상 장구 위치·크기 |
| `HIT_CONFIG.impactVelocity/cooldownMs/strength` | 타격 속도·재타격 간격·강도 |

`JANGGU_CONFIG`의 rim/yaw 값은 3D 투영용이다. 양 끝 타원이 보이는 기본 yaw 25°를 사용한다. 정확히 0°는 타격면이 옆으로 서서 폭이 0이 되므로 피한다.

## 직접 카메라 점검

`npm run dev` → 카메라 선택 → `/experience?debug=tracking` 또는 체험 화면의 **모션 디버그 켜기**. 분홍 점은 raw Grip, 흰 원은 채 anchor, 녹색은 palm, 파랑은 wrist다. 노란 타원은 실제 hit zone이다. 디버그를 끄면 이 표시는 사라진다.

1. **주먹:** 손을 펴고 쥔다. OPEN/CLOSING/FIST 전환 후 채가 나타나는지 확인.
2. **유지:** 주먹을 멈춘다. 손잡이와 anchor가 겹치는지, 떨림이 줄었는지 확인.
3. **빠른 이동:** 상하좌우로 빠르게 움직인다. Grip과 anchor 간격을 확인하고 필요하면 `beta`, `maxAnchorLag`, 추론 간격을 조정.
4. **손목 회전:** 각도 경계와 손이 옆으로 선 자세에서 채가 뒤집히지 않는지 확인.
5. **가림:** 손을 잠깐 가렸다 복구하고, 이어 1초 이상 가린다. 짧은 가림은 유지, 긴 가림은 숨김 및 잡기 재확인.
6. **장구 위치:** 노트북을 평소 각도로 두고 얼굴/상체/손과 하단 장구가 함께 보이는지 확인.
7. **연주 자세:** 손이 닿는 위치에 맞게 `y/width/maxHeight` 조정. 16:9, 작은 창, 외부 웹캠 및 창 크기 변경도 확인.
8. **타격 일치:** 노란 타원의 경계를 채 끝으로 통과한다. 해당 면의 파동과 피드백을 확인. 빠르게 관통하는 동작, 열린 손, 가림 중 허위 타격 여부도 확인.

자동 검증: `node src/motion/stickInteraction.test.js` (9개), `node src/motion/motion.test.js` (8개), `npm run build`.

자동 테스트는 합성 좌표의 상태/수치 검증이다. 실제 카메라의 주먹 정확도와 지연은 아직 측정하지 않았으며, 브라우저 시각 검증도 환경의 원격 디버깅 연결 실패로 완료하지 못했다. MediaPipe 추론은 메인 스레드에서 실행되므로 저사양 장치에서는 추론 시간 자체가 지연의 원인이 될 수 있다. 실제 손 크기/조명/가림에 맞춘 설정 조정이 필요하다.
