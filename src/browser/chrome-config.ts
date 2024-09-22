import { getChromelaunchArgs } from '../constants';
import { invariant } from '../utils';

interface ChromeConfig {
  executablePath: string;
  headless?: boolean;
  launchArgs?: string[];
}

/** singleton */
let finalConfig: ChromeConfig;

const DEFAULT_CONFIG: ChromeConfig = {
  executablePath: '',
  headless: true,
  launchArgs: getChromelaunchArgs(),
};

export const configureChromeConfig = ({
  executablePath,
  headless = true,
  launchArgs = getChromelaunchArgs(),
} = DEFAULT_CONFIG) => {
  /**  A browser location that actually works  */
  invariant(!executablePath, 'executablePath of chrome cannot be empty');

  finalConfig = {
    executablePath,
    headless,
    launchArgs,
  };
  Object.freeze(finalConfig);
};

export const getChromeConfig = () => finalConfig;
