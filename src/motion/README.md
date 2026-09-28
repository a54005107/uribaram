# 실시간 모션 기반 시스템

현재 장구 위치·궁채 방향·타격 처리는 [상체 추종 안내](TORSO_TRACKING.md)가 최신 기준이다.

장구채의 Grip/Grab 상태, 화면 하단 장구, 새로운 타격 좌표 처리는 [장구채 개선 안내](STICK_INTERACTION.md)를 참고한다. 손 추론은 30ms 간격이며 채 렌더링은 React 상태 갱신과 별도로 RAF에서 수행한다.

## 연결과 파일

기존 `@mediapipe/tasks-vision` 1.0.1과 `public/mediapipe`의 Hand/Pose Lite 모델 및 WASM을 재사용한다. 추가 설치는 없다. `CameraProvider`와 카메라 선택 화면은 수정하지 않았다.

`CameraProvider → 기존 MediaStream → video → 기존 useHandTracking/useFaceTracking 추론 → motionEngine → EMA → 손목/머리 이력 → 분석 데이터 → Canvas/향후 interaction`

- `motionConfig.js`: 추론/UI 간격, EMA 시간 상수, 신뢰도, 속도 및 관절/머리 임계값.
- `geometry.js`: 벡터·거리·관절 각도 및 cover/mirror 화면 변환.
- `smoothing.js`: 시간 간격을 반영하는 EMA.
- `motionHistory.js`: 최근 시간/최대 개수로 제한한 이력.
- `motionAnalyzer.js`: 방향·속도·구간 이동 거리·움직임 시작/정지.
- `fingerAnalyzer.js`: 두 관절 각도로 손가락 펴짐/접힘 판정.
- `handTracker.js`: 좌우 손, 21개 관절, 손끝, 손목, 손가락 상태의 프로젝트용 adapter.
- `poseTracker.js`: 어깨·팔꿈치·손목과 Pose 기반 머리 위치/기울기/움직임 adapter.
- `motionEngine.js`: 독립 분석 엔진, 결과 조회 및 추적 소실 처리.
- `MotionDebug.jsx`: Canvas 골격·궤적·속도 벡터와 텍스트 디버그 패널.
- `motion.test.js`: 카메라 없이 실행하는 수치/상태 테스트.

수정 파일: `src/hooks/useHandTracking.js`, `src/hooks/useFaceTracking.js` (결과 콜백, 주기 제한, 스트림 교체와 비동기 해제), `src/pages/CameraExperience.jsx` (엔진/디버그 연결), `src/styles.css` (디버그 스타일), 루트 `README.md` (안내 링크).

## 데이터 사용

```js
const engine = createMotionEngine(); // 옵션 override 가능
engine.hands(handLandmarkerResult, performance.now(), video.videoWidth / video.videoHeight);
engine.pose(poseLandmarkerResult, performance.now(), video.videoWidth / video.videoHeight);
const {leftHand, rightHand, pose} = engine.snapshot();
// rightHand: {hand: 'RIGHT', position, wrist, landmarks, worldLandmarks,
// fingerTips, fingers, history, velocity, direction, speed, distance,
// moving, started, stopped, timestamp, confidence}
// pose: {landmarks, leftShoulder, rightShoulder, leftElbow, rightElbow,
// leftWrist, rightWrist, head, timestamp}
```

실제 화면에서는 기존 두 추적 훅이 추론 직후 엔진 메서드를 호출한다. 모델이나 스트림을 새로 열지 않는다. 조회 결과의 내부 배열/객체는 읽기 전용으로 사용한다. `started`/`stopped`는 해당 추론 프레임의 전이 플래그이므로 향후 이벤트 소비자는 결과 콜백 직후 읽어야 한다. 느린 UI polling은 전이를 놓칠 수 있다. 감지 소실은 `null`이며 정상 정지와 구분한다.

## 계산 기준

