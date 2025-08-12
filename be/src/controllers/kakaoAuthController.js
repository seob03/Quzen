const KakaoUser = require('../models/KakaoUser');

class KakaoAuthController {
  constructor(db) {
    this.userModel = new KakaoUser(db);
  }

  // 카카오 로그인 성공 시 호출
  async kakaoLoginSuccess(profile) {
    try {
      const userData = {
        kakaoId: profile.id,
        email: profile._json.kakao_account?.email || null,
        name: profile.displayName,
        picture: profile._json.properties?.profile_image || null
      };

      const user = await this.userModel.updateOrCreate(userData);
      return user;
    } catch (error) {
      console.error('Kakao login error:', error);
      throw error;
    }
  }

  // 카카오 로그인 상태 확인
  async checkAuthStatus(userId) {
    try {
      const user = await this.userModel.findByKakaoId(userId);
      return user;
    } catch (error) {
      console.error('Kakao auth status check error:', error);
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

module.exports = KakaoAuthController;
