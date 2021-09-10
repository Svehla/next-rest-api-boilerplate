// this is example demo service to demonstrate how to config service

import { config } from '../config'
import { paths } from './__generated__/generated-api-types'
import { serviceLayerFetch } from './serviceLayerFetch'

const petFindByStatusMockResponse = () => ({
  config: {
    delay: 3000,
  },
  responseData: [
    {
      id: 1,
      category: {
        id: 1,
        name: 'category1',
      },
      name: 'pet name',
      photoUrls: [],
      tags: [
        {
          id: 1,
          name: 'category1',
        },
      ],
      status: 'sold',
    },
  ] as paths['/pet/findByStatus']['get']['responses']['200']['content']['application/json'],
})

export const petFindByStatus = async (
  query: paths['/pet/findByStatus']['get']['parameters']['query']
) =>
  serviceLayerFetch(
    `${config.services.backendServiceDomain}/api/limit?status=${query.status}`,
    {
      method: 'get',
    },
    {
      useMock: config.services.useMock,
      getMockResponse: petFindByStatusMockResponse,
    }
  )
