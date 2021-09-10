import { messages } from './messages'

const LANGUAGES = Object.freeze({
  cs: 'cs',
  en: 'en',
})

type LanguageOptions = keyof typeof LANGUAGES

const DEFAULT_LANGUAGE = 'cs' as LanguageOptions
// TODO: add option to change language
const LANG = DEFAULT_LANGUAGE

/**
 * TODO: add option to change language
 */
export const translate = <ID extends keyof typeof messages>(
  id: ID
): typeof messages[ID][LanguageOptions] => {
  const message = messages[id][LANG]
  if (!message) throw new Error(`message ${id} is not implemented for language ${LANG}`)
  // @ts-expect-error
  return message
}

// runtime-time validations of messages consistency
Object.entries(messages).map(([k, v]) => {
  if (!v.cs) throw new Error(`missing cs translation for key: ${k}`)
  if (!v.en) throw new Error(`missing en translation for key: ${k}`)
})

// compile-time validations of messages consistency
type CheckMessages<T extends Record<string, { en: string; cs: string }>> = T
type ____ = CheckMessages<typeof messages>
