import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Unlock, KeyRound, CheckCircle, Smartphone } from 'lucide-react';
import { isPWAMode, saveLastValidCode, getLastValidCode } from '@/utils/pwaUtils';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const { toast } = useToast();

  // تحديد وضع PWA وautofill عند التحميل
  useEffect(() => {
    const pwaMode = isPWAMode();
    setIsPWA(pwaMode);
    
    if (pwaMode) {
      const lastCode = getLastValidCode();
      if (lastCode) {
        setCode(lastCode);
      }
    }
  }, []);

  const verifyCode = async (inputCode: string) => {
    try {
      const response = await fetch('/code.json');
      if (!response.ok) {
        throw new Error('فشل في تحميل ملف الرموز');
      }
      
      const data = await response.json();
      const validCodes = data.codes || [];
      
      // التحقق بدون حساسية لحالة الأحرف
      const normalizedInput = inputCode.toLowerCase().trim();
      const isValid = validCodes.some((validCode: string) => 
        validCode.toLowerCase() === normalizedInput
      );
      
      return isValid;
    } catch (error) {
      console.error('خطأ في التحقق من الرمز:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال رمز الوصول"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const isValid = await verifyCode(code);
      
      if (isValid) {
        // حفظ الرمز في cache إذا كان PWA
        saveLastValidCode(code);
        
        toast({
          title: "تم التحقق بنجاح!",
          description: "مرحباً بك في لعبة كبريت"
        });
        
        onLoginSuccess();
      } else {
        setCode('');
        toast({
          variant: "destructive",
          title: "رمز غير صحيح",
          description: "الرمز المدخل غير صالح، جرب مرة أخرى"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في الاتصال",
        description: "فشل في التحقق من رمز الوصول"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-2">
          {/* إشارة PWA */}
          {isPWA && (
            <div className="flex items-center justify-center gap-2 text-xs text-primary bg-primary/10 rounded-full px-3 py-1 mb-2">
              <Smartphone className="w-3 h-3" />
              <span>وضع التطبيق</span>
            </div>
          )}
          
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          
          <CardTitle className="text-2xl font-bold">
            رمز الوصول
          </CardTitle>
          
          <p className="text-muted-foreground">
            أدخل رمز الوصول للدخول إلى لعبة أعواد الثقاب
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                رمز الوصول
              </Label>
              <div className="relative">
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="أدخل رمز الوصول"
                  className="pl-10"
                  disabled={isLoading}
                  maxLength={20}
                  autoComplete="off"
                />
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !code.trim()}
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-2" />
                  جاري التحقق...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 ml-2" />
                  تحقق من الرمز
                </>
              )}
            </Button>
          </form>

          {/* ستكر المتجر */}
          <div className="text-center mt-6">
            <button
              onClick={() => window.open('https://hex-store.com/', '_blank')}
              className="group relative inline-block transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <div className="flex flex-col items-center gap-3 p-4">
                <div className="text-base font-medium text-foreground">
                  حياكم في متجرنا
                </div>
                <img 
                  src="/hex-store-logo.png" 
                  alt="Hex Store Logo" 
                  className="w-20 h-20 object-contain transition-all duration-300 group-hover:brightness-110"
                />
              </div>
              
              {/* تأثير الهوفر */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;