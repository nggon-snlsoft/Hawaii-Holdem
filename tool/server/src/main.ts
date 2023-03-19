import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import AdminController from "./controllers/AdminController";
import {sqlProxy} from "./module/sqlProxy";

const devDBInfo: any = {
    "host": "127.0.0.1",
    "port": "3306",
    "database": "holdem",
    "user": "root",
    "pw": "root"
};

export enum ENUM_RESULT_CODE {
    UNKNOWN_FAIL = -1,
    SUCCESS = 0,
    EXPIRED_SESSION = 1,
}

export class HoldemAdminServer {
    public app: express.Application;
    private adminController: AdminController = null;
    readonly sqlClient: sqlProxy = null;

    constructor() {
        this.app = express();
        this.sqlClient = new sqlProxy(devDBInfo);

        this.initMiddleWares();
        this.adminController = new AdminController(this.sqlClient);
        this.adminController.init();

        this.initRoutes();
    }

    private initRoutes() {
        console.log('INIT_ROUTES');

        this.app.use('/admin', this.adminController.router);
        this.app.get('/', (req, res)=>{
            res.send('It could not be a better day to die');
        });
    }

    private initMiddleWares() {
        console.log('INIT_MIDDLE_WARES');
        this.app.use ( cors() );
        this.app.use ( bodyParser.json() );
        this.app.use ( bodyParser.urlencoded( {
            extended: true,
        }));
    }

    public listen( port: number ) {
        this.app.listen( port, ()=>{
            console.log(`ADMIN-SERVER is running on ${ port }`);
        });
    }
}