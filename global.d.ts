/* eslint-disable vars-on-top */
import Environment from './src/environments/environment';

declare global {
    // eslint-disable-next-line no-var
    var environment: Environment;
}