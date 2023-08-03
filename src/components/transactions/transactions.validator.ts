import Joi from "joi";
import { TransactionsInterface } from "./transactions.types";

export const validateDeposit = Joi.object<TransactionsInterface>({
    amount: Joi.number().positive().required()
});

export const validateTransfer = Joi.object<TransactionsInterface | any>({
    amount: Joi.number().positive().required(),
    email: Joi.string().email().required(),
});

export const validateWithdrawal = Joi.object<TransactionsInterface | any>({
    amount: Joi.number().positive().required(),
    bank: Joi.string().trim().required(),
    accountNumber: Joi.string().trim().required(),
});