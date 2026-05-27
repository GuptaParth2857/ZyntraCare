const nextConfig = require('eslint-config-next');

module.exports = [
  ...nextConfig,
  {
    ignores: ['**/*.test.ts', '**/*.spec.ts', 'node_modules/', '.next/', 'librechat/', 'vane/', 'ZyntraCare/'],
  },
];
