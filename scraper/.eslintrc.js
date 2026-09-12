module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // tsconfig.json wyklucza *.spec.ts z builda (nie mają trafiać do dist/),
    // ale ESLint z parserOptions.project potrzebuje wszystkie lintowane pliki
    // w projekcie - stąd osobny tsconfig tylko dla lintera.
    project: 'tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
