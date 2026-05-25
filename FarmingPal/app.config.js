// Load .env relative to this file (not process.cwd) so credentials are correct
// regardless of which directory `npx expo start` is run from.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: 'FarmingPal',
    slug: 'FarmingPal',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'farmingpal',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#2d6a2d',
          sounds: [],
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      supabaseUrl:  process.env.EXPO_PUBLIC_SUPABASE_URL  ?? '',
      supabaseAnon: process.env.EXPO_PUBLIC_SUPABASE_ANON ?? '',
    },
  },
};
