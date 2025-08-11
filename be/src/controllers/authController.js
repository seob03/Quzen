const User = require('../models/User');

class AuthController {
  constructor(db) {
    this.userModel = new User(db);
  }

  // 구글 로그인 성공 시 호출
  async googleLoginSuccess(profile) {
    try {
      const userData = {
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos[0]?.value || null
      };

      const user = await this.userModel.updateOrCreate(userData);
      return user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // 로그인 상태 확인
  async checkAuthStatus(userId) {
    try {
      const user = await this.userModel.findByGoogleId(userId);
      return user;
    } catch (error) {
      console.error('Auth status check error:', error);
      throw error;
    }
  }

  // 로그아웃
  async logout(req, res) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: '로그아웃 실패' });
      }
      res.json({ message: '로그아웃 성공' });
    });
  }
}

module.exports = AuthController;
