import Joi from "joi";
import { TransactionsInterface } from "./transactions.types";

export const validateDeposit = Joi.object<TransactionsInterface>({
    amount: Joi.number().positive().required()
});