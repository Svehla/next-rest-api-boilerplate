import { config } from '../config'
import { serviceLayerFetch } from './serviceLayerFetch'

const getRandomJokeMock = () => ({
  responseInit: {
    status: 200,
  },
  responseData: {
    categories: [],
    created_at: '2020-01-05 13:42:24.142371',
    icon_url: 'https://assets.chucknorris.host/img/avatar/chuck-norris.png',
    id: 'lIRk_stZRH2I1bB1UDUuqQ',
    updated_at: '2020-01-05 13:42:24.142371',
    url: 'https://api.chucknorris.io/jokes/lIRk_stZRH2I1bB1UDUuqQ',
    value:
      'When Chuck Norris walks into a bar, he automatically owns all the women inside and instantly has an infinite tab.',
  },
})

export const getRandomJoke = async () => {
  const [data] = await serviceLayerFetch(
    'https://api.chucknorris.io/jokes/random',
    {},
    {
      useMock: config.services.useMock,
      getMockResponse: getRandomJokeMock,
    }
  )
  return data
}
