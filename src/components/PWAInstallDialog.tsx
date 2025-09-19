import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Share, 
  Plus, 
  Home,
  CheckCircle,
  X,
  Chrome,
  Smartphone as Phone
} from 'lucide-react';

interface PWAInstallDialogProps {
  open: boolean;
  onClose: () => void;
}

const PWAInstallDialog: React.FC<PWAInstallDialogProps> = ({ open, onClose }) => {
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'desktop'>('android');
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // تحديد نوع الجهاز - إعطاء الأولوية للجوال
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      // حتى لو كان ديسكتوب، اعرض تعليمات أندرويد كافتراضي
      setDeviceType('android');
    }

    // الاستماع لحدث إمكانية التثبيت
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setCanInstall(false);
        onClose();
      }
      setDeferredPrompt(null);
    }
  };

  const getInstructions = () => {
    switch (deviceType) {
      case 'ios':
        return {
          title: 'تثبيت التطبيق على آيفون/آيباد',
          icon: <Smartphone className="w-6 h-6 text-blue-500" />,
          steps: [
            { icon: <Chrome className="w-4 h-4" />, text: 'افتح التطبيق في متصفح Safari' },
            { icon: <Share className="w-4 h-4" />, text: 'اضغط على أيقونة المشاركة ' },
            { icon: <Plus className="w-4 h-4" />, text: 'مرر لأسفل واختر "Add to Home Screen"' },
            { icon: <CheckCircle className="w-4 h-4" />, text: 'اضغط "Add" لإضافة التطبيق' }
          ]
        };
      
      case 'desktop':
        return {
          title: 'تثبيت التطبيق على سطح المكتب',
          icon: <Monitor className="w-6 h-6 text-purple-500" />,
          steps: [
            { icon: <Chrome className="w-4 h-4" />, text: 'افتح التطبيق في Chrome أو Edge' },
            { icon: <Download className="w-4 h-4" />, text: 'ابحث عن أيقونة التثبيت في شريط العنوان' },
            { icon: <Plus className="w-4 h-4" />, text: 'اضغط "تثبيت" عند ظهور النافذة' },
            { icon: <Home className="w-4 h-4" />, text: 'التطبيق سيظهر في قائمة التطبيقات' }
          ]
        };
      
      default: // android وافتراضي
        return {
          title: 'تثبيت التطبيق على أندرويد',
          icon: <Phone className="w-6 h-6 text-green-500" />,
          steps: [
            { icon: <Chrome className="w-4 h-4" />, text: 'افتح التطبيق في متصفح Chrome' },
            { icon: <Share className="w-4 h-4" />, text: 'اضغط على أيقونة القائمة (⋮) في الأعلى' },
            { icon: <Plus className="w-4 h-4" />, text: 'اختر "إضافة إلى الشاشة الرئيسية"' },
            { icon: <CheckCircle className="w-4 h-4" />, text: 'اضغط "إضافة" لتأكيد التثبيت' }
          ]
        };
    }
  };

  const instructions = getInstructions();

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {instructions.icon}
              <DialogTitle className="text-lg">تحميل التطبيق</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* زر التثبيت السريع */}
          {canInstall && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-center">
                <Button 
                  onClick={handleInstallClick}
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-5 h-5 ml-2" />
                  تثبيت التطبيق الآن
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  تثبيت سريع ومباشر
                </p>
              </CardContent>
            </Card>
          )}

          {/* المزايا */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-center">مزايا التطبيق المثبت</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>يعمل بدون إنترنت</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>فتح سريع</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>توفير البطارية</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>واجهة أصلية</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* أزرار تبديل نوع الجهاز */}
          <div className="flex gap-2 mb-4">
            <Button 
              variant={deviceType === 'android' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setDeviceType('android')}
              className="flex-1"
            >
              <Phone className="w-4 h-4 ml-1" />
              أندرويد
            </Button>
            <Button 
              variant={deviceType === 'ios' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setDeviceType('ios')}
              className="flex-1"
            >
              <Smartphone className="w-4 h-4 ml-1" />
              آيفون
            </Button>
            <Button 
              variant={deviceType === 'desktop' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setDeviceType('desktop')}
              className="flex-1"
            >
              <Monitor className="w-4 h-4 ml-1" />
              كمبيوتر
            </Button>
          </div>

          {/* التعليمات اليدوية */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{instructions.title}</Badge>
              </div>
              
              <div className="space-y-3">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      {step.icon}
                      <span>{step.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ملاحظة */}
          <div className="text-xs text-muted-foreground text-center p-3 bg-muted/50 rounded-lg">
            💡 بعد التثبيت، ستتمكن من اللعب حتى بدون اتصال إنترنت!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PWAInstallDialog;