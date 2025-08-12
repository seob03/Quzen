const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const GoogleAuthController = require('../controllers/googleAuthController');
const KakaoAuthController = require('../controllers/kakaoAuthController');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

function configurePassport(db) {
  const googleAuthController = new GoogleAuthController(db);
  const kakaoAuthController = new KakaoAuthController(db);

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
    // 구글 사용자와 카카오 사용자를 구분하여 저장
    const userId = user.googleId || user.kakaoId;
    const provider = user.googleId ? 'google' : 'kakao';
    done(null, { id: userId, provider });
  });

  // 세션에서 사용자 정보 복원
  passport.deserializeUser(async (userInfo, done) => {
    try {
      let user;
      if (userInfo.provider === 'google') {
        user = await googleAuthController.userModel.findByGoogleId(userInfo.id);
      } else if (userInfo.provider === 'kakao') {
        user = await kakaoAuthController.userModel.findByKakaoId(userInfo.id);
      }
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
      const user = await googleAuthController.googleLoginSuccess(profile);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }

  }));

  // 카카오 OAuth 환경변수 검증
  if (!process.env.KAKAO_CLIENT_ID || !process.env.KAKAO_CLIENT_SECRET) {
    console.error('❌ Kakao OAuth 환경변수가 설정되지 않았습니다!');
    console.error('📝 .env 파일에 다음을 추가하세요:');
    console.error('KAKAO_CLIENT_ID=your_kakao_client_id');
    console.error('KAKAO_CLIENT_SECRET=your_kakao_client_secret');
  } else {
    // Kakao OAuth 전략 설정
    passport.use(new KakaoStrategy({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL || "http://localhost/auth/kakao/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await kakaoAuthController.kakaoLoginSuccess(profile);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));

    console.log('✅ Passport Kakao OAuth 전략 설정 완료');
  }
  console.log('✅ Passport Google OAuth 전략 설정 완료');

}

module.exports = configurePassport;
