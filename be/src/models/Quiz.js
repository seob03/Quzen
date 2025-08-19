// Quiz 모델을 MongoDB 네이티브 방식으로 구현
class Quiz {
  constructor(data) {
    this.title = data.title;
    this.subject = data.subject;
    this.difficulty = data.difficulty || 'medium';
    this.questions = data.questions || [];
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date();
    this.mode = data.mode;
    this.isRandom = data.isRandom || false;
    // 퀴즈 결과 정보 추가
    this.results = data.results || null; // 퀴즈 완료 후 결과
    this.completedAt = data.completedAt || null; // 퀴즈 완료 시간
    this.score = data.score || null; // 점수
    this.totalQuestions = data.totalQuestions || 0; // 총 문제 수
    this.correctAnswers = data.correctAnswers || 0; // 정답 수
  }

  // 유효성 검사
  validate() {
    if (!this.title || !this.subject || !this.questions || !this.mode) {
      throw new Error('필수 필드가 누락되었습니다.');
    }

    if (!['easy', 'medium', 'hard'].includes(this.difficulty)) {
      throw new Error('잘못된 난이도입니다.');
    }

    if (!['quiz', 'workbook'].includes(this.mode)) {
      throw new Error('잘못된 모드입니다.');
    }

    // 각 문제 유효성 검사
    this.questions.forEach((question, index) => {
      if (!question.question || !question.options || question.correctAnswer === undefined) {
        throw new Error(`문제 ${index + 1}의 필수 필드가 누락되었습니다.`);
      }
      
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        throw new Error(`문제 ${index + 1}의 선택지는 4개여야 합니다.`);
      }

      if (question.correctAnswer < 0 || question.correctAnswer > 3) {
        throw new Error(`문제 ${index + 1}의 정답 번호가 잘못되었습니다.`);
      }
    });

    return true;
  }

  // 퀴즈 결과 설정
  setResults(results) {
    this.results = results;
    this.completedAt = new Date();
    this.totalQuestions = results.length;
    this.correctAnswers = results.filter(r => r.isCorrect).length;
    this.score = Math.round((this.correctAnswers / this.totalQuestions) * 100);
  }

  // MongoDB 문서로 변환
  toDocument() {
    return {
      title: this.title,
      subject: this.subject,
      difficulty: this.difficulty,
      questions: this.questions,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      mode: this.mode,
      isRandom: this.isRandom,
      results: this.results,
      completedAt: this.completedAt,
      score: this.score,
      totalQuestions: this.totalQuestions,
      correctAnswers: this.correctAnswers
    };
  }

  // MongoDB 문서에서 Quiz 객체 생성
  static fromDocument(doc) {
    return new Quiz({
      title: doc.title,
      subject: doc.subject,
      difficulty: doc.difficulty,
      questions: doc.questions,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      mode: doc.mode,
      isRandom: doc.isRandom,
      results: doc.results,
      completedAt: doc.completedAt,
      score: doc.score,
      totalQuestions: doc.totalQuestions,
      correctAnswers: doc.correctAnswers
    });
  }
}

module.exports = Quiz;
