import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { BookOpen, FileText, AlertCircle, Archive, TrendingUp, Target, Sparkles } from 'lucide-react';

type View = 'home' | 'wrong-answers' | 'archive' | 'db-quiz-generator';

interface HomeProps {
  onNavigate: (view: View) => void;
}

export function Home({ onNavigate }: HomeProps) {
  // Mock data for demonstration
  const progress = {
    totalQuestions: 450,
    solvedQuestions: 287,
    correctRate: 78,
    weeklyGoal: 50,
    weeklyProgress: 32
  };

  const recentChapters = [
    { name: '경제학 개론', progress: 85, questions: 45 },
    { name: '회계학 기초', progress: 62, questions: 38 },
    { name: '경영학 원론', progress: 40, questions: 22 }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h2 className="text-3xl mb-4">매경 TEST 준비</h2>
        <p className="text-muted-foreground mb-6">AI가 생성하는 맞춤형 문제로 효율적인 학습을 시작하세요</p>
        
        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={() => onNavigate('db-quiz-generator')}
            className="flex items-center space-x-2 px-8 py-6 text-lg"
          >
            <Sparkles className="w-6 h-6" />
            <span>AI 매경 퀴즈</span>
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>학습 현황</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>전체 진도</span>
              <span>{progress.solvedQuestions}/{progress.totalQuestions}</span>
            </div>
            <Progress value={(progress.solvedQuestions / progress.totalQuestions) * 100} />
            
            <div className="flex justify-between">
              <span>정답률</span>
              <span className="text-green-600">{progress.correctRate}%</span>
            </div>
            <Progress value={progress.correctRate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>주간 목표</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>이번 주 목표</span>
              <span>{progress.weeklyProgress}/{progress.weeklyGoal} 문제</span>
            </div>
            <Progress value={(progress.weeklyProgress / progress.weeklyGoal) * 100} />
            <p className="text-sm text-muted-foreground">
              목표까지 {progress.weeklyGoal - progress.weeklyProgress}문제 남음
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('wrong-answers')}>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="mb-1">오답노트</h3>
            <p className="text-sm text-muted-foreground">틀린 문제 복습하기</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('archive')}>
          <CardContent className="p-6 text-center">
            <Archive className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="mb-1">아카이브</h3>
            <p className="text-sm text-muted-foreground">풀었던 문제 보기</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="mb-1">단원별 학습</h3>
            <p className="text-sm text-muted-foreground">원하는 단원 선택</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Chapters */}
      <Card>
        <CardHeader>
          <CardTitle>최근 학습 단원</CardTitle>
          <CardDescription>최근에 공부했던 단원들의 진도를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentChapters.map((chapter, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">{chapter.name}</span>
                    <span className="text-xs text-muted-foreground">{chapter.questions}문제 풀이</span>
                  </div>
                  <Progress value={chapter.progress} className="h-2" />
                </div>
                <Button variant="ghost" size="sm" className="ml-4">
                  계속하기
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}