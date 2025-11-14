interface MaxUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  }
  
  interface MaxChat {
    id: number;
    type: string;
  }
  
  interface MaxWebAppStartParam {
    // Параметры из startapp?=PARAMS
    [key: string]: string;
  }
  
  interface MaxWebAppData {
    query_id?: string;
    auth_date?: number;
    hash?: string;
    start_param?: MaxWebAppStartParam;
    user?: MaxUser;
    chat?: MaxChat;
  }
  
  interface MaxBackButton {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  }
  
  interface MaxScreenCapture {
    isScreenCaptureEnabled: boolean;
    enableScreenCapture: () => void;
    disableScreenCapture: () => void;
  }
  
  interface MaxHapticFeedback {
    impactOccurred: (impactStyle: 'soft' | 'light' | 'medium' | 'heavy' | 'rigid', disableVibrationFallback?: boolean) => void;
    notificationOccurred: (notificationType: 'error' | 'success' | 'warning', disableVibrationFallback?: boolean) => void;
    selectionChanged: (disableVibrationFallback?: boolean) => void;
  }
  
  interface MaxWebApp {
    initData: string;
    initDataUnsafe: MaxWebAppData;
    platform: 'ios' | 'android' | 'desktop' | 'web';
    version: string;
    
    // Методы
    onEvent: (eventName: string, callback: (...args: any[]) => void) => void;
    offEvent: (eventName: string, callback: (...args: any[]) => void) => void;
    ready: () => void;
    close: () => void;
    requestContact: () => void;
    enableClosingConfirmation: () => void;
    disableClosingConfirmation: () => void;
    openLink: (url: string) => void;
    openMaxLink: (url: string) => void;
    shareContent: (text: string, link: string) => void;
    shareMaxContent: (text: string, link: string) => void;
    downloadFile: (url: string, fileName: string) => void;
    openCodeReader: (fileSelect?: boolean) => void;
    
    // Объекты
    BackButton: MaxBackButton;
    ScreenCapture: MaxScreenCapture;
    HapticFeedback: MaxHapticFeedback;
  }
  
  declare global {
    interface Window {
      WebApp?: MaxWebApp;
    }
  }
  
  export {};
  