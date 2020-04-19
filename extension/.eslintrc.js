module.exports = {
  extends: ['../.eslintrc.js'],
  parserOptions: {
    project: 'tsconfig.json',
  },
  settings: {
    react: {
      version: '16.9.0',
    },
  },
  rules: {
    'import/no-extraneous-dependencies': 'off',
  },
};
