// ==UserScript==
// @name        Copy Linear.app branch name
// @namespace   Violentmonkey Scripts
// @match       https://linear.app/*/issue/*/*
// @grant       none
// @version     3d979af
// @author      -
// @description 2024-10-29T19:05:29.587Z
// @icon        https://static.linear.app/client/assets/favicon.hash-Ch-xRaRR.svg
// @updateURL   https://raw.githubusercontent.com/shiftgeist/deno-userscript-copy-linear-branch-name/refs/heads/main/dist/index.js
// @downloadURL https://raw.githubusercontent.com/shiftgeist/deno-userscript-copy-linear-branch-name/refs/heads/main/dist/index.js
// ==/UserScript==

// https://jsr.io/@mesqueeb/case-anything/3.1.0/src/utils.ts
var magicSplit = /^[a-zà-öø-ÿа-я]+|[A-ZÀ-ÖØ-ßА-Я][a-zà-öø-ÿа-я]+|[a-zà-öø-ÿа-я]+|[0-9]+|[A-ZÀ-ÖØ-ßА-Я]+(?![a-zà-öø-ÿа-я])/g;
var spaceSplit = /\S+/g;
function getPartsAndIndexes(string, splitRegex) {
  const result = { parts: [], prefixes: [] };
  const matches = string.matchAll(splitRegex);
  let lastWordEndIndex = 0;
  for (const match of matches) {
    if (typeof match.index !== "number") continue;
    const word = match[0];
    result.parts.push(word);
    const prefix = string.slice(lastWordEndIndex, match.index).trim();
    result.prefixes.push(prefix);
    lastWordEndIndex = match.index + word.length;
  }
  const tail = string.slice(lastWordEndIndex).trim();
  if (tail) {
    result.parts.push("");
    result.prefixes.push(tail);
  }
  return result;
}
function splitAndPrefix(string, options) {
  const { keepSpecialCharacters = false, keep, prefix = "" } = options || {};
  const normalString = string.trim().normalize("NFC");
  const hasSpaces = normalString.includes(" ");
  const split = hasSpaces ? spaceSplit : magicSplit;
  const partsAndIndexes = getPartsAndIndexes(normalString, split);
  return partsAndIndexes.parts.map((_part, i) => {
    let foundPrefix = partsAndIndexes.prefixes[i] || "";
    let part = _part;
    if (keepSpecialCharacters === false) {
      if (keep) {
        part = part.normalize("NFD").replace(new RegExp(`[^a-zA-Z\xD8\xDF\xF80-9${keep.join("")}]`, "g"), "");
      }
      if (!keep) {
        part = part.normalize("NFD").replace(/[^a-zA-ZØßø0-9]/g, "");
        foundPrefix = "";
      }
    }
    if (keep && foundPrefix) {
      foundPrefix = foundPrefix.replace(new RegExp(`[^${keep.join("")}]`, "g"), "");
    }
    if (i === 0) {
      return foundPrefix + part;
    }
    if (!foundPrefix && !part) return "";
    if (!hasSpaces) {
      return (foundPrefix || prefix) + part;
    }
    if (!foundPrefix && prefix.match(/\s/)) {
      return " " + part;
    }
    return (foundPrefix || prefix) + part;
  }).filter(Boolean);
}

// https://jsr.io/@mesqueeb/case-anything/3.1.0/src/core.ts
function kebabCase(string, options) {
  return splitAndPrefix(string, { ...options, prefix: "-" }).join("").toLowerCase();
}

// main.ts
var logID = "\u{1F535}";
var maxLength = 50;
var iconSelector = '[aria-label="Copy branch name"]';
var issueID = location?.href.split("/")[5];
var branchTemplate = ({ type, title }) => `${type}-${issueID}-${title}`;
console.log(`${logID} Init "Copy branch name"`);
function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}
function copyTemplate({ type, title }) {
  let branch = branchTemplate({ type, title });
  if (branch.length > maxLength) {
    branch = branch.slice(0, maxLength);
  }
  return `git checkout -b ${branch}`;
}
async function main() {
  await waitForElm(iconSelector);
  const button = document.querySelector(iconSelector)?.parentElement;
  const type = "feat";
  const title = document.querySelector('[data-view-id="issue-view"] div div')?.innerText;
  button?.addEventListener("click", (e) => {
    e.stopPropagation();
    const checkout = copyTemplate({ type, title: kebabCase(title) });
    navigator.clipboard.writeText(checkout);
    console.log(`Copied "${checkout}" to clipboard`);
  });
}
main();
