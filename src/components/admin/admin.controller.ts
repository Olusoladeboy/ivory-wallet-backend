import aqp from 'api-query-params';
import bcryptjs from 'bcryptjs';
import { Application, NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { hash } from '../../lib/helper';
import * as responsehandler from '../../lib/response-handler';
import BaseApi from '../BaseApi';
import { AdminInterface } from './admin.types';
import { AppDataSource } from '../../data-source';
import { AdminEntity } from './admin.entity';
import { validateInvite, validateRegistration } from './admin.validator';
import Environment from '../../environments/environment';
import { IRequest } from '../../lib/interface';
import { validateLogin } from '../user/user.validator';
import { UserEnitity } from '../user/user.entity';
import mailerService from '../../lib/mailer';
import { verifyAdmin } from '../../middleware/authorization.middleware';

const env: Environment = new Environment();

const adminRepository = AppDataSource.getRepository(AdminEntity)

const userRepository = AppDataSource.getRepository(UserEnitity)


const jwtdata = {
    jwtSecret: env.jwt_secret,
    tokenExpireTime: 70000,
};
/**
 * Status controller
 */
export default class AdminController extends BaseApi {
    jwtdata

    constructor(express: Application) {
        super();
        this.register(express);
    }

    public register(express: Application): void {
        express.use('/api/admin', this.router);
        this.router.get('/', [verifyAdmin], this.getAllAdmin);
        this.router.post('/invite', [verifyAdmin], this.adminInvite);
        this.router.post('/register', this.adminSignup);
        this.router.post('/login', this.adminLogin);
    }


    async getAdminService(query: any): Promise<any> {
        try {
            const { filter: where, skip, sort: order, limit: take } = aqp(query);
            const admins = await adminRepository.find({
                where,
                skip,
                take,
                order,
            });
            return {
                sort: order,
                skip,
                limit: take,
                total: adminRepository.count(where),
                data: admins,

            }
        } catch (error) {
            throw new Error(error)
        }
    }

    public async getAllAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // const result = await this.getAdminService(req.query);
            const { filter: where, skip, sort: order, limit: take } = aqp(req.query);
            const admins = await adminRepository.find({
                where,
                skip,
                take,
                order,
            });
            const result = {
                sort: order || null,
                skip: skip || null,
                limit: take || 0,
                total: await adminRepository.count({ where }),
                data: admins,
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

    public async adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: AdminInterface = req.body;
            const { error } = validateLogin.validate(data);
            if (error) throw new Error(error.message);
            const { email, password } = data;
            const admin = await adminRepository.findOne({ where: { email }, select: ['password'] });
            if (!admin) throw new Error('Admin not found');

            const isPasswordCorrect = await admin.comparePassword(password);
            if (!isPasswordCorrect) throw new Error('Password Incorrect')
            const payload = {
                id: admin.id,
                email,
                time: new Date(),
            };
            const token = jwt.sign(payload, jwtdata.jwtSecret, {
                expiresIn: jwtdata.tokenExpireTime,
            });
            delete admin.password;
            const result = {
                success: true,
                payload: {
                    admin,
                    token
                }
            };
            res.locals.data = result;
            responsehandler.json(res);
        } catch (error) {
            next(error);
        }
    }

    public async adminInvite(req: IRequest, res: Response, next: NextFunction): Promise<void> {
        try {

            const admin = req.user;

            const data = req.body;
            const { error } = validateInvite.validate(data);
            if (error) throw new Error(error.message)

            const { email, type } = data;

            let url;

            if (type === 'admin') {
                const adminExists = await adminRepository.findOne({ where: { email } })
                if (adminExists) throw new Error('Admin already registered')
                const signUptoken = jwt.sign({
                    id: admin.id,
                    email: admin.email,
                    invitatedEmail: email,
                    direction: 1000 // 1000 is for admin
                }, jwtdata.jwtSecret, {
                    expiresIn: jwtdata.tokenExpireTime,
                });
                // send mail to invitee with a link to register
                url = `${env.adminUrl}/signup?token=${signUptoken}`;
            } else {
                const userExists = await userRepository.findOne({ where: { email } })
                if (userExists) throw new Error('User already registered')
                const signUptoken = jwt.sign({
                    id: admin.id,
                    email: admin.email,
                    invitatedEmail: email,
                    direction: 1 // 1 is for user
                }, jwtdata.jwtSecret, {
                    expiresIn: jwtdata.tokenExpireTime,
                });
                // send mail to invitee with a link to register
                url = `${env.clientUrl}/signup?token=${signUptoken}`;
            }

            // Send Email
            await mailerService({
                email: email,
                template: 4997221,
                name: 'User',
                variables: {
                    invite_link: url,
                },
            })

            res.locals.data = {
                success: true,
                message: 'Invite Sent Successfully'
            };
            responsehandler.send(res);
        } catch (error) {
            next(error);
        }
    }

    public async adminSignup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token } = req.query;
            if (!token) throw new Error('Not Authorized, Kindly use the signup link from your invitation');

            const { id, email, invitatedEmail, direction } = jwt.verify(token, env.jwt_secret)
            if (!email) throw new Error('Invalid token')
            if (!direction || direction !== 1000) throw new Error('Invalid Token')

            const validInvite = await adminRepository.findOne({ where: { email, id } });
            if (!validInvite) throw new Error('Invalid token')

            const data: AdminInterface = req.body;
            data.invitedById = id;
            const { error } = validateRegistration.validate(data);

            if (error) throw new Error(error.message);
            if (data.password) {
                data.password = hash(data.password);
            }

            if (invitatedEmail !== data.email) throw new Error("This token is invalid")

            const result = await adminRepository.save(data);
            if (!result) throw new Error('Cannot create admin');
            res.locals.data = {
                success: true,
                message: 'Admin Created Successfully'
            };
            responsehandler.send(res);
        } catch (error) {
            next(error);
        }
    }

}
