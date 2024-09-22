import { access } from 'fs/promises';
import { launch, Browser } from 'puppeteer-core';
import { getChromeConfig } from './chrome-config';

/** singleton */
let finalBrowser: Browser;

export const getBrowser = async (): Promise<Browser> => {
  // If a browser instance has already been created, return the instance
  if (finalBrowser) {
    return finalBrowser;
  }

  const { executablePath, headless, launchArgs } = getChromeConfig();

  // Check whether the browser path is correct
  try {
    await access(executablePath);
  } catch (e) {
    throw new Error(`cannot found chrome [${executablePath}]`);
  }

  const launchOptions = {
    headless,
    executablePath,
    args: launchArgs,
  };

  try {
    const browser = await launch(launchOptions);
    const browserVersion = await browser.version();
    console.log(`browser launched. version=${browserVersion}`);

    finalBrowser = browser;
    return finalBrowser;
  } catch (err) {
    throw new Error(
      `failed to load chrome [ ${executablePath} ]. error=${err.message}`,
    );
  }
};
