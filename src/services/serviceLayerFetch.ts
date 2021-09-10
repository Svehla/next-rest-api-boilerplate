// --------- node utils ---------

const delay = (time: number) => new Promise(r => setTimeout(r, time))

export type FetchInitArg = Partial<Parameters<typeof fetch>[1]>
export type ResponseInitArg = Partial<ConstructorParameters<typeof Response>>[1]

/**
 * we want to want to wait one cycle of the event-loop
 */
const setImmediatePromise = () => new Promise(r => setTimeout(r, 0))

const isObject = (obj: any): boolean => obj !== null && obj.constructor.name === 'Object'

// --- fix static types for network node-fetch library ---

export declare class ServiceLayerResponse<T> extends Response {
  json(): Promise<T>
}

const extract4xx5xxErrData = async (res: Response) => ({
  url: res.url,
  status: res.status,
  reason: await res.text(),
})

export class ServiceLayerFetchError extends Error {
  response: Response

  type: string

  constructor(information: string, response: Response) {
    super(information)
    this.response = response
    this.type = 'ServiceLayerFetchError'
  }
}

// this code ensures that when you access response on error and it is not there you will not get 'can not read 'status' of undefined error
// -  non existing host network failure or invalid configuration
// all these cases results in failure with no response available
// prevent access to non existing 'response' attribute by using recursive proxy
// recursive because you can try to read it on multiple levels of application (service implementation and in endpoint implementation for instance)
const getErrorWithoutResponse = (originalError: Error) => {
  const preventResponseAccessHandler = {
    get: (target: any, propName: string, receiver: any) => {
      if (propName === 'response') {
        throw new Proxy(
          new Error(`When catching error from 'serviceLayerFetch' you are trying to read 'response' attribute,
       but this error occurred when there was network failure, non existing host or misconfiguration of service,
       response is thus not available!
       Original error: ${originalError}
       `),
          preventResponseAccessHandler
        )
      }
      return Reflect.get(target, propName, receiver)
    },
  }

  return new Proxy(originalError, preventResponseAccessHandler)
}

export const errorThrower = async <T>(res: ServiceLayerResponse<T>) => {
  // ok is equal to `statusCode` in range 200-299`
  if (res.ok) return
  throw new ServiceLayerFetchError(JSON.stringify(await extract4xx5xxErrData(res.clone())), res)
}

const defaultOkResponseParser = <M>(r: ServiceLayerResponse<M>) => r.json()

export const serviceLayerFetch = async <M, N = M>(
  url: string,
  init: Parameters<typeof fetch>[1] | undefined,
  {
    useMock,
    getMockResponse,
    okResponseParser = defaultOkResponseParser as any as (
      arg: ServiceLayerResponse<M>
    ) => Promise<N> | N,
  }: {
    useMock?: boolean
    getMockResponse?: (
      url: string,
      init: FetchInitArg
    ) => {
      responseData?: M
      responseInit?: ResponseInitArg
      config?: {
        delay?: number
      }
    }
    okResponseParser?: (arg: ServiceLayerResponse<M>) => Promise<N> | N
  } = {}
): Promise<[N, ServiceLayerResponse<M>]> => {
  // we want to be sure that each mock service is async function
  await setImmediatePromise()
  try {
    let response: ServiceLayerResponse<M>
    if (useMock && getMockResponse) {
      const mock = getMockResponse(url, init)

      if (mock.config?.delay) await delay(mock?.config?.delay)

      const stringifiedMockData =
        isObject(mock.responseData) || Array.isArray(mock.responseData)
          ? JSON.stringify(mock.responseData)
          : (mock.responseData as any as string)

      response = new Response(stringifiedMockData, {
        // @ts-expect-error
        url: url as any,
        ...mock.responseInit,
      })
    } else {
      response = await fetch(url, init)
    }

    // clone response in order to be able to read body more than once
    // see : https://stackoverflow.com/questions/40497859/reread-a-response-body-from-javascripts-fetch for more info
    await errorThrower(response)

    const okParsedData = await okResponseParser(response.clone())
    return [okParsedData, response]
  } catch (e: any) {
    // if error has response attribute it means that
    // request failed on 4xx5xx error status
    if (e.response) {
      throw e
    }
    throw getErrorWithoutResponse(e)
  }
}
