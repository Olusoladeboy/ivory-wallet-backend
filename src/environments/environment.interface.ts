interface IEnvironment {
    port: number;
    secretKey: string;
    jwt_secret: string;
    postgres_host: string;
    postgres_port: number,
    postgres_username: string;
    postgres_password: string;
    postgres_database: string;
    applyEncryption: boolean;
    adminUrl: string;
    clientUrl: string;
    mj_secret: string;
    mj_private: string;
    getCurrentEnvironment(): string;
    setEnvironment(env: string): void;
    isProductionEnvironment(): boolean;
    isDevEnvironment(): boolean;
    isTestEnvironment(): boolean;
    isStagingEnvironment(): boolean;
}

export default IEnvironment;
