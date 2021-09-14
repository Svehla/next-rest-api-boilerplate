import { messages } from './messages'

/**
 * this file shows how to parse translate templates
 * and use compile time check to keep your translations valid
 * and don't put bug into your runtime code with invalid translate templates
 */

// ------- interpolate parsing --------
type Head<T> = T extends [infer I, ...infer _Rest] ? I : never
type Tail<T> = T extends [infer _I, ...infer Rest] ? Rest : never

type Join<T extends any[], Delimiter extends string> = T extends []
  ? ''
  : // @ts-expect-error ????
    `${Head<T>}${Delimiter}${Join<Tail<T>, Delimiter>}`
type ZipArrays<T extends any[], U extends any[]> = T extends []
  ? U
  : U extends []
  ? T
  : [Head<T>, Head<U>, ...ZipArrays<Tail<T>, Tail<U>>]
type GetOddItems<T> = T extends [infer A, infer _B, ...infer Rest]
  ? [A, ...GetOddItems<Rest>]
  : T extends [infer A, infer _B]
  ? [A]
  : T extends [infer A]
  ? [A]
  : []
type GetArgValByName<T extends string[], U extends Record<string, any>> = T extends [
  infer ArgName,
  ...infer Rest
]
  ? // @ts-expect-error
    [U[ArgName], ...GetArgValByName<Rest, U>]
  : []
export type ReplaceTemplateWithValues<
  T extends string,
  ArgsObj extends Record<string, string | number | null | undefined>,
  ParsedTemplate = ParseTranslateTemplate<T>,
  ParsedTexts extends any[] = GetOddItems<ParsedTemplate>,
  ParsedArgsNames extends any[] = GetEvenItems<ParsedTemplate>,
  ArgsArray extends any[] = GetArgValByName<ParsedArgsNames, ArgsObj>,
  T0 extends any[] = ZipArrays<ParsedTexts, ArgsArray>,
  T1 = Join<T0, ''>
> = T1
type GetEvenItems<T> = T extends [infer _A, infer B, ...infer Rest]
  ? [B, ...GetEvenItems<Rest>]
  : []
// ----------------------------

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
export const translate = <
  ID extends keyof typeof messages,
  Message extends typeof messages[ID][LanguageOptions],
  Data extends ParseTranslationTemplateArgs<Message>
>(
  id: ID,
  data?: Data
) => {
  const message = messages[id][LANG]
  if (!message) throw new Error(`message ${id} is not implemented for language ${LANG}`)
  return interpolate(
    message,
    data as Record<string, TranslateArgumentValue>
  ) as ReplaceTemplateWithValues<Message, Data>
}

// runtime-time validations of messages consistency
Object.entries(messages).map(([k, v]) => {
  if (!v.cs) throw new Error(`missing cs translation for key: ${k}`)
  if (!v.en) throw new Error(`missing en translation for key: ${k}`)
})

// compile-time validations of messages consistency
type CheckMessages<T extends Record<string, { en: string; cs: string }>> = T
type ____ = CheckMessages<typeof messages>

// test
const a = translate('login.header.h1', { NAME: 'Kuba' } as const)
