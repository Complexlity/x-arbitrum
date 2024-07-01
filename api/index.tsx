import { Button, Frog, loadGoogleFont } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import { getUserDetailsFromFid } from '../utils/getUserDetails.js'
import { config } from '../utils/config.js'
import { ImageResponse } from 'hono-og'
import nftAbi from "../nftDetails/abi.json" assert { type: "json" };

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  title: "This is the wayt", assetsPath: '/', basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.frame('/', (c) => {
  return c.res({
    action:"/finish",
    image: (
      <NftImage />
    ),
    intents: [
      <Button.Transaction target="/mint">Mint</Button.Transaction>
    ],
  },)

}, {
  fonts: [
    {
      name: "Ojuju",
  weight: 600,
      source: "google"
    }
  ]
})

app.frame('/finish', async (c) => {
  const { transactionId, frameData } = c
  if (!frameData) return c.error({
    message: "Frame data not found"
  })
  const userImageAndUsername = await getUserDetailsFromFid(frameData.fid)

  return c.res(
    {
      image: <NftImage userImage={userImageAndUsername?.userImage} userName={userImageAndUsername?.userName} />,
      intents: [
        <Button>Share</Button>
      ]
    }
  )

})

app.hono.get('/nftImage', async (c) => {
  const font = {
    name: "Ojuju",
    family: "Ojuju",
    weight: 600
  } as const
  return new ImageResponse(
    <NftImage />,
    {
      width: 1200,
      height: 630,
      fonts:
        [
          {
            ...font,
            data: await loadGoogleFont({...font})
          }
        ]
    }
  )
})

app.hono.get('/ximage/:fid', async (c) => {
  const fid = Number(c.req.param('fid'))
  if(!fid) throw new Error("Image fid missing")
  const user = await getUserDetailsFromFid(fid)
  if (!user) throw new Error(`User with fid ${fid} not found`)
  return new ImageResponse(
    <NftImage userImage={user.userImage} userName={user.userName.toLowerCase()} />,
    {
      fonts: [
        {
          name: "Ojuju",
          weight: 600,
          data: await loadGoogleFont({family: "Ojuju",weight: 600 })
        }
    ]
    }
  )
})


app.hono.get('/xmetadata/:fid', async (c) => {
const fid = Number(c.req.param('fid'))
if(!fid) throw new Error("Image fid missing")
const user = await getUserDetailsFromFid(fid)
  if (!user) throw new Error(`User with fid ${fid} not found`)
  return c.json({
    "name": `${user.userName.toLowerCase()}Xarbitrum`,
    "description": `A customized NFT for ${user.userName} to show collaboration with Arbitrum`,
    "image": `${config.HOST}/api/ximage/${fid}`,
    "attributes": [
      {
        "trait_type": "Tier",
        "value": "ELITE"
      }
    ]
  })
})

app.transaction('/mint', async (c) => {
const { frameData } = c
  if (!frameData) return c.error({
    message: "Frame data not found"
  })
  const fid = frameData.fid
  const nftAddress = config.REQUIRED_NFT_ADDRESS;
  return c.contract({
    chainId: "eip155:42161",
    abi: nftAbi,
    functionName: "mint",
    args: [fid],
    to: nftAddress as `0x${string}`,
  });
})


function NftImage({ userImage, userName }: { userImage?: string, userName?: string }) {
  if (!userName || !userImage) {
    userName = "???"
    userImage = "https://i.ibb.co/VYCmKgj/dummy-Image.jpg"


  }

  // userName = "Complexlity"
  return (
    <div
  style={{
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    fontSize: 32,
    fontWeight: 600,
    background: "url(https://i.ibb.co/s1xrThZ/person-Xarbitrum-template.png)",
    backgroundSize: "100% 100%",
  }}
>

<div tw="flex w-[56.9] h-[53] absolute top-[47.8] left-[35.1]">
  <img src={userImage} width="100%" height="100%" style={{
    objectFit: "cover",
    objectPosition: "top"
  }}/>
  </div>
  <div tw="flex absolute top-110 text-white left-[7.5] text-4xl uppercase w-[29rem] text-center justify-center">
        <span>{userName}</span>
  </div>
  <div tw="flex absolute top-110 right-[7.5] w-[29rem] text-4xl uppercase text-center text-white justify-center ">
  <span>Arbitrum</span>
  </div>
</div>

  )
}

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
