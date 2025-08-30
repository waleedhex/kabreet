import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Monitor, 
  Download, 
  Share, 
  MoreVertical,
  ArrowRight,
  CheckCircle,
  Chrome,
  Zap
} from 'lucide-react';

interface PWAInstallPromptProps {
  onClose: () => void;
}

const PWAInstallPrompt = ({ onClose }: PWAInstallPromptProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'safari';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Edge')) return 'edge';
    return 'other';
  };

  const browser = detectBrowser();

  const chromeSteps = [
    {
      icon: <MoreVertical className="h-5 w-5" />,
      title: "اضغط على قائمة المتصفح",
      description: "اضغط على النقاط الثلاث (⋮) في أعلى يمين المتصفح"
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: "اختر تثبيت التطبيق",
      description: "ابحث عن خيار 'تثبيت التطبيق' أو 'Add to Home Screen'"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "اضغط على تثبيت",
      description: "أكد التثبيت وسيظهر التطبيق على الشاشة الرئيسية"
    }
  ];

  const safariSteps = [
    {
      icon: <Share className="h-5 w-5" />,
      title: "اضغط على زر المشاركة",
      description: "اضغط على رمز المشاركة (مربع مع سهم للأعلى) في شريط الأدوات"
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: "اختر إضافة للشاشة الرئيسية",
      description: "مرر لأسفل في قائمة المشاركة واختر 'Add to Home Screen'"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "أكد الإضافة",
      description: "اضغط على 'إضافة' لحفظ التطبيق على الشاشة الرئيسية"
    }
  ];

  const steps = browser === 'safari' ? safariSteps : chromeSteps;

  const benefits = [
    { icon: <Zap className="h-4 w-4 text-yellow-500" />, text: "تشغيل سريع بدون تأخير" },
    { icon: <Smartphone className="h-4 w-4 text-blue-500" />, text: "يعمل كتطبيق حقيقي" },
    { icon: <Monitor className="h-4 w-4 text-green-500" />, text: "يعمل بدون إنترنت" },
    { icon: <Download className="h-4 w-4 text-primary" />, text: "لا يحتاج تحميل من المتجر" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="max-w-xs sm:max-w-md w-full h-[80vh] sm:h-auto sm:max-h-[75vh] overflow-hidden flex flex-col">
        <CardHeader className="text-center pb-3 px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg sm:text-xl">حفظ كتطبيق</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            احفظ لعبة ألغاز الكباريت على جهازك كتطبيق حقيقي
          </p>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-4 px-4 pb-4">
          {/* المميزات */}
          <div className="bg-muted/30 rounded-lg p-3">
            <h3 className="font-semibold mb-2 text-center text-sm">لماذا تحفظه كتطبيق؟</h3>
            <div className="grid grid-cols-1 gap-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  {benefit.icon}
                  <span className="text-sm">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* التعليمات */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {browser === 'safari' ? (
                <div className="h-5 w-5 text-blue-500 font-bold text-sm">🧭</div>
              ) : (
                <Chrome className="h-5 w-5 text-green-500" />
              )}
              <h3 className="font-semibold">
                تعليمات {browser === 'safari' ? 'Safari' : 'Chrome/Edge'}
              </h3>
            </div>
            
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${
                    currentStep === index ? 'bg-primary/10 border border-primary/20' : 'bg-muted/20'
                  }`}
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs">{step.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* أزرار التنقل */}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                السابق
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1"
              >
                التالي
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onClose}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 ml-2" />
                فهمت
              </Button>
            )}
          </div>

          {/* معلومة إضافية */}
          <div className="text-xs text-muted-foreground text-center bg-muted/20 rounded-lg p-2">
            💡 بعد التثبيت، ستجد التطبيق على الشاشة الرئيسية ويمكنك فتحه مثل أي تطبيق آخر
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;