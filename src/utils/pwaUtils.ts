// utility لتحديد ما إذا كان التطبيق يعمل في وضع PWA
export const isPWAMode = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://') ||
    window.location.search.includes('pwa=true')
  );
};

// حفظ آخر رمز دخول صحيح
export const saveLastValidCode = (code: string): void => {
  if (isPWAMode()) {
    localStorage.setItem('matchstick_last_code', code.toLowerCase().trim());
  }
};

// استرداد آخر رمز دخول صحيح
export const getLastValidCode = (): string | null => {
  if (isPWAMode()) {
    return localStorage.getItem('matchstick_last_code');
  }
  return null;
};