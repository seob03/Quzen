import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { ArrowLeft, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface QuizModeProps {
  onBack: () => void;
  chapter: string;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function QuizMode({ onBack, chapter }: QuizModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(120); // 2분
  const [isTimerActive, setIsTimerActive] = useState(true);

  // Mock questions data
  const questions: Question[] = [
    {
      id: '1',
      question: '경제학에서 말하는 "기회비용"의 정확한 정의는 무엇인가?',
      options: [
        '실제로 지불한 금액',
        '선택하지 않은 대안 중 가장 가치 있는 것의 가치',
        '총비용에서 고정비용을 뺀 것',
        '미래에 발생할 모든 비용의 합'
      ],
      correctAnswer: 1,
      explanation: '기회비용은 어떤 선택을 할 때 포기해야 하는 다른 대안들 중 가장 가치 있는 것을 의미합니다.',
      difficulty: 'easy'
    },
    {
      id: '2',
      question: '완전경쟁시장의 특징이 아닌 것은?',
      options: [
        '다수의 공급자와 수요자',
        '동질적인 상품',
        '시장 진입과 퇴출의 자유',
        '정보의 비대칭성'
      ],
      correctAnswer: 3,
      explanation: '완전경쟁시장에서는 모든 참가자가 완전한 정보를 가지고 있어야 하므로, 정보의 비대칭성은 완전경쟁시장의 특징이 아닙니다.',
      difficulty: 'medium'
    },
    {
      id: '3',
      question: 'GDP(국내총생산)에 포함되지 않는 것은?',
      options: [
        '기업의 설비투자',
        '정부의 공공투자',
        '중고차 판매',
        '수출에서 수입을 뺀 순수출'
      ],
      correctAnswer: 2,
      explanation: 'GDP는 일정 기간 동안 생산된 최종재의 시장가치를 측정하므로, 중고차 판매는 새로운 생산이 아니라 기존 재화의 소유권 이전일 뿐입니다.',
      difficulty: 'medium'
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleSubmitAnswer();
    }
  }, [timeLeft, isTimerActive, showResult]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showResult) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer !== null) {
      setIsTimerActive(false);
      setShowResult(true);
      
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      setScore(prev => ({ 
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(120);
      setIsTimerActive(true);
    } else {
      // Quiz completed
      alert(`퀴즈 완료! 점수: ${score.correct + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0)}/${questions.length}`);
      onBack();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl">퀴즈 모드</h2>
            <p className="text-sm text-muted-foreground">
              문제 {currentQuestionIndex + 1} / {questions.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4" />
            <span className={timeLeft < 30 ? 'text-red-500' : ''}>{formatTime(timeLeft)}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            정답률: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>문제 {currentQuestionIndex + 1}</span>
            <span className={`text-xs px-2 py-1 rounded ${
              currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentQuestion.difficulty === 'easy' ? '쉬움' :
               currentQuestion.difficulty === 'medium' ? '보통' : '어려움'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg leading-relaxed">{currentQuestion.question}</p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedAnswer === index
                    ? showResult
                      ? index === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-primary bg-primary/5'
                    : showResult && index === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : 'border-border hover:border-primary/50'
                } ${showResult ? 'cursor-default' : ''}`}
                onClick={() => handleAnswerSelect(index)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm ${
                    selectedAnswer === index
                      ? showResult
                        ? index === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-red-500 bg-red-500 text-white'
                        : 'border-primary bg-primary text-primary-foreground'
                      : showResult && index === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-muted-foreground'
                  }`}>
                    {showResult ? (
                      selectedAnswer === index ? (
                        index === currentQuestion.correctAnswer ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                      ) : index === currentQuestion.correctAnswer ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        index + 1
                      )
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </div>
            ))}
          </div>

          {showResult && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="flex items-center space-x-2 mb-2">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700">정답입니다!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700">틀렸습니다.</span>
                  </>
                )}
              </h4>
              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex justify-between">
            {!showResult ? (
              <>
                <div></div>
                <Button 
                  onClick={handleSubmitAnswer} 
                  disabled={selectedAnswer === null}
                  className="flex items-center space-x-2"
                >
                  <span>답안 제출</span>
                </Button>
              </>
            ) : (
              <>
                <div></div>
                <Button 
                  onClick={handleNextQuestion}
                  className="flex items-center space-x-2"
                >
                  <span>{currentQuestionIndex < questions.length - 1 ? '다음 문제' : '완료'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}