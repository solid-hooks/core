import { defineEslintConfig } from '@subframe7536/eslint-config'

export default defineEslintConfig({
  overrideRules: {
    'prefer-template': 'off',
  },
  ignoreRuleOnFile: [{
    files: ['README.md/**.{ts,tsx}', 'dev/**/*.tsx'],
    rules: [
      'ts/explicit-function-return-type',
      'no-constant-binary-expression',
    ],
  }],
})
