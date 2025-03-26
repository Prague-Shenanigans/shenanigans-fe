/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

/* eslint func-names: 0 */
/* eslint global-require: 0 */

const { configure } = require('quasar/wrappers');
const path = require('path');
const svgLoader = require('vite-svg-loader');

module.exports = configure((ctx) => ({
  // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
  // preFetch: true,

  boot: ['i18n', 'axios', 'icons'],

  css: ['app.scss'],

  extras: ['roboto-font', 'material-icons', 'material-icons-outlined'],

  build: {
    target: {
      browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
      node: 'node20',
    },

    vueRouterMode: 'history',

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
    host: '192.168.1.115',
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

  electron: {
    inspectPort: 5858,
    bundler: 'packager',

    packager: {
      // macOS/Windows settings here if needed
    },

    builder: {
      appId: 'prague-shenanigans',
    },
  },

  bex: {
    contentScripts: ['my-content-script'],
  },
}));
