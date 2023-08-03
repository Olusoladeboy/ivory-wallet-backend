import Joi from "joi";
import { AdminInterface } from "./admin.types";

export const validateRegistration = Joi.object<AdminInterface>({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().trim().required(),
    invitedById: Joi.number().required(),
});

export const validateInvite = Joi.object<AdminInterface | any>({
    email: Joi.string().email().trim().required(),
    type: Joi.string().trim().valid(...['admin', 'user']).required(),
});