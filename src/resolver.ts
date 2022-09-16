import { ethers } from "ethers";
import { getCidInBase32, getCidInBase32ForIpns } from "./ipfs";
// @ts-ignore
const { exec } = require("child_process");

const RPC_URL = "https://cloudflare-eth.com/";

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

export async function openEns(ens: string) {
  const resolver = await provider.getResolver(ens);
  const content = await resolver?.getContentHash();

  console.info(content);
  const [protocol, hash] = content?.split("://") ?? [];

  const base32Cid =
    protocol === "ipfs"
      ? await getCidInBase32(hash)
      : await getCidInBase32ForIpns(hash);
  if (!base32Cid) {
    console.error("CID not found");
    return;
  }
  const url = `http://${base32Cid}.ipfs.localhost:8080`;
  exec(`open ${url}`);
}
