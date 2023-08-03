import "reflect-metadata"
import { DataSource } from "typeorm"
import { UserEnitity } from "./components/user/user.entity";
import Environment from "./environments/environment";
import { AdminEntity } from "./components/admin/admin.entity";
import { WalletEntity } from "./components/wallet/wallet.entity";
import { TransactionsEntity } from "./components/transactions/transactions.entity";
// import { User } from "./entity/User"

const env: Environment = new Environment();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.postgres_host,
    port: env.postgres_port,
    username: env.postgres_username,
    password: env.postgres_password,
    database: env.postgres_database,
    synchronize: true,
    logging: false,
    entities: [UserEnitity, AdminEntity, WalletEntity, TransactionsEntity],
    migrations: [],
    subscribers: [],
})
