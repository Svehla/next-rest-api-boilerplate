import { Await } from '../../utils/generics'
import { genericHookContextBuilder } from '../../utils/genericHookContextBuilder'
import { getRandomJoke } from '../../services/chunkNorris'
import { petFindByStatus } from '../../services/petService'
import { translate } from '../../translations/translate'
import { useEffect, useState } from 'react'
import { useFormValues } from '../../hooks/useFormValues'

const useValue = () => {
  const form = useFormValues({
    username: {
      value: '',
      isRequired: true,
      validate: s => (s.username.length < 10 ? translate('login.error.length10') : ''),
    },
    password: {
      value: '',
      isRequired: true,
    },
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null as string | null)
  const [chunkNorrisJoke, setChuckNorrisJoke] = useState(
    null as null | Await<ReturnType<typeof getRandomJoke>>
  )

  useEffect(() => {
    const main = async () => {
      try {
        setLoading(true)
        const data = await getRandomJoke()

        const _mockTestRes = await petFindByStatus({ status: ['sold'] })

        setChuckNorrisJoke(data)
      } catch (errRes) {
        console.error(errRes)
        // @ts-expect-error
        setError(errRes?.toString())
      } finally {
        setLoading(false)
      }
    }
    main()
  }, [])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.validate()) return

    alert('logged in')
  }

  return {
    loading,
    error,
    onSubmit,
    chunkNorrisJoke,
    form,
  }
}

export const { Context: LoginContext, ContextProvider: LoginContextProvider } =
  genericHookContextBuilder(useValue)
