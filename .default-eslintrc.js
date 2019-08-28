module.exports = {
  //make new rules: https://github.com/typescript-eslint/typescript-eslint/issues/36#issuecomment-504470676
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  'env': {
    'es6': true,
    'node': true,

  },
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'rules': {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/array-type': [1, 'generic'],
    'indent': [
      'warn',
      2
    ],
    '@typescript-eslint/indent': [
      0,
      2
    ],
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'linebreak-style': [
      'off',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ]
  }
};