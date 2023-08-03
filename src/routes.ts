import * as express from 'express';
import UserController from './components/user/user.controller';
import AdminController from './components/admin/admin.controller';
import WalletController from './components/wallet/wallet.controller';
import TransactionsController from './components/transactions/transactions.controller';

export default function registerRoutes(app: express.Application): void {
    // new SystemStatusController(app);
    new UserController(app);
    new AdminController(app);
    new WalletController(app);
    new TransactionsController(app);
}
