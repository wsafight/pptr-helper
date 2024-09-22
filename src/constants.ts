export const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

export const getChromelaunchArgs = () => [
  // After turning it on, the headless browser cannot be used
  '--disable-gpu',
  // freeze when newPage
  '--single-process',
];

export const getDefaultViewport = () => ({ width: 1024, height: 1600 });
