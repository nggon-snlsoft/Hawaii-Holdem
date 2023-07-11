import express, { Response, Request, NextFunction } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import { sqlProxy } from './modules/sqlProxy';
import dao from './modules/dao';
import exitHook from './modules/hookExit';

import * as fs from 'fs';
import * as path from 'path';
import requestIp from 'request-ip';

const cors = require('cors');
const favicon = require('serve-favicon');
const methodOverride = require( "method-override" );

import ApiController from './controllers/CustomApiController';

// const devDBInfo: any = {
//     "host": "127.0.0.1",
//     "port": "3306",
//     "database": "holdem",
//     "user": "root",
//     "pw": "root"
// };

const devDBInfo: any = {
    "host": "database-1.cleanm1dnitm.ap-northeast-1.rds.amazonaws.com",
    "port": "3306",
    "database": "holdem",
    "user": "admin",
    "pw": "admin0912"
};

export enum ENUM_RESULT_CODE {
    UNKNOWN_FAIL = -1,
    SUCCESS = 0,
    EXPIRED_SESSION = 2,
}

export class CustomApiServer {
    public app: express.Application;
    private apiController: ApiController = null;
    // private userController: UserController = null;
    // private storeController: StoreController = null;
    // private tableController: TableController = null;
    // private conf: any = null;

    readonly sqlClient: sqlProxy = null;

    constructor() {
        this.app = express();
        this.sqlClient = new sqlProxy(devDBInfo);
        dao.init( this.sqlClient );

        this.apiController = new ApiController( this.sqlClient );

        this.initRoutes();
        this.Init();
    }

    async Init(): Promise<any>{
    }

    private initRoutes() {
        this.app.use( cors() );
        this.app.use( methodOverride() );
        this.app.use ( bodyParser.json() );
        this.app.use ( bodyParser.urlencoded({
            extended: true 
        }));
        
        this.app.set( 'DAO', dao );
        this.app.use( '/customs', this.apiController.router );
        this.app.get( '/', (req, res)=>{
			res.send( "It could not be a better day to die" );
        });
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

