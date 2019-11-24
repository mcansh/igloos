import chrome from "chrome-aws-lambda";
import { LaunchOptions } from "puppeteer-core";
const exePath =
  process.platform === "win32"
    ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function getOptions(isDev: boolean) {
  let options: LaunchOptions;
  if (isDev) {
    options = {
      args: [],
      executablePath: exePath,
      headless: false
    };
  } else {
    options = {
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless
    };
  }
  return options;
}

export { getOptions };
