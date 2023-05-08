import express, { Response, Request, NextFunction } from 'express';
import bodyParser from 'body-parser';
// import passport from 'passport';
import session from 'express-session';
import { sqlProxy } from './modules/sqlProxy';
import dao from './modules/dao';
import exitHook from './modules/hookExit';

import * as fs from 'fs';
import * as path from 'path';

const cors = require('cors');

import UserController from './controllers/UserController';
import TableController from './controllers/TableController';
import StoreController from './controllers/StoreController';

const devDBInfo: any = {
    "host": "127.0.0.1",
    "port": "3306",
    "database": "holdem",
    "user": "root",
    "pw": "root"
};

const devServerInfo: any = {
    host: '127.0.0.1',
    port: '2568',
};

export enum ENUM_RESULT_CODE {
    UNKNOWN_FAIL = -1,
    SUCCESS = 0,
    EXPIRED_SESSION = 2,
}

export class HoldemApiServer {
    public app: express.Application;
    private userController: UserController = null;
    private storeController: StoreController = null;
    private tableController: TableController = null;
    private conf: any = null;

    readonly sqlClient: sqlProxy = null;

    constructor() {
        this.app = express();
        this.sqlClient = new sqlProxy(devDBInfo);
        dao.init( this.sqlClient );

        this.initMiddleWares();
        this.userController = new UserController(this.sqlClient);
        this.storeController = new StoreController( this.sqlClient );
        this.tableController = new TableController(this.sqlClient, devServerInfo);

        this.initRoutes();

        this.Init();
    }

    async Init(): Promise<any>{
        let confFile = await fs.readFileSync( path.join(__dirname, "../src/config/ServerConfigure.json"), {encoding : 'utf8'});
		let confJson = JSON.parse( confFile.toString() );
        this.conf = confJson['server'];
    }

    private initRoutes() {

        this.app.use( '/users', this.userController.router );
        this.app.use( '/store', this.storeController.router );        
        this.app.use( '/tables', this.tableController.router );        
        this.app.get( '/', (req, res)=>{
			res.send( "It could not be a better day to die" );
        });
        this.app.use( '/check', this.CheckVersion.bind(this) );
    }

    private CheckVersion(req: any, res: any ) {
        let cv = req.body.version;
        let sv = this.conf.version;

        if ( cv == sv ) {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.SUCCESS,
                msg: 'SUCCESS',
                name: this.conf.name,
            });
        } else {
            res.status( 200 ).json({
                code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                msg: 'INVALID_VERSION'
            });
        }
    }

    private initMiddleWares() {
        this.app.use ( cors() );
        this.app.use ( express.json() );
        this.app.use ( bodyParser.json() );
        this.app.use ( bodyParser.urlencoded({
            extended: true 
        }));

        this.app.use((req: Request, res: Response, next: NextFunction) => {
            console.log(`Request occur! ${req.method}, ${req.url}`);
            next();
        });

        this.app.use ( session ( {
            secret: `@#@$MYSIGN#@$#$`,
            resave: false,
            saveUninitialized: true            
        }));

        // this.app.use( passport.initialize());
        // this.app.use( passport.session() );

        this.app.set( 'DAO', dao );
    }

    public listen( port: number ) {
        this.app.listen( port, ()=>{
            console.log(`API SERVER IS RUNNING ON ${ port }`);
        });
    }

    beforeListen: () => {

	}
}

exitHook(() => {
    console.log("server is Closing");
    console.error("OnExit");
  });

