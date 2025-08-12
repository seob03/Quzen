require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const connectDB = require('./db.js');
const configurePassport = require('./src/config/passport');
const createGoogleAuthRoutes = require('./src/routes/googleAuthRoutes');
const createKakaoAuthRoutes = require('./src/routes/kakaoAuthRoutes');


// 환경변수 디버그 로그
console.log('🔍 환경변수 로딩 상태:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ 설정됨' : '❌ 없음');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ 설정됨' : '❌ 없음');
console.log('KAKAO_CLIENT_ID:', process.env.KAKAO_CLIENT_ID ? '✅ 설정됨' : '❌ 없음');
console.log('KAKAO_CLIENT_SECRET:', process.env.KAKAO_CLIENT_SECRET ? '✅ 설정됨' : '❌ 없음');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ 설정됨' : '❌ 없음');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost');
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://mongo:27017/quzen');

const app = express();

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || '1234',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24시간
    sameSite: 'lax'
  },
  name: 'quzen_session'
}));

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

let server;
let dbInstance;

connectDB().then((db) => {
  dbInstance = db; // 종료 시 사용하기 위해 저장

  // Passport 설정
  configurePassport(db);

  // 구글 인증 라우트 설정
  app.use('/auth', createGoogleAuthRoutes(db));

  // 카카오 인증 라우트 설정

  app.use('/auth', createKakaoAuthRoutes(db));

  server = app.listen(process.env.PORT || 8080, () => {
    console.log('API 서버 실행중 http://localhost:8080');
  });

  // API 라우트들 (DB 연결 후에 정의)
  app.get('/test', (req, res) => {
    db.collection('test').insertOne({ title: '이거 되면 인정이요 @@@@@@@@' })
      .then(() => {
        res.json({ message: 'DB 저장 완료!' });
      })
      .catch((error) => {
        res.status(500).json({ error: 'DB 저장 실패' });
      });
  });

  // API 연결 테스트 (OAuth 없이)
  app.get('/api/test', (req, res) => {
    res.json({
      message: 'API 연결 성공!',
      timestamp: new Date().toISOString(),
      env: {
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        frontendUrl: process.env.FRONTEND_URL
      }
    });
  });


  // API 서버이므로 다른 라우트는 404 (정규식 사용)
  app.get(/.*/, (req, res) => {
    res.status(404).json({ error: 'API 엔드포인트를 찾을 수 없습니다' });
  });

}).catch((err) => {
  console.error('DB 연결 실패:', err);
});
