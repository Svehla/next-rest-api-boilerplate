import { messages } from './messages'

/**
 * Match all variables wrapped with double curly bracket like:
 * {{variableName}}
 */
const VARIABLE_REGEX = /{{([^{}]*)}}/g

type TranslateArgumentValue = string | null | number | undefined

export const interpolate = (str: string, data: Record<string, TranslateArgumentValue>) =>
  str.replace(
    VARIABLE_REGEX,
    // @ts-expect-error
    (_match: string, content: string) =>
      // null and undefined values are resolved as empty object
      data[content] ?? ''
  )

type GetAllEvenItems<T> = T extends [infer _A, infer B, ...infer Rest]
  ? [B, ...GetAllEvenItems<Rest>]
  : []

type ParseTemplate<T> = T extends `${infer PreText}{{${infer MsgVariable}}}${infer PostText}`
  ? [PreText, MsgVariable, ...ParseTemplate<PostText>]
  : [T]

type ParseTemplateArgs<
  T,
  ParsedTemplate = ParseTemplate<T>,
  // @ts-expect-error
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
  data?: ParseTemplateArgs<typeof messages[ID][LanguageOptions]>
) => {
  const message = messages[id][LANG]
  if (!message) throw new Error(`message ${id} is not implemented for language ${LANG}`)
  // @ts-expect-error
  return interpolate(message, data) as typeof messages[ID][LanguageOptions]
}

// runtime-time validations of messages consistency
Object.entries(messages).map(([k, v]) => {
  if (!v.cs) throw new Error(`missing cs translation for key: ${k}`)
  if (!v.en) throw new Error(`missing en translation for key: ${k}`)
})

// compile-time validations of messages consistency
type CheckMessages<T extends Record<string, { en: string; cs: string }>> = T
type ____ = CheckMessages<typeof messages>
