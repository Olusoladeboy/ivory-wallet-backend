import { Request } from "express";
import { UserInterface } from "../components/user/user.types";

export interface IRequest extends Request {
    user: UserInterface
}