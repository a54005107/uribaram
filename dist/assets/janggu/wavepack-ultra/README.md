# 우리바람 네온 장구 파동 애니메이션 ULTRA PACK

구성:
- 좌/우 타격 각각
- weak / normal / strong 3단계 세기
- idle / impact / spread / peak / return 5단계

총 30개 상태 SVG가 포함되어 있습니다.

파일명 예:
- left_normal_idle.svg
- left_normal_impact.svg
- left_normal_spread.svg
- left_normal_peak.svg
- left_normal_return.svg

각 SVG의 세로선은 모두 `line-01` ~ `line-14` ID를 유지합니다.
따라서 코덱스에서 각 프레임의 `d` 값을 읽어 GSAP/MorphSVG 또는 직접 보간 방식으로
부드러운 path morphing을 구현할 수 있습니다.

추천 애니메이션 타이밍:
impact 60~80ms
spread 80~110ms
peak 100~140ms
return 120~180ms
idle 복귀

`wave_demo.html`을 브라우저에서 열면 상태 전환 데모를 확인할 수 있습니다.

주의:
이 패키지는 2.5D SVG 기반의 파동 모션용입니다.
몸 회전에 따른 진짜 연속 3D 회전은 별도 GLB/Three.js 레이어와 결합하는 것을 권장합니다.
