import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zaltra000.vita',
  appName: 'Vita',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: true,
      backgroundColor: '#F8F7F4',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP'
    },
  },
};

export default config;
