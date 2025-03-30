/* eslint-env node */

const { configure } = require('quasar/wrappers');
const path = require('path');
const svgLoader = require('vite-svg-loader');

module.exports = configure((ctx) => ({
  boot: ['i18n', 'axios', 'icons'],

  css: ['app.scss'],

  // ✅ Merge your icon fonts here
  extras: ['roboto-font', 'material-icons', 'material-icons-outlined'],

  build: {
    target: {
      browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
      node: 'node20',
    },
    vueRouterMode: 'history',
    publicPath: '', // ✅ important for Capacitor to load fonts/assets
    vitePlugins: [
      [
        '@intlify/vite-plugin-vue-i18n',
        {
          include: path.resolve(__dirname, './src/i18n/**'),
        },
      ],
      [
        'vite-plugin-checker',
        {
          overlay: false,
          vueTsc: {
            tsconfigPath: 'tsconfig.vue-tsc.json',
          },
          eslint: {
            lintCommand: 'eslint "./**/*.{js,ts,mjs,cjs,vue}"',
          },
        },
        { server: false },
      ],
      svgLoader(),
    ],
  },

  devServer: {
    port: ctx.mode.capacitor ? 9020 : 9012,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5015',
        changeOrigin: true,
      },
      '/swagger': {
        target: 'http://localhost:5015',
        changeOrigin: true,
      },
      '/hub': {
        target: 'http://localhost:5015',
        changeOrigin: true,
        ws: true,
      },
    },
  },

  framework: {
    config: {},
    plugins: ['Notify', 'Dialog', 'LocalStorage', 'Loading', 'Cookies', 'Meta', 'Dark', 'Screen', 'Platform'],
  },

  animations: [],

  ssr: {
    pwa: false,
    prodPort: 3000,
    middlewares: ['render'],
  },

  pwa: {
    workboxMode: 'generateSW',
    injectPwaMetaTags: true,
    swFilename: 'sw.js',
    manifestFilename: 'manifest.json',
    useCredentialsForManifestTag: false,
  },

  capacitor: {
    appId: 'com.pavel.pragueshenanigans',
    hideSplashscreen: true,
  },

  // ✅ Mobile platform permissions (merged safely)
  // Add inside root config — not as second extras
  extrasCapacitor: {
    android: {
      permissions: ['android.permission.ACCESS_FINE_LOCATION', 'android.permission.ACCESS_COARSE_LOCATION'],
    },
    ios: {
      plist: {
        NSLocationWhenInUseUsageDescription: 'This app needs your location to show your position on the map.',
      },
    },
  },

  electron: {
    inspectPort: 5858,
    bundler: 'packager',
    packager: {},
    builder: {
      appId: 'prague-shenanigans',
    },
  },

  bex: {
    contentScripts: ['my-content-script'],
  },
}));
