import * as util from 'util';
import * as express from 'express';
import jwt from 'jsonwebtoken';

import logger from '../lib/logger';
import Environment from '../environments/environment';
import { IRequest } from '../lib/interface';
import { AdminEntity } from '../components/admin/admin.entity';
import { AppDataSource } from '../data-source';
import { UserEnitity } from '../components/user/user.entity';

const env: Environment = new Environment();

export const verifyUser = async (
    req: IRequest,
    res: express.Response,
    next: express.NextFunction,
): Promise<void> => {

    try {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) throw new Error('No Auth Token Found')

        const { email } = jwt.verify(token, env.jwt_secret);

        const user = await getUser('user', email);

        req.user = user;

        next();

    } catch (error) {
        next(error);

    }

};


export const verifyAdmin = async (
    req: IRequest,
    res: express.Response,
    next: express.NextFunction,
): Promise<void> => {

    try {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) throw new Error('No Auth Token Found')

        const { email } = jwt.verify(token, env.jwt_secret);

        const user = await getUser('admin', email);

        req.user = user;

        next();

    } catch (error) {
        next(error);

    }

};

const getUser = async (role: 'admin' | 'user', email: string) => {
    if (role === 'admin') {
        const admin = await AppDataSource.getRepository(AdminEntity).findOne({ where: { email } })
        if (!admin) throw new Error('Admin Not Found')
        return admin;
    }
    const user = await AppDataSource.getRepository(UserEnitity).findOne({ where: { email } })
    if (!user) throw new Error('User Not Found')
    return user;
}
