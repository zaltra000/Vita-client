import React from 'react';

/**
 * Standard Error Boundary class component.
 * Catches errors in the child component tree and displays a fallback UI.
 * Note: TS-ignore is used on class members due to environment-specific TS resolution issues with React class components.
 */
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    // @ts-ignore
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('App Error Boundary caught:', error, errorInfo);
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7F4] dark:bg-slate-900 p-8 text-center"
          dir="rtl"
        >
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-stone-800 dark:text-white mb-2">
            حدث خطأ غير متوقع
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 max-w-xs leading-relaxed">
            نعتذر عن هذا الخطأ. يرجى إعادة تشغيل التطبيق.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-transform"
          >
            إعادة تشغيل التطبيق
          </button>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}

export default ErrorBoundary;
