import { getBrowserlaunchArgs } from '../constants';
import { invariant } from '../utils';

interface BrowserConfig {
  executablePath: string;
  headless?: boolean;
  launchArgs?: string[];
}

/** singleton */
let finalConfig: BrowserConfig;

const DEFAULT_CONFIG: BrowserConfig = {
  executablePath: '',
  headless: true,
  launchArgs: getBrowserlaunchArgs(),
};

export const configureBrowserConfig = ({
  executablePath,
  headless = true,
  launchArgs = getBrowserlaunchArgs(),
} = DEFAULT_CONFIG) => {
  /**  A browser location that actually works  */
  invariant(
    typeof executablePath !== 'string' || !executablePath,
    'executablePath of chrome cannot be empty',
  );

  finalConfig = {
    executablePath,
    headless,
    launchArgs,
  };
  Object.freeze(finalConfig);
};

export const getBrowserConfig = () => finalConfig;
