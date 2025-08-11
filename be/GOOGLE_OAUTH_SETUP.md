# Google OAuth 2.0 설정 가이드

## 1. Google Cloud Console에서 OAuth 2.0 클라이언트 생성

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보"로 이동
4. "사용자 인증 정보 만들기" > "OAuth 2.0 클라이언트 ID" 선택
5. 애플리케이션 유형: "웹 애플리케이션" 선택
6. 승인된 리디렉션 URI에 다음 추가:
   - `http://localhost/auth/google/callback` (개발용 - Nginx 프록시)
   - `https://yourdomain.com/auth/google/callback` (프로덕션용)

## 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```env
# Google OAuth 설정
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost/auth/google/callback

# 세션 설정
SESSION_SECRET=your_session_secret_here

# 프론트엔드 URL (Docker 환경)
FRONTEND_URL=http://localhost

# 데이터베이스 설정
MONGODB_URI=mongodb://localhost:27017/quzen

# 서버 포트
PORT=8080
```

## 3. API 엔드포인트

### 로그인
- `GET /auth/google` - 구글 로그인 시작

### 콜백
- `GET /auth/google/callback` - 구글 로그인 콜백 (자동 처리)

### 사용자 정보
- `GET /auth/me` - 현재 로그인한 사용자 정보 조회

### 로그아웃
- `GET /auth/logout` - 로그아웃

## 4. 프론트엔드에서 사용 예시

```javascript
// 로그인 버튼 클릭 시
window.location.href = '/auth/google';

// 사용자 정보 조회
fetch('/auth/me', {
  credentials: 'include'
})
.then(response => response.json())
.then(data => {
  if (data.user) {
    console.log('로그인된 사용자:', data.user);
  }
});

// 로그아웃
fetch('/auth/logout', {
  credentials: 'include'
})
.then(() => {
  console.log('로그아웃 완료');
});
```

## 5. Docker 환경 주의사항

- Nginx가 `/auth/` 경로를 백엔드로 프록시하도록 설정됨
- 세션 쿠키가 올바르게 전달되도록 Nginx 설정 완료
- CORS 설정이 Docker 환경에 맞게 최적화됨
