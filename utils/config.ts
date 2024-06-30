
// import {  ArkErrors, type } from 'arktype'
import z from 'zod'
  
// const parseConfig = type({
//     REDIS_URL: "url>0",
//     REDIS_TOKEN: "string>0",
//     AIRSTACK_API_KEY: "string>0"
// })
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;


const configParser = z.object({
  REQUIRED_NFT_ADDRESS: z.string().startsWith("0x"),
  
})

//Make process.env types match as needed
// type EnvSchemaType = typeof parseConfig.infer
type EnvSchemaType = z.infer<typeof configParser>

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvSchemaType {}
  }
}

const config = configParser.parse(process.env)

export {config}

//     type T = Exclude<typeof config, ArkErrors>
// const configg = config as T
// export {configg as config}

