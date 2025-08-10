import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Brain } from 'lucide-react';

export function Login() {
  const handleOAuthLogin = (provider: string) => {
    console.log(`OAuth login with ${provider}`);
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}