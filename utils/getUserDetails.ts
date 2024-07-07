import axios from "axios";
import { UserData } from "./types.js";
export async function getUserDetailsFromFid(fid?: number) {
     if(!fid) fid = 213144
  const usersUrl = "https://api.neynar.com/v2/farcaster/user/bulk";
  const usersParams = {
    fids: `${fid}`,
    viewer_fid: `${fid}`,
  };

  const headers = {
    accept: "application/json",
    api_key: "NEYNAR_API_DOCS",
  };

  try {
      const { data } = await axios.get < { users: UserData[] }>(usersUrl, {
      params: usersParams,
      headers: headers,
    });
      const [userData] = data.users;
     const userAddress = userData.verified_addresses.eth_addresses[0] ?? userData.custody_address


    return {
        userName: userData.display_name,
      userImage: userData.pfp_url,
        userAddress
    };
  } catch (error) {
      console.log({error})
    return null;
  }
}

