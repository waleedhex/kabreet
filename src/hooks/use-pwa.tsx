import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [isPWA, setIsPWA] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // التحقق من وضع PWA بطرق متعددة
    const checkPWAMode = () => {
      // الطريقة الأولى: التحقق من display-mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // الطريقة الثانية: التحقق من navigator.standalone (Safari iOS)
      const isStandaloneSafari = (window.navigator as any).standalone === true;
      
      // الطريقة الثالثة: التحقق من window.matchMedia للعرض المُحسَّن
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      // الطريقة الرابعة: فحص document.referrer
      const isFromHomeScreen = document.referrer === '' || document.referrer.includes('android-app://');
      
      return isStandalone || isStandaloneSafari || isMinimalUI || isFromHomeScreen;
    };

    // التحقق الأولي
    setIsPWA(checkPWAMode());

    // الاستماع لتغييرات وضع العرض
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsPWA(e.matches || checkPWAMode());
    };

    mediaQuery.addEventListener('change', handleDisplayModeChange);

    // الاستماع لحدث beforeinstallprompt للتحقق من إمكانية التثبيت
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return {
    isPWA,
    isInstallable,
    shouldShowInstallPrompt: !isPWA // يظهر دائماً في المتصفح ويختفي فقط في PWA
  };
};

// خدمة الكاش للـ PWA
export const pwaCache = {
  // حفظ رمز الدخول في الكاش
  saveAccessCode: (code: string) => {
    try {
      localStorage.setItem('pwa_access_code', code);
    } catch (error) {
      console.error('Failed to save access code to cache:', error);
    }
  },

  // استرجاع رمز الدخول من الكاش
  getAccessCode: (): string | null => {
    try {
      return localStorage.getItem('pwa_access_code');
    } catch (error) {
      console.error('Failed to get access code from cache:', error);
      return null;
    }
  },

  // حذف رمز الدخول من الكاش
  clearAccessCode: () => {
    try {
      localStorage.removeItem('pwa_access_code');
    } catch (error) {
      console.error('Failed to clear access code from cache:', error);
    }
  },

  // التحقق من وجود رمز دخول محفوظ
  hasAccessCode: (): boolean => {
    try {
      return localStorage.getItem('pwa_access_code') !== null;
    } catch (error) {
      console.error('Failed to check access code cache:', error);
      return false;
    }
  }
};