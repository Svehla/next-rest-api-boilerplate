import fs from 'fs'
import openapiTS from 'openapi-typescript'
import swaggerJson from './swagger.json'

// TODO: fetch swaggerJSON from backend
const main = async () => {
  // @ts-expect-error
  const tsGeneratedTypes = await openapiTS(swaggerJson)

  fs.writeFileSync(
    `${process.cwd()}/src/services/__generated__/generated-api-types.ts`,
    tsGeneratedTypes,
    'utf-8'
  )
}

main()
