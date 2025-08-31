import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePWA, pwaCache } from '@/hooks/use-pwa';

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { isPWA } = usePWA();

  // أوتوفيل رمز الدخول في وضع PWA
  useEffect(() => {
    if (isPWA && pwaCache.hasAccessCode()) {
      const cachedCode = pwaCache.getAccessCode();
      if (cachedCode) {
        setAccessCode(cachedCode);
        // محاولة تسجيل دخول تلقائي
        setTimeout(() => {
          handleSubmit({ preventDefault: () => {} } as React.FormEvent);
        }, 500);
      }
    }
  }, [isPWA]);

  const validateAccessCode = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch('/codes.json');
      const data = await response.json();
      const validCodes = data.codes || [];
      
      // التحقق بدون حساسية لحالة الأحرف
      return validCodes.some((validCode: string) => 
        validCode.toLowerCase() === code.toLowerCase()
      );
    } catch (error) {
      console.error('Error loading access codes:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      setError('يرجى إدخال رمز الدخول');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = await validateAccessCode(accessCode.trim());
      
      if (isValid) {
        // حفظ رمز الدخول في الكاش في وضع PWA
        if (isPWA) {
          pwaCache.saveAccessCode(accessCode.trim());
        }
        
        toast({
          title: "تم تسجيل الدخول بنجاح! 🎉",
          description: "مرحباً بك في لعبة الأعواد الذكية",
        });
        onLogin();
      } else {
        setError('رمز الدخول غير صحيح. حاول مرة أخرى');
        toast({
          title: "رمز دخول خاطئ",
          description: "يرجى التحقق من رمز الدخول والمحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    } catch (error) {
      setError('خطأ في التحقق من رمز الدخول');
      toast({
        title: "خطأ في الشبكة",
        description: "تعذر التحقق من رمز الدخول. حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="game-card shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Lock className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              دخول لعبة الأعواد الذكية
            </CardTitle>
            <p className="text-muted-foreground">
              أدخل رمز الدخول للبدء في اللعب
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-sm font-medium">
                  رمز الدخول
                </Label>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="accessCode"
                    type="text"
                    placeholder="أدخل رمز الدخول"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      setError('');
                    }}
                    className="pr-10 text-center font-mono text-lg tracking-wider uppercase"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>جاري التحقق...</span>
                  </div>
                ) : (
                  'دخول'
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground">
              <p>للحصول على رمز الدخول، تواصل مع المشرف</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;