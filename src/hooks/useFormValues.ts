import { useState } from 'react'

// -------------- util functions -------------
export const mapEntries = <Key extends string | number, V, RetKey extends string | number, RV>(
  fn: (a: [Key, V]) => [RetKey, RV],
  // @ts-expect-error
  obj: Record<Key, V>
) =>
  Object.fromEntries(
    Object.entries(obj).map(
      // omit programmers to use index in the iterating over objects
      i => fn(i as any)
    )
    // @ts-expect-error
  ) as Record<RetKey, RV>

/**
 * helper tool to manage large form states with possible errors
 */
export const useFormValues = <
  T extends Record<
    string,
    {
      value: any
      isRequired?: boolean | ((state: Record<string, any>) => boolean)
      // I think its impossible to add proper static types to the state
      onChangeValidation?: (value: any, state: Record<string, any>) => boolean
      validate?: (state: Record<string, any>) => string
      maxLen?: number
    }
  >
>(
  initState: T
) => {
  const [formState, setFormState] = useState(
    mapEntries(([k, v]) => [k, v.value], initState) as { [K in keyof T]: T[K]['value'] }
  )
  const [formErrors, setFormErrors] = useState(
    mapEntries(([k]) => [k, ''], initState) as { [K in keyof T]: string }
  )

  const setValue = mapEntries(
    ([k, v]) => [
      k,
      (userChangedValue: any) => {
        let newValue = userChangedValue
        if (v?.onChangeValidation?.(newValue, formState) === false) {
          return
        }
        if (v.maxLen && `${newValue ?? ''}`.length > v.maxLen) {
          newValue = newValue.substr(0, v.maxLen)
        }

        setFormState(p => ({ ...p, [k]: newValue }))
        setFormErrors(p => ({ ...p, [k]: '' }))
      },
    ],
    initState
  ) as { [Key in keyof T]: (arg: T[Key]['value']) => void }

  const setError = mapEntries(
    ([k]) => [k, (newErrText: string) => setFormErrors(p => ({ ...p, [k]: newErrText }))],
    formState
  ) as { [Key in keyof T]: (arg: string) => void }

  const validate = () => {
    const errors = {} as Record<keyof T, string>
    Object.entries(initState).forEach(([k, v]) => {
      const errs = [] as string[]
      const isRequired =
        typeof v?.isRequired === 'function' ? v.isRequired(formState) : v.isRequired

      if (isRequired) {
        const errRequiredMsg = 'Pole nesmí být prázdné'

        let isEmpty = false
        if (formState[k] === null || formState[k] === undefined || formState[k] === '') {
          isEmpty = true
        } else if (typeof formState[k] === 'number' && isNaN(formState[k])) {
          isEmpty = true
        }
        if (isEmpty) {
          errs.push(errRequiredMsg)
        }
      }
      if (v?.validate) {
        errs.push(v?.validate(formState))
      }
      errors[k as keyof T] = errs.filter(Boolean).join(', ')
    })
    setFormErrors(p => ({ ...p, ...errors }))

    return Object.values(errors).filter(Boolean).length === 0
  }

  const clearErrors = () => {
    setFormErrors(p => mapEntries(([k]) => [k, ''], p) as { [K in keyof T]: string })
  }

  const _setFormState = (s => {
    setFormState(s)
    setFormErrors(p => ({
      ...p,
      ...mapEntries(([k]) => [k, ''], formErrors),
    }))
  }) as React.Dispatch<React.SetStateAction<typeof formState>>

  return {
    values: formState,
    errors: formErrors,

    setVal: setValue,
    setErr: setError,
    clearErrors,
    validate,
    _setFormState,
    _setFormErrors: setFormErrors,
  }
}
