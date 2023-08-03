import aqp from 'api-query-params';
import { Application, NextFunction, Request, Response } from 'express';
import * as responsehandler from '../../lib/response-handler';
import BaseApi from '../BaseApi';
import { TransactionsInterface } from './transactions.types';
import { AppDataSource } from '../../data-source';
import { TransactionsEntity } from './transactions.entity';
import { validateDeposit } from './transactions.validator';
import Environment from '../../environments/environment';
import { verifyAdmin, verifyUser } from '../../middleware/authorization.middleware';
import { IRequest } from '../../lib/interface';
import { v4 as uuidv4 } from 'uuid';
import { WalletEntity } from '../wallet/wallet.entity';

const env: Environment = new Environment();

const transactionsRepository = AppDataSource.getRepository(TransactionsEntity)
const walletRepository = AppDataSource.getRepository(WalletEntity)


/**
 * Transactions controller
 */
export default class TransactionsController extends BaseApi {
    jwtdata

    constructor(express: Application) {
        super();
        this.register(express);
    }

    public register(express: Application): void {
        express.use('/api/transactions', this.router);
        this.router.get('/', [verifyAdmin], this.getAllTransactions);
        this.router.get('/me', [verifyUser], this.getMeTransactions);
        this.router.post('/deposit', [verifyUser], this.deposit);
    }

    public async getAllTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { filter: where, skip, sort: order, limit: take } = aqp(req.query);
            const transactionss = await transactionsRepository.find({
                where,
                skip,
                take,
                order,
            });
            const result = {
                sort: order || null,
                skip: skip || null,
                limit: take || 0,
                total: await transactionsRepository.count({ where }),
                data: transactionss,
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

    public async getMeTransactions(req: IRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // const result = await this.getTransactionsService(req.query);
            const { id } = req.user;
            const transactions = await transactionsRepository.find({
                where: {
                    userId: id
                },
            });

            res.locals.data = {
                success: true,
                message: 'Successful',
                payload: transactions
            };
            responsehandler.json(res);
        } catch (error) {
            next(error);
        }
    }

    public async deposit(req: IRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user;

            const data = req.body;
            const { error } = validateDeposit.validate(data);
            if (error) throw new Error(error.message);

            const { amount } = data;

            const wallet = await walletRepository.findOne({ where: { userId: user.id } });

            await walletRepository.update(wallet.id, { balance: () => `balance + ${amount}` })

            data.reference = uuidv4()
            data.status = 'successful'
            data.type = 'deposit'
            data.userId = user.id

            const result = await transactionsRepository.save(data);
            if (!result) throw new Error('Cannot create transactions');
            res.locals.data = {
                success: true,
                message: 'Transactions Created Successfully',
                payload: result
            };
            responsehandler.send(res);
        } catch (error) {
            next(error);
        }
    }

}
