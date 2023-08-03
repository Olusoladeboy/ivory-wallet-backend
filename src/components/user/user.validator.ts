import Joi from "joi";
import { UserInterface } from "./user.types";

export const validateRegistration = Joi.object<UserInterface>({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().trim().required(),
    invitedById: Joi.number().required(),
});

export const validateLogin = Joi.object<UserInterface>({
    email: Joi.string().email().trim().required(),
    password: Joi.string().trim().required(),
});