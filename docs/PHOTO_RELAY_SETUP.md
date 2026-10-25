# 사진 QR 중계 설정

사진은 촬영 브라우저의 메모리에만 보관하고, QR을 읽은 휴대폰 한 대에 WebRTC로 전달합니다. 사진 파일을 서버 저장소에 업로드하지 않습니다. 네트워크가 직접 연결을 차단해도 전달할 수 있도록 TURN 중계를 사용합니다.

현재 연결된 TURN 서비스가 없습니다. 코드만 배포하면 QR 수신이 해결되는 상태는 아닙니다. 설정이 없으면 QR을 만들지 않고 `relay-not-configured` 안내를 표시합니다. 촬영 기기에서 사진 다운로드는 계속 사용할 수 있습니다.

## Vercel 설정

1. Cloudflare Realtime TURN에서 TURN 키를 발급합니다. 서비스 이용 조건과 요금은 계정에서 확인합니다.
2. Vercel 프로젝트의 Environment Variables에 아래 두 값을 등록합니다. 브랜치에서도 사용할 경우 Preview 환경에도 등록합니다.
   - `CLOUDFLARE_TURN_KEY_ID`
   - `CLOUDFLARE_TURN_API_TOKEN`
3. 환경변수에는 `VITE_` 접두사를 붙이지 않습니다. 비밀 토큰은 브라우저 번들에 들어가면 안 됩니다.
4. 다시 배포합니다. `/api/photo-ice`는 10분짜리 임시 ICE 자격증명만 발급하며 사진을 받지 않습니다.
5. 촬영 화면을 열어 둔 상태에서 새 QR을 발급하고 휴대폰 Safari/Chrome으로 엽니다. 같은 Wi-Fi와 모바일 데이터에서 각각 수신·저장을 확인합니다.

로컬의 일반 Vite 서버는 Vercel API를 실행하지 않습니다. API까지 검사할 때는 Vercel 개발 환경 또는 배포된 Preview를 사용합니다. QR은 발급 후 5분, 한 번의 수신만 허용합니다.

공식 안내: https://developers.cloudflare.com/realtime/turn/generate-credentials/

## 검증 범위

자격증명 미설정, 잘못된 STUN 전용 응답, 컴포넌트 종료 시 연결 정리, 사진 토큰 검증과 만료는 자동 테스트로 확인합니다. 실제 TURN 자격증명을 사용한 휴대폰 전송은 아직 검증하지 않았습니다.

## Metered dashboard credential option

Set these server-side Vercel environment variables for Production and Preview:
- `METERED_TURN_USERNAME`: the dashboard credential username.
- `METERED_TURN_PASSWORD`: the dashboard `credential` value, without quotation marks.

Deploy the updated `api/photo-ice.js` and redeploy after saving variables. If either Metered variable exists, both are required; this option takes precedence over Cloudflare. These reusable TURN credentials are delivered to WebRTC clients at runtime, but are not embedded in the frontend build or repository. They do not expire after the photo link's five-minute lifetime. Rotate/delete the credential in Metered when needed and update Vercel. Never put the account Secret Key into these fields.

Test from the public deployment: take a photo, keep the sender page open, scan the new QR on a phone and download. Allow up to two minutes after creating a Metered credential. Automated checks do not establish real relay connectivity; that requires actual configured credentials and two devices.
