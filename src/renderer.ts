 // @ts-ignore
import { openEns } from "./dist/resolver";
// @ts-ignore
import { isIpfsInstalled, startIpfs } from "./dist/ipfs";

const loading = document.querySelector("#loading") as HTMLElement;
const main = document.querySelector("#main") as HTMLElement;
const spinner = document.querySelector(".lds-ring") as HTMLElement;

isIpfsInstalled().then((isInstalled: boolean) => {
  loading.style.display = isInstalled ? "none" : "flex";
  main.style.display = !isInstalled ? "none" : "flex";


  startIpfs()
    .then(() => {
      loading.style.display = "none";
      main.style.display = "flex";
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
  spinner.style.display = "inline-block";
  openEns(content).then(() => {
    spinner.style.display = "none";
  });
});

popularApps?.forEach((app) => {
  app.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    if (target) {
      const ensDomain = target.closest("li")?.dataset.ensDomain;
      spinner.style.display = "inline-block";
      openEns(ensDomain).then(() => {
        spinner.style.display = "none";
      });
    }
  });
});