- 원본 영상의 정규화 좌표: x는 오른쪽, y는 아래쪽으로 증가. 손 이름은 MediaPipe handedness를 사용하며 CSS 반전으로 교환하지 않는다. 디버그 방향 문구도 원본 좌표 기준이다.
- EMA: `alpha = 1 - exp(-dt / smoothingTimeMs)`. 이미지/손 world landmark에 적용한 뒤 손목/머리 위치 이력을 저장한다.
- 속도: 최근 약 120ms의 변위 / 실제 초 단위 시간. 방향은 x/y 속도의 우세 축. `speed`는 정규화 영상 평면 거리/초이며 m/s가 아니다. x와 y는 각각 영상 폭과 높이에 대한 비율이므로 물리적으로 등방성인 속도는 아니다.
- `distance`는 최근 650ms(최대 40개 샘플)의 평면 경로 길이로, 전체 세션 누적값이 아니다. z 속도는 참고용 상대 깊이이며 speed에는 포함하지 않는다.
- 움직임 시작 .12/s, 유지/정지 .065/s의 히스테리시스로 미세 떨림을 줄인다. 신뢰도가 낮거나 손이 사라지면 해당 데이터를 제거하고, 300ms 이상 새 결과가 없으면 만료한다. 재등장 첫 프레임 속도는 0이다.
- 손가락은 world 좌표의 연속 두 관절 각도로 판정한다. world 좌표가 없으면 종횡비를 보정한 영상 좌표를 사용한다.
- 머리는 코·양쪽 귀의 상대 위치와 귀 연결선 기울기로 좌/우/상/하/기울임/중립을 근사한다. 얼굴 회전의 정밀 추정은 아니다. 머리 이동 방향/속도는 별도 이력으로 계산한다. 신뢰도가 낮은 Pose 관절은 null이다.
- Canvas에만 좌우 반전과 `object-fit: cover`의 확대/잘림을 적용한다. 계산 좌표는 변형하지 않는다.

## 성능과 수명 관리

추론 최대 20Hz, 기존 React 화면 갱신 최대 약 8Hz, 모션 데이터는 엔진 내부에 보관한다. Canvas는 requestAnimationFrame, 텍스트는 주기 제한 후 DOM에 직접 반영한다. 숨김 탭/정지 영상에서는 추론하지 않고 동일 video 프레임을 중복 분석하지 않는다. 화면 종료와 스트림 교체 시 RAF/모델/이력을 정리하며, 모델 초기화 중 종료된 경우에도 완료 즉시 모델을 닫는다. 모델/WASM은 동일 출처의 로컬 정적 파일이며 영상 업로드를 추가하지 않았다.

MediaPipe 추론은 여전히 메인 스레드의 동기 호출이다. 저사양 장치에서는 추론 간격을 늘리거나 다음 단계로 Worker를 도입할 수 있다. 기존 장구/채 UI 갱신 간격도 제한되므로 실제 기기의 반응성을 확인해야 한다.

## 검증

```sh
npm run build
node src/motion/motion.test.js
npm run dev
```

1. 표시된 localhost 주소에서 카메라 선택 후 체험 화면으로 이동한다. `모션 디버그 켜기` 또는 `/experience?debug=motion`을 사용한다.
2. 모델 로딩 후 왼손/오른손을 한쪽씩 들어 라벨, 손끝, 손목, 연결선이 맞는지 확인한다. 양손 교차/가림도 점검한다.
3. 손을 멈췄다가 상하좌우로 움직여 moving, 속도, 궤적을 확인한다. 미러 화면의 수평 이동과 원본 좌표 방향은 반대다.
4. 손바닥을 펴고 주먹을 쥐고 손을 회전해 손가락 판정을 확인한다. 어깨·팔꿈치·손목, 머리 이동/기울임도 확인한다.
5. 손을 화면 밖으로 뺐다가 다른 위치에서 다시 넣어 미감지와 재등장 초기화가 동작하는지 확인한다.
6. 창 크기/종횡비를 바꿔 landmark 정렬을 확인하고, 디버그를 꺼도 기존 악기/채가 동작하는지 확인한다.
7. 카메라 변경, 탭 전환, 모델 로딩 중 나가기/재진입을 반복한다. 모델 파일 요청 실패 시 기존 오류 상태를 확인한다. Network에서 영상 업로드가 없는지 확인한다.

자동 테스트는 timestamp 속도/시작·정지, 히스테리시스, EMA, 이력 제한, 관절 각도, cover/mirror, 추적 소실/재등장, 낮은 신뢰도의 Pose 처리를 검증한다. 실제 카메라 인식 정확도/FPS/GPU 동작은 수동 검증 대상이다.

## 한계와 다음 단계

손 겹침·빠른 움직임·장구채에 의한 가림은 인식을 불안정하게 만들 수 있다. 손가락 판정은 휴리스틱이며 엄지 벌림과 굽힘을 완전히 구분하지 않는다. 머리 방향은 사용자별 중립 자세 보정이 없으므로 특히 up/down 정확도가 제한된다. 필요하면 Face Landmarker adapter와 중립 자세 calibration을 추가할 수 있다. 새 장구 타격 분류는 추가하지 않았으며 기존 타격 코드는 유지된다. 이후 실제 사용자 데이터로 임계값/지연을 조정하고 모션 결과를 장구 판정에 연결한다.

API 참고: [MediaPipe Hand Landmarker Web](https://developers.google.cn/edge/mediapipe/solutions/vision/hand_landmarker/web_js), [PoseLandmarker JS](https://developers.google.com/edge/api/mediapipe/js/tasks-vision.poselandmarker).
