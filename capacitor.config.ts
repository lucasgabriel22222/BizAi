import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bizai.app',
  appName: 'BizAI',
  webDir: 'public',
  server: {
    url: 'https://bizai-app.netlify.app',
    cleartext: true
  }
};

export default config;
