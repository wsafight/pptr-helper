import { type Page } from 'puppeteer-core';
import { invariant } from '@/utils';
import { getBrowser } from '@/browser/get-browser';
import { DEFAULT_USER_AGENT, getDefaultViewport } from '@/constants';

export interface BasicActionArgs {
  /** The URL of the webpage that needs to be screenshot */
  url: string;
  /** Local save address */
  savePath: string;
  /** Without this configuration, many web pages do not support browsing. */
  userAgent?: string;
  /** callback function */
  pageFunction?: (page: Page) => Promise<void>;
  /** viewport */
  viewport?: {
    width: number;
    height: number;
  };
}

export const checkBasicActionArgs = ({ url, savePath }: BasicActionArgs) => {
  invariant(
    typeof url !== 'string' || !url,
    'url must be a string and cannot be empty',
  );
  invariant(
    typeof savePath !== 'string' || !savePath,
    'savePath must be a string and cannot be empty',
  );
};

export const getBrowserPage = async ({
  url,
  userAgent,
  viewport,
  pageFunction,
}: Omit<BasicActionArgs, 'savePath'>): Promise<Page> => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.setUserAgent(userAgent || DEFAULT_USER_AGENT);
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const { width, height } = { ...getDefaultViewport(), ...viewport };
  await page.setViewport({ width, height });

  if (pageFunction) {
    await pageFunction(page);
  }
  return page;
};
