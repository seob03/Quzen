// 모듈 선언
const express = require('express');
const app = express();
const path = require('path');
const tmp = require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('./db.js');

const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

// oauth
const configurePassport = require('./src/config/passport');
const createGoogleAuthRoutes = require('./src/routes/googleAuthRoutes');
const createKakaoAuthRoutes = require('./src/routes/kakaoAuthRoutes');

// quiz
const quizRoutes = require('./src/routes/quizRoutes');


// 환경변수 디버그 로그
console.log('🔍 환경변수 로딩 상태:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ 설정됨' : '❌ 없음');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ 설정됨' : '❌ 없음');
console.log('KAKAO_CLIENT_ID:', process.env.KAKAO_CLIENT_ID ? '✅ 설정됨' : '❌ 없음');
console.log('KAKAO_CLIENT_SECRET:', process.env.KAKAO_CLIENT_SECRET ? '✅ 설정됨' : '❌ 없음');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ 설정됨' : '❌ 없음');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost');
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://mongo:27017/quzen');



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
    secure: false, // 배포할 때는 true로 변경하기
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
  
  // DB 연결을 app.locals에 저장 (라우트에서 사용하기 위해)
  app.locals.db = db;

  // Passport 설정
  configurePassport(db);
  // 구글 인증 라우트 설정
  app.use('/auth', createGoogleAuthRoutes(db));
  // 카카오 인증 라우트 설정
  app.use('/auth', createKakaoAuthRoutes(db));
  // 퀴즈 라우트 설정
  app.use('/api/quiz', quizRoutes);

  server = app.listen(process.env.PORT || 8080, () => {
    console.log('API 서버 실행중 http://localhost:8080');
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
