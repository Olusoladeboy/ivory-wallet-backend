import Joi from "joi";
import { WalletInterface } from "./wallet.types";

export const validateCreate = Joi.object<WalletInterface>({
    user: Joi.number().required(),
    balance: Joi.number().required(),
});