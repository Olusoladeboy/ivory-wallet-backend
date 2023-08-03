import aqp from 'api-query-params';
import bcryptjs from 'bcryptjs';
import { Application, NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { hash } from '../../lib/helper';
import * as responsehandler from '../../lib/response-handler';
import BaseApi from '../BaseApi';
import { UserInterface } from './user.types';
import { AppDataSource } from '../../data-source';
import { UserEnitity } from './user.entity';
import { validateLogin, validateRegistration } from './user.validator';
import Environment from '../../environments/environment';
import { verifyAdmin, verifyUser } from '../../middleware/authorization.middleware';
import { IRequest } from '../../lib/interface';
import { WalletEntity } from '../wallet/wallet.entity';
import { AdminEntity } from '../admin/admin.entity';

const env: Environment = new Environment();

const userRepository = AppDataSource.getRepository(UserEnitity)
const walletRepository = AppDataSource.getRepository(WalletEntity)
const adminRepository = AppDataSource.getRepository(AdminEntity)


const jwtdata = {
    jwtSecret: env.jwt_secret,
    tokenExpireTime: 70000,
};
/**
 * Status controller
 */
export default class UserController extends BaseApi {
    jwtdata

    constructor(express: Application) {
        super();
        this.register(express);
    }

    public register(express: Application): void {
        express.use('/api/user', this.router);
        this.router.get('/', [verifyAdmin], this.getAllUser);
        this.router.get('/me', [verifyUser], this.getMeUser);
        this.router.post('/register', this.userSignup);
        this.router.post('/login', this.userLogin);
    }


    async getUserService(query: any): Promise<any> {
        try {
            const { filter: where, skip, sort: order, limit: take } = aqp(query);
            const users = await userRepository.find({
                where,
                skip,
                take,
                order,
            });
            return {
                sort: order,
                skip,
                limit: take,
                total: userRepository.count(where),
                data: users,

            }
        } catch (error) {
            throw new Error(error)
        }
    }

    public async getAllUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // const result = await this.getUserService(req.query);
            const { filter: where, skip, sort: order, limit: take } = aqp(req.query);
            const users = await userRepository.find({
                where,
                skip,
                take,
                order,
            });
            const result = {
                sort: order || null,
                skip: skip || null,
                limit: take || 0,
                total: await userRepository.count({ where }),
                data: users,
            }
            res.locals.data = {
                success: true,
                message: 'Successful',
                payload: result
            };
            responsehandler.json(res);
        } catch (error) {
            next(error);
        }
    }

    public async getMeUser(req: IRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // const result = await this.getUserService(req.query);
            const { email } = req.user;
            const user = await userRepository.find({
                where: {
                    email
                },
            });

            res.locals.data = {
                success: true,
                message: 'Successful',
                payload: user
            };
            responsehandler.json(res);
        } catch (error) {
            next(error);
        }
    }

    public async userLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: UserInterface = req.body;
            const { error } = validateLogin.validate(data);
            if (error) throw new Error(error.message);
            const { email, password } = data;
            const user = await userRepository.findOne({ where: { email }, select: ['password'] });
            if (!user) throw new Error('User not found');

            const isPasswordCorrect = await user.comparePassword(password);
            if (!isPasswordCorrect) throw new Error('Password Incorrect')
            const payload = {
                id: user.id,
                email,
                time: new Date(),
            };
            const token = jwt.sign(payload, jwtdata.jwtSecret, {
                expiresIn: jwtdata.tokenExpireTime,
            });
            delete user.password;
            const result = {
                success: true,
                payload: {
                    user,
                    token
                }
            };
            res.locals.data = result;
            responsehandler.json(res);
        } catch (error) {
            next(error);
        }
    }

    public async userSignup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token } = req.query;
            if (!token) throw new Error('Not Authorized, Kindly use the signup link from your invitation');

            const { id, email, invitatedEmail, direction } = jwt.verify(token, env.jwt_secret)
            if (!email) throw new Error('Invalid token')
            if (!direction || direction !== 1) throw new Error('Invalid Token')


            const validInvite = await adminRepository.findOne({ where: { email, id } });
            if (!validInvite) throw new Error('Invalid token')

            const data: UserInterface = req.body;
            data.invitedById = id;

            const { error } = validateRegistration.validate(data);
            if (error) throw new Error(error.message);
            if (data.password) {
                data.password = hash(data.password);
            }

            if (invitatedEmail !== data.email) throw new Error("This token is invalid")

            const result = await userRepository.save(data);
            if (!result) throw new Error('Cannot create user');

            // Create new wallet

            await walletRepository.save({
                userId: result.id,
                balance: 0
            })

            res.locals.data = {
                success: true,
                message: 'User Created Successfully'
            };
            responsehandler.send(res);
        } catch (error) {
            next(error);
        }
    }

}
