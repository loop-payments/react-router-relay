module.exports = {
  extends: [
    'fbjs/strict',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'plugin:relay/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'babel', 'prettier', 'react', 'relay'],
  rules: {
    // Mutations aren't located in the same file as Components
    'relay/unused-fields': 'off',
  },
  settings: {
    react: {
      version: '16.8.1',
    },
  },
};
