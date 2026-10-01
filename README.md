# 우리바람 카메라 인식 MVP

우리나라 전통 풍물놀이를 웹에서 체험할 수 있는 인터랙티브 프로젝트입니다.

Figma 에셋과 모션용 부품: [에셋 라이브러리 안내](public/assets/figma/README.md). 개발 서버에서 `/assets/figma/index.html`을 열면 원본·버전·개별 부품을 확인할 수 있습니다.

실시간 손·신체 모션 분석과 디버그 사용법: [모션 시스템 안내](src/motion/README.md).

상체를 따라가는 장구, 궁채 방향·타격 좌표와 튜닝: [상체 추종 안내](src/motion/TORSO_TRACKING.md).

풍물놀이 디자인을 적용하기 전에 카메라와 MediaPipe 인식 정확도를 검증하기 위한 최소 프로젝트입니다.

## 화면 흐름

1. 대기 화면 (`/`) → 깃발 클릭 또는 키보드로 선택 후 Enter
2. 나팔 체험 (`/trumpet`) → 다음
3. 깃발 문구 입력 (`/flag`) → 다음
4. 카메라 연결 확인 (`/camera`) → 카메라 연결 후 체험 진입
5. 기존 얼굴·손 추적 및 장구 체험 (`/experience`) → 체험 완료
6. 마무리 (`/ending`) → 처음으로 (`/`)

나팔·깃발·마무리는 흐름 확인용 임시 UI입니다. 깃발 문구는 탭의 sessionStorage에 보관하며 마무리의 처음으로 버튼으로 초기화합니다.
CameraProvider는 라우트 전체에서 유지되어 카메라 준비 → 장구 체험 이동 시 스트림을 공유합니다. 마무리 또는 대기 화면에 진입하면 기존 stop()으로 스트림을 종료합니다.

## 체험 화면과 디버그

- `/camera`: 기존 카메라 선택과 영상 미리보기를 유지합니다.
- `/experience`: UI 배경 위에 장구와 채를 표시합니다. 카메라 영상, 얼굴 표시, 랜드마크 및 디버그 UI는 숨깁니다.
- `/experience?debug=motion`: 카메라 영상과 기존 모션 분석·랜드마크 디버그를 표시합니다.
- `/experience?debug=tracking`: 카메라 영상과 기존 채·타격 영역 디버그를 표시합니다.

체험의 video는 DOM, 전체 화면 크기, `object-fit: cover`, 좌우 반전을 그대로 유지하고 `opacity: 0`으로만 숨깁니다. MediaPipe는 같은 video의 재생 프레임을 계속 처리하며 원본 해상도·화면 크기를 이용한 좌표 계산은 바뀌지 않습니다. 기존처럼 비활성 브라우저 탭에서는 추론을 쉬고, 체험 종료 시 스트림을 종료합니다.

## 실행

```bash
npm install
npm run dev
```

카메라는 `localhost` 또는 HTTPS 환경에서만 사용할 수 있습니다. 영상은 브라우저 안에서 처리되며 서버로 전송되지 않습니다.

## 인식 구조

- MediaPipe Pose Landmarker Lite
- 얼굴 핵심점 5개의 visibility 평균으로 얼굴 감지
- 연속 프레임 검증으로 오인식과 깜빡임 감소
- 좌표 보간으로 오버레이 흔들림 감소
- GPU 초기화 실패 시 CPU 자동 전환
- `object-fit: cover` 영역을 반영한 화면 좌표 변환
