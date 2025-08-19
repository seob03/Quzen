import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Save } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  chapter?: string;
  section?: string;
}

interface QuizModeViewProps {
  quiz: QuizQuestion[];
  subject: string;
  difficulty: string;
  onBack: () => void;
  onSave?: (quiz: QuizQuestion[], mode: string) => void;
}

export const QuizModeView: React.FC<QuizModeViewProps> = ({ 
  quiz, 
  subject, 
  difficulty, 
  onBack,
  onSave 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [userAnswers, setUserAnswers] = useState<number[]>(new Array(quiz.length).fill(-1));

  const currentQuestion = quiz[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showResult) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer !== null) {
      setShowResult(true);
      
      const newUserAnswers = [...userAnswers];
      newUserAnswers[currentQuestionIndex] = selectedAnswer;
      setUserAnswers(newUserAnswers);
      
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      setScore(prev => ({ 
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1] !== -1 ? userAnswers[currentQuestionIndex + 1] : null);
      setShowResult(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1] !== -1 ? userAnswers[currentQuestionIndex - 1] : null);
      setShowResult(false);
    }
  };

  const handleSaveQuiz = async () => {
    // 퀴즈 결과를 DB에 저장
    try {
      const results = userAnswers.map((userAnswer, index) => {
        if (userAnswer === -1) return null; // 답안을 선택하지 않은 문제
        
        const question = quiz[index];
        return {
          questionIndex: index,
          userAnswer: userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: userAnswer === question.correctAnswer
        };
      }).filter(result => result !== null); // null 값 제거

      console.log('=== 퀴즈 결과 저장 디버깅 ===');
      console.log('전체 문제 수:', quiz.length);
      console.log('답안 배열:', userAnswers);
      console.log('결과 배열:', results);

      const requestBody = {
        quizData: {
          title: `${subject} ${getDifficultyText(difficulty)} 퀴즈`,
          subject: subject,
          difficulty: difficulty,
          questions: quiz.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          })),
          mode: 'quiz'
        },
        results: results
      };

      console.log('전송할 데이터:', requestBody);

      const response = await fetch('/api/quiz/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('퀴즈 결과 저장 성공:', data);
        alert('퀴즈 결과가 저장되었습니다!');
      } else {
        const errorData = await response.json();
        console.error('퀴즈 결과 저장 실패:', errorData);
        alert('퀴즈 결과 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('퀴즈 결과 저장 오류:', error);
      alert('퀴즈 결과 저장 중 오류가 발생했습니다.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return '보통';
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
              {subject} - {getDifficultyText(difficulty)} | 문제 {currentQuestionIndex + 1} / {quiz.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
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
            <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(difficulty)}`}>
              {getDifficultyText(difficulty)}
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
            <Button 
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전
            </Button>
            
            {!showResult ? (
              <Button 
                onClick={handleSubmitAnswer} 
                disabled={selectedAnswer === null}
              >
                답안 제출
              </Button>
            ) : (
              <Button 
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === quiz.length - 1}
              >
                다음
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Summary */}
      {currentQuestionIndex === quiz.length - 1 && showResult && (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg mb-2">퀴즈 완료!</h3>
            <p className="text-muted-foreground mb-4">
              총 {quiz.length}문제 중 {score.correct}문제를 맞혔습니다. ({Math.round((score.correct / quiz.length) * 100)}%)
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                홈으로 돌아가기
              </Button>
              <Button onClick={handleSaveQuiz}>
                결과 저장
              </Button>
              <Button onClick={() => {
                setCurrentQuestionIndex(0);
                setSelectedAnswer(userAnswers[0] !== -1 ? userAnswers[0] : null);
                setShowResult(false);
                setScore({ correct: 0, total: 0 });
              }}>
                다시 풀기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
