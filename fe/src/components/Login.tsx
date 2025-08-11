import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Brain } from 'lucide-react';


export function Login() {

  const handleOAuthLogin = (provider: string) => {
    console.log(`OAuth login with ${provider}`);
    
    if (provider === 'google') {
      // 구글 OAuth 로그인 시작
      window.location.href = '/auth/google';
    } else {
      console.error('지원하지 않는 OAuth 제공자:', provider);
    }
  };

  const testApiConnection = () => {
    console.log('API 연결 테스트 시작...');
    fetch('/api/test', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        console.log('API 응답:', data);
        alert(`API 연결 성공!\n${JSON.stringify(data, null, 2)}`);
      })
      .catch(error => {
        console.error('API 연결 실패:', error);
        alert('API 연결 실패: ' + error.message);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Quzen</h1>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>로그인</CardTitle>
            <CardDescription>
              OAuth를 통해 간편하게 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleOAuthLogin('google')}
            >
              Google로 로그인
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleOAuthLogin('github')}
            >
              GitHub으로 로그인
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleOAuthLogin('kakao')}
            >
              카카오로 로그인
            </Button>
            
            {/* API 테스트 버튼 */}
            <div className="pt-4 border-t">
              <Button
                className="w-full"
                variant="secondary"
                onClick={testApiConnection}
              >
                🔧 API 연결 테스트
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}