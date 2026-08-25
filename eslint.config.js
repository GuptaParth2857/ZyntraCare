const nextConfig = require('eslint-config-next');

module.exports = [
  ...nextConfig,
  {
    ignores: ['**/*.test.ts', '**/*.spec.ts', 'node_modules/', '.next/', 'librechat/', 'vane/', 'ZyntraCare/'],
  },
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/rules-of-hooks': 'warn',
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@next/next/no-sync-scripts': 'off',
    },
  },
];
