module.exports = {
  root: true,
  parserOptions: {
    parser: require.resolve('@typescript-eslint/parser'),
    extraFileExtensions: ['.vue'],
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended', // ✅ More strict than "vue3-essential"
    'airbnb-base',
    'prettier' // ✅ Ensure Prettier and ESLint don’t conflict
  ],

  plugins: ['@typescript-eslint', 'vue'],

  rules: {
    'no-plusplus': 'off',
    'no-param-reassign': 'off',
    'no-void': 'off',
    'no-nested-ternary': 'off',
    'max-classes-per-file': 'off',
    'comma-dangle': 'warn',
    'semi': ['warn', 'always'], // ✅ Ensure semicolons
    'linebreak-style': 0,
    'no-shadow': 'off',
    'no-underscore-dangle': 'off',

    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-explicit-any': 'off',

    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'max-len': ['warn', { code: 180 }],
    'arrow-parens': 'off',

    'prefer-promise-reject-errors': 'off',

    'quotes': ['warn', 'single', { avoidEscape: true }], // ✅ Enforce single quotes

    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-unused-vars': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    'vue/attributes-order': [
      'error',
      {
        order: [
          'DEFINITION',
          'LIST_RENDERING',
          'CONDITIONALS',
          'RENDER_MODIFIERS',
          'GLOBAL',
          'UNIQUE',
          'TWO_WAY_BINDING',
          'OTHER_DIRECTIVES',
          'OTHER_ATTR',
          'EVENTS',
          'CONTENT'
        ],
        alphabetical: false,
      },
    ],
  },
};
