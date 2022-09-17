// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

// @ts-ignore
import { openEns } from "./dist/resolver";
// @ts-ignore
import { isIpfsInstalled, startIpfs } from "./dist/ipfs";

const splash = document.querySelector("#splash") as HTMLElement;
const loading = document.querySelector("#loading") as HTMLElement;
const main = document.querySelector("#main") as HTMLElement;

isIpfsInstalled().then((isInstalled: boolean) => {
  splash.style.display = "none";
  loading.style.display = isInstalled ? "none" : "inline-block";
  main.style.display = !isInstalled ? "none" : "inline-block";

  startIpfs()
    .then(() => {
      loading.style.display = "none";
      main.style.display = "inline-block";
    })
    .catch((e: any) => {
      // mostrar mensaje de error

      console.error("Start IPFS failed");
      console.error(e);
    });
});

const searchButton = document.querySelector("#search-ipfs");
const popularApps = document.querySelectorAll(".popular-apps-list li");

searchButton?.addEventListener("click", () => {
  const ensDomain = document.querySelector(".ens-domain");
  // @ts-ignore
  const content = ensDomain.value;
  openEns(content);
});

popularApps?.forEach((app) => {
  app.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target) {
      const ensDomain = target.dataset.ensDomain;
      openEns(ensDomain);
    }
  });
});
