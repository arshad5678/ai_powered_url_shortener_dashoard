module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    // Prefer const over let/var
    'prefer-const': 'error',
    
    // Disallow console.log across the codebase (except warn/error)
    'no-console': ['error', { allow: ['warn', 'error'] }],
    
    // Disallow unused variables/imports
    '@typescript-eslint/no-unused-vars': [
      'error',
      { 
        argsIgnorePattern: '^_', 
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true 
      }
    ],
    
    // Warn on explicit use of 'any' type
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // Configure import ordering
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'object',
          'type'
        ],
        alphabetize: { order: 'asc', caseInsensitive: true },
        'newlines-between': 'always'
      }
    ]
  },
  overrides: [
    {
      // Allow console.log in the server startup entrypoint
      files: ['src/server.ts'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
};
