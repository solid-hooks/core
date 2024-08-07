import { defineEslintConfig } from '@subframe7536/eslint-config'

export default defineEslintConfig({
  solid: true,
  overrideRules: {
    'prefer-template': 'off',
  },
})
  .append({
    files: ['README.md/**.{ts,tsx}', 'dev/**/*.tsx'],
    rules: {
      'ts/explicit-function-return-type': 'off',
      'no-constant-binary-expression': 'off',
    },
  })
