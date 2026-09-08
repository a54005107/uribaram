# 우리바람 카메라 인식 MVP

풍물놀이 디자인을 적용하기 전에 카메라와 MediaPipe 인식 정확도를 검증하기 위한 최소 프로젝트입니다.

## 화면 흐름

1. 시작 페이지 (`/`)
2. 카메라 연결 확인 (`/camera`)
3. 얼굴 감지 및 장구 오버레이 (`/experience`)

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
