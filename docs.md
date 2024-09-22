# 开发文档（未完成）

Puppeteer 是一个 JavaScript 库，中文翻译为“木偶师”。

它提供了一个高级 API，用于通过 [DevTools 协议](https://chromedevtools.github.io/devtools-protocol/) 或 [WebDriver BiDi](https://pptr.dev/webdriver-bidi) 控制 Chrome 或 Firefox 浏览器。

如下是 puppeteer 代码：

```ts
import puppeteer from 'puppeteer';

// 启动浏览器并打开一个新的空白页面
const browser = await puppeteer.launch();
const page = await browser.newPage();

// 跳转 https://developer.chrome.com
// 因为跳转方法是一个异步方法，所以需要 await 等待跳转完成
await page.goto('https://developer.chrome.com/');

// 设置屏幕视口大小
await page.setViewport({width: 1080, height: 1024});

// locator 意味定位器，描述了一种定位对象并对其执行操作的策略。

// 定位查询框并输入 automate beyond recorder
await page.locator('.devsite-search-field').fill('automate beyond recorder');

// 定位 link 然后点击按钮
await page.locator('.devsite-result-item-link').click();

// 定位该文字并获取对应的句柄（分为 DOM 元素或者 js 对象引用）
const textSelector = await page
  .locator('text/Customize and automate')
  .waitHandle();

// ? 会查询前面的 DOM 句柄是否存在，如果存在获取 textContent, 不存在直接返回 null
const fullTitle = await textSelector?.evaluate(el => el.textContent);

// Print the full title.
console.log('The title of this blog post is "%s".', fullTitle);

// 关闭浏览器
await browser.close();
```

puppeteer 可以操作浏览器，所以我们可以借助 puppeteer 来进行各种操作。
包括但是不限于如下操作：

- 对页面和元素截图
- 网页生成 PDF
- 爬取 SPA（Single-Page Application）网站的内容并为 SSR（Server-Side Rendering）网站生成 pre-render 的内容
- UI 自动化测试、自动填充/提交表单、模拟 UI 输入
- 性能测试，生成 timeline trace 用于定位网站性能问题
- 测试浏览器插件


puppeteer 在安装过程中下载兼容的 Chrome，这样会导致 node_modules 非常大。于是 puppeteer 开发者提供了 puppeteer-core 工具包可以配置并操作本地的 Chrome 浏览器。

```ts
import { access } from 'node:fs/promises';
// 此处用的是 puppeteer-core， 需要配置本地的 Chrome 浏览器
import { launch, Browser } from 'puppeteer-core';
import { getChromeConfig } from './chrome-config';

/** 单例 */
let finalBrowser: Browser;

export const getBrowser = async (): Promise<Browser> => {
  // 如果当前实例已经创建，直接返回
  if (finalBrowser) {
    return finalBrowser;
  }

  const { executablePath, headless, launchArgs } = getChromeConfig();

  try {
    // 检查文件是否存在，不存在直接报错
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
    // 启动时候根据配置信息启动
    const browser = await launch(launchOptions);
    const browserVersion = await browser.version();
    console.log(`browser launched. version=${browserVersion}`);

    finalBrowser = browser;
    // 返回该浏览器句柄
    return finalBrowser;
  } catch (err: any) {
    // 启动不了直接报错
    throw new Error(
      `failed to load chrome [ ${executablePath} ]. error=${err?.message}`,
    );
  }
};
```

这里是配置启动浏览器的配置项。

```ts
import { getChromelaunchArgs } from '../constants';
import { invariant } from '../utils';

// 浏览器
interface ChromeConfig {
  // 浏览器执行路径
  executablePath: string;
  // 是否无头，若为 false，则会弹出浏览器并自行操作
  headless?: boolean;
  // 启动参数
  launchArgs?: string[];
}

/** 配置也是单例 */
let finalConfig: ChromeConfig;

/// 默认配置
const DEFAULT_CONFIG: ChromeConfig = {
  executablePath: '',
  headless: true,
  launchArgs: getChromelaunchArgs(),
};

// 设置配置项
export const configureChromeConfig = ({
  executablePath,
  headless = true,
  launchArgs = getChromelaunchArgs(),
} = DEFAULT_CONFIG) => {
  // 如果浏览器路径不是字符串或者是空字符串，直接抛出错误
  invariant(
    typeof executablePath !== 'string' || !executablePath,
    'executablePath of chrome cannot be empty',
  );

  finalConfig = {
    executablePath,
    headless,
    launchArgs,
  };
  // 冻结配置项。不让其在其他地方修改，修改直接报错
  Object.freeze(finalConfig);
};

// 获取配置项
export const getChromeConfig = () => finalConfig;
```

在设置好浏览器配置后。我们就可以处理页面逻辑了，我们这里提取一个公共方法

```ts
import { type Page } from 'puppeteer-core';
import { invariant } from '@/utils';
import { getBrowser } from '@/browser/get-browser';
import { DEFAULT_USER_AGENT, getDefaultViewport } from '@/constants';

export interface BasicActionArgs {
  // 跳转的网页
  url: string;
  // 保存的本地路径，如果需要生成 pdf 或者图片
  savePath: string;
  // 用户代理。如果没有该配置，许多网页会不支持浏览
  userAgent?: string;
  // 回调函数，把 page 抛出来让开发者操作
  pageFunction?: (page: Page) => Promise<void>;
  // 页面视口
  viewport?: {
    width: number;
    height: number;
  };
}

// 检查操作
export const checkBasicActionArgs = ({ url, savePath }: BasicActionArgs) => {
  // 不是字符串，且没有 url 直接报错
  invariant(
    typeof url !== 'string' || !url,
    'url must be a string and cannot be empty',
  );
  // 不是字符串，且没有 savePath 直接报错
  invariant(
    typeof savePath !== 'string' || !savePath,
    'savePath must be a string and cannot be empty',
  );
};

export const getChromePage = async ({
  url,
  userAgent,
  viewport,
  pageFunction,
}: Omit<BasicActionArgs, 'savePath'>): Promise<Page> => {
  // 获取上述的单例浏览器
  const browser = await getBrowser();
  // 生成页面
  const page = await browser.newPage();

  // 设置用户代理
  await page.setUserAgent(userAgent || DEFAULT_USER_AGENT);
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const { width, height } = { ...getDefaultViewport(), ...viewport };
  await page.setViewport({ width, height });

  if (pageFunction) {
    // 回调，在配置项中操作 page
    await pageFunction(page);
  }
  // 返回 page
  return page;
};
```

以下就是页面生成图片的代码

```ts
import { type ScreenshotOptions } from 'puppeteer-core';
import { BasicActionArgs, checkBasicActionArgs, getChromePage } from '@/basic';

export interface ExportToImageArgs extends BasicActionArgs {
  // 图片类型
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
  // 检查 url 和 savePath
  checkBasicActionArgs({ url, savePath });

  // 获取浏览器页面
  const page = await getChromePage({ url, userAgent, viewport, pageFunction });

  const imgOptions = {
    type,
    path: savePath,
    // 全局页面
    fullPage: true,
    // 其他配置
    ...screenshotOptions,
  };

  // 生成图片
  await page.screenshot(imgOptions);
  // 关闭页面
  await page.close();
};
```

最终我们如此使用：

```ts
import { join } from 'path';
import { access, mkdir } from 'node:fs/promises';
import { configureChromeConfig } from './config/chrome.mjs';
import { exportToImage } from './exportToImage.mjs';
import { getChildrenPath } from './getChildrenPath.mjs';
import { sleep } from './utils';

configureChromeConfig({
  // 执行路径
  executablePath:
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  // 设置无头浏览器
  headless: true,
});

const mainPath = '/xxxxx/puppeteer-demo/dist';

// 页面 url
const defaultUrl = 'https://xxx';

const dirSet = new Set();

// 异步函数
const main = async () => {
  // 根据主路径获取子路径
  const childrenPath = await getChildrenPath({
    url: defaultUrl,
  });

  const docCount = childrenPath.length;

  for (let i = 0; i < docCount; i++) {
    // 在获取一次子路径（此处要根据业务逻辑来,此处要生成多个文件夹）
    let subPath = await getChildrenPath({
      url: childrenPath[i],
    });

    subPath = subPath.map(item => item.trim()).filter(Boolean);

    for (let j = 0; j < subPath.length; j++) {
      const finalPath = subPath[j].slice(defaultUrl.length + 1);
      const [main, second] = finalPath.split('/');

      // 生成当前文件夹
      const currentPath = decodeURIComponent(join(mainPath, main));

      // 没有文件夹
      if (!dirSet.has(currentPath)) {
        try {
          // 查看是否存在
          await access(currentPath);
        } catch (e) {
          // 不存在创建文件夹并放入 dirSet
          await mkdir(currentPath);
          dirSet.add(currentPath);
        }
      }

      // 生成文件夹下的文件（一个网页对应一个文件）
      const secondFile = `${decodeURIComponent(second)
        .split('.')[0]
        .trim()}.png`;

      // 把文件夹和文件合并起来设置为保存路径
      const savePath = join(currentPath, secondFile);
      console.log(`第${i + 1}, ${j + 1}, ${savePath}`);
      await exportToImage({
        url: subPath[j],
        savePath,
      });

      // 休息 5s，避免限流
      await sleep(5000);
    }
  }
};

// 执行文件
main();
```

大家可以自行学习 [Puppeteer 文档](https://pptr.dev/)
