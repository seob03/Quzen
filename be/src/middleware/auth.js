const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: '로그인이 필요합니다.' });
};

module.exports = {
  isAuthenticated
};
