// @ts-ignore
const { exec } = require("child_process");

async function installIpfsIfNeeded() {
  if (await isIpfsInstalled()) {
    console.log("IPFS already installed");
    return;
  }

  await installIpfsForMac();
  // await installIpfsForLinux();
}

function isIpfsInstalled() {
  return new Promise((resolve) => {
    exec("ipfs --version", (err: any, stdout: any, stderr: any) => {
      resolve(!stderr.includes("ipfs: command not found"));
    });
  });
}

export async function startIpfs() {
  await installIpfsIfNeeded();
  exec("ipfs daemon");
}

export async function getCidInBase32(hash: string): Promise<string> {
  return new Promise((resolve) => {
    exec(`ipfs cid base32 ${hash}`, (err: any, stdout: any, stderr: any) => {
      if (err) {
        console.error(err);
      }
      resolve(stdout.trim());
    });
  });
}

export async function getCidInBase32ForIpns(hash: string) {
  return new Promise((resolve) => {
    exec(
      `ipfs resolve -r /ipns/${hash}`,
      async (err: any, stdout: any, stderr: any) => {
        if (err) {
          console.error(err);
        }
        const result = stdout.trim().slice(6);
        resolve(result.length > 50 ? result : await getCidInBase32(result));
      }
    );
  });
}

async function installIpfsForMac() {
  return new Promise((resolve, reject) => {
    exec(
      "mkdir -p ipfs && curl -O https://dist.ipfs.tech/kubo/v0.15.0/kubo_v0.15.0_darwin-arm64.tar.gz -o ipfs",
      (err: any) => {
        if (!!err) {
          reject(err);
          return;
        }
        exec(
          "tar -xvzf ipfs/kubo_v0.15.0_darwin-arm64.tar.gz -C ipfs",
          (err: any) => {
            if (!!err) {
              reject(err);
              return;
            }
            exec("cd ipfs/kubo && sudo bash install.sh", (err: any) => {
              if (!!err) {
                reject(err);
                return;
              }
              exec("ipfs init", (err: any) => {
                if (!!err) {
                  reject(err);
                  return;
                }
                resolve(true);
              });
            });
          }
        );
      }
    );
  });
}

async function installIpfsForLinux() {
  return new Promise((resolve, reject) => {
    exec(
      "mkdir -p ipfs && wget https://dist.ipfs.tech/kubo/v0.15.0/kubo_v0.15.0_linux-amd64.tar.gz -O ipfs",
      (err: any) => {
        if (!!err) {
          reject(err);
          return;
        }
        exec(
          "tar -xvzf ipfs/kubo_v0.15.0_darwin-arm64.tar.gz -C ipfs",
          (err: any) => {
            if (!!err) {
              reject(err);
              return;
            }
            exec("cd ipfs/kubo && sudo bash install.sh", (err: any) => {
              if (!!err) {
                reject(err);
                return;
              }
              exec("ipfs init", (err: any) => {
                if (!!err) {
                  reject(err);
                  return;
                }
                resolve(true);
              });
            });
          }
        );
      }
    );
  });
}
