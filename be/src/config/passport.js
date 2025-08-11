const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AuthController = require('../controllers/authController');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

function configurePassport(db) {
  const authController = new AuthController(db);

  // 환경변수 검증
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ Google OAuth 환경변수가 설정되지 않았습니다!');
    console.error('📝 .env 파일에 다음을 추가하세요:');
    console.error('GOOGLE_CLIENT_ID=your_google_client_id');
    console.error('GOOGLE_CLIENT_SECRET=your_google_client_secret');
    return; // Passport 설정을 건너뛰고 계속 진행
  }

  // 세션에 사용자 정보 저장
  passport.serializeUser((user, done) => {
    done(null, user.googleId);
  });

  // 세션에서 사용자 정보 복원
  passport.deserializeUser(async (googleId, done) => {
    try {
      const user = await authController.userModel.findByGoogleId(googleId);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth 전략 설정
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await authController.googleLoginSuccess(profile);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  console.log('✅ Passport Google OAuth 전략 설정 완료');
}

module.exports = configurePassport;
