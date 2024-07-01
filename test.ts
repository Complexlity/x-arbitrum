import { Address, createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import nftAbi from "./nftDetails/abi.json" assert {type: "json"}
import { config } from "./utils/config.js";

const publicClient = createPublicClient({
	chain: arbitrumSepolia,
	transport: http()
})

const data = await publicClient.readContract({
  address: config.REQUIRED_NFT_ADDRESS as Address,
  abi: nftAbi,
  functionName: "getTokenIdForFid",
  args: ["111245"],
}) as bigint

console.log({data: data.toString()})
