const express = require('express');
const passport = require('passport');
const AuthController = require('../controllers/authController');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

function createAuthRoutes(db) {
  const router = express.Router();
  const authController = new AuthController(db);

  // 구글 로그인 시작
  router.get('/google', (req, res, next) => {
    console.log('🔐 Google OAuth 시작');
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  });

  // 구글 로그인 콜백
  router.get('/google/callback', 
    passport.authenticate('google', { 
      failureRedirect: '/auth/failure',
      session: true
    }),
    (req, res) => {
      console.log('구글 로그인 콜백');
      // 로그인 성공 시 프론트엔드로 리다이렉트
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
    }
  );

  // 로그인 실패
  router.get('/failure', (req, res) => {
    res.status(401).json({ error: '로그인 실패' });
  });

  // 로그아웃
  router.get('/logout', (req, res) => {
    authController.logout(req, res);
  });

  // 현재 사용자 정보 조회
  router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({
        user: {
          id: req.user.googleId,
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

module.exports = createAuthRoutes;
