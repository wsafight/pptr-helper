import { type Page } from 'puppeteer-core';
import { BasicActionArgs, getChromePage } from '../basic';
import { invariant } from '@/utils';

export type GetEvalResultFromPage = Omit<BasicActionArgs, 'savePath'> & {
  evalFunction: (page: Page) => Promise<any>;
};

export const getEvalResult = async ({
  url = '',
  userAgent,
  viewport,
  pageFunction,
  evalFunction,
}: GetEvalResultFromPage) => {
  invariant(
    typeof url !== 'string' || !url,
    'url must be a string and cannot be empty',
  );

  const page = await getChromePage({ url, userAgent, viewport, pageFunction });
  const result = await evalFunction(page);
  await page.close();
  return result;
};
