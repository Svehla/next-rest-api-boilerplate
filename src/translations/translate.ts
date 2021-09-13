import { messages } from './messages'

// There is POC for compile time template replacing for better editor hover hints
// > https://gist.github.com/Svehla/49959b9b996927ac6524c5ab5a81dba2

/**
 * Match all variables wrapped with double curly bracket like:
 * {{variableName}}
 */
const VARIABLE_REGEX = /{{(\w+)}}/g

type TranslateArgumentValue = string | null | number | undefined

/**
 * interpolate takes template and replace variables wrapped in {{VARIABLE_REGEX}}
 * null and undefined args values are resolved as empty empty string
 */
export const interpolate = (str: string, data: Record<string, TranslateArgumentValue>) =>
  str.replace(VARIABLE_REGEX, (_match, content: string) => data[content]?.toString() ?? '')

type GetAllEvenItems<T> = T extends [infer _A, infer B, ...infer Rest]
  ? [B, ...GetAllEvenItems<Rest>]
  : []

type ParseTranslateTemplate<T extends string> =
  T extends `${infer PreText}{{${infer MsgVariable}}}${infer PostText}`
    ? [PreText, MsgVariable, ...ParseTranslateTemplate<PostText>]
    : [T]

type ParseTranslationTemplateArgs<
  T extends string,
  ParsedTemplate extends string[] = ParseTranslateTemplate<T>,
  ParsedArgs extends string[] = GetAllEvenItems<ParsedTemplate>,
  ArgsObject = Record<ParsedArgs[number], TranslateArgumentValue>
> = ArgsObject

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
  id: ID,
  data?: ParseTranslationTemplateArgs<typeof messages[ID][LanguageOptions]>
) => {
  const message = messages[id][LANG]
  if (!message) throw new Error(`message ${id} is not implemented for language ${LANG}`)
  return interpolate(
    message,
    data as Record<string, TranslateArgumentValue>
  ) as typeof messages[ID][LanguageOptions]
}

// runtime-time validations of messages consistency
Object.entries(messages).map(([k, v]) => {
  if (!v.cs) throw new Error(`missing cs translation for key: ${k}`)
  if (!v.en) throw new Error(`missing en translation for key: ${k}`)
})

// compile-time validations of messages consistency
type CheckMessages<T extends Record<string, { en: string; cs: string }>> = T
type ____ = CheckMessages<typeof messages>
