// @ts-ignore
const { exec } = require("child_process");

export const LINUX = "linux";
export const WINDOWS = "win32";
export const MAC = "darwin";

async function installIpfsIfNeeded() {
  if (await isIpfsInstalled()) {
    console.log("IPFS already installed");
    return;
  }

  switch (process.platform) {
    case LINUX:
      return await installIpfsForLinux();
    case WINDOWS:
      throw new Error("Not yet implemented");
    case MAC:
      if (process.arch.includes("arm")) {
        return await installIpfsForARMMac();
      } else {
        return await installIpfsForAMDMac();
      }
  }
}

export async function isIpfsInstalled() {
  try {
    await asyncExec("ipfs --version");
    return true;
  } catch (e) {
    return false;
  }
}

export async function startIpfs() {
  await installIpfsIfNeeded();
  console.log(`Executing daemon`);
  asyncExec("ipfs daemon")
    .catch((e) => {
      if (!e.stderr.includes("someone else has the lock")) {
        throw new Error("Unexpected error while initilizing ipfs daemon");
      }
    })
    .finally(() => console.log("Killing Daemon"));
}

export async function getCidInBase32(hash: string): Promise<string> {
  const { stdout } = await asyncExec(`ipfs cid base32 ${hash}`);
  return stdout.trim();
}

export async function getCidInBase32ForIpns(hash: string) {
  const { stdout } = await asyncExec(`ipfs resolve -r /ipns/${hash}`);
  const result = stdout.trim().slice(6);
  return result.length > 50 ? result : await getCidInBase32(result);
}

async function installIpfsForAMDMac() {
  console.log("Installing IPFS for AMD Mac");
  await asyncExec(
    "mkdir -p ipfs && cd ipfs && curl -O https://dist.ipfs.tech/kubo/v0.15.0/kubo_v0.15.0_darwin-amd64.tar.gz"
  );
  await asyncExec("cd ipfs && tar -xvzf kubo_v0.15.0_darwin-amd64.tar.gz");
  await asyncExec("cd ipfs/kubo && bash install.sh");
  await initIpfs();
}

async function installIpfsForARMMac() {
  console.log("Installing IPFS for ARM Mac");
  await asyncExec(
    "mkdir -p ipfs && cd ipfs && curl -O https://dist.ipfs.tech/kubo/v0.15.0/kubo_v0.15.0_darwin-arm64.tar.gz"
  );
  await asyncExec("cd ipfs && tar -xvzf kubo_v0.15.0_darwin-arm64.tar.gz");
  await asyncExec("cd ipfs/kubo && bash install.sh");
  await initIpfs();
}

async function installIpfsForLinux() {
  console.log("Installing IPFS for Linux");
  await asyncExec(
    "mkdir -p ipfs && cd ipfs && wget https://dist.ipfs.tech/kubo/v0.15.0/kubo_v0.15.0_linux-amd64.tar.gz"
  );
  await asyncExec("tar -xvzf ipfs/kubo_v0.15.0_linux-amd64.tar.gz");

  await asyncExec(`cd kubo && bash install.sh`);

  await initIpfs();
}

async function initIpfs() {
  try {
    await asyncExec("ipfs init");
  } catch (e: any) {
    if (!e.stderr.includes("Error: ipfs configuration file already exists!")) {
      throw new Error("Unexpected error when initializing ipfs");
    }
  }
}

interface ExecResponse {
  err: any;
  stdout: any;
  stderr: any;
}

function asyncExec(command: string): Promise<ExecResponse> {
  return new Promise((resolve, reject) => {
    exec(command, (err: any, stdout: any, stderr: any) => {
      if (!!err) {
        console.error(err);
        reject({ err, stdout, stderr });
      }
      resolve({ err, stdout, stderr });
    });
  });
}
