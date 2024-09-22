import { type PDFOptions } from 'puppeteer-core';
import { BasicActionArgs, checkBasicActionArgs, getChromePage } from '@/basic';

export interface ExportToPdfArgs extends BasicActionArgs {
  pdfOptions?: PDFOptions;
}

export const exportToPdf = async ({
  url = '',
  savePath = '',
  viewport,
  pageFunction,
  userAgent,
  pdfOptions,
}: ExportToPdfArgs) => {
  checkBasicActionArgs({ url, savePath });

  const page = await getChromePage({ url, userAgent, viewport, pageFunction });

  const finalPdfOptions = {
    path: savePath,
    ...pdfOptions,
  };

  await page.pdf(finalPdfOptions);
  await page.close();
};
