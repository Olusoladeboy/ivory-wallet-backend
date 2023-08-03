import * as fs from 'fs';
import * as path from 'path';
import { config as configDotenv } from 'dotenv';

import { EnvironmentFile, Environments } from './environment.constant';
import IEnvironment from './environment.interface';

class Environment implements IEnvironment {

  public port: number;

  public mongoUri: string;

  public secretKey: string;

  public jwt_secret: string;

  public applyEncryption: boolean;

  public postgres_port: number;

  public postgres_host: string;

  public postgres_username: string;

  public postgres_password: string;

  public postgres_database: string;

  public adminUrl: string;

  public clientUrl: string;

  public mj_secret: string;
  public mj_private: string;

  constructor(NODE_ENV?: string) {
    const env: string = NODE_ENV || process.env.NODE_ENV || Environments.DEV;
    const port: string | undefined | number = process.env.PORT || 3000;
    this.setEnvironment(env);
    this.port = Number(port);
    this.mongoUri = process.env.mongoUri;
    this.applyEncryption = JSON.parse(process.env.APPLY_ENCRYPTION);
    this.secretKey = process.env.SECRET_KEY;

    this.jwt_secret = process.env.JWT_SECRET;

    this.postgres_port = Number(process.env.POSTGRES_)

    this.postgres_host = process.env.POSTGRES_URI

    this.postgres_username = process.env.POSTGRES_USER

    this.postgres_password = process.env.POSTGRES_PASSWORD

    this.postgres_database = process.env.POSTGRES_DB

    this.clientUrl = process.env.CLIENT_URL

    this.adminUrl = process.env.ADMIN_URL

    this.mj_secret = process.env.MJ_SECRETKEY;
    this.mj_private = process.env.MJ_APIKEY;
  }

  public getCurrentEnvironment(): string {
    let environment: string = process.env.NODE_ENV || Environments.DEV;

    if (!environment) {
      environment = Environments.LOCAL;
    }
    switch (environment) {
      case Environments.PRODUCTION:
        return Environments.PRODUCTION;
      case Environments.DEV:
      case Environments.TEST:
      case Environments.QA:
        return Environments.TEST;
      case Environments.STAGING:
        return Environments.STAGING;
      case Environments.LOCAL:
      default:
        return Environments.LOCAL;
    }
  }

  public setEnvironment(env: string): void {
    let envPath: string;
    const rootdir: string = path.resolve(__dirname, '../../');
    if (this.getCurrentEnvironment() !== Environments.PRODUCTION) {
      switch (env) {
        case Environments.PRODUCTION:
          envPath = path.resolve(rootdir, EnvironmentFile.PRODUCTION);
          break;
        case Environments.TEST:
          envPath = path.resolve(rootdir, EnvironmentFile.TEST);
          break;
        case Environments.STAGING:
          envPath = path.resolve(rootdir, EnvironmentFile.STAGING);
          break;
        case Environments.LOCAL:
          envPath = path.resolve(rootdir, EnvironmentFile.LOCAL);
          break;
        default:
          envPath = path.resolve(rootdir, EnvironmentFile.LOCAL);
      }
      if (!fs.existsSync(envPath)) {
        throw new Error('.env file is missing in root directory');
      }
      configDotenv({ path: envPath });
    } else {
      configDotenv();
    }

  }

  public isProductionEnvironment(): boolean {
    return this.getCurrentEnvironment() === Environments.PRODUCTION;
  }

  public isDevEnvironment(): boolean {
    return this.getCurrentEnvironment() === Environments.DEV || this.getCurrentEnvironment() === Environments.LOCAL;
  }

  public isTestEnvironment(): boolean {
    return this.getCurrentEnvironment() === Environments.TEST;
  }

  public isStagingEnvironment(): boolean {
    return this.getCurrentEnvironment() === Environments.STAGING;
  }

}

export default Environment;
