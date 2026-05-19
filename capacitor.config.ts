import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trjara.app',
  appName: 'Trjara',
  webDir: 'out',
  server: {
    url: 'https://trjara-user-application.vercel.app/',
    cleartext: true
  }
};

export default config;
