const express = require('express');
const passport = require('passport');
const KakaoAuthController = require('../controllers/kakaoAuthController');

function createKakaoAuthRoutes(db) {
  const router = express.Router();
  const kakaoAuthController = new KakaoAuthController(db);

  /**
   * @route GET /auth/kakao
   * @desc 카카오 로그인 시작
   * @access Public
   * @author 이민섭
   */
  router.get('/kakao', (req, res, next) => {
    console.log('Kakao OAuth 시작');
    passport.authenticate('kakao', {
      scope: ['profile_nickname', 'profile_image']
    })(req, res, next);
  });

  /**
   * @route GET /auth/kakao/callback
   * @desc 카카오 로그인 콜백
   * @access Public
   * @author 이민섭
   */
  router.get('/kakao/callback',
    passport.authenticate('kakao', {
      failureRedirect: '/auth/failure',
      session: true
    }),
    (req, res) => {
      console.log('카카오 로그인 콜백');
      // 로그인 성공 시 프론트엔드로 리다이렉트
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
    }
  );

  // 카카오 로그인 실패
  router.get('/failure', (req, res) => {
    res.status(401).json({ error: '카카오 로그인 실패' });
  });

  // 카카오 로그아웃
  router.get('/logout', (req, res) => {
    kakaoAuthController.logout(req, res);
  });

  // 현재 카카오 사용자 정보 조회
  router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({
        user: {
          id: req.user.kakaoId,
          email: req.user.email,
          name: req.user.name,
          picture: req.user.picture
        }
      });
    } else {
      res.status(401).json({ error: '로그인이 필요합니다' });
    }
  });

  return router;
}

module.exports = createKakaoAuthRoutes;
