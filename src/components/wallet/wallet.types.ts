import { UserEnitity } from "../user/user.entity";

export interface WalletInterface {
    id?: number;
    user: UserEnitity;
    balance: number;
}