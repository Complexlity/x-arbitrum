
import {  ArkErrors, type } from 'arktype'
// import z from 'zod'
import { config as dotEnvConfig } from 'dotenv'
import { isAddress } from 'viem'

dotEnvConfig({ path: "./.env" })

const startsWithOx = type("string").narrow((address, ctx) => {
  if (isAddress(address)) {
    return true;
  }
  // add a customizable error and return false
  return ctx.mustBe("A valid EVM address");
});


const configParser = type({
    REQUIRED_NFT_ADDRESS: startsWithOx,
    HOST: "url",
  })
  // AIRSTACK_API_KEY: "string>0"
// const dateRegex = /^\d{4}-\d{2}-\d{2}$/;


const config = configParser(process.env)

// if()
// const configParser = z.object({
//   REQUIRED_NFT_ADDRESS: z.string().startsWith("0x"),
//   HOST: z.string().url()

// })

// Make process.env types match as needed
type EnvSchemaType = typeof configParser.infer
// type EnvSchemaType = z.infer<typeof configParser>

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvSchemaType {}
  }
}

// const config = configParser.parse(process.env)
if (config instanceof type.errors) {
  throw new Error(config.summary)
}

// export {config}

  type T = Exclude<typeof config, ArkErrors>
  const configg = config as T
export { configg as config }

