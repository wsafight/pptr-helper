import { type ScreenshotOptions } from 'puppeteer-core';
import { BasicActionArgs, checkBasicActionArgs, getChromePage } from '@/basic';

export interface ExportToImageArgs extends BasicActionArgs {
  /** Image type, default png */
  type?: 'webp' | 'jpeg' | 'png';
  /** Other image generation configuration items */
  screenshotOptions?: ScreenshotOptions;
}

export const exportToImage = async ({
  url = '',
  savePath = '',
  type = 'png',
  userAgent,
  screenshotOptions,
  viewport,
  pageFunction,
}: ExportToImageArgs): Promise<void> => {
  checkBasicActionArgs({ url, savePath });

  const page = await getChromePage({ url, userAgent, viewport, pageFunction });

  const imgOptions = {
    type,
    path: savePath,
    fullPage: true,
    ...screenshotOptions,
  };

  await page.screenshot(imgOptions);
  await page.close();
};
