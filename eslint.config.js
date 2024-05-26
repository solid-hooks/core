import { defineEslintConfig } from '@subframe7536/eslint-config'

export default defineEslintConfig({
  solid: true,
  overrideRules: {
    'prefer-template': 'off',
  },
})
