import { Button, Frog, loadGoogleFont } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import { getUserDetailsFromFid } from '../utils/getUserDetails.js'
import { config } from '../utils/config.js'
import { ImageResponse } from 'hono-og'
import nftAbi from "../nftDetails/abi.json" assert { type: "json" };
import { Address, createPublicClient, http } from 'viem'
import { arbitrumSepolia, arbitrum } from 'viem/chains'

const arbitrumClient = createPublicClient({
  transport: http(),
  chain: arbitrumSepolia
})

const OPEN_SEA_URL =
      "https://testnets.opensea.io/collection/farcasteruserxarbitrum";

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }
export const app = new Frog({
  title: "This is the wayt",
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});



app.hono.get("/ximage/:fid", async (c) => {
  const fid = Number(c.req.param("fid"));
  if (!fid) throw new Error("Image fid missing");
  const user = await getUserDetailsFromFid(fid);
  if (!user) throw new Error(`User with fid ${fid} not found`);
  return new ImageResponse(
    (
      <NftImage
        userImage={user.userImage}
        userName={user.userName.toLowerCase()}
      />
    ),
    {
      fonts: [
        {
          name: "Ojuju",
          weight: 600,
          data: await loadGoogleFont({ family: "Ojuju", weight: 600 }),
        },
      ],
    }
  );
});

app.hono.get("/xmetadata/:fid", async (c) => {
  const fid = Number(c.req.param("fid"));
  if (!fid) throw new Error("Image fid missing");
  const user = await getUserDetailsFromFid(fid);
  if (!user) throw new Error(`User with fid ${fid} not found`);
  return c.json({
    name: `${user.userName.toLowerCase()}Xarbitrum`,
    description: `A customized NFT for ${user.userName} to show collaboration with Arbitrum`,
    image: `${config.HOST}/api/ximage/${fid}`,
    attributes: [
      {
        trait_type: "Tier",
        value: "ELITE",
      },
    ],
  });
});


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

app.frame(
  "/finish",
  async (c) => {
    const { frameData } = c;

    if (!frameData)
      return c.error({
        message: "Frame data not found",
      });
    const fid = frameData.fid
    const userImageAndUsername = await getUserDetailsFromFid(fid);
  const data = await arbitrumClient.readContract({
  address: config.REQUIRED_NFT_ADDRESS as Address,
  abi: nftAbi,
  functionName: "getTokenIdForFid",
  args: [`${fid}`],
  }) as bigint
    const tokenId = Number(data.toString())
    console.log({ tokenId })
    // const openSeaUrl = tokenId ? `https://testnets.opensea.io/assets/arbitrum-sepolia/0x7c9a78bc26ca09896659881d1ef4b636b16f6e9a/${tokenId}` : "https://testnets.opensea.io/collection/farcasteruserxarbitrum"


const params = new URLSearchParams()
params.set("text", `Get your customized x-arbitrum NFT and share in /arbitrum. Here's mine`);
params.append(
  "embeds[]",
  `https:/${config.HOST}/api/s/${fid}`
);

const shareUrl = `https://warpcast.com/~/compose?${params.toString()}`;

    return c.res({
      image: (
        <NftImage
          userImage={userImageAndUsername?.userImage}
          userName={userImageAndUsername?.userName}

        />
      ),
      intents: [
        <Button.Link href={shareUrl}>Share</Button.Link>,
        <Button.Link href={OPEN_SEA_URL}>Open Sea</Button.Link>
      ],
    });
  },
  {
    fonts: [
      {
        name: "Ojuju",
        weight: 600,
        source: "google",
      },
    ],
  }
);

app.frame('/s/:fid', async (c) => {
  const fid = Number(c.req.param('fid'))
  let userName, userImage;
  console.log({fid})
  if (fid) {
    const userDetails = await getUserDetailsFromFid(fid)
    if (userDetails) {
      userName = userDetails.userName
      userImage = userDetails.userImage
    }
  }
  return (
    c.res({
      image: <NftImage userImage={userImage} userName={userName} />,
      intents: [
        <Button.Transaction target="/mint">Mint</Button.Transaction>,
        <Button.Link href={OPEN_SEA_URL}>Open Sea</Button.Link>,
      ],
    })
)},
    {
      fonts: [
        {
          name: "Ojuju",
          weight: 600,
          source: "google",
        },
      ],
    }
  );

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

app.transaction('/mint', async (c) => {
const { frameData } = c
  if (!frameData) return c.error({
    message: "Frame data not found"
  })
  const fid = frameData.fid
  const nftAddress = config.REQUIRED_NFT_ADDRESS;
  return c.contract({
    chainId: "eip155:421614",
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
  if (userName.length > 15) {
    userName = userName.slice(0, 12) + "..."
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
