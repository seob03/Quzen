const express = require('express');
const { 
  generateQuizFromDB,
  saveQuiz,
  saveQuizResults,
  getUserQuizzes,
  getUserWrongAnswers,
  getQuiz
} = require('../controllers/quizController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /api/quiz/generate-from-db
 * @desc DB 기반 퀴즈 문제 생성 (trainData 컬렉션 사용)
 * @access Public
 * @author 이민섭
 */
router.post('/generate-from-db', generateQuizFromDB);

/**
 * @route POST /api/quiz/save
 * @desc 퀴즈 저장
 * @access Private
 * @author 이민섭
 */
router.post('/save', isAuthenticated, saveQuiz);

/**
 * @route POST /api/quiz/save-results
 * @desc 퀴즈 결과 저장
 * @access Private
 * @author 이민섭
 */
router.post('/save-results', isAuthenticated, saveQuizResults);

/**
 * @route GET /api/quiz/user
 * @desc 사용자의 퀴즈 목록 조회
 * @access Private
 * @author 이민섭
 */
router.get('/user', isAuthenticated, getUserQuizzes);

/**
 * @route GET /api/quiz/wrong-answers
 * @desc 사용자의 오답 목록 조회
 * @access Private
 * @author 이민섭
 */
router.get('/wrong-answers', isAuthenticated, getUserWrongAnswers);

/**
 * @route GET /api/quiz/:quizId
 * @desc 특정 퀴즈 조회
 * @access Private
 * @author 이민섭
 */
router.get('/:quizId', isAuthenticated, getQuiz);

/**
 * @route GET /api/quiz/health
 * @desc 퀴즈 API 상태 확인
 * @access Public
 * @author 이민섭
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '퀴즈 API가 정상적으로 작동 중입니다.',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
