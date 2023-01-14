import * as path from 'path'
import { ESLintUtils } from '@typescript-eslint/utils'

export const createRule = ESLintUtils.RuleCreator(name => {
  const basename = path.basename(name, path.extname(name))
  return `https://https://github.com/konti-kun/eslint-plugin-firestore/blob/main/docs/rules/${basename}.md`
})