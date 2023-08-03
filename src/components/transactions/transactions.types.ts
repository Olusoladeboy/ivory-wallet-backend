import { UserEnitity } from "../user/user.entity";

export interface TransactionsInterface {
    id?: number;
    userId: number;
    userToId: number;
    amount: number;
    bank: string;
    accountNumber: string;
    reference: string;
    type: string;
    status: string;
}