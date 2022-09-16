// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

// @ts-ignore
import { openEns } from "./dist/resolver";

const searchButton = document.querySelector("#search-ipfs");

if (searchButton) {
  searchButton.addEventListener("click", () => {
    const ensDomain = document.querySelector(".ens-domain");
    // @ts-ignore
    const content = ensDomain.value;
    openEns(content);
  });
}
