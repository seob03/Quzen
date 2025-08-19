const OpenAI = require('openai');
const Quiz = require('../models/Quiz');

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * DB 기반 퀴즈 문제 생성 (trainData 컬렉션 사용)
 */
const generateQuizFromDB = async (req, res) => {
  try {
    const { subject, difficulty = 'medium', numQuestions = 5, isRandom = false } = req.body;
    
    if (!subject) {
      return res.status(400).json({ error: '과목(subject)은 필수입니다.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API 키가 설정되지 않았습니다.' });
    }

    // DB에서 해당 과목의 데이터 가져오기
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: '데이터베이스 연결이 없습니다.' });
    }

    const trainDataCollection = db.collection('trainData');
    let documents;
    
    if (isRandom) {
      // 랜덤 모드: 모든 과목에서 데이터 가져오기
      documents = await trainDataCollection.find({}).toArray();
    } else {
      // 특정 과목만 선택
      documents = await trainDataCollection.find({ subject }).toArray();
    }

    if (documents.length === 0) {
      return res.status(404).json({ error: `데이터를 찾을 수 없습니다.` });
    }

    // 랜덤으로 문서 선택 (최대 3개)
    const selectedDocs = [];
    const shuffled = documents.sort(() => 0.5 - Math.random());
    const docsToUse = Math.min(3, shuffled.length);
    
    for (let i = 0; i < docsToUse; i++) {
      selectedDocs.push(shuffled[i]);
    }

    // 선택된 문서들의 내용을 조합
    const combinedContent = selectedDocs.map(doc => 
      `[${doc.chapter} - ${doc.section}]\n${doc.content}`
    ).join('\n\n');

    // 난이도별 프롬프트 조정
    let difficultyPrompt = '';
    switch (difficulty) {
      case 'easy':
        difficultyPrompt = '기초적인 개념과 사실에 대한 쉬운 문제를 생성해주세요.';
        break;
      case 'medium':
        difficultyPrompt = '중간 수준의 이해와 적용이 필요한 문제를 생성해주세요.';
        break;
      case 'hard':
        difficultyPrompt = '심화된 지식과 분석이 필요한 어려운 문제를 생성해주세요.';
        break;
      default:
        difficultyPrompt = '중간 수준의 문제를 생성해주세요.';
    }

    // 퀴즈 생성을 위한 프롬프트 구성
    const prompt = `
다음 교재 내용을 바탕으로 퀴즈 문제를 생성해주세요:

과목: ${isRandom ? '랜덤 (경영/경제)' : subject}
난이도: ${difficulty}
${difficultyPrompt}
문제 수: ${numQuestions}개

교재 내용:
${combinedContent}

다음 JSON 형식으로 응답해주세요:
{
  "quiz": [
    {
      "question": "문제 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "correctAnswer": 2,
      "explanation": "정답 설명",
      "chapter": "해당 챕터명",
      "section": "해당 섹션명"
    }
  ]
}

주의사항:
- correctAnswer는 0-3 사이의 숫자 (0: 첫 번째 선택지, 1: 두 번째 선택지, 2: 세 번째 선택지, 3: 네 번째 선택지)
- 정답은 0, 1, 2, 3 중 랜덤하게 분포되어야 하며, 항상 같은 위치에 있으면 안 됩니다
- 모든 문제는 객관식으로 생성
- 설명은 간결하고 이해하기 쉽게 작성
- chapter와 section은 교재 내용에서 해당하는 부분을 명시
- JSON 형식만 응답하고 다른 텍스트는 포함하지 마세요
- 각 문제의 정답 위치를 다양하게 분배해주세요
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 매일경제 테스트 전문 교육자입니다. 주어진 교재 내용을 바탕으로 정확하고 교육적인 퀴즈 문제를 생성해주세요. 정답의 위치는 0, 1, 2, 3 중에서 다양하게 분포되어야 합니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 3000
    });

    const response = completion.choices[0].message.content;
    
    // JSON 파싱 시도
    let quizData;
    try {
      // JSON 부분만 추출 (혹시 다른 텍스트가 포함된 경우)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        quizData = JSON.parse(response);
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('GPT 응답:', response);
      return res.status(500).json({ 
        error: '퀴즈 생성 중 오류가 발생했습니다.',
        details: '응답을 파싱할 수 없습니다.'
      });
    }

    res.json({
      success: true,
      quiz: quizData.quiz || quizData,
      subject: isRandom ? '랜덤' : subject,
      difficulty,
      numQuestions,
      isRandom,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('DB 기반 퀴즈 생성 오류:', error);
    res.status(500).json({ 
      error: '퀴즈 생성 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
};

/**
 * 퀴즈 저장
 */
const saveQuiz = async (req, res) => {
  try {
    const { title, subject, difficulty, questions, mode, isRandom } = req.body;
    const userId = req.user?._id || req.user?.id; // 인증된 사용자 ID

    if (!userId) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    if (!title || !subject || !questions || !mode) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    const quiz = new Quiz({
      title,
      subject,
      difficulty: difficulty || 'medium',
      questions,
      createdBy: userId,
      mode,
      isRandom: isRandom || false
    });

    // 유효성 검사
    quiz.validate();

    // MongoDB에 저장
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: '데이터베이스 연결이 없습니다.' });
    }

    const quizCollection = db.collection('quizzes');
    const result = await quizCollection.insertOne(quiz.toDocument());

    res.json({
      success: true,
      quiz: { ...quiz.toDocument(), _id: result.insertedId },
      message: '퀴즈가 성공적으로 저장되었습니다.'
    });

  } catch (error) {
    console.error('퀴즈 저장 오류:', error);
    res.status(500).json({ 
      error: '퀴즈 저장 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
};

/**
 * 퀴즈 결과 저장 (기존 퀴즈에 결과 추가)
 */
const saveQuizResults = async (req, res) => {
  try {
    const { quizId, results, quizData } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ error: '결과는 필수입니다.' });
    }

    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: '데이터베이스 연결이 없습니다.' });
    }

    const { ObjectId } = require('mongodb');
    const quizCollection = db.collection('quizzes');
    
    let quizIdToUse = quizId;
    
    // quizId가 없으면 새로 퀴즈를 생성
    if (!quizId && quizData) {
      const quiz = new Quiz({
        title: quizData.title || '퀴즈',
        subject: quizData.subject || '기타',
        difficulty: quizData.difficulty || 'medium',
        questions: quizData.questions || [],
        createdBy: userId,
        mode: quizData.mode || 'quiz',
        isRandom: quizData.isRandom || false
      });

      quiz.validate();
      const result = await quizCollection.insertOne(quiz.toDocument());
      quizIdToUse = result.insertedId.toString();
    } else if (!quizId) {
      return res.status(400).json({ error: '퀴즈 ID 또는 퀴즈 데이터가 필요합니다.' });
    }

    // 퀴즈 조회 (기존 퀴즈인 경우)
    let quiz;
    if (quizId) {
      quiz = await quizCollection.findOne({ 
        _id: ObjectId.createFromHexString(quizIdToUse), 
        createdBy: userId 
      });
    } else {
      quiz = await quizCollection.findOne({ 
        _id: ObjectId.createFromHexString(quizIdToUse)
      });
    }

    if (!quiz) {
      console.log('quizController.js line 475: 퀴즈를 찾을 수 없습니다.');
      return res.status(404).json({ error: '퀴즈를 찾을 수 없습니다.' });
    } else {
      console.log('quizController.js line 478: 퀴즈를 찾았습니다.');
      console.log('quiz:', quiz);
    }

    // 결과 정보 계산
    const totalQuestions = results.length;
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // 각 결과에 추가 정보 포함
    const enhancedResults = results.map((result, index) => {
      const question = quiz.questions[result.questionIndex];
      return {
        ...result,
        questionText: question.question,
        userAnswerText: question.options[result.userAnswer],
        correctAnswerText: question.options[result.correctAnswer],
        explanation: question.explanation || null
      };
    });

    // 퀴즈 업데이트
    const updateResult = await quizCollection.updateOne(
      { _id: ObjectId.createFromHexString(quizIdToUse) },
      {
        $set: {
          results: enhancedResults,
          completedAt: new Date(),
          score: score,
          totalQuestions: totalQuestions,
          correctAnswers: correctAnswers
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({ error: '퀴즈 결과 저장에 실패했습니다.' });
    }

    res.json({
      success: true,
      message: '퀴즈 결과가 성공적으로 저장되었습니다.',
      quizId: quizIdToUse,
      score: score,
      correctAnswers: correctAnswers,
      totalQuestions: totalQuestions
    });

  } catch (error) {
    console.error('퀴즈 결과 저장 오류:', error);
    res.status(500).json({ 
      error: '퀴즈 결과 저장 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
};

/**
 * 사용자의 퀴즈 목록 조회 (날짜별 그룹화)
 */
const getUserQuizzes = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: '데이터베이스 연결이 없습니다.' });
    }

    const quizCollection = db.collection('quizzes');
    const quizzes = await quizCollection
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .toArray();

    // 날짜별로 그룹화
    const groupedQuizzes = quizzes.reduce((groups, quiz) => {
      const date = new Date(quiz.createdAt).toLocaleDateString('ko-KR');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(quiz);
      return groups;
    }, {});

    res.json({
      success: true,
      quizzes: quizzes,
      groupedQuizzes: groupedQuizzes
    });

  } catch (error) {
    console.error('퀴즈 목록 조회 오류:', error);
    res.status(500).json({ 
      error: '퀴즈 목록 조회 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
};

/**
 * 사용자의 오답 목록 조회
 */
const getUserWrongAnswers = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: '데이터베이스 연결이 없습니다.' });
    }

    const quizCollection = db.collection('quizzes');
    
    // 완료된 퀴즈 중에서 오답만 추출
    const completedQuizzes = await quizCollection
      .find({ 
        createdBy: userId,
        results: { $exists: true, $ne: null }
      })
      .sort({ completedAt: -1 })
      .toArray();

    // 오답 문제들 추출
    const wrongAnswers = [];
    completedQuizzes.forEach(quiz => {
      if (quiz.results) {
        quiz.results.forEach((result, index) => {
          if (!result.isCorrect) {
            wrongAnswers.push({
              quizId: quiz._id,
              quizTitle: quiz.title,
              questionIndex: index,
              question: quiz.questions[index],
              userAnswer: result.userAnswer,
              correctAnswer: result.correctAnswer,
              userAnswerText: result.userAnswerText || quiz.questions[index].options[result.userAnswer],
              correctAnswerText: result.correctAnswerText || quiz.questions[index].options[result.correctAnswer],
              questionText: result.questionText || quiz.questions[index].question,
              explanation: result.explanation || quiz.questions[index].explanation,
              completedAt: quiz.completedAt,
              subject: quiz.subject,
              difficulty: quiz.difficulty,
              mode: quiz.mode
            });
          }
        });
      }
    });

    // 날짜별로 그룹화
    const groupedWrongAnswers = wrongAnswers.reduce((groups, answer) => {
      const date = new Date(answer.completedAt).toLocaleDateString('ko-KR');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(answer);
      return groups;
    }, {});

    res.json({
      success: true,
      wrongAnswers: wrongAnswers,
      groupedWrongAnswers: groupedWrongAnswers
    });

  } catch (error) {
    console.error('오답 목록 조회 오류:', error);
    res.status(500).json({ 
      error: '오답 목록 조회 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
};

/**
 * 특정 퀴즈 조회
 */
const getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: '데이터베이스 연결이 없습니다.' });
    }

    const { ObjectId } = require('mongodb');
    const quizCollection = db.collection('quizzes');
    const quiz = await quizCollection.findOne({ 
      _id: ObjectId.createFromHexString(quizId), 
      createdBy: userId 
    });

    if (!quiz) {
      return res.status(404).json({ error: '퀴즈를 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      quiz: quiz
    });

  } catch (error) {
    console.error('퀴즈 조회 오류:', error);
    res.status(500).json({ 
      error: '퀴즈 조회 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
};

module.exports = {
  generateQuizFromDB,
  saveQuiz,
  saveQuizResults,
  getUserQuizzes,
  getUserWrongAnswers,
  getQuiz
};
