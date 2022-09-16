// @ts-ignore
const { exec } = require("child_process");

const LINUX = 'linux'
const WINDOWS = 'win32'
const MAC = 'darwin'

async function installIpfsIfNeeded() {
  if (await isIpfsInstalled()) {
    console.log("IPFS already installed");
    return;
  }

  switch (process.platform) {
    case LINUX:
      return await installIpfsForLinux();
    case WINDOWS:
      throw new Error('Not yet implemented')
    case MAC:
      if (process.arch.includes('arm')) {
        return await installIpfsForARMMac();
      } else {
        return await installIpfsForAMDMac();
      }
  }
}

async function isIpfsInstalled() {
  const { stderr } = await asyncExec("ipfs --version")
  return !stderr.includes("ipfs: command not found")
}

export async function startIpfs() {
  await installIpfsIfNeeded();
  asyncExec("ipfs daemon")
    .catch(e => {
      if (!e.stderr.includes('someone else has the lock')) {
        console.error(e)
        throw new Error('Unexpected error while initilizing ipfs daemon')
      }
    })
    .finally(() => console.log('Killing Daemon'))
}

export async function getCidInBase32(hash: string): Promise<string> {
  const { stdout } = await asyncExec(`ipfs cid base32 ${hash}`)
  return stdout.trim()
}

export async function getCidInBase32ForIpns(hash: string) {
  const { stdout } = await asyncExec(`ipfs resolve -r /ipns/${hash}`)
  const result = stdout.trim().slice(6);
  return result.length > 50 ? result : await getCidInBase32(result);
}

async function installIpfsForAMDMac() {
  console.log('Installing IPFS for AMD Mac')
  await asyncExec("mkdir -p ipfs && cd ipfs && curl -O https://dist.ipfs.tech/kubo/v0.15.0/kubo_v0.15.0_darwin-amd64.tar.gz")
  await asyncExec("cd ipfs && tar -xvzf kubo_v0.15.0_darwin-amd64.tar.gz")
  await asyncExec("cd ipfs/kubo && sudo bash install.sh")
  await asyncExec("ipfs init")
}

async function installIpfsForARMMac() {
  console.log('Installing IPFS for ARM Mac')
  await asyncExec("mkdir -p ipfs && cd ipfs && curl -O https://dist.ipfs.tech/kubo/v0.15.0/kubo_v0.15.0_darwin-arm64.tar.gz")
  await asyncExec("cd ipfs && tar -xvzf kubo_v0.15.0_darwin-arm64.tar.gz")
  await asyncExec("cd ipfs/kubo && sudo bash install.sh")
  await asyncExec("ipfs init")
}

async function installIpfsForLinux() {
  console.log('Installing IPFS for Linux')
  await asyncExec("mkdir -p ipfs && cd ipfs && wget https://dist.ipfs.tech/kubo/v0.15.0/kubo_v0.15.0_linux-amd64.tar.gz")
  await asyncExec("cd ipfs && tar -xvzf ipfs/kubo_v0.15.0_darwin-arm64.tar.gz")
  await asyncExec("cd ipfs/kubo && sudo bash install.sh")
  await asyncExec("ipfs init")
}

interface ExecResponse {
  err: any,
  stdout: any,
  stderr: any
}

function asyncExec(command: string): Promise<ExecResponse> {
  return new Promise((resolve, reject) => {
    exec(command, (err: any, stdout: any, stderr: any) => {
      if (!!err) {
        console.error(err);
        reject({ err, stdout, stderr })
      }
      resolve({ err, stdout, stderr })
    })
  })
}
