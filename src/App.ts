import http from 'http';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import addErrorHandler from './middleware/error-handler';
import registerRoutes from './routes';

export default class App {
    public express: express.Application;

    public httpServer: http.Server;

    corsOptions = { origin: "*", optionsSuccessStatus: 200 };


    public async init(): Promise<void> {
        this.express = express();
        this.httpServer = http.createServer(this.express);
        this.middleware();
        this.routes();
        this.addErrorHandler();
    }

    /**
     * here register your all routes
     */
    private routes(): void {
        this.express.get('/', this.basePathRoute);
        this.express.get('/web', this.parseRequestHeader, this.basePathRoute);
        registerRoutes(this.express);
    }

    /**
     * here you can apply your middlewares
     */
    private middleware(): void {
        // support application/json type post data
        // support application/x-www-form-urlencoded post data
        // Helmet can help protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately.

        this.express.use(helmet({
            crossOriginResourcePolicy: false,
            crossOriginEmbedderPolicy: false,
            contentSecurityPolicy: false
        }));
        this.express.use(express.json({ limit: '100mb' }));
        this.express.use(express.urlencoded({ limit: '100mb', extended: true }));
        this.express.use(cors(this.corsOptions));
        this.express.use(helmet.frameguard({ action: "deny" }));
        this.express.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
        this.express.use(helmet.xssFilter());
        this.express.use(helmet.dnsPrefetchControl());
        this.express.use(helmet.noSniff());

    }

    private parseRequestHeader(req: express.Request, res: express.Response, next: Function): void {
        console.log(req.headers.access_token);
        next();
    }

    private basePathRoute(request: express.Request, response: express.Response): void {
        response.json({ message: 'API Base Path' });
    }

    private addErrorHandler(): void {
        this.express.use(addErrorHandler);
    }
}
