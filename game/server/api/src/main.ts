import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import { sqlProxy } from './modules/sqlProxy';
import dao from './modules/dao';

const cors = require('cors');

import UserController from './controllers/UserController';
import TableController from './controllers/TableController';

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

export class HoldemApiServer {
    public app: express.Application;
    private userController: UserController = null;
    private tableController: TableController = null;

    readonly sqlClient: sqlProxy = null;

    constructor() {
        this.app = express();
        this.sqlClient = new sqlProxy(devDBInfo);
        dao.init( this.sqlClient );

        this.initMiddleWares();
        this.userController = new UserController(this.sqlClient);
        this.tableController = new TableController(this.sqlClient);

        this.initRoutes();
    }

    private initRoutes() {

        this.app.use('/users', this.userController.router );
        this.app.use('/tables', this.tableController.router );        
        this.app.get('/', (req, res)=>{
			res.send( "It could not be a better day to die" );
        });
    }

    private initMiddleWares() {
        this.app.use ( cors() );
        this.app.use ( bodyParser.json() );
        this.app.use ( bodyParser.urlencoded({
            extended: true 
        }));

        this.app.use ( session ( {
            secret: `@#@$MYSIGN#@$#$`,
            resave: false,
            saveUninitialized: true            
        }));

        this.app.use( passport.initialize());
        this.app.use( passport.session() );

        this.app.set( 'DAO', dao );
    }

    public listen( port: number ) {
        this.app.listen( port, ()=>{
            console.log(`Server is running on ${ port }`);
        });
    }

    beforeListen: () => {
	}
}

