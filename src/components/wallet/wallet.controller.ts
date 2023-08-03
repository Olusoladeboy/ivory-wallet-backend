import aqp from 'api-query-params';
import { Application, NextFunction, Request, Response } from 'express';
import * as responsehandler from '../../lib/response-handler';
import BaseApi from '../BaseApi';
import { WalletInterface } from './wallet.types';
import { AppDataSource } from '../../data-source';
import { WalletEntity } from './wallet.entity';
import { validateCreate } from './wallet.validator';
import Environment from '../../environments/environment';
import { verifyAdmin, verifyUser } from '../../middleware/authorization.middleware';
import { IRequest } from '../../lib/interface';

const env: Environment = new Environment();

const walletRepository = AppDataSource.getRepository(WalletEntity)


/**
 * Wallet controller
 */
export default class WalletController extends BaseApi {
    jwtdata

    constructor(express: Application) {
        super();
        this.register(express);
    }

    public register(express: Application): void {
        express.use('/api/wallet', this.router);
        this.router.get('/', [verifyAdmin], this.getAllWallet);
        this.router.get('/me', [verifyUser], this.getMeWallet);
    }

    public async getAllWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { filter: where, skip, sort: order, limit: take } = aqp(req.query);
            const wallets = await walletRepository.find({
                where,
                skip,
                take,
                order,
            });
            const result = {
                sort: order || null,
                skip: skip || null,
                limit: take || 0,
                total: await walletRepository.count({ where }),
                data: wallets,
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

    public async getMeWallet(req: IRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // const result = await this.getWalletService(req.query);
            const { id } = req.user;
            const wallet = await walletRepository.find({
                where: {
                    userId: id
                },
            });

            res.locals.data = {
                success: true,
                message: 'Successful',
                payload: wallet
            };
            responsehandler.json(res);
        } catch (error) {
            next(error);
        }
    }

    public async createWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data: WalletInterface = req.body;
            const { error } = validateCreate.validate(data);
            if (error) throw new Error(error.message);
            const result = await walletRepository.save(data);
            if (!result) throw new Error('Cannot create wallet');
            res.locals.data = {
                success: true,
                message: 'Wallet Created Successfully'
            };
            responsehandler.send(res);
        } catch (error) {
            next(error);
        }
    }

}
